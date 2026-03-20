import api from "./api";
import { UploadResponse } from "../types/video.types";
import { AnalysisResult } from "../types/analysis.types";

export const uploadVideo = async (
  file: File,
  title: string,
  logoNames: string[],
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("video", file);
  formData.append("title", title);
  formData.append("logoNames", logoNames.join(","));

  const { data } = await api.post<{ success: boolean; data: UploadResponse }>(
    "/video/upload",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data.data;
};

export const getAnalysisResult = async (
  videoId: string,
): Promise<AnalysisResult> => {
  const { data } = await api.get<{ success: boolean; data: AnalysisResult }>(
    `/video/${videoId}/analysis`,
  );
  return data.data;
};

export const getAllReports = async (): Promise<AnalysisResult[]> => {
  const { data } = await api.get<{ success: boolean; data: AnalysisResult[] }>(
    "/video/reports",
  );
  return data.data;
};

export const getJobStatus = async (videoId: string) => {
  const { data } = await api.get(`/video/${videoId}/status`);
  return data.data;
};
