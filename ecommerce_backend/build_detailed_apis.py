import os

files = {
    'app/dbmodels/user.py': '''from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.db.base import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    first_name = Column(String(100))
    last_name = Column(String(100))
    phone_number = Column(String(20))
    address = Column(String(500))
    gst_number = Column(String(50))
    role = Column(String(50), default="user")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
''',

    'app/dbmodels/product.py': '''from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
from sqlalchemy.sql import func
from app.db.base import Base

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True, nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    stock = Column(Integer, default=0)
    category = Column(String(100), index=True)
    brand = Column(String(100), index=True)
    image_url = Column(String(500))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
''',

    'app/dbmodels/order.py': '''from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from sqlalchemy.sql import func
from app.db.base import Base

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    total_amount = Column(Float, nullable=False)
    tax_amount = Column(Float, default=0.0)
    shipping_address = Column(Text, nullable=False)
    status = Column(String(50), default="pending", index=True)
    tracking_number = Column(String(100))
    payment_status = Column(String(50), default="unpaid")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
''',

    'app/schemas/user_schema.py': '''from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    gst_number: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    gst_number: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class UserOut(UserBase):
    id: int
    role: str
    is_active: bool
    created_at: Optional[datetime]

    class Config:
        from_attributes = True
''',

    'app/schemas/product_schema.py': '''from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ProductBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    stock: int = Field(default=0, ge=0)
    category: Optional[str] = None
    brand: Optional[str] = None
    image_url: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock: Optional[int] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None

class ProductOut(ProductBase):
    id: int
    is_active: bool
    created_at: Optional[datetime]

    class Config:
        from_attributes = True
''',

    'app/schemas/order_schema.py': '''from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class OrderBase(BaseModel):
    total_amount: float = Field(..., gt=0)
    tax_amount: float = Field(default=0.0, ge=0)
    shipping_address: str = Field(..., min_length=5)

class OrderCreate(OrderBase):
    pass

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

    class Config:
        from_attributes = True
''',

    'app/api/v1/auth.py': '''from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.core.dependencies import get_db
from app.core.config import settings
from app.core.security import verify_password, get_password_hash, create_access_token
from app.dbmodels.user import User
from app.schemas.auth_schema import Token
from app.schemas.user_schema import UserCreate, UserOut

router = APIRouter()

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user_in.email).first():
        raise HTTPException(status_code=400, detail="Email is already registered")
    if user_in.phone_number and db.query(User).filter(User.phone_number == user_in.phone_number).first():
        raise HTTPException(status_code=400, detail="Phone number is already associated with another account")
        
    hashed_pass = get_password_hash(user_in.password)
    user_data = user_in.model_dump(exclude={"password"})
    new_user = User(**user_data, hashed_password=hashed_pass)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Account is deactivated")
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
''',

    'app/api/v1/users.py': '''from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.dependencies import get_db
from app.core.security import get_current_user
from app.dbmodels.user import User
from app.schemas.user_schema import UserOut, UserUpdate

router = APIRouter()

@router.get("/me", response_model=UserOut)
def read_user_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/", response_model=List[UserOut])
def get_users(skip: int = 0, limit: int = 100, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return db.query(User).offset(skip).limit(limit).all()

@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this user")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

@router.put("/{user_id}", response_model=UserOut)
def update_user(user_id: int, user_in: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this user")
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
    # Prevent normal users from upgrading their own role
    if user_in.role and current_user.role != "admin":
        user_in.role = user.role
        
    update_data = user_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
        
    db.commit()
    db.refresh(user)
    return user
''',

    'app/api/v1/products.py': '''from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.dependencies import get_db
from app.core.security import get_current_user
from app.dbmodels.product import Product
from app.dbmodels.user import User
from app.schemas.product_schema import ProductOut, ProductCreate, ProductUpdate

router = APIRouter()

@router.get("/", response_model=List[ProductOut])
def get_products(category: Optional[str] = None, brand: Optional[str] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    query = db.query(Product).filter(Product.is_active == True)
    if category:
        query = query.filter(Product.category.ilike(f"%{category}%"))
    if brand:
        query = query.filter(Product.brand.ilike(f"%{brand}%"))
    return query.offset(skip).limit(limit).all()

@router.post("/", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(product_in: ProductCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
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
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
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
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    product.is_active = False # soft deletion logic
    db.commit()
    return None
''',

    'app/api/v1/orders.py': '''from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.dependencies import get_db
from app.core.security import get_current_user
from app.dbmodels.order import Order
from app.dbmodels.user import User
from app.schemas.order_schema import OrderOut, OrderCreate, OrderUpdate

router = APIRouter()

@router.post("/", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(order_in: OrderCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Fallback to user shipping address if none provided
    shipping_addr = order_in.shipping_address if order_in.shipping_address else current_user.address
    if not shipping_addr:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Shipping address is required")
        
    new_order = Order(
        **order_in.model_dump(exclude={"shipping_address"}),
        shipping_address=shipping_addr,
        user_id=current_user.id
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return new_order

@router.get("/", response_model=List[OrderOut])
def get_orders(user_id: Optional[int] = None, skip: int = 0, limit: int = 100, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user_id and current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to fetch these orders")
        
    query = db.query(Order)
    if current_user.role != "admin" or user_id == current_user.id:
        query = query.filter(Order.user_id == current_user.id)
    elif user_id:
        query = query.filter(Order.user_id == user_id)
        
    return query.offset(skip).limit(limit).all()

@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if order.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough privileges")
    return order

@router.put("/{order_id}", response_model=OrderOut)
def update_order_status(order_id: int, order_in: OrderUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admins can update order operations")
        
    update_data = order_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(order, key, value)
    db.commit()
    db.refresh(order)
    return order
''',

    'app/api/v1/billing.py': '''from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
import uuid
from app.core.dependencies import get_db
from app.core.security import get_current_user
from app.dbmodels.order import Order
from app.dbmodels.user import User

router = APIRouter()

class PaymentRequest(BaseModel):
    order_id: int
    payment_method: str = Field(..., description="Credit Card, UPI, PayPal, etc.")
    card_token: str = Field(None, description="Optional payment gateway tokenizer")

class PaymentResponse(BaseModel):
    transaction_id: str
    order_id: int
    status: str
    message: str

@router.post("/pay", response_model=PaymentResponse)
def process_payment(payment_request: PaymentRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == payment_request.order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if order.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not permitted to pay this order")
    
    if order.payment_status == "paid":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order is already securely paid")
    
    # Complex Mocking of a Payment Gateway Transaction (e.g. Stripe/Razorpay)
    transaction_id = f"txn_{uuid.uuid4().hex}"
    
    # State mutation
    order.payment_status = "paid"
    order.status = "processing" # Automatically move to processing
    db.commit()
    
    return {
        "transaction_id": transaction_id,
        "order_id": order.id, 
        "status": "success",
        "message": f"Payment of ${order.total_amount} verified via {payment_request.payment_method}"
    }

@router.get("/invoices/{order_id}")
def generate_invoice(order_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    if order.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized")
        
    purchaser = db.query(User).filter(User.id == order.user_id).first()
        
    return {
        "invoice_id": f"INV-{order.id}",
        "date": order.created_at,
        "customer_name": f"{purchaser.first_name} {purchaser.last_name}",
        "gst_number": purchaser.gst_number,
        "shipping_address": order.shipping_address,
        "base_amount": order.total_amount,
        "tax": order.tax_amount,
        "final_total": order.total_amount + order.tax_amount,
        "payment_status": order.payment_status
    }
'''
}

for path, content in files.items():
    full_path = os.path.join(r"c:\\Users\\tanma\\OneDrive\\Desktop\\SEProject\\ecommerce_backend", path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Advanced APIs rewritten with detailed enterprise patterns.")
