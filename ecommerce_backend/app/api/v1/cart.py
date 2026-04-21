from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.dependencies import get_db
from app.core.security import get_current_user
from app.dbmodels.cart import CartItem
from app.dbmodels.user import User
from app.dbmodels.product import Product
from app.schemas.cart_schema import CartItemOut, CartItemCreate, CartItemUpdate

router = APIRouter()

@router.get("/", response_model=List[CartItemOut])
def get_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admins cannot have a shopping cart")
    return db.query(CartItem).filter(CartItem.user_id == current_user.id).all()

@router.post("/", response_model=CartItemOut)
def add_to_cart(item_in: CartItemCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admins cannot shop")
    # Check if product exists and is active
    product = db.query(Product).filter(Product.id == item_in.product_id, Product.is_active == True).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if item already in cart
    cart_item = db.query(CartItem).filter(
        CartItem.user_id == current_user.id, 
        CartItem.product_id == item_in.product_id
    ).first()
    
    if cart_item:
        cart_item.quantity += item_in.quantity
    else:
        cart_item = CartItem(
            user_id=current_user.id,
            product_id=item_in.product_id,
            quantity=item_in.quantity
        )
        db.add(cart_item)
    
    db.commit()
    db.refresh(cart_item)
    return cart_item

@router.put("/{item_id}", response_model=CartItemOut)
def update_cart_item(item_id: int, item_in: CartItemUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart_item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.user_id == current_user.id).first()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    if item_in.quantity <= 0:
        db.delete(cart_item)
    else:
        cart_item.quantity = item_in.quantity
    
    db.commit()
    if item_in.quantity > 0:
        db.refresh(cart_item)
    return cart_item

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_cart(item_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart_item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.user_id == current_user.id).first()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    db.delete(cart_item)
    db.commit()
    return None

@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
def clear_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admins do not have a cart")
    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()
    db.commit()
    return None
