from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.dependencies import get_db
from app.core.security import get_current_user
from app.dbmodels.order import Order, OrderItem
from app.dbmodels.user import User
from app.schemas.order_schema import OrderOut, OrderCreate, OrderUpdate

router = APIRouter()

@router.post("/", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(order_in: OrderCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Fallback to user shipping address if none provided
    shipping_addr = order_in.shipping_address if order_in.shipping_address else current_user.address
    if not shipping_addr:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Shipping address is required")
        
    new_order = Order(
        **order_in.model_dump(exclude={"shipping_address", "items"}),
        shipping_address=shipping_addr,
        user_id=current_user.id
    )
    db.add(new_order)
    db.flush()
    
    for item in order_in.items:
        db_item = OrderItem(
            order_id=new_order.id,
            product_name=item.product_name,
            quantity=item.quantity,
            price=item.price
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(new_order)
    return new_order

@router.get("/", response_model=List[OrderOut])
def get_orders(user_id: Optional[int] = None, skip: int = 0, limit: int = 100, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user_id and current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to fetch these orders")
        
    query = db.query(Order)
    if current_user.role != "admin" or user_id == current_user.id:
        query = query.filter(Order.user_id == current_user.id)
    elif user_id:
        query = query.filter(Order.user_id == user_id)
        
    return query.offset(skip).limit(limit).all()

@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if order.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough privileges")
    return order

@router.put("/{order_id}", response_model=OrderOut)
def update_order_status(order_id: int, order_in: OrderUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can update order operations")
        
    update_data = order_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(order, key, value)
    db.commit()
    db.refresh(order)
    return order
