import os
from minio import Minio
from minio.error import S3Error
from app.core.config import settings

def get_minio_client():
    return Minio(
        f"{settings.MINIO_ENDPOINT}:{settings.MINIO_PORT}",
        access_key=settings.MINIO_ACCESS_KEY,
        secret_key=settings.MINIO_SECRET_KEY,
        secure=False
    )

def download_video(video_key: str) -> str:
    try:
        client = get_minio_client()
        os.makedirs(settings.TEMP_DIR, exist_ok=True)
        filename = video_key.split('/')[-1]
        local_path = os.path.join(settings.TEMP_DIR, filename)

        # Skip download if already exists
        if not os.path.exists(local_path):
            client.fget_object(
                settings.MINIO_BUCKET,
                video_key,
                local_path
            )
        return local_path

    except S3Error as e:
        raise Exception(f"MinIO download failed: {str(e)}")

def cleanup_video(local_path: str):
    try:
        if os.path.exists(local_path):
            os.remove(local_path)
    except Exception as e:
        print(f"Cleanup warning: {str(e)}")