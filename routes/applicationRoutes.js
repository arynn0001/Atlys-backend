const express = require("express");

const {
  createApplication,
  getMyApplications,
  getMyApplicationById,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  deleteApplication,
  uploadApplicationDocument
} = require("../controllers/applicationController");

const {
  protect,
  adminOnly
} = require("../middleware/authMiddleware");

const {
  uploadDocument
} = require("../middleware/uploadMiddleware");

const router = express.Router();

// ==========================================
// USER ROUTES
// ==========================================

// Create Application
router.post(
  "/",
  protect,
  uploadDocument.none(),
  createApplication
);

// Get Logged-in User Applications
router.get(
  "/my",
  protect,
  getMyApplications
);

// Get Logged-in User Single Application
router.get(
  "/my/:id",
  protect,
  getMyApplicationById
);

// Upload Application Document
router.post(
  "/:id/documents",
  protect,
  uploadDocument.single("file"),
  uploadApplicationDocument
);

// ==========================================
// ADMIN ROUTES
// ==========================================

// Get All Applications
router.get(
  "/admin/all",
  protect,
  adminOnly,
  getAllApplications
);

// Get Single Application
router.get(
  "/admin/:id",
  protect,
  adminOnly,
  getApplicationById
);

// Update Application
router.put(
  "/admin/:id",
  protect,
  adminOnly,
  updateApplicationStatus
);

// Delete Application
router.delete(
  "/admin/:id",
  protect,
  adminOnly,
  deleteApplication
);

module.exports = router;