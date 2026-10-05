const express = require("express");

const {
  getPublicNewsroom,
  getAllNewsroom,
  getSingleNewsroom,
  createNewsroom,
  updateNewsroom,
  deleteNewsroom,
  toggleNewsroomActive
} = require("../controllers/newsroomController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// PUBLIC (website wala banda)
// =====================================================

router.get("/", getPublicNewsroom);

// =====================================================
// ADMIN (tumhara admin panel)
// =====================================================

router.get("/admin/all", protect, adminOnly, getAllNewsroom);

router.get("/admin/:id", protect, adminOnly, getSingleNewsroom);

router.post("/admin", protect, adminOnly, createNewsroom);

router.put("/admin/:id", protect, adminOnly, updateNewsroom);

router.delete("/admin/:id", protect, adminOnly, deleteNewsroom);

router.put("/admin/:id/toggle", protect, adminOnly, toggleNewsroomActive);

module.exports = router;