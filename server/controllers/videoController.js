const Video = require("../models/Video");
const User = require("../models/User");
const Analysis = require("../models/Analysis");
const {
  uploadVideo,
  getVideoUrl,
  deleteVideo,
} = require("../services/minioService");
const videoQueue = require("../queues/videoQueue");

// ── Upload Video ──────────────────────────
const upload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No video file provided",
      });
    }

    const { title, logoNames } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Video title is required",
      });
    }

    const fullUser = await User.findById(req.user._id);
    if (!fullUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Upload to MinIO
    const { key } = await uploadVideo(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
    );

    // Parse logoNames — comes as comma separated string
    const parsedLogoNames = logoNames
      ? logoNames
          .split(",")
          .map((n) => n.trim())
          .filter(Boolean)
      : [];

    // Save metadata to MongoDB
    const video = await Video.create({
      title,
      originalName: req.file.originalname,
      minioKey: key,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploadedBy: fullUser._id,
      companyName: fullUser.companyName || req.user.companyName || "Unknown",
      logoNames: parsedLogoNames,
    });

    // Add job to Bull queue
    const job = await videoQueue.add({
      videoId: video._id,
      videoKey: key,
      companyId: fullUser._id,
      logoNames: parsedLogoNames,
    });

    // Update video with jobId
    await Video.findByIdAndUpdate(video._id, { jobId: job.id });

    // Emit socket event
    const io = req.app.get("io");
    if (io) {
      io.emit("job-update", {
        jobId: job.id.toString(),
        status: "pending",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Video uploaded and queued for analysis",
      data: {
        videoId: video._id,
        jobId: job.id.toString(),
        message: "Video uploaded and queued for analysis",
      },
    });
  } catch (err) {
    console.error("Upload error:", err.message);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ── Get all videos ────────────────────────
const getVideos = async (req, res) => {
  try {
    const videos = await Video.find({ uploadedBy: req.user._id })
      .sort({ createdAt: -1 })
      .select("-minioKey");

    return res.status(200).json({
      success: true,
      data: { videos },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ── Get single video ──────────────────────
const getVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    if (video.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this video",
      });
    }

    const url = await getVideoUrl(video.minioKey);

    return res.status(200).json({
      success: true,
      data: { video, url },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ── Delete video ──────────────────────────
const deleteVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    if (video.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this video",
      });
    }

    await deleteVideo(video.minioKey);
    await Video.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ── Get job status ────────────────────────
const getJobStatus = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).select(
      "status jobId title",
    );

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        status: video.status,
        jobId: video.jobId,
        title: video.title,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ── Get analysis result ───────────────────
const getAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findOne({ videoId: req.params.id });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found — job may still be processing",
      });
    }

    return res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// ── Get all reports ───────────────────────
const getAllReports = async (req, res) => {
  try {
    const reports = await Analysis.find({
      companyId: req.user._id.toString(),
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  upload,
  getVideos,
  getVideo,
  deleteVideoById,
  getJobStatus,
  getAnalysis,
  getAllReports,
};
