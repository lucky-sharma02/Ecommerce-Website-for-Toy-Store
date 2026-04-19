import os

files = {
    'app/core/config.py': '''import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "E-commerce Backend"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "supersecretkeyyoushouldchangeinproduction"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    SQLALCHEMY_DATABASE_URI: str = "mysql+pymysql://root:@localhost:3306/ToysDB"

    class Config:
        env_file = ".env"

settings = Settings()
''',
    'app/db/base.py': '''from sqlalchemy.orm import declarative_base

Base = declarative_base()
''',
    'app/db/session.py': '''from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
''',
    'app/core/dependencies.py': '''from app.db.session import SessionLocal

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
''',
    'app/dbmodels/__init__.py': '',
    'app/dbmodels/user.py': '''from sqlalchemy import Column, Integer, String, Boolean
from app.db.base import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    hashed_password = Column(String(255))
    role = Column(String(50), default="user")
    is_active = Column(Boolean, default=True)
''',
    'app/dbmodels/product.py': '''from sqlalchemy import Column, Integer, String, Float, Boolean
from app.db.base import Base

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True)
    description = Column(String(1000))
    price = Column(Float)
    stock = Column(Integer)
    is_active = Column(Boolean, default=True)
''',
    'app/dbmodels/order.py': '''from sqlalchemy import Column, Integer, String, Float, ForeignKey
from app.db.base import Base

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    total_amount = Column(Float)
    status = Column(String(50), default="pending")
''',
    'app/schemas/__init__.py': '',
    'app/api/__init__.py': '',
    'app/api/v1/__init__.py': '',
    'app/api/v1/auth.py': '''from fastapi import APIRouter
router = APIRouter()
''',
    'app/api/v1/users.py': '''from fastapi import APIRouter
router = APIRouter()
''',
    'app/api/v1/products.py': '''from fastapi import APIRouter
router = APIRouter()
''',
    'app/api/v1/orders.py': '''from fastapi import APIRouter
router = APIRouter()
''',
    'app/api/v1/billing.py': '''from fastapi import APIRouter
router = APIRouter()
''',
    'main.py': '''from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app.dbmodels import user, product, order
from app.api.v1 import auth, users, products, orders, billing

# Auto create all tables in MySQL
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])
app.include_router(products.router, prefix=f"{settings.API_V1_STR}/products", tags=["products"])
app.include_router(orders.router, prefix=f"{settings.API_V1_STR}/orders", tags=["orders"])
app.include_router(billing.router, prefix=f"{settings.API_V1_STR}/billing", tags=["billing"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the E-commerce Backend API. Visit /docs for the API documentation."}
'''
}

for path, content in files.items():
    full_path = os.path.join(r"c:\Users\tanma\OneDrive\Desktop\SEProject\ecommerce_backend", path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("App rebuilt successfully.")
