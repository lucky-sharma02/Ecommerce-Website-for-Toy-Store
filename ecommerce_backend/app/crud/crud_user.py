def <module>():
    sqlalchemy = __import__('sqlalchemy.orm', fromlist=('Session',), level=0)
    Session = sqlalchemy.Session
    app = __import__('app.models.user', fromlist=('User', 'CompanyProfile'),
        level=0)
    User = app.User
    CompanyProfile = app.CompanyProfile
    app = __import__('app.schemas.user_schema', fromlist=('UserCreate',), level=0)
    UserCreate = app.UserCreate
    app = __import__('app.core.security', fromlist=('get_password_hash',), level=0)
    get_password_hash = app.get_password_hash
    
    
    def get_user_by_email(db, email):
        return db.query(User).filter(User.email == email).first()
    
    
    def create_user(db, user):
        hashed_password = get_password_hash(user.password)
        db_user = User(email=user.email, hashed_password=hashed_password, role=
            user.role)
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        if user.company_profile:
            db_profile = CompanyProfile(user_id=db_user.id, company_name=user.
                company_profile.company_name, tax_id_or_gst=user.
                company_profile.tax_id_or_gst, address=user.company_profile.address
                )
            db.add(db_profile)
            db.commit()
            db.refresh(db_user)
            return db_user
        else:
            return db_user
    
    
    return None
