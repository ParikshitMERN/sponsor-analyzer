import cv2
import numpy as np
from typing import List, Tuple
from app.core.config import settings

def extract_frames(video_path: str) -> List[Tuple[int, float, np.ndarray]]:
    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        raise ValueError(f"Could not open video: {video_path}")

    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    frame_interval = int(fps * settings.FRAME_INTERVAL)
    if frame_interval < 1:
        frame_interval = 1

    frames = []
    frame_number = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if frame_number % frame_interval == 0:
            timestamp = frame_number / fps
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frames.append((frame_number, round(timestamp, 2), rgb_frame))
        frame_number += 1

    cap.release()
    print(f"Extracted {len(frames)} frames from {total_frames} total frames")
    return frames

def get_video_info(video_path: str) -> dict:
    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    info = {
        'fps': fps,
        'total_frames': total_frames,
        'width': int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
        'height': int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)),
        'duration': total_frames / fps if fps > 0 else 0
    }
    cap.release()
    return info