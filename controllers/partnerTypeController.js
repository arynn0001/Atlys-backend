const PartnerType = require("../models/PartnerType");

// ==============================
// CREATE PARTNER TYPE
// ==============================
const createPartnerType = async (req, res) => {
  try {
    const {
      name,
      description,
      active,
      displayOrder,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Partner type name is required",
      });
    }

    const existingType = await PartnerType.findOne({
      name: name.trim(),
    });

    if (existingType) {
      return res.status(400).json({
        success: false,
        message: "Partner type already exists",
      });
    }

    const partnerType = await PartnerType.create({
      name: name.trim(),
      description: description || "",
      active:
        active === undefined
          ? true
          : active === true || active === "true",
      displayOrder: Number(displayOrder) || 0,
    });

    return res.status(201).json({
      success: true,
      message: "Partner type created successfully",
      partnerType,
    });
  } catch (error) {
    console.error("Create Partner Type Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create partner type",
      error: error.message,
    });
  }
};

// ==============================
// GET ALL PARTNER TYPES
// ==============================
const getPartnerTypes = async (req, res) => {
  try {
    const partnerTypes = await PartnerType.find()
      .sort({
        displayOrder: 1,
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: partnerTypes.length,
      partnerTypes,
    });
  } catch (error) {
    console.error("Get Partner Types Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get partner types",
      error: error.message,
    });
  }
};

// ==============================
// GET SINGLE PARTNER TYPE
// ==============================
const getPartnerTypeById = async (req, res) => {
  try {
    const partnerType = await PartnerType.findById(req.params.id);

    if (!partnerType) {
      return res.status(404).json({
        success: false,
        message: "Partner type not found",
      });
    }

    return res.status(200).json({
      success: true,
      partnerType,
    });
  } catch (error) {
    console.error("Get Partner Type Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get partner type",
      error: error.message,
    });
  }
};

// ==============================
// UPDATE PARTNER TYPE
// ==============================
const updatePartnerType = async (req, res) => {
  try {
    const {
      name,
      description,
      active,
      displayOrder,
    } = req.body;

    const partnerType = await PartnerType.findById(
      req.params.id
    );

    if (!partnerType) {
      return res.status(404).json({
        success: false,
        message: "Partner type not found",
      });
    }

    if (name !== undefined) {
      const cleanName = name.trim();

      if (!cleanName) {
        return res.status(400).json({
          success: false,
          message: "Partner type name cannot be empty",
        });
      }

      const duplicate = await PartnerType.findOne({
        name: cleanName,
        _id: { $ne: req.params.id },
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: "Another partner type with this name already exists",
        });
      }

      partnerType.name = cleanName;
    }

    if (description !== undefined) {
      partnerType.description = description;
    }

    if (active !== undefined) {
      partnerType.active =
        active === true || active === "true";
    }

    if (displayOrder !== undefined) {
      partnerType.displayOrder =
        Number(displayOrder) || 0;
    }

    await partnerType.save();

    return res.status(200).json({
      success: true,
      message: "Partner type updated successfully",
      partnerType,
    });
  } catch (error) {
    console.error("Update Partner Type Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update partner type",
      error: error.message,
    });
  }
};

// ==============================
// DELETE PARTNER TYPE
// ==============================
const deletePartnerType = async (req, res) => {
  try {
    const partnerType = await PartnerType.findById(
      req.params.id
    );

    if (!partnerType) {
      return res.status(404).json({
        success: false,
        message: "Partner type not found",
      });
    }

    await partnerType.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Partner type deleted successfully",
    });
  } catch (error) {
    console.error("Delete Partner Type Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete partner type",
      error: error.message,
    });
  }
};

module.exports = {
  createPartnerType,
  getPartnerTypes,
  getPartnerTypeById,
  updatePartnerType,
  deletePartnerType,
};