import numpy as np
from ultralytics import YOLO
from typing import List, Dict
from app.utils.image_utils import calculate_coverage

model = None

def load_model():
    global model
    if model is None:
        model = YOLO('yolov8n.pt')
        print("YOLOv8 model loaded")
    return model

def detect_objects(frame: np.ndarray) -> List[Dict]:
    yolo = load_model()
    results = yolo(frame, verbose=False)
    detections = []

    for result in results:
        boxes = result.boxes
        if boxes is None:
            continue

        h, w = frame.shape[:2]

        for box in boxes:
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            confidence = float(box.conf[0])

            bounding_box = {
                'x': round(x1, 2),
                'y': round(y1, 2),
                'width': round(x2 - x1, 2),
                'height': round(y2 - y1, 2)
            }

            coverage = calculate_coverage(bounding_box, w, h)

            detections.append({
                'confidence': round(confidence, 4),
                'bounding_box': bounding_box,
                'screen_coverage': coverage
            })

    return detections