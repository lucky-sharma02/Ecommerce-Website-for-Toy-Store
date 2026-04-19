from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from sqlalchemy.sql import func
from app.db.base import Base

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True, nullable=False)
    description = Column(Text)
    unit_price = Column(Float, nullable=False)
    lot_price = Column(Float, nullable=False)
    lot_size = Column(Integer, nullable=False)
    stock = Column(Integer, default=0)
    category = Column(String(100), index=True)
    sku = Column(String(100), index=True, unique=True)
    image_url = Column(String(500))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
