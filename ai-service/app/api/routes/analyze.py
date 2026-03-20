from fastapi import APIRouter, HTTPException
from app.models.schemas import AnalyzeRequest, AnalysisResult, LogoDetection, BoundingBox
from app.services.frame_extractor import extract_frames, get_video_info
from app.services.logo_detector import detect_objects
from app.services.logo_recognizer import match_logo
from app.services.scoring_service import calculate_efficiency_score
from app.utils.minio_client import download_video, cleanup_video
from app.core.config import settings
from app.utils.image_utils import resize_frame

router = APIRouter()

@router.post("", response_model=AnalysisResult)
async def analyze_video(request: AnalyzeRequest):
    local_path = None

    try:
        print(f"Starting analysis: {request.video_key}")

        local_path = download_video(request.video_key)
        print(f"Downloaded to: {local_path}")

        video_info = get_video_info(local_path)
        video_duration = video_info['duration']
        print(f"Video duration: {video_duration}s")

        frames = extract_frames(local_path)
        print(f"Frames to analyze: {len(frames)}")

        all_detections = []

        for frame_number, timestamp, frame in frames:
            frame = resize_frame(frame, max_size=640)
            objects = detect_objects(frame)

           for obj in objects:
    # ← raise this threshold to skip weak detections
    if obj['confidence'] < 0.4:
        continue

    match = match_logo(
        frame,
        obj['bounding_box'],
        request.logo_names
    )

                if match:
                    all_detections.append({
                        'frame_number': frame_number,
                        'timestamp': timestamp,
                        'confidence': match['confidence'],
                        'bounding_box': obj['bounding_box'],
                        'logo_name': match['logo_name'],
                        'screen_coverage': obj['screen_coverage']
                    })
                    print(f"Logo '{match['logo_name']}' at {timestamp}s")

        scores = calculate_efficiency_score(
            all_detections,
            len(frames),
            video_duration
        )

        detection_objects = [
            LogoDetection(
                frame_number=d['frame_number'],
                timestamp=d['timestamp'],
                confidence=d['confidence'],
                bounding_box=BoundingBox(**d['bounding_box']),
                logo_name=d['logo_name'],
                screen_coverage=d['screen_coverage']
            )
            for d in all_detections
        ]

        return AnalysisResult(
            video_key=request.video_key,
            company_id=request.company_id,
            total_frames=video_info['total_frames'],
            analyzed_frames=len(frames),
            detections=detection_objects,
            visibility_duration=scores['visibility_duration'],
            average_coverage=scores['average_coverage'],
            efficiency_score=scores['efficiency_score'],
            verdict=scores['verdict'],
            message=scores['message']
        )

    except Exception as e:
        print(f"Analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if local_path:
            cleanup_video(local_path)