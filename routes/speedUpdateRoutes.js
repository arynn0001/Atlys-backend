const express = require("express");

const {
  getPublicSpeedUpdates,
  getAllSpeedUpdates,
  getSingleSpeedUpdate,
  createSpeedUpdate,
  updateSpeedUpdate,
  deleteSpeedUpdate,
  toggleSpeedUpdateActive
} = require("../controllers/speedUpdateController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// PUBLIC
// =====================================================

// GET /api/speedupdates
router.get("/", getPublicSpeedUpdates);

// =====================================================
// ADMIN
// =====================================================

router.get("/admin/all", protect, adminOnly, getAllSpeedUpdates);
router.get("/admin/:id", protect, adminOnly, getSingleSpeedUpdate);
router.post("/admin", protect, adminOnly, createSpeedUpdate);
router.put("/admin/:id", protect, adminOnly, updateSpeedUpdate);
router.delete("/admin/:id", protect, adminOnly, deleteSpeedUpdate);
router.put(
  "/admin/:id/toggle",
  protect,
  adminOnly,
  toggleSpeedUpdateActive
);

module.exports = router;