from pydantic import BaseModel
from typing import Optional
from app.schemas.product_schema import ProductOut

class CartItemBase(BaseModel):
    product_id: int
    quantity: int = 1

class CartItemCreate(CartItemBase):
    pass

class CartItemUpdate(BaseModel):
    quantity: int

class CartItemOut(CartItemBase):
    id: int
    user_id: int
    product: ProductOut

    class Config:
        from_attributes = True
