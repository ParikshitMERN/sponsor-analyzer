import numpy as np
from PIL import Image
from typing import List, Dict, Optional
import torch
from transformers import CLIPProcessor, CLIPModel
from app.core.config import settings

clip_model = None
clip_processor = None

def load_clip():
    global clip_model, clip_processor
    if clip_model is None:
        print("Loading CLIP model...")
        clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
        clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
        print("CLIP model loaded")
    return clip_model, clip_processor

def match_logo(
    frame: np.ndarray,
    bounding_box: Dict,
    logo_names: List[str]
) -> Optional[Dict]:
    model, processor = load_clip()

    x = int(bounding_box['x'])
    y = int(bounding_box['y'])
    w = int(bounding_box['width'])
    h = int(bounding_box['height'])

    if w <= 0 or h <= 0:
        return None

    pil_image = Image.fromarray(frame)
    cropped = pil_image.crop((x, y, x + w, y + h))

    text_prompts = [f"a logo of {name}" for name in logo_names]
    text_prompts.append("not a logo or unrelated object")

    inputs = processor(
        text=text_prompts,
        images=cropped,
        return_tensors="pt",
        padding=True
    )

    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits_per_image
        probs = logits.softmax(dim=1)[0]

    best_idx = probs[:-1].argmax().item()
    best_prob = float(probs[best_idx])

    if best_prob >= settings.CONFIDENCE_THRESHOLD:
        return {
            'logo_name': logo_names[best_idx],
            'confidence': round(best_prob, 4)
        }

    return None