const express = require("express");

const {
  submitDefenceApplication,
  getDefenceStatus,
  getPublicDefenceApplications,
  getAllDefenceApplications,
  getDefenceApplication,
  verifyDefenceApplication,
  rejectDefenceApplication,
} = require("../controllers/defenceController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const {
  uploadDocument,
} = require("../middleware/uploadMiddleware");

const router = express.Router();

// =====================================================
// PUBLIC / USER
// =====================================================

// -----------------------------------------------------
// Submit Defence Application
// PUBLIC
// -----------------------------------------------------

router.post(
  "/apply",
  uploadDocument.single("defenceIdDocument"),
  submitDefenceApplication
);

// -----------------------------------------------------
// Get Defence Application Status
// PUBLIC
// -----------------------------------------------------

router.get(
  "/status",
  getDefenceStatus
);

// -----------------------------------------------------
// Get Defence Applications
// PUBLIC
//
// No admin token required.
//
// GET:
// /api/defence/applications
//
// This endpoint is intended for the frontend
// to fetch Defence application content.
// -----------------------------------------------------

router.get(
  "/applications",
  getPublicDefenceApplications
);

// =====================================================
// ADMIN
// =====================================================

// -----------------------------------------------------
// Get ALL Defence Applications
// ADMIN ONLY
// -----------------------------------------------------

router.get(
  "/admin/all",
  protect,
  adminOnly,
  getAllDefenceApplications
);

// -----------------------------------------------------
// Get Single Defence Application
// ADMIN ONLY
// -----------------------------------------------------

router.get(
  "/admin/:id",
  protect,
  adminOnly,
  getDefenceApplication
);

// -----------------------------------------------------
// Verify Defence Application
// ADMIN ONLY
// -----------------------------------------------------

router.put(
  "/admin/:id/verify",
  protect,
  adminOnly,
  verifyDefenceApplication
);

// -----------------------------------------------------
// Reject Defence Application
// ADMIN ONLY
// -----------------------------------------------------

router.put(
  "/admin/:id/reject",
  protect,
  adminOnly,
  rejectDefenceApplication
);

module.exports = router;