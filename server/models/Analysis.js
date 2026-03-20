const mongoose = require("mongoose");

const boundingBoxSchema = new mongoose.Schema({
  x: Number,
  y: Number,
  width: Number,
  height: Number,
});

const detectionSchema = new mongoose.Schema({
  frame_number: Number,
  timestamp: Number,
  confidence: Number,
  bounding_box: boundingBoxSchema,
  logo_name: String,
  screen_coverage: Number,
});

const analysisSchema = new mongoose.Schema(
  {
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    companyId: {
      type: String,
      required: true,
    },
    video_key: String,
    total_frames: Number,
    analyzed_frames: Number,
    detections: [detectionSchema],
    visibility_duration: Number,
    average_coverage: Number,
    efficiency_score: Number,
    verdict: {
      type: String,
      enum: ["pass", "fail"],
    },
    message: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Analysis", analysisSchema);
