const express = require("express");

const {
  getPlaces,
  getPlaceById,
  createPlace,
  updatePlace,
  deletePlace
} = require("../controllers/placeController");

const {
  protect,
  adminOnly
} = require("../middleware/authMiddleware");

const router = express.Router();

// =========================
// PUBLIC ROUTES
// =========================

router.get("/", getPlaces);

router.get("/:id", getPlaceById);

// =========================
// ADMIN ROUTES
// =========================

router.post(
  "/",
  protect,
  adminOnly,
  createPlace
);

router.put(
  "/:id",
  protect,
  adminOnly,
  updatePlace
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deletePlace
);

module.exports = router;