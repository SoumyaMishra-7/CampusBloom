const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const certificateRoutes = require("./routes/certificateRoutes");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");
const env = require("./config/env");

function createApp(io) {
  const app = express();

  app.set("io", io);
  app.use(helmet());
  app.use(
    cors({
      origin: env.clientOrigin
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan("dev"));
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/certificates", certificateRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = {
  createApp
};

