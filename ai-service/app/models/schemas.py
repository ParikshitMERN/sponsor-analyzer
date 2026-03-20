from pydantic import BaseModel
from typing import List
from enum import Enum


class Verdict(str, Enum):
    pass_ = "pass"
    fail = "fail"


class AnalyzeRequest(BaseModel):
    video_key: str
    company_id: str
    logo_names: List[str]


class BoundingBox(BaseModel):
    x: float
    y: float
    width: float
    height: float


class LogoDetection(BaseModel):
    frame_number: int
    timestamp: float
    confidence: float
    bounding_box: BoundingBox
    logo_name: str
    screen_coverage: float


class AnalysisResult(BaseModel):
    video_key: str
    company_id: str
    total_frames: int
    analyzed_frames: int
    detections: List[LogoDetection]
    visibility_duration: float
    average_coverage: float
    efficiency_score: float
    verdict: Verdict
    message: str