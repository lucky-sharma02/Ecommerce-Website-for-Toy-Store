import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "E-commerce Backend"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "supersecretkeyyoushouldchangeinproduction"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    SQLALCHEMY_DATABASE_URI: str = "mysql+pymysql://root:Tanmaychasql%40123@localhost:3306/toysdb"

    class Config:
        env_file = ".env"

settings = Settings()
