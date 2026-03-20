export type JobStatus = "pending" | "processing" | "completed" | "failed";

export interface Video {
  _id: string;
  title: string;
  filename: string;
  minioKey: string;
  uploadedBy: string;
  status: JobStatus;
  createdAt: string;
}

export interface UploadResponse {
  videoId: string;
  jobId: string;
  message: string;
}
