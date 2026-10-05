const Partner = require("../models/Partner");
const PartnerType = require("../models/PartnerType");
const { uploadToBunny } = require("../utils/bunnyStorage");

// ==========================================
// CREATE PARTNER
// ==========================================
const createPartner = async (req, res) => {
  try {
    const {
      partnerType,
      companyName,
      shortDescription,
      description,
      website,
      email,
      phone,
      country,
      city,
      featured,
      active,
      displayOrder,
    } = req.body;

    if (!partnerType) {
      return res.status(400).json({
        success: false,
        message: "Partner type is required",
      });
    }

    if (!companyName || !companyName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Company name is required",
      });
    }

    // Check Partner Type
    const typeExists = await PartnerType.findById(partnerType);

    if (!typeExists) {
      return res.status(404).json({
        success: false,
        message: "Partner type not found",
      });
    }

    // Check duplicate company inside same type
    const existingPartner = await Partner.findOne({
      partnerType,
      companyName: companyName.trim(),
    });

    if (existingPartner) {
      return res.status(400).json({
        success: false,
        message: "This company already exists in this partner type",
      });
    }

    let logoUrl = "";
    let coverImageUrl = "";

    // ==========================================
    // LOGO UPLOAD
    // ==========================================
    if (req.files?.logo?.[0]) {
      const logoFile = req.files.logo[0];

      const logoResult = await uploadToBunny({
        buffer: logoFile.buffer,
        fileName: logoFile.originalname,
        contentType: logoFile.mimetype,
        folder: "partners/logos",
      });

      logoUrl = logoResult.path;
    }

    // ==========================================
    // COVER IMAGE UPLOAD
    // ==========================================
    if (req.files?.coverImage?.[0]) {
      const coverFile = req.files.coverImage[0];

      const coverResult = await uploadToBunny({
        buffer: coverFile.buffer,
        fileName: coverFile.originalname,
        contentType: coverFile.mimetype,
        folder: "partners/covers",
      });

      coverImageUrl = coverResult.path;
    }

    const partner = await Partner.create({
      partnerType,
      companyName: companyName.trim(),

      logo: logoUrl,
      coverImage: coverImageUrl,

      shortDescription: shortDescription || "",
      description: description || "",

      website: website || "",
      email: email || "",
      phone: phone || "",

      country: country || "",
      city: city || "",

      featured:
        featured === true || featured === "true",

      active:
        active === undefined
          ? true
          : active === true || active === "true",

      displayOrder:
        Number(displayOrder) || 0,
    });

    const populatedPartner = await Partner.findById(
      partner._id
    ).populate(
      "partnerType",
      "name description active"
    );

    return res.status(201).json({
      success: true,
      message: "Partner created successfully",
      partner: populatedPartner,
    });
  } catch (error) {
    console.error("Create Partner Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create partner",
      error: error.message,
    });
  }
};

// ==========================================
// GET ALL PARTNERS
// ==========================================
const getPartners = async (req, res) => {
  try {
    const {
      type,
      featured,
      active,
    } = req.query;

    const filter = {};

    if (type) {
      filter.partnerType = type;
    }

    if (featured !== undefined) {
      filter.featured =
        featured === "true";
    }

    if (active !== undefined) {
      filter.active =
        active === "true";
    }

    const partners = await Partner.find(filter)
      .populate(
        "partnerType",
        "name description active"
      )
      .sort({
        displayOrder: 1,
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: partners.length,
      partners,
    });
  } catch (error) {
    console.error("Get Partners Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get partners",
      error: error.message,
    });
  }
};

// ==========================================
// GET PARTNER BY ID
// ==========================================
const getPartnerById = async (req, res) => {
  try {
    const partner = await Partner.findById(
      req.params.id
    ).populate(
      "partnerType",
      "name description active"
    );

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      });
    }

    return res.status(200).json({
      success: true,
      partner,
    });
  } catch (error) {
    console.error("Get Partner Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get partner",
      error: error.message,
    });
  }
};

