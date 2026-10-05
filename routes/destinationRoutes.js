const express = require("express");

const {
  getDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination
} = require("../controllers/destinationController");

const {
  protect,
  adminOnly
} = require("../middleware/authMiddleware");

const router = express.Router();

// =========================
// PUBLIC ROUTES
// =========================

router.get("/", getDestinations);

router.get("/:id", getDestinationById);

// =========================
// ADMIN ROUTES
// =========================

router.post(
  "/",
  protect,
  adminOnly,
  createDestination
);

router.put(
  "/:id",
  protect,
  adminOnly,
  updateDestination
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteDestination
);

module.exports = router;