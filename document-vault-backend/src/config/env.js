const path = require("path");

function readNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

module.exports = {
  port: readNumber(process.env.PORT, 4000),
  mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/document_vault",
  jwtSecret: process.env.JWT_SECRET || "change-me",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  maxFileSizeMb: readNumber(process.env.MAX_FILE_SIZE_MB, 5),
  uploadsDir: path.join(__dirname, "..", "uploads")
};