// ==========================================
// GET PARTNERS BY PARTNER TYPE
// ==========================================
const getPartnersByType = async (req, res) => {
  try {
    const { typeId } = req.params;

    const typeExists = await PartnerType.findById(
      typeId
    );

    if (!typeExists) {
      return res.status(404).json({
        success: false,
        message: "Partner type not found",
      });
    }

    const partners = await Partner.find({
      partnerType: typeId,
    })
      .populate(
        "partnerType",
        "name description active"
      )
      .sort({
        displayOrder: 1,
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: partners.length,
      partnerType: typeExists,
      partners,
    });
  } catch (error) {
    console.error(
      "Get Partners By Type Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get partners by type",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE PARTNER
// ==========================================
const updatePartner = async (req, res) => {
  try {
    const {
      partnerType,
      companyName,
      shortDescription,
      description,
      website,
      email,
      phone,
      country,
      city,
      featured,
      active,
      displayOrder,
    } = req.body;

    const partner = await Partner.findById(
      req.params.id
    );

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      });
    }

    // ==========================================
    // PARTNER TYPE
    // ==========================================
    if (partnerType !== undefined) {
      const typeExists =
        await PartnerType.findById(partnerType);

      if (!typeExists) {
        return res.status(404).json({
          success: false,
          message: "Partner type not found",
        });
      }

      partner.partnerType = partnerType;
    }

    // ==========================================
    // COMPANY NAME
    // ==========================================
    if (companyName !== undefined) {
      const cleanName = companyName.trim();

      if (!cleanName) {
        return res.status(400).json({
          success: false,
          message: "Company name cannot be empty",
        });
      }

      const duplicate = await Partner.findOne({
        partnerType:
          partnerType || partner.partnerType,
        companyName: cleanName,
        _id: {
          $ne: req.params.id,
        },
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message:
            "This company already exists in this partner type",
        });
      }

      partner.companyName = cleanName;
    }

    // ==========================================
    // TEXT FIELDS
    // ==========================================
    if (shortDescription !== undefined) {
      partner.shortDescription =
        shortDescription;
    }

    if (description !== undefined) {
      partner.description = description;
    }

    if (website !== undefined) {
      partner.website = website;
    }

    if (email !== undefined) {
      partner.email = email;
    }

    if (phone !== undefined) {
      partner.phone = phone;
    }

    if (country !== undefined) {
      partner.country = country;
    }

    if (city !== undefined) {
      partner.city = city;
    }

    // ==========================================
    // BOOLEAN FIELDS
    // ==========================================
    if (featured !== undefined) {
      partner.featured =
        featured === true ||
        featured === "true";
    }

    if (active !== undefined) {
      partner.active =
        active === true ||
        active === "true";
    }

    if (displayOrder !== undefined) {
      partner.displayOrder =
        Number(displayOrder) || 0;
    }

    // ==========================================
    // LOGO UPDATE
    // ==========================================
    if (req.files?.logo?.[0]) {
      const logoFile = req.files.logo[0];

      const logoResult = await uploadToBunny({
        buffer: logoFile.buffer,
        fileName: logoFile.originalname,
        contentType: logoFile.mimetype,
        folder: "partners/logos",
      });

      partner.logo = logoResult.path;
    }

    // ==========================================
    // COVER IMAGE UPDATE
    // ==========================================
    if (req.files?.coverImage?.[0]) {
      const coverFile =
        req.files.coverImage[0];

      const coverResult = await uploadToBunny({
        buffer: coverFile.buffer,
        fileName: coverFile.originalname,
        contentType: coverFile.mimetype,
        folder: "partners/covers",
      });

      partner.coverImage =
        coverResult.path;
    }

    await partner.save();

    const updatedPartner =
      await Partner.findById(
        partner._id
      ).populate(
        "partnerType",
        "name description active"
      );

    return res.status(200).json({
      success: true,
      message: "Partner updated successfully",
      partner: updatedPartner,
    });
  } catch (error) {
    console.error("Update Partner Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update partner",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE PARTNER
// ==========================================
const deletePartner = async (req, res) => {
  try {
    const partner = await Partner.findById(
      req.params.id
    );

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Partner not found",
      });
    }

    await partner.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Partner deleted successfully",
    });
  } catch (error) {
    console.error("Delete Partner Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete partner",
      error: error.message,
    });
  }
};

module.exports = {
  createPartner,
  getPartners,
  getPartnerById,
  getPartnersByType,
  updatePartner,
  deletePartner,
};