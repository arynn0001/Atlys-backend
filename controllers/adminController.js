const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// =====================================================
// ADMIN SIGNUP
// =====================================================

const adminSignup = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password
    } = req.body;

    // =========================
    // VALIDATION
    // =========================

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });
    }

    // =========================
    // CHECK EXISTING USER
    // =========================

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      });
    }

    // =========================
    // HASH PASSWORD
    // =========================

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // =========================
    // CREATE ADMIN
    // =========================

    const admin = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone || "",
      password: hashedPassword,
      role: "admin",
      isActive: true
    });

    // =========================
    // CREATE TOKEN
    // =========================

    const token = jwt.sign(
      {
        id: admin._id,
        role: "admin"
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    // =========================
    // RESPONSE
    // =========================

    return res.status(201).json({
      success: true,
      message: "Admin registration successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        isActive: admin.isActive
      }
    });

  } catch (error) {
    console.error("Admin Signup Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// =====================================================
// ADMIN LOGIN
// =====================================================

const adminLogin = async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;

    // =========================
    // VALIDATION
    // =========================

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // =========================
    // FIND ADMIN
    // =========================

    const admin = await User.findOne({
      email: email.toLowerCase().trim(),
      role: "admin"
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin account not found"
      });
    }

    // =========================
    // CHECK ADMIN STATUS
    // =========================

    if (admin.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Admin account is inactive"
      });
    }

    // =========================
    // PASSWORD CHECK
    // =========================

    const passwordMatch = await bcrypt.compare(
      password,
      admin.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin email or password"
      });
    }

    // =========================
    // CREATE TOKEN
    // =========================

    const token = jwt.sign(
      {
        id: admin._id,
        role: "admin"
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    // =========================
    // RESPONSE
    // =========================

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        isActive: admin.isActive
      }
    });

  } catch (error) {
    console.error("Admin Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// =====================================================
// GET ALL NORMAL USERS
// ADMIN ONLY
// =====================================================

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: "user"
    })
      .select("-password")
      .sort({
        createdAt: -1
      });

    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });

  } catch (error) {
    console.error("Get All Users Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// =====================================================
// GET SINGLE USER
// ADMIN ONLY
// =====================================================

const getUserById = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      role: "user"
    })
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error("Get User By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// =====================================================
// UPDATE USER
// ADMIN ONLY
// =====================================================

const updateUser = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      isActive
    } = req.body;

    // =========================
    // FIND USER
    // =========================

    const user = await User.findOne({
      _id: req.params.id,
      role: "user"
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // =========================
    // UPDATE NAME
    // =========================

    if (name !== undefined) {

      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty"
        });
      }

      user.name = name.trim();
    }

    // =========================
    // UPDATE EMAIL
    // =========================

    if (email !== undefined) {

      if (!email.trim()) {
        return res.status(400).json({
          success: false,
          message: "Email cannot be empty"
        });
      }

      const normalizedEmail = email
        .toLowerCase()
        .trim();

      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: {
          $ne: user._id
        }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already registered"
        });
      }

      user.email = normalizedEmail;
    }

    // =========================
    // UPDATE PHONE
    // =========================

    if (phone !== undefined) {
      user.phone = phone.trim();
    }

    // =========================
    // UPDATE ACTIVE STATUS
    // =========================

    if (isActive !== undefined) {

      if (
        typeof isActive !== "boolean"
      ) {
        return res.status(400).json({
          success: false,
          message: "isActive must be true or false"
        });
      }

      user.isActive = isActive;
    }

    // =========================
    // SAVE USER
    // =========================

    await user.save();

    // =========================
    // GET UPDATED USER
    // =========================

    const updatedUser = await User.findById(
      user._id
    ).select("-password");

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error("Update User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// =====================================================
// DELETE / DEACTIVATE USER
// ADMIN ONLY
// =====================================================

const deleteUser = async (req, res) => {
  try {

    const user = await User.findOne({
      _id: req.params.id,
      role: "user"
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // =========================
    // SOFT DELETE
    // =========================

    user.isActive = false;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User deactivated successfully"
    });

  } catch (error) {
    console.error("Delete User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  adminSignup,
  adminLogin,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
};