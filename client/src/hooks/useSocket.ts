import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface JobUpdate {
  jobId: string;
  status: "pending" | "processing" | "completed" | "failed";
  result?: object;
  error?: string;
}

export const useSocket = (jobId: string | null) => {
  const [jobUpdate, setJobUpdate] = useState<JobUpdate | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ?? "http://localhost:5000";

    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("Socket connected");
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket || !jobId) return;

    socket.emit("subscribe-job", jobId);

    socket.on("job-update", (update: JobUpdate) => {
      if (update.jobId === jobId) {
        setJobUpdate(update);
      }
    });

    return () => {
      socket.off("job-update");
    };
  }, [socket, jobId]);

  return { jobUpdate };
};
