from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def health_check():
    return {
        "status": "AI service running",
        "version": "1.0.0"
    }