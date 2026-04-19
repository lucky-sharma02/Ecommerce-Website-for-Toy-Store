from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ProductBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    unit_price: float = Field(..., gt=0)
    lot_price: float = Field(..., gt=0)
    lot_size: int = Field(..., gt=0)
    stock: int = Field(default=0, ge=0)
    category: Optional[str] = None
    sku: Optional[str] = None
    image_url: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    unit_price: Optional[float] = None
    lot_price: Optional[float] = None
    lot_size: Optional[int] = None
    stock: Optional[int] = None
    category: Optional[str] = None
    sku: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None

class ProductOut(ProductBase):
    id: int
    is_active: bool
    created_at: Optional[datetime]

    class Config:
        from_attributes = True
