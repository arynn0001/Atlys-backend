const express = require("express");

const {
  getPriceChanges,
  getPriceChangeById,
  createPriceChange,
  updatePriceChange,
  deletePriceChange,
} = require("../controllers/priceChangeController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// PUBLIC
// ==========================================

router.get(
  "/",
  getPriceChanges
);

// ==========================================
// ADMIN
// ==========================================

router.post(
  "/",
  protect,
  adminOnly,
  createPriceChange
);

router.get(
  "/:id",
  

  getPriceChangeById
);

router.put(
  "/:id",
  protect,
  adminOnly,
  updatePriceChange
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deletePriceChange
);

module.exports = router;