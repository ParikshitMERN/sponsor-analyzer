from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MINIO_ENDPOINT: str = "minio"
    MINIO_PORT: int = 9000
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin123"
    MINIO_BUCKET: str = "sponsor-videos"
    FRAME_INTERVAL: float = 5.0  
    CONFIDENCE_THRESHOLD: float = 0.25
    TEMP_DIR: str = "/tmp/videos"
    AI_SERVICE_PORT: int = 800

    class Config:
        env_file = ".env"

settings = Settings()