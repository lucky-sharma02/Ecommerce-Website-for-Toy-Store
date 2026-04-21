from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class OrderItemBase(BaseModel):
    product_id: int
    product_name: str
    quantity: int
    price_at_purchase: float

class OrderItemOut(OrderItemBase):
    id: int
    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    shipping_address: str

class OrderCreate(OrderBase):
    payment_method_id: str # For Stripe

class OrderUpdate(BaseModel):
    order_status: Optional[str] = None
    payment_status: Optional[str] = None

class OrderOut(OrderBase):
    id: int
    user_id: int
    total_price: float
    payment_id: Optional[str]
    payment_status: str
    order_status: str
    created_at: datetime
    items: List[OrderItemOut]

    class Config:
        from_attributes = True

class CheckoutSessionCreate(BaseModel):
    # For creating Stripe PaymentIntent
    pass

class PaymentIntentResponse(BaseModel):
    client_secret: str
    total_price: float
