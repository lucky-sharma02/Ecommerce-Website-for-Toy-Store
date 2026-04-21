from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True, nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    bulk_discount_percent = Column(Float, nullable=False, default=10.0)
    bulk_min_quantity = Column(Integer, nullable=False, default=10)
    stock = Column(Integer, default=0, nullable=False)
    
    # Old field removed, replaced with relation
    category_id = Column(Integer, ForeignKey("categories.id"))
    category_rel = relationship("Category", back_populates="products")
    
    image_url = Column(String(500))
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
