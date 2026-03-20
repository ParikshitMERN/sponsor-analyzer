from typing import List, Dict

def calculate_efficiency_score(
    detections: List[Dict],
    total_analyzed_frames: int,
    video_duration: float
) -> Dict:

    if not detections or total_analyzed_frames == 0:
        return {
            'visibility_duration': 0.0,
            'average_coverage': 0.0,
            'efficiency_score': 0.0,
            'verdict': 'fail',
            'message': 'No logo detections found in the video'
        }

    detected_timestamps = sorted(set([d['timestamp'] for d in detections]))

    if len(detected_timestamps) >= 2:
        visibility_duration = round(
            detected_timestamps[-1] - detected_timestamps[0], 2
        )
    else:
        visibility_duration = round(
            detected_timestamps[0] if detected_timestamps else 0.0, 2
        )

    coverages = [d['screen_coverage'] for d in detections]
    average_coverage = round(sum(coverages) / len(coverages), 2)

    visibility_ratio = min(
        visibility_duration / video_duration, 1.0
    ) if video_duration > 0 else 0

    coverage_score = min(average_coverage / 5.0, 1.0)

    efficiency_score = round(
        ((visibility_ratio * 0.5) + (coverage_score * 0.5)) * 100, 2
    )

    verdict = 'pass' if efficiency_score >= 40 else 'fail'

    message = (
        f"Logo visible for {visibility_duration}s "
        f"out of {video_duration:.1f}s. "
        f"Average screen coverage: {average_coverage}%. "
        f"Efficiency score: {efficiency_score}/100."
    )

    return {
        'visibility_duration': visibility_duration,
        'average_coverage': average_coverage,
        'efficiency_score': efficiency_score,
        'verdict': verdict,
        'message': message
    }