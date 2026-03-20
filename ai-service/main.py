from fastapi import FastAPI
from app.api.routes import analyze, health
from app.services.logo_detector import load_model
from app.services.logo_recognizer import load_clip

app = FastAPI(
    title="Sponsor Logo Analyzer AI Service",
    version="1.0.0"
)

@app.on_event("startup")
async def startup_event():
    print("Pre-loading YOLOv8 model...")
    load_model()
    print("Pre-loading CLIP model...")
    load_clip()
    print("All models loaded and ready!")

app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(analyze.router, prefix="/analyze", tags=["analyze"])