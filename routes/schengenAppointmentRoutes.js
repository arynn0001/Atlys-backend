const express = require("express");

const {
  getDestinations,
  getDestinationPage,

  createDestination,
  updateDestination,
  deleteDestination,

  getCentres,
  createCentre,
  updateCentre,
  deleteCentre,

  getSlots,
  getEarliestSlots,
  createSlot,
  updateSlot,
  deleteSlot,

  bookAppointment,
  getMyBookings,

  getAllBookings,
  updateBookingStatus,

  createAlert,
  getMyAlerts,
  deleteAlert,

  getAdminOverview,
} = require("../controllers/schengenAppointmentController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// PUBLIC
// =====================================================

// Get all active Schengen destinations
router.get(
  "/destinations",
  getDestinations
);

// Get complete destination page data
router.get(
  "/:slug",
  getDestinationPage
);

// Get centres of a destination
router.get(
  "/:destinationId/centres",
  getCentres
);

// Get available slots of a destination
router.get(
  "/:destinationId/slots",
  getSlots
);

// Get earliest available slot for every centre
router.get(
  "/:destinationId/earliest",
  getEarliestSlots
);

// =====================================================
// USER
// =====================================================

// Create/book Schengen appointment
// Login required
router.post(
  "/book",
  protect,
  bookAppointment
);

// =====================================================
// USER - MY APPLICATIONS
// =====================================================

// IMPORTANT:
// This endpoint returns ONLY the applications
// belonging to the currently logged-in user.
//
// It CANNOT be accessed without a valid user JWT.
router.get(
  "/bookings/my",
  protect,
  getMyBookings
);

// =====================================================
// USER - ALERTS
// =====================================================

// Create slot alert
// Login required
router.post(
  "/alerts",
  protect,
  createAlert
);

// Get ONLY logged-in user's alerts
router.get(
  "/alerts/my",
  protect,
  getMyAlerts
);

// Delete ONLY logged-in user's alert
router.delete(
  "/alerts/:id",
  protect,
  deleteAlert
);

// =====================================================
// ADMIN - OVERVIEW
// =====================================================

// Get admin Schengen overview
// Admin only
router.get(
  "/admin/overview",
  protect,
  adminOnly,
  getAdminOverview
);

// =====================================================
// ADMIN - DESTINATIONS
// =====================================================

// Create destination
router.post(
  "/admin/destinations",
  protect,
  adminOnly,
  createDestination
);

// Update destination
router.put(
  "/admin/destinations/:id",
  protect,
  adminOnly,
  updateDestination
);

// Delete destination
router.delete(
  "/admin/destinations/:id",
  protect,
  adminOnly,
  deleteDestination
);

// =====================================================
// ADMIN - CENTRES
// =====================================================

// Create centre
router.post(
  "/admin/centres",
  protect,
  adminOnly,
  createCentre
);

// Update centre
router.put(
  "/admin/centres/:id",
  protect,
  adminOnly,
  updateCentre
);

// Delete centre
router.delete(
  "/admin/centres/:id",
  protect,
  adminOnly,
  deleteCentre
);

// =====================================================
// ADMIN - SLOTS
// =====================================================

// Create slot
router.post(
  "/admin/slots",
  protect,
  adminOnly,
  createSlot
);

// Update slot
router.put(
  "/admin/slots/:id",
  protect,
  adminOnly,
  updateSlot
);

// Delete slot
router.delete(
  "/admin/slots/:id",
  protect,
  adminOnly,
  deleteSlot
);

// =====================================================
// ADMIN - ALL APPLICATIONS / BOOKINGS
// =====================================================

// IMPORTANT:
// This endpoint returns ALL Schengen applications,
// but ONLY an authenticated ADMIN can access it.
//
// Normal users CANNOT access this endpoint.
router.get(
  "/admin/bookings",
  protect,
  adminOnly,
  getAllBookings
);

// Update application status
// Admin only
router.put(
  "/admin/bookings/:id/status",
  protect,
  adminOnly,
  updateBookingStatus
);

// =====================================================

module.exports = router;