const express = require("express");

const {
  getCountries,
  getCountryById,
  createCountry,
  updateCountry,
  deleteCountry
} = require("../controllers/countryController");

const {
  protect,
  adminOnly
} = require("../middleware/authMiddleware");

const {
  uploadDocument
} = require("../middleware/uploadMiddleware");

const router = express.Router();


// =====================================================
// USER ROUTES
// =====================================================

// Logged-in user → Get all countries
router.get(
  "/",
  // protect,
  getCountries
);

// Logged-in user → Get single country
router.get(
  "/:id",
  protect,
  getCountryById
);


// =====================================================
// ADMIN ROUTES
// =====================================================

// Admin → Create country
// Required files:
// flag
// image

router.post(
  "/",
  protect,
  adminOnly,
  uploadDocument.fields([
    {
      name: "flag",
      maxCount: 1
    },
    {
      name: "image",
      maxCount: 1
    }
  ]),
  createCountry
);


// Admin → Update country
// Files are optional

router.put(
  "/:id",
  protect,
  adminOnly,
  uploadDocument.fields([
    {
      name: "flag",
      maxCount: 1
    },
    {
      name: "image",
      maxCount: 1
    }
  ]),
  updateCountry
);


// Admin → Delete / deactivate country

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteCountry
);


module.exports = router;