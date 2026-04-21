from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.dependencies import get_db
from app.core.security import get_current_admin
from app.dbmodels.user import User
from app.dbmodels.order import Order, OrderItem
from app.dbmodels.product import Product

router = APIRouter()

@router.get("/analytics")
def get_analytics(admin_user: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    # Total Sales
    total_sales = db.query(func.sum(Order.total_price)).filter(Order.payment_status == "success").scalar() or 0.0
    
    # Total Orders
    total_orders = db.query(func.count(Order.id)).filter(Order.payment_status == "success").scalar() or 0
    
    # Total Products
    total_products = db.query(func.count(Product.id)).filter(Product.is_active == True).scalar() or 0
    
    # Total Users (Customers)
    total_customers = db.query(func.count(User.id)).filter(User.is_admin == False).scalar() or 0
    
    # Top Selling Products (by quantity)
    top_products = db.query(
        OrderItem.product_name, 
        func.sum(OrderItem.quantity).label("total_quantity")
    ).join(Order).filter(Order.payment_status == "success")\
    .group_by(OrderItem.product_name)\
    .order_by(func.sum(OrderItem.quantity).desc())\
    .limit(5).all()
    
    return {
        "total_sales": total_sales,
        "total_orders": total_orders,
        "total_products": total_products,
        "total_customers": total_customers,
        "top_products": [{"name": p[0], "quantity": p[1]} for p in top_products]
    }
