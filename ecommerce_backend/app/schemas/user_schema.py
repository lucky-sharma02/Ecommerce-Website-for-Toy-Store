from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    company_name: Optional[str] = None
    address: Optional[str] = None
    gst_number: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    role: Optional[str] = "retailer"

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    company_name: Optional[str] = None
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
