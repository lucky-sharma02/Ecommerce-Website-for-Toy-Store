import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.base_models import Base, User, Product, CartItem, Order, OrderItem, Category
from app.core import security
from app.core.config import settings

def init_db():
    engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    print("Resetting database tables...")
    with engine.begin() as conn:
        # Disable foreign key checks for MySQL
        if "mysql" in settings.SQLALCHEMY_DATABASE_URI:
            conn.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
            
        Base.metadata.drop_all(bind=conn)
        Base.metadata.create_all(bind=conn)
        
        # Re-enable foreign key checks for MySQL
        if "mysql" in settings.SQLALCHEMY_DATABASE_URI:
            conn.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
    
    db = SessionLocal()
    
    # 1. Create Categories
    print("Seeding categories...")
    categories_data = [
        {"name": "Action Figures", "description": "Superheroes, villains, and everything in between."},
        {"name": "Board Games", "description": "Strategy games, family fun, and classic sets."},
        {"name": "Dolls", "description": "Beautiful dolls and accessories."},
        {"name": "Uncategorized", "description": "General catch-all for miscellaneous toys."}
    ]
    
    category_map = {}
    for cat in categories_data:
        c = Category(name=cat["name"], description=cat["description"])
        db.add(c)
        db.flush() # Get IDs
        category_map[cat["name"]] = c.id
    
    # 2. Create Admin user
    admin_email = "admin@toystore.com"
    print(f"Creating admin user: {admin_email}")
    admin = User(
        email=admin_email,
        hashed_password=security.get_password_hash("admin123"),
        full_name="System Admin",
        is_admin=True,
        is_active=True
    )
    db.add(admin)
    
    # 3. Create Sample Customer
    customer_email = "customer@example.com"
    print(f"Creating sample customer: {customer_email}")
    customer = User(
        email=customer_email,
        hashed_password=security.get_password_hash("customer123"),
        full_name="John Doe",
        is_admin=False,
        is_active=True
    )
    db.add(customer)
    
    # 4. Seed sample products with Category IDs
    print("Seeding sample products...")
    sample_toys = [
        {
            "name": "Super Hero Action Figure",
            "description": "High-quality action figure with articulated joints.",
            "price": 25.0,
            "bulk_discount_percent": 20.0,
            "bulk_min_quantity": 10,
            "stock": 100,
            "category_id": category_map["Action Figures"],
            "image_url": "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?q=80&w=500&auto=format&fit=crop"
        },
        {
            "name": "Classic Chess Set",
            "description": "Handcrafted wooden chess pieces with a folding board.",
            "price": 45.0,
            "bulk_discount_percent": 22.2,
            "bulk_min_quantity": 5,
            "stock": 50,
            "category_id": category_map["Board Games"],
            "image_url": "https://images.unsplash.com/photo-1529158017232-ade674765cd3?q=80&w=500&auto=format&fit=crop"
        },
        {
            "name": "Porcelain Doll",
            "description": "Exquisite porcelain doll with detailed dress.",
            "price": 60.0,
            "bulk_discount_percent": 16.6,
            "bulk_min_quantity": 5,
            "stock": 30,
            "category_id": category_map["Dolls"],
            "image_url": "https://images.unsplash.com/photo-1559449129-9dc8e442000b?q=80&w=500&auto=format&fit=crop"
        }
    ]
    for toy in sample_toys:
        p = Product(**toy)
        db.add(p)
    
    db.commit()
    db.close()
    print("Database initialization complete.")

if __name__ == "__main__":
    init_db()
