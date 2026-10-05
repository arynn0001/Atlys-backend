const express = require("express");

const {
  createPartnerType,
  getPartnerTypes,
  getPartnerTypeById,
  updatePartnerType,
  deletePartnerType,
} = require("../controllers/partnerTypeController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ==============================
// PUBLIC
// ==============================

router.get("/", getPartnerTypes);

router.get("/:id", getPartnerTypeById);

// ==============================
// ADMIN
// ==============================

router.post(
  "/",
  protect,
  adminOnly,
  createPartnerType
);

router.put(
  "/:id",
  protect,
  adminOnly,
  updatePartnerType
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deletePartnerType
);

module.exports = router;