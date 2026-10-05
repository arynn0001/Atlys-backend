const mongoose = require("mongoose");
const SpeedUpdate = require("../models/SpeedUpdate");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// =====================================================
// HELPER: Format an update for the frontend
// =====================================================
const formatUpdate = (update, totalShips) => {
  const now = new Date();
  const date = new Date(update.date);

  // Days ago calculation
  const diffMs = now - date;
  const daysAgo = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  // Day number (29, 22, 18)
  const dayNumber = date.getDate();

  // Month year (JUNE 2026)
  const monthNames = [
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
  ];
  const monthYear = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

  // Ships formatted with order + total
  const ships = (update.ships || [])
    .sort((a, b) => a.order - b.order)
    .map((ship, index) => ({
      _id: ship._id,
      order: ship.order || index + 1,
      total: update.ships.length,
      description: ship.description
    }));

  return {
    _id: update._id,
    date: update.date,
    daysAgo,
    dayNumber,
    monthYear,
    shipsCount: update.ships.length,
    ships,
    active: update.active,
    createdAt: update.createdAt,
    updatedAt: update.updatedAt
  };
};

// =====================================================
// PUBLIC - GET ALL ACTIVE UPDATES
// =====================================================
// GET /api/speedupdates

const getPublicSpeedUpdates = async (req, res) => {
  try {
    const updates = await SpeedUpdate.find({ active: true })
      .sort({ date: -1 })
      .lean();

    const formatted = updates.map((u) => formatUpdate(u));

    return res.json({
      success: true,
      count: formatted.length,
      today: formatted.length > 0 ? formatted[0] : null,
      archive: formatted.slice(1),
      updates: formatted
    });
  } catch (error) {
    console.error("Get public speed updates error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch speed updates"
    });
  }
};

// =====================================================
// ADMIN - GET ALL
// =====================================================
// GET /api/speedupdates/admin/all

const getAllSpeedUpdates = async (req, res) => {
  try {
    const { active, search } = req.query;
    const query = {};

    if (active === "true") query.active = true;
    if (active === "false") query.active = false;

    if (search && search.trim()) {
      query["ships.description"] = {
        $regex: search.trim(),
        $options: "i"
      };
    }

    const updates = await SpeedUpdate.find(query)
      .sort({ date: -1 })
      .lean();

    const formatted = updates.map((u) => formatUpdate(u));

    return res.json({
      success: true,
      count: formatted.length,
      updates: formatted
    });
  } catch (error) {
    console.error("Get all speed updates error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch speed updates"
    });
  }
};

// =====================================================
// ADMIN - GET SINGLE
// =====================================================
// GET /api/speedupdates/admin/:id

const getSingleSpeedUpdate = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid update ID"
      });
    }

    const update = await SpeedUpdate.findById(id).lean();

    if (!update) {
      return res.status(404).json({
        success: false,
        message: "Speed update not found"
      });
    }

    return res.json({
      success: true,
      update: formatUpdate(update)
    });
  } catch (error) {
    console.error("Get single speed update error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch speed update"
    });
  }
};

// =====================================================
// ADMIN - CREATE
// =====================================================
// POST /api/speedupdates/admin

const createSpeedUpdate = async (req, res) => {
  try {
    const { date, ships, active } = req.body;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required"
      });
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date"
      });
    }

    if (!ships || !Array.isArray(ships) || ships.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one ship is required"
      });
    }

    const cleanShips = ships
      .filter((s) => s.description && s.description.trim())
      .map((s, index) => ({
        order: Number(s.order) || index + 1,
        description: s.description.trim()
      }));

    if (cleanShips.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Ship descriptions cannot be empty"
      });
    }

    const update = await SpeedUpdate.create({
      date: parsedDate,
      ships: cleanShips,
      active: active === false || active === "false" ? false : true
    });

    return res.status(201).json({
      success: true,
      message: "Speed update created successfully",
      update: formatUpdate(update.toObject())
    });
  } catch (error) {
    console.error("Create speed update error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create speed update"
    });
  }
};

// =====================================================
// ADMIN - UPDATE
// =====================================================
// PUT /api/speedupdates/admin/:id

const updateSpeedUpdate = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid update ID"
      });
    }

    const update = await SpeedUpdate.findById(id);

    if (!update) {
      return res.status(404).json({
        success: false,
        message: "Speed update not found"
      });
    }

    const { date, ships, active } = req.body;

    if (date !== undefined) {
      const parsedDate = new Date(date);
      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date"
        });
      }
      update.date = parsedDate;
    }

    if (ships !== undefined) {
      if (!Array.isArray(ships) || ships.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one ship is required"
        });
      }

      const cleanShips = ships
        .filter((s) => s.description && s.description.trim())
        .map((s, index) => ({
          order: Number(s.order) || index + 1,
          description: s.description.trim()
        }));

      if (cleanShips.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Ship descriptions cannot be empty"
        });
      }

      update.ships = cleanShips;
    }

    if (active !== undefined) {
      update.active = active === true || active === "true";
    }

    await update.save();

    return res.json({
      success: true,
      message: "Speed update updated successfully",
      update: formatUpdate(update.toObject())
    });
  } catch (error) {
    console.error("Update speed update error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update speed update"
    });
  }
};

// =====================================================
// ADMIN - DELETE
// =====================================================
// DELETE /api/speedupdates/admin/:id

const deleteSpeedUpdate = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid update ID"
      });
    }

    const update = await SpeedUpdate.findByIdAndDelete(id);

    if (!update) {
      return res.status(404).json({
        success: false,
        message: "Speed update not found"
      });
    }

    return res.json({
      success: true,
      message: "Speed update deleted successfully"
    });
  } catch (error) {
    console.error("Delete speed update error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete speed update"
    });
  }
};

// =====================================================
// ADMIN - TOGGLE ACTIVE
// =====================================================
// PUT /api/speedupdates/admin/:id/toggle

const toggleSpeedUpdateActive = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid update ID"
      });
    }

    const update = await SpeedUpdate.findById(id);

    if (!update) {
      return res.status(404).json({
        success: false,
        message: "Speed update not found"
      });
    }

    update.active = !update.active;
    await update.save();

    return res.json({
      success: true,
      message: `Update ${
        update.active ? "activated" : "deactivated"
      } successfully`,
      update: formatUpdate(update.toObject())
    });
  } catch (error) {
    console.error("Toggle speed update error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle update status"
    });
  }
};

module.exports = {
  getPublicSpeedUpdates,
  getAllSpeedUpdates,
  getSingleSpeedUpdate,
  createSpeedUpdate,
  updateSpeedUpdate,
  deleteSpeedUpdate,
  toggleSpeedUpdateActive
};