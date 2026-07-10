from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./tributario.db"
    REDIS_URL: str = "redis://localhost:6379/0"
    SECRET_KEY: str = "super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    UPLOAD_DIR: str = "uploads"

    class Config:
        env_file = ".env"


settings = Settings()
