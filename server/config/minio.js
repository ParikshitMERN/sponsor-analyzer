const Minio = require("minio");

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || "minio",
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
  secretKey: process.env.MINIO_SECRET_KEY || "minioadmin123",
});

const BUCKET_NAME = "sponsor-videos";

const initMinio = async () => {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, "us-east-1");
      console.log(`Bucket '${BUCKET_NAME}' created`);
    } else {
      console.log(`Bucket '${BUCKET_NAME}' already exists`);
    }
    console.log("MinIO connected");
  } catch (err) {
    console.error("MinIO error:", err.message);
  }
};

module.exports = { minioClient, initMinio, BUCKET_NAME };
