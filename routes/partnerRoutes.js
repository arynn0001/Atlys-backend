const express = require("express");

const {
  createPartner,
  getPartners,
  getPartnerById,
  getPartnersByType,
  updatePartner,
  deletePartner,
} = require("../controllers/partnerController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const {
  uploadDocument,
} = require("../middleware/uploadMiddleware");

const router = express.Router();

// ==========================================
// PUBLIC
// ==========================================

router.get("/", getPartners);

router.get(
  "/type/:typeId",
  getPartnersByType
);

router.get("/:id", getPartnerById);

// ==========================================
// ADMIN
// ==========================================

router.post(
  "/",
  protect,
  adminOnly,
  uploadDocument.fields([
    {
      name: "logo",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  createPartner
);

router.put(
  "/:id",
  protect,
  adminOnly,
  uploadDocument.fields([
    {
      name: "logo",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  updatePartner
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  deletePartner
);

module.exports = router;