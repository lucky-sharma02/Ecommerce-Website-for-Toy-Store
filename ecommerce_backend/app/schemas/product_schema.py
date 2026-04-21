from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.schemas.category_schema import CategoryOut

class ProductBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    bulk_discount_percent: float = Field(default=10.0, ge=0, le=100)
    bulk_min_quantity: int = Field(default=10, gt=0)
    stock: int = Field(default=0, ge=0)
    category_id: Optional[int] = None
    image_url: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    bulk_discount_percent: Optional[float] = None
    bulk_min_quantity: Optional[int] = None
    stock: Optional[int] = None
    category_id: Optional[int] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None

class ProductOut(ProductBase):
    id: int
    is_active: bool
    created_at: Optional[datetime]
    category_rel: Optional[CategoryOut] = None

    class Config:
        from_attributes = True
