const express = require("express");

const {
  getExperiences,
  getExperienceById,
  createExperience,
  updateExperience,
  deleteExperience
} = require("../controllers/experienceController");

const {
  protect,
  adminOnly
} = require("../middleware/authMiddleware");

const router = express.Router();

// =========================
// PUBLIC ROUTES
// =========================

router.get("/", getExperiences);

router.get("/:id", getExperienceById);

// =========================
// ADMIN ROUTES
// =========================

router.post(
  "/",
  protect,
  adminOnly,
  createExperience
);

router.put(
  "/:id",
  protect,
  adminOnly,
  updateExperience
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteExperience
);

module.exports = router;