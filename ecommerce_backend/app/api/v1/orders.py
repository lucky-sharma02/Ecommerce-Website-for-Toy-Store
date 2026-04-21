import stripe
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core import security
from app.core.config import settings
from app.core.dependencies import get_db
from app.dbmodels.order import Order, OrderItem
from app.dbmodels.user import User
from app.dbmodels.product import Product
from app.dbmodels.cart import CartItem
from app.schemas.order_schema import OrderOut, PaymentIntentResponse, OrderUpdate

router = APIRouter()
stripe.api_key = settings.STRIPE_SECRET_KEY

def calculate_order_total(db: Session, user_id: int):
    cart_items = db.query(CartItem).filter(CartItem.user_id == user_id).all()
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    total_gross = 0.0
    total_discount = 0.0
    
    for item in cart_items:
        product = item.product
        if product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}")
        
        # Calculate line item subtotal
        item_subtotal = product.price * item.quantity
        
        # Calculate discount separately
        if item.quantity >= product.bulk_min_quantity:
            item_discount = item_subtotal * (product.bulk_discount_percent / 100)
        else:
            item_discount = 0
            
        total_gross += item_subtotal
        total_discount += item_discount
    
    final_total = round(total_gross - total_discount, 2)
    return final_total, cart_items

@router.post("/create-payment-intent", response_model=PaymentIntentResponse)
def create_payment_intent(current_user: User = Depends(security.get_current_user), db: Session = Depends(get_db)):
    if current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admins cannot perform transactions")
    total_price, _ = calculate_order_total(db, current_user.id)
    
    try:
        # Stripe minimum amount is 0.50 USD
        stripe_amount = int(total_price * 100)
        if stripe_amount < 50:
            raise HTTPException(status_code=400, detail="Order total must be at least $0.50 to proceed with payment.")

        # Create a PaymentIntent with the order amount and currency
        intent = stripe.PaymentIntent.create(
            amount=stripe_amount,
            currency="usd",
            metadata={"user_id": current_user.id},
            automatic_payment_methods={"enabled": True},
        )
        return {
            "client_secret": intent.client_secret,
            "total_price": total_price
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/verify-payment/{payment_intent_id}", response_model=OrderOut)
def verify_payment_and_create_order(payment_intent_id: str, shipping_address: str, current_user: User = Depends(security.get_current_user), db: Session = Depends(get_db)):
    if current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admins cannot place orders")
    try:
        # 1. Verify payment with Stripe
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        if intent.status != "succeeded":
            raise HTTPException(status_code=400, detail=f"Payment not successful: {intent.status}")
        
        # 2. Final stock check and total calculation
        total_price, cart_items = calculate_order_total(db, current_user.id)
        
        # 3. Start Transaction
        # Create Order
        new_order = Order(
            user_id=current_user.id,
            total_price=total_price,
            shipping_address=shipping_address,
            payment_id=payment_intent_id,
            payment_status="success",
            order_status="placed"
        )
        db.add(new_order)
        db.flush() # Get order ID
        
        # Create Order Items and Reduce Stock
        for item in cart_items:
            product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
            if product.stock < item.quantity:
                db.rollback()
                raise HTTPException(status_code=400, detail=f"Stock ran out for {product.name} during processing")
            
            # Using original price as price_at_purchase as requested
            price_at_purchase = product.price
            
            order_item = OrderItem(
                order_id=new_order.id,
                product_id=product.id,
                product_name=product.name,
                quantity=item.quantity,
                price_at_purchase=price_at_purchase
            )
            db.add(order_item)
            
            # Reduce stock
            product.stock -= item.quantity
            
        # 4. Clear Cart
        db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()
        
        db.commit()
        db.refresh(new_order)
        return new_order
        
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[OrderOut])
def get_my_orders(current_user: User = Depends(security.get_current_user), db: Session = Depends(get_db)):
    return db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()

@router.get("/all", response_model=List[OrderOut])
def get_all_orders(admin_user: User = Depends(security.get_current_admin), db: Session = Depends(get_db)):
    return db.query(Order).order_by(Order.created_at.desc()).all()

@router.put("/{order_id}", response_model=OrderOut)
def update_order_status(order_id: int, order_update: OrderUpdate, admin_user: User = Depends(security.get_current_admin), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order_update.order_status:
        order.order_status = order_update.order_status
    if order_update.payment_status:
        order.payment_status = order_update.payment_status
        
    db.commit()
    db.refresh(order)
    return order
