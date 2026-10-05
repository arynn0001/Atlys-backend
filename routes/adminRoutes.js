const express = require("express");

const {
  adminSignup,
  adminLogin,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} = require("../controllers/adminController");

const {
  protect,
  adminOnly
} = require("../middleware/authMiddleware");

const router = express.Router();

// =========================
// ADMIN SIGNUP
// =========================

router.post(
  "/signup",
  adminSignup
);

// =========================
// ADMIN LOGIN
// =========================

router.post(
  "/login",
  adminLogin
);

// =========================
// GET ALL USERS
// ADMIN ONLY
// =========================

router.get(
  "/users",
  protect,
  adminOnly,
  getAllUsers
);

// =========================
// GET SINGLE USER
// ADMIN ONLY
// =========================

router.get(
  "/users/:id",
  protect,
  adminOnly,
  getUserById
);

// =========================
// UPDATE USER
// ADMIN ONLY
// =========================

router.put(
  "/users/:id",
  protect,
  adminOnly,
  updateUser
);

// =========================
// DEACTIVATE USER
// ADMIN ONLY
// =========================

router.delete(
  "/users/:id",
  protect,
  adminOnly,
  deleteUser
);

module.exports = router;