from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.dependencies import get_db
from app.core.security import get_current_user
from app.dbmodels.product import Product
from app.dbmodels.user import User
from app.schemas.product_schema import ProductOut, ProductCreate, ProductUpdate

router = APIRouter()

@router.get("/", response_model=List[ProductOut])
def get_products(category: Optional[str] = None, sku: Optional[str] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    query = db.query(Product).filter(Product.is_active == True)
    if category:
        query = query.filter(Product.category.ilike(f"%{category}%"))
    if sku:
        query = query.filter(Product.sku.ilike(f"%{sku}%"))
    return query.offset(skip).limit(limit).all()

@router.post("/", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(product_in: ProductCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role not in ["admin", "wholesaler"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin or Wholesaler access required")
    new_product = Product(**product_in.model_dump())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product

@router.put("/{product_id}", response_model=ProductOut)
def update_product(product_id: int, product_in: ProductUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role not in ["admin", "wholesaler"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin or Wholesaler access required")
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        
    update_data = product_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role not in ["admin", "wholesaler"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin or Wholesaler access required")
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    product.is_active = False # soft deletion logic
    db.commit()
    return None
