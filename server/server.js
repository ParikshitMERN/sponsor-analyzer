const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const { initMinio } = require("./config/minio");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

const PORT = process.env.PORT || 5000;

connectDB();
initMinio();

app.set("io", io);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/video", require("./routes/videoRoutes"));

app.get("/api/health", (req, res) => {
  return res.json({ success: true, status: "Server is running" });
});

app.use((req, res) => {
  return res.status(404).json({ success: false, message: "Route not found" });
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("subscribe-job", (jobId) => {
    console.log(`Client subscribed to job: ${jobId}`);
    socket.join(`job-${jobId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

require("./queues/workers/analysisWorker");

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { io };
