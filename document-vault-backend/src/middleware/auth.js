const jwt = require("jsonwebtoken");
const env = require("../config/env");

function extractToken(headerValue = "") {
  if (!headerValue.startsWith("Bearer ")) {
    return null;
  }
  return headerValue.slice(7).trim();
}

function verifyJwt(req, res, next) {
  const token = extractToken(req.headers.authorization);

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.auth = {
      userId: payload.sub,
      role: payload.role
    };
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

function allowRoles(...roles) {
  return function roleGuard(req, res, next) {
    if (!req.auth || !roles.includes(req.auth.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return next();
  };
}

module.exports = {
  verifyJwt,
  allowRoles
};

