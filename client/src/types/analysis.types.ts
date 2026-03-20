export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LogoDetection {
  frame_number: number;
  timestamp: number;
  confidence: number;
  bounding_box: BoundingBox;
  logo_name: string;
  screen_coverage: number;
}

export interface AnalysisResult {
  _id: string;
  videoId: string;
  companyId: string;
  total_frames: number;
  analyzed_frames: number;
  detections: LogoDetection[];
  visibility_duration: number;
  average_coverage: number;
  efficiency_score: number;
  verdict: "pass" | "fail";
  message: string;
  createdAt: string;
}
