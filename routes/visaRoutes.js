const express = require("express");

const {
  getVisas,
  getVisaCards,
  getVisaById,
  getVisasByCountry,
  getVisaMapData,
  createVisa,
  updateVisa,
  deleteVisa
} = require("../controllers/visaController");

const {
  protect,
  adminOnly
} = require("../middleware/authMiddleware");

const {
  uploadDocument
} = require("../middleware/uploadMiddleware");

const router = express.Router();


// ==========================================
// PUBLIC ROUTES
// ==========================================


// ==========================================
// VISA CARDS
// ==========================================
//
// GET /api/visas/cards
//
// Optional:
// ?country=COUNTRY_ID
// ?category=tourist
// ?popular=true
//
// ==========================================

router.get(
  "/cards",
  getVisaCards
);


// ==========================================
// VISA MAP DATA
// ==========================================
//
// GET /api/visas/map
//
// Optional:
// ?country=COUNTRY_ID
// ?category=tourist
// ?popular=true
//
// Returns:
// - Country (name, code, flag, image)
// - Visa (name, category, type, etc.)
// - Location (latitude, longitude)
// - estimatedVisaDate
// - approvalDateLabel ("08 OCT 26")
// - visaStatus ("guaranteed" | "normal" | "fast_track")
// - badgeText ("GUARANTEED APPROVAL")
// - startingPrice, currency
// - detailUrl
//
// ==========================================

router.get(
  "/map",
  getVisaMapData
);


// ==========================================
// GET ALL VISAS
// ==========================================

router.get(
  "/",
  getVisas
);


// ==========================================
// GET VISAS BY COUNTRY
// ==========================================

router.get(
  "/country/:countryId",
  getVisasByCountry
);


// ==========================================
// GET SINGLE VISA
// ==========================================

router.get(
  "/:id",
  getVisaById
);


// ==========================================
// ADMIN ROUTES
// ==========================================


// ==========================================
// CREATE VISA
// ==========================================
//
// Content-Type:
// multipart/form-data
//
// Image field:
// image
//
// Additional fields:
// estimatedVisaDate
// visaStatus
// badgeText
// detailUrl
//
// ==========================================

router.post(
  "/",
  protect,
  adminOnly,
  uploadDocument.single("image"),
  createVisa
);


// ==========================================
// UPDATE VISA
// ==========================================
//
// Content-Type:
// multipart/form-data
//
// Image field:
// image
//
// Additional fields:
// estimatedVisaDate
// visaStatus
// badgeText
// detailUrl
//
// ==========================================

router.put(
  "/:id",
  protect,
  adminOnly,
  uploadDocument.single("image"),
  updateVisa
);


// ==========================================
// DEACTIVATE VISA
// ==========================================

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteVisa
);


module.exports = router;