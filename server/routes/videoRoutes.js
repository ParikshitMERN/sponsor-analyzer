const express = require("express");
const router = express.Router();
const {
  upload,
  getVideos,
  getVideo,
  deleteVideoById,
  getJobStatus,
  getAnalysis,
  getAllReports,
} = require("../controllers/videoController");
const { protect } = require("../middleware/authMiddleware");
const uploadMiddleware = require("../middleware/uploadMiddleware");

router.post("/upload", protect, uploadMiddleware.single("video"), upload);
router.get("/reports", protect, getAllReports); // must be before /:id
router.get("/", protect, getVideos);
router.get("/:id", protect, getVideo);
router.get("/:id/status", protect, getJobStatus);
router.get("/:id/analysis", protect, getAnalysis);
router.delete("/:id", protect, deleteVideoById);

module.exports = router;
