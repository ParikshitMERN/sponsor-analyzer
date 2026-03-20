const Bull = require("bull");

const videoQueue = new Bull("video-analysis", {
  redis: {
    host: "redis",
    port: 6379,
  },
});

videoQueue.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

videoQueue.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed: ${err.message}`);
});

videoQueue.on("active", (job) => {
  console.log(`Job ${job.id} started processing`);
});

module.exports = videoQueue;
