def <module>():
    sqlalchemy = __import__('sqlalchemy.orm', fromlist=('Session',), level=0)
    Session = sqlalchemy.Session
    app = __import__('app.models.product', fromlist=('Product',), level=0)
    Product = app.Product
    app = __import__('app.schemas.product_schema', fromlist=('ProductCreate',
        'ProductUpdate'), level=0)
    ProductCreate = app.ProductCreate
    ProductUpdate = app.ProductUpdate
    
    
    def get_product(db, product_id):
        return db.query(Product).filter(Product.id == product_id, Product.
            is_active == True).first()
    
    
    def get_products(db, skip, limit):
        return db.query(Product).filter(Product.is_active == True).offset(skip
            ).limit(limit).all()
    
    
    def create_product(db, product, wholesaler_id):
        __temp_84 = {'wholesaler_id': wholesaler_id}
        __temp_84.update(product.model_dump())
        db_product = Product(*(), **__temp_84)
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        return db_product
    
    
    def update_product(db, product_id, product_update):
        db_product = db.query(Product).filter(Product.id == product_id).first()
        if not db_product:
            return None
        for __temp_94 in iter(product_update.model_dump(exclude_unset=True).items()
            ):
            __temp_95, __temp_96 = __temp_94
            var = __temp_95
            value = __temp_96
            setattr(db_product, var, value)
            continue
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        return db_product
    
    
    def soft_delete_product(db, product_id):
        db_product = db.query(Product).filter(Product.id == product_id).first()
        if db_product:
            db_product.is_active = False
            db.commit()
            return db_product
        else:
            return db_product
    
    
    return None
