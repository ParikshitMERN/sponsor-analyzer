import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { getJobStatus } from "../services/videoService";
import Navbar from "../components/shared/Navbar";

const AnalysisPage = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>("uploaded");
  const [error, setError] = useState<string>("");

  // ── Socket.io listener ──
  useEffect(() => {
    const token = localStorage.getItem("token");
    const jobId = localStorage.getItem(`jobId-${videoId}`);

    const socket = io(
      import.meta.env.VITE_SOCKET_URL ?? "http://localhost:5000",
      { auth: { token } },
    );

    socket.on("connect", () => {
      console.log("Socket connected");
      if (jobId) socket.emit("subscribe-job", jobId);
    });

    socket.on("job-update", (update: any) => {
      console.log("Socket job update:", update);
      if (update.videoId === videoId || update.jobId === jobId) {
        setStatus(update.status);
        if (update.status === "completed") {
          setTimeout(() => navigate(`/report/${videoId}`), 1000);
        }
        if (update.status === "failed") {
          setError(update.error || "Analysis failed");
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [videoId, navigate]);

  // ── Polling fallback every 5 seconds ──
  useEffect(() => {
    if (!videoId) return;

    const interval = setInterval(async () => {
      try {
        const result = await getJobStatus(videoId);
        console.log("Polling status:", result?.status);

        if (!result) return;

        setStatus(result.status);

        if (result.status === "completed") {
          clearInterval(interval);
          setTimeout(() => navigate(`/report/${videoId}`), 1000);
        }

        if (result.status === "failed") {
          clearInterval(interval);
          setError("Analysis failed — please try again");
        }
      } catch (err: any) {
        console.error("Polling error:", err.message);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [videoId, navigate]);

  const steps = [
    { label: "Video uploaded to storage", triggerStatus: "uploaded" },
    { label: "Extracting frames with OpenCV", triggerStatus: "processing" },
    { label: "Detecting logos with YOLOv8", triggerStatus: "processing" },
    { label: "Matching brands with CLIP", triggerStatus: "processing" },
    { label: "Calculating efficiency score", triggerStatus: "completed" },
  ];

  // Map status to a numeric level
  const statusLevel: Record<string, number> = {
    uploaded: 0,
    processing: 1,
    completed: 2,
    failed: 2,
  };

  const triggerLevel: Record<string, number> = {
    uploaded: 0,
    processing: 1,
    completed: 2,
  };

  const current = statusLevel[status] ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Analyzing video...
        </h1>
        <p className="text-gray-500 text-sm mb-12">
          Our AI is detecting sponsor logos in your video
        </p>

        <div className="space-y-4 text-left">
          {steps.map((step, i) => {
            const stepLevel = triggerLevel[step.triggerStatus] ?? 0;
            const isDone = current > stepLevel;
            const isActive = current === stepLevel;

            return (
              <div key={i} className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all
                  ${
                    isDone
                      ? "bg-green-500 text-white"
                      : isActive
                        ? "bg-blue-500 text-white animate-pulse"
                        : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {isDone ? "✓" : i + 1}
                </div>
                <span
                  className={`text-sm ${isDone || isActive ? "text-gray-800" : "text-gray-400"}`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Status badge */}
        <div className="mt-8">
          <span
            className={`inline-block px-4 py-2 rounded-full text-sm font-medium
            ${
              status === "completed"
                ? "bg-green-100 text-green-700"
                : status === "failed"
                  ? "bg-red-100 text-red-700"
                  : status === "processing"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-600"
            }`}
          >
            {status === "uploaded" && "Waiting in queue..."}
            {status === "processing" && "AI is analyzing your video..."}
            {status === "completed" && "Complete! Redirecting to report..."}
            {status === "failed" && "Analysis failed"}
          </span>
        </div>

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisPage;
