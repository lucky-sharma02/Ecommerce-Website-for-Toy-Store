def <module>():
    fastapi = __import__('fastapi', fromlist=('FastAPI',), level=0)
    FastAPI = fastapi.FastAPI
    fastapi = __import__('fastapi.middleware.cors', fromlist=('CORSMiddleware',
        ), level=0)
    CORSMiddleware = fastapi.CORSMiddleware
    app = __import__('app.core.config', fromlist=('settings',), level=0)
    settings = app.settings
    app = __import__('app.api.v1', fromlist=('auth', 'users', 'products',
        'orders', 'billing'), level=0)
    auth = app.auth
    users = app.users
    products = app.products
    orders = app.orders
    billing = app.billing
    app = FastAPI(title=settings.PROJECT_NAME)
    app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_credentials=
        True, allow_methods=['*'], allow_headers=['*'])
    app.include_router(auth.router, prefix=str(settings.API_V1_STR) + '/auth',
        tags=['auth'])
    app.include_router(users.router, prefix=str(settings.API_V1_STR) + '/users',
        tags=['users'])
    app.include_router(products.router, prefix=str(settings.API_V1_STR) +
        '/products', tags=['products'])
    app.include_router(orders.router, prefix=str(settings.API_V1_STR) +
        '/orders', tags=['orders'])
    app.include_router(billing.router, prefix=str(settings.API_V1_STR) +
        '/billing', tags=['billing'])
    
    
    def read_root():
        return {'message':
            'Welcome to the E-commerce Backend API. Visit /docs for the API documentation.'
            }
    
    
    read_root = app.get('/')(read_root)
    return None
