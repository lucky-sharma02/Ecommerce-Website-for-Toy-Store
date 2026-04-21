from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.dependencies import get_db
from app.core.security import get_current_admin
from app.dbmodels.category import Category
from app.schemas.category_schema import CategoryOut, CategoryCreate, CategoryUpdate

router = APIRouter()

@router.get("/", response_model=List[CategoryOut])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()

@router.post("/", response_model=CategoryOut)
def create_category(category_in: CategoryCreate, db: Session = Depends(get_db), current_admin = Depends(get_current_admin)):
    db_obj = Category(**category_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{category_id}", response_model=CategoryOut)
def update_category(category_id: int, category_in: CategoryUpdate, db: Session = Depends(get_db), current_admin = Depends(get_current_admin)):
    db_obj = db.query(Category).filter(Category.id == category_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Category not found")
    
    update_data = category_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_obj, key, value)
    
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: int, db: Session = Depends(get_db), current_admin = Depends(get_current_admin)):
    db_obj = db.query(Category).filter(Category.id == category_id).first()
    if not db_obj:
        raise HTTPException(status_code=404, detail="Category not found")
    
    db.delete(db_obj)
    db.commit()
    return None
