const { minioClient, BUCKET_NAME } = require("../config/minio");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const uploadVideo = (fileBuffer, originalName, mimeType) => {
  return new Promise((resolve, reject) => {
    const ext = path.extname(originalName);
    const key = `videos/${uuidv4()}${ext}`;

    minioClient.putObject(
      BUCKET_NAME,
      key,
      fileBuffer,
      fileBuffer.length,
      { "Content-Type": mimeType },
      (err, etag) => {
        if (err) return reject(err);
        resolve({ key, etag });
      },
    );
  });
};

const getVideoUrl = (key) => {
  return minioClient.presignedGetObject(BUCKET_NAME, key, 60 * 60);
};

const deleteVideo = (key) => {
  return minioClient.removeObject(BUCKET_NAME, key);
};

module.exports = { uploadVideo, getVideoUrl, deleteVideo };
