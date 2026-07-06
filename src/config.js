require("dotenv").config();
const path = require("path");

function parseBool(value, fallback = false) {
  if (value === undefined || value === null || value === "") return fallback;
  const normalized = String(value).trim().toLowerCase();
  return ["1", "true", "yes", "on"].includes(normalized);
}

const config = {
  port: Number(process.env.PORT || 3000),

  minioEndPoint: process.env.MINIO_ENDPOINT || "localhost",
  minioPort: Number(process.env.MINIO_PORT || 9000),
  minioUseSSL: parseBool(process.env.MINIO_USE_SSL, false),
  minioAccessKey: process.env.MINIO_ACCESS_KEY || "",
  minioSecretKey: process.env.MINIO_SECRET_KEY || "",
  minioBucket: process.env.MINIO_BUCKET || "",

  defaultBucketName: process.env.DEFAULT_BUCKET_NAME || "sessions",
  defaultBucketPublic: parseBool(process.env.DEFAULT_BUCKET_PUBLIC, false),
  indexFilePath: path.join(__dirname, "..", "data", "session-index.json"),
};

module.exports = config;
