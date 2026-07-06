const express = require("express");
const path = require("path");
const config = require("./config");
const MinioFilesClient = require("./lib/minioFilesClient");
const BucketService = require("./lib/bucketService");
const SessionStore = require("./lib/sessionStore");
const createSessionRoutes = require("./routes/sessionRoutes");
const createBucketRoutes = require("./routes/bucketRoutes");
const createWhatsappRoutes = require("./routes/whatsappRoutes");

function createApp() {
  const app = express();

  app.use(express.json({ limit: "2mb" }));
  app.use(express.static(path.join(__dirname, "public")));

  const filesClient = new MinioFilesClient({
    endPoint: config.minioEndPoint,
    port: config.minioPort,
    useSSL: config.minioUseSSL,
    accessKey: config.minioAccessKey,
    secretKey: config.minioSecretKey,
  });

  const bucketService = new BucketService({ filesClient });

  const sessionStore = new SessionStore({
    bucketService,
    indexFilePath: config.indexFilePath,
    bucketId: config.minioBucket,
  });

  app.get("/health", (_req, res) => {
    res.json({
      ok: true,
      service: "spark-session-store-api",
      bucketConfigured: Boolean(sessionStore.bucketId),
    });
  });

  app.use(
    "/buckets",
    createBucketRoutes({ bucketService, sessionStore, config }),
  );
  app.use("/sessions", createSessionRoutes({ sessionStore }));
  app.use("/whatsapp", createWhatsappRoutes({ sessionStore }));

  app.use((err, _req, res, _next) => {
    const statusCode = err?.response?.status || 400;
    const message =
      err?.response?.data?.message || err.message || "Unknown error";

    res.status(statusCode).json({
      error: message,
      details: err?.response?.data || null,
    });
  });

  return app;
}

module.exports = createApp;
