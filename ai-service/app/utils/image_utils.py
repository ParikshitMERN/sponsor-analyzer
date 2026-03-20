import numpy as np
from PIL import Image

def calculate_coverage(bounding_box: dict, frame_width: int, frame_height: int) -> float:
    box_area = bounding_box['width'] * bounding_box['height']
    frame_area = frame_width * frame_height
    if frame_area == 0:
        return 0.0
    return round((box_area / frame_area) * 100, 2)

def numpy_to_pil(frame: np.ndarray) -> Image.Image:
    return Image.fromarray(frame)

def resize_frame(frame: np.ndarray, max_size: int = 640) -> np.ndarray:
    import cv2
    h, w = frame.shape[:2]
    if max(h, w) > max_size:
        scale = max_size / max(h, w)
        new_w = int(w * scale)
        new_h = int(h * scale)
        frame = cv2.resize(frame, (new_w, new_h))
    return frame