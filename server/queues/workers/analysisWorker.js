const videoQueue = require("../videoQueue");
const Video = require("../../models/Video");
const Analysis = require("../../models/Analysis");
const axios = require("axios");

videoQueue.process(async (job) => {
  const { videoId, videoKey, companyId, logoNames } = job.data;

  try {
    await Video.findByIdAndUpdate(videoId, { status: "processing" });

    const response = await axios.post(
      `${process.env.AI_SERVICE_URL}/analyze/`,
      {
        video_key: videoKey,
        company_id: companyId.toString(),
        logo_names: logoNames,
      },
      { timeout: 600000 },
    );

    const result = response.data;

    await Analysis.create({
      videoId,
      companyId: companyId.toString(),
      video_key: videoKey,
      total_frames: result.total_frames,
      analyzed_frames: result.analyzed_frames,
      detections: result.detections,
      visibility_duration: result.visibility_duration,
      average_coverage: result.average_coverage,
      efficiency_score: result.efficiency_score,
      verdict: result.verdict,
      message: result.message,
    });

    await Video.findByIdAndUpdate(videoId, { status: "completed" });

    // ── Emit socket event to notify frontend ──
    const io = require("../../server").io;
    if (io) {
      io.emit("job-update", {
        jobId: job.id.toString(),
        videoId: videoId.toString(),
        status: "completed",
      });
      console.log(`Socket emitted for job ${job.id}`);
    }

    console.log(`Analysis saved for video ${videoId}`);
    return result;
  } catch (err) {
    await Video.findByIdAndUpdate(videoId, { status: "failed" });

    // Emit failure too
    try {
      const io = require("../../server").io;
      if (io) {
        io.emit("job-update", {
          jobId: job.id.toString(),
          videoId: videoId.toString(),
          status: "failed",
          error: err.message,
        });
      }
    } catch (e) {}

    console.error(`Analysis failed for video ${videoId}:`, err.message);
    throw new Error(err.message);
  }
});

module.exports = videoQueue;
