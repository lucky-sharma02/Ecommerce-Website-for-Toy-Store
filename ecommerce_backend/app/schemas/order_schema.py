from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class OrderItemBase(BaseModel):
    product_name: str
    quantity: int = Field(..., gt=0)
    price: float = Field(..., ge=0)

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemOut(OrderItemBase):
    id: int

    class Config:
        from_attributes = True

class OrderBase(BaseModel):
    total_amount: float = Field(..., gt=0)
    tax_amount: float = Field(default=0.0, ge=0)
    shipping_address: str = Field(..., min_length=5)

class OrderCreate(OrderBase):
    items: List[OrderItemCreate]

class OrderUpdate(BaseModel):
    status: Optional[str] = None
    tracking_number: Optional[str] = None
    payment_status: Optional[str] = None

class OrderOut(OrderBase):
    id: int
    user_id: int
    status: str
    tracking_number: Optional[str]
    payment_status: str
    created_at: Optional[datetime]
    items: List[OrderItemOut] = []

    class Config:
        from_attributes = True
