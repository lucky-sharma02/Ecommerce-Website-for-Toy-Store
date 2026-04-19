from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
import uuid
from app.core.dependencies import get_db
from app.core.security import get_current_user
from app.dbmodels.order import Order
from app.dbmodels.user import User

router = APIRouter()

class PaymentRequest(BaseModel):
    order_id: int
    payment_method: str = Field(..., description="Credit Card, UPI, PayPal, etc.")
    card_token: str = Field(None, description="Optional payment gateway tokenizer")

class PaymentResponse(BaseModel):
    transaction_id: str
    order_id: int
    status: str
    message: str

@router.post("/pay", response_model=PaymentResponse)
def process_payment(payment_request: PaymentRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == payment_request.order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if order.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not permitted to pay this order")
    
    if order.payment_status == "paid":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order is already securely paid")
    
    # Complex Mocking of a Payment Gateway Transaction (e.g. Stripe/Razorpay)
    transaction_id = f"txn_{uuid.uuid4().hex}"
    
    # State mutation
    order.payment_status = "paid"
    order.status = "processing" # Automatically move to processing
    db.commit()
    
    return {
        "transaction_id": transaction_id,
        "order_id": order.id, 
        "status": "success",
        "message": f"Payment of ${order.total_amount} verified via {payment_request.payment_method}"
    }

@router.get("/invoices/{order_id}")
def generate_invoice(order_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if order.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized")
        
    purchaser = db.query(User).filter(User.id == order.user_id).first()
        
    return {
        "invoice_id": f"INV-{order.id}",
        "date": order.created_at,
        "customer_name": f"{purchaser.first_name} {purchaser.last_name}",
        "gst_number": purchaser.gst_number,
        "shipping_address": order.shipping_address,
        "base_amount": order.total_amount,
        "tax": order.tax_amount,
        "final_total": order.total_amount + order.tax_amount,
        "payment_status": order.payment_status
    }
