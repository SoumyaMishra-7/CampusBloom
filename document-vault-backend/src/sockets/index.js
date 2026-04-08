const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const env = require("../config/env");

function initializeSocketServer(server) {
  const io = new Server(server, {
    cors: {
      origin: env.clientOrigin,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
    }
  });

  io.use((socket, next) => {
    const rawToken =
      socket.handshake.auth?.token ||
      socket.handshake.headers.authorization?.replace(/^Bearer\s+/i, "");

    if (!rawToken) {
      return next(new Error("Authentication required"));
    }

    try {
      const payload = jwt.verify(rawToken, env.jwtSecret);
      socket.user = {
        userId: payload.sub,
        role: payload.role
      };
      return next();
    } catch (error) {
      return next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(`user:${socket.user.userId}`);
    if (socket.user.role === "admin") {
      socket.join("admins");
    }
  });

  return io;
}

function emitCertificateEvent(io, eventName, payload, studentId) {
  if (!io) {
    return;
  }

  io.to("admins").emit(eventName, payload);
  if (studentId) {
    io.to(`user:${studentId}`).emit(eventName, payload);
  }
}

module.exports = {
  initializeSocketServer,
  emitCertificateEvent
};

