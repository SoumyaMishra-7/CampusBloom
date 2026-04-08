const express = require("express");
const { body, param, query } = require("express-validator");
const {
  createCertificate,
  getCertificates,
  updateCertificate,
  deleteCertificate,
  updateCertificateStatus
} = require("../controllers/certificateController");
const asyncHandler = require("../utils/asyncHandler");
const { verifyJwt, allowRoles } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validate");
const { uploadSingleCertificate } = require("../middleware/upload");

const router = express.Router();

const objectIdRule = param("id").isMongoId().withMessage("Invalid identifier");
const titleRule = body("title")
  .optional({ values: "falsy" })
  .isString()
  .isLength({ min: 1, max: 120 })
  .withMessage("Title must be between 1 and 120 characters");
const descriptionRule = body("description")
  .optional()
  .isString()
  .isLength({ max: 2000 })
  .withMessage("Description must be 2000 characters or fewer");
const fileUrlRule = body("fileUrl")
  .optional()
  .isURL({ require_protocol: true })
  .withMessage("fileUrl must be a valid URL");

router.use(verifyJwt);

router.post(
  "/",
  allowRoles("student"),
  uploadSingleCertificate,
  body("title").isString().trim().notEmpty().withMessage("Title is required"),
  descriptionRule,
  fileUrlRule,
  validateRequest,
  asyncHandler(createCertificate)
);

router.get(
  "/",
  query("page").optional().isInt({ min: 1 }).withMessage("page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100"),
  query("studentId").optional().isMongoId().withMessage("studentId must be valid"),
  query("status").optional().isIn(["pending", "approved", "rejected"]).withMessage("Invalid status"),
  validateRequest,
  asyncHandler(getCertificates)
);

router.put(
  "/:id",
  allowRoles("student"),
  uploadSingleCertificate,
  objectIdRule,
  titleRule,
  descriptionRule,
  fileUrlRule,
  validateRequest,
  asyncHandler(updateCertificate)
);

router.delete(
  "/:id",
  allowRoles("student"),
  objectIdRule,
  validateRequest,
  asyncHandler(deleteCertificate)
);

router.patch(
  "/:id/status",
  allowRoles("admin"),
  objectIdRule,
  body("status").isIn(["approved", "rejected"]).withMessage("Status must be approved or rejected"),
  body("note").optional().isString().isLength({ max: 500 }).withMessage("Note must be 500 characters or fewer"),
  validateRequest,
  asyncHandler(updateCertificateStatus)
);

module.exports = router;

