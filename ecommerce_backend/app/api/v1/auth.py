from fastapi import APIRouter, Depends, HTTPException, status
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
