const express = require("express");

const {
  getFAQs,
  getFAQById,
  getAllFAQsAdmin,
  createFAQ,
  updateFAQ,
  deleteFAQ
} = require("../controllers/faqController");

const {
  protect,
  adminOnly
} = require("../middleware/authMiddleware");

const router = express.Router();


// ==========================================
// PUBLIC ROUTES
// ==========================================

// Get active FAQs
// Examples:
// /api/faqs
// /api/faqs?type=visa
// /api/faqs?type=application
// /api/faqs?type=visa&visa=VISA_ID
router.get("/", getFAQs);


// Get single FAQ
router.get("/:id", getFAQById);


// ==========================================
// ADMIN ROUTES
// ==========================================

// Get all FAQs including inactive
router.get(
  "/admin/all",


  getAllFAQsAdmin
);


// Create FAQ
router.post(
  "/",
  protect,
  adminOnly,
  createFAQ
);


// Update FAQ
router.put(
  "/:id",
  protect,
  adminOnly,
  updateFAQ
);


// Delete / deactivate FAQ
router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteFAQ
);


module.exports = router;