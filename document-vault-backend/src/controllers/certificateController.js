const fs = require("fs");
const path = require("path");
const sanitizeHtml = require("sanitize-html");
const Certificate = require("../models/Certificate");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const { emitCertificateEvent } = require("../sockets");

function sanitizeText(value, maxLength) {
  return sanitizeHtml(String(value || ""), { allowedTags: [], allowedAttributes: {} })
    .trim()
    .slice(0, maxLength);
}

function buildFileUrl(req, file) {
  if (file) {
    return `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
  }

  return sanitizeHtml(String(req.body.fileUrl || ""), {
    allowedTags: [],
    allowedAttributes: {}
  }).trim();
}

function removeUploadedFile(file) {
  if (file?.path && fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }
}

async function ensureStudent(userId) {
  const student = await User.findOne({ _id: userId, role: "student" });
  if (!student) {
    const error = new Error("Student account not found");
    error.statusCode = 404;
    throw error;
  }
}

async function findOwnedCertificate(certificateId, userId) {
  const certificate = await Certificate.findOne({ _id: certificateId, studentId: userId });

  if (!certificate) {
    const error = new Error("Certificate not found");
    error.statusCode = 404;
    throw error;
  }

  return certificate;
}

async function createCertificate(req, res) {
  await ensureStudent(req.auth.userId);

  const title = sanitizeText(req.body.title, 120);
  const description = sanitizeText(req.body.description, 2000);
  const fileUrl = buildFileUrl(req, req.file);

  if (!title) {
    removeUploadedFile(req.file);
    return res.status(400).json({ message: "Title is required" });
  }

  if (!fileUrl) {
    removeUploadedFile(req.file);
    return res.status(400).json({ message: "Certificate file is required" });
  }

  const certificate = await Certificate.create({
    title,
    description,
    fileUrl,
    studentId: req.auth.userId,
    status: "pending"
  });

  const payload = await Certificate.findById(certificate._id).populate("studentId", "name email role");
  emitCertificateEvent(req.app.get("io"), "certificate_created", payload, String(payload.studentId._id));

  return res.status(201).json(payload);
}

async function getCertificates(req, res) {
  const isAdmin = req.auth.role === "admin";
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (isAdmin) {
    if (req.query.studentId) {
      filter.studentId = req.query.studentId;
    }
  } else {
    filter.studentId = req.auth.userId;
  }

  const query = Certificate.find(filter)
    .sort({ updatedAt: -1 })
    .populate("studentId", "name email role");

  if (isAdmin) {
    query.skip((page - 1) * limit).limit(limit);
  }

  const [items, total] = await Promise.all([
    query,
    Certificate.countDocuments(filter)
  ]);

  return res.json({
    data: items,
    pagination: {
      page: isAdmin ? page : 1,
      limit: isAdmin ? limit : items.length,
      total,
      totalPages: isAdmin ? Math.max(Math.ceil(total / limit), 1) : 1
    }
  });
}

async function updateCertificate(req, res) {
  const certificate = await findOwnedCertificate(req.params.id, req.auth.userId);

  if (certificate.status === "approved") {
    removeUploadedFile(req.file);
    return res.status(400).json({ message: "Approved certificates cannot be modified" });
  }

  const title = sanitizeText(req.body.title, 120);
  const description = sanitizeText(req.body.description, 2000);
  const fileUrl = buildFileUrl(req, req.file) || certificate.fileUrl;

  if (!title) {
    removeUploadedFile(req.file);
    return res.status(400).json({ message: "Title is required" });
  }

  certificate.title = title;
  certificate.description = description;
  certificate.fileUrl = fileUrl;
  certificate.status = "pending";
  await certificate.save();

  const payload = await Certificate.findById(certificate._id).populate("studentId", "name email role");
  emitCertificateEvent(req.app.get("io"), "certificate_updated", payload, String(payload.studentId._id));

  return res.json(payload);
}

async function deleteCertificate(req, res) {
  const certificate = await findOwnedCertificate(req.params.id, req.auth.userId);
  const studentId = String(certificate.studentId);

  await certificate.deleteOne();
  emitCertificateEvent(req.app.get("io"), "certificate_deleted", { _id: certificate._id }, studentId);

  return res.status(204).send();
}

async function updateCertificateStatus(req, res) {
  const certificate = await Certificate.findById(req.params.id).populate("studentId", "name email role");

  if (!certificate) {
    return res.status(404).json({ message: "Certificate not found" });
  }

  certificate.status = req.body.status;
  await certificate.save();

  await AuditLog.create({
    certificateId: certificate._id,
    actedBy: req.auth.userId,
    action: req.body.status,
    note: sanitizeText(req.body.note, 500)
  });

  emitCertificateEvent(
    req.app.get("io"),
    "certificate_status_changed",
    certificate,
    String(certificate.studentId._id)
  );

  return res.json(certificate);
}

module.exports = {
  createCertificate,
  getCertificates,
  updateCertificate,
  deleteCertificate,
  updateCertificateStatus
};

