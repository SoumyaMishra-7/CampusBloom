const multer = require("multer");

function notFoundHandler(_req, res) {
  res.status(404).json({ message: "Route not found" });
}

function errorHandler(error, _req, res, _next) {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({ message: error.message });
  }

  if (error.message === "Unsupported file type") {
    return res.status(400).json({ message: error.message });
  }

  if (error.name === "CastError") {
    return res.status(400).json({ message: "Invalid identifier" });
  }

  if (error.name === "ValidationError") {
    const firstMessage = Object.values(error.errors)[0]?.message || "Validation failed";
    return res.status(400).json({ message: firstMessage });
  }

  return res.status(error.statusCode || 500).json({
    message: error.message || "Internal server error"
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};

