const DefenceApplication = require("../models/DefenceApplication");
const { uploadToBunny } = require("../utils/bunnyStorage");

// =====================================================
// SUBMIT DEFENCE APPLICATION
// =====================================================

const submitDefenceApplication = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      defenceId,
      passportNumber,
      email,
      phone,
    } = req.body;

    // -------------------------------------------------
    // Required fields validation
    // -------------------------------------------------

    if (
      !firstName ||
      !lastName ||
      !defenceId ||
      !passportNumber ||
      !email ||
      !phone
    ) {
      return res.status(400).json({
        success: false,
        message:
          "First name, last name, Defence ID, passport number, email and phone are required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // -------------------------------------------------
    // Check existing application
    // -------------------------------------------------

    const existing = await DefenceApplication.findOne({
      email: normalizedEmail,
    });

    // Already verified user cannot submit again
    if (existing && existing.status === "verified") {
      return res.status(409).json({
        success: false,
        message:
          "This email is already verified for Defence fee waiver.",
      });
    }

    // -------------------------------------------------
    // Upload Defence ID Document
    // -------------------------------------------------

    let defenceIdDocument = "";

    if (req.file) {
      const uploaded = await uploadToBunny({
        buffer: req.file.buffer,
        fileName: req.file.originalname,
        contentType: req.file.mimetype,
        folder: "defence",
      });

      defenceIdDocument = uploaded.path;
    }

    // -------------------------------------------------
    // Create / Update application
    // -------------------------------------------------

    const application = await DefenceApplication.findOneAndUpdate(
      {
        email: normalizedEmail,
      },
      {
        firstName: firstName.trim(),

        lastName: lastName.trim(),

        defenceId: defenceId.trim(),

        passportNumber: passportNumber
          .trim()
          .toUpperCase(),

        email: normalizedEmail,

        phone: phone.trim(),

        ...(defenceIdDocument
          ? {
              defenceIdDocument,
            }
          : {}),

        status: "pending",

        serviceFeeWaiver: false,

        emailTagged: false,

        verifiedAt: null,

        adminRemarks: "",
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      }
    );

    // -------------------------------------------------
    // Response
    // -------------------------------------------------

    return res.status(201).json({
      success: true,
      message:
        "Defence application submitted successfully. Verification is pending.",
      application: {
        id: application._id,
        firstName: application.firstName,
        lastName: application.lastName,
        email: application.email,
        status: application.status,
        createdAt: application.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "Submit defence application error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to submit Defence application.",
    });
  }
};

// =====================================================
// USER / PUBLIC - CHECK OWN DEFENCE STATUS
// =====================================================
//
// Request:
//
// GET /api/defence/status?email=test@example.com
//
// Sensitive fields such as:
//
// - Defence ID
// - Passport Number
// - Defence Document
// - Phone
//
// are intentionally NOT returned here.
//
// =====================================================

const getDefenceStatus = async (req, res) => {
  try {
    const { email } = req.query;

    // -------------------------------------------------
    // Email required
    // -------------------------------------------------

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const normalizedEmail = email
      .toLowerCase()
      .trim();

    // -------------------------------------------------
    // Find application belonging to this email
    // -------------------------------------------------

    const application = await DefenceApplication.findOne({
      email: normalizedEmail,
    })
      .select(
        [
          "firstName",
          "lastName",
          "email",
          "status",
          "serviceFeeWaiver",
          "emailTagged",
          "verifiedAt",
          "adminRemarks",
          "createdAt",
          "updatedAt",
        ].join(" ")
      )
      .lean();

    // -------------------------------------------------
    // Application not found
    // -------------------------------------------------

    if (!application) {
      return res.status(404).json({
        success: false,
        message:
          "No Defence application found for this email.",
      });
    }

    // -------------------------------------------------
    // Return only this application's safe details
    // -------------------------------------------------

    return res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error(
      "Get defence status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch Defence status.",
    });
  }
};

// =====================================================
// PUBLIC - GET DEFENCE APPLICATIONS
// =====================================================
//
// Endpoint:
//
// GET /api/defence/applications
//
// No admin token required.
//
// Returns complete application data.
//
// =====================================================

const getPublicDefenceApplications = async (
  req,
  res
) => {
  try {
    const applications = await DefenceApplication.find()
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error(
      "Get public Defence applications error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch Defence applications.",
    });
  }
};

// =====================================================
// ADMIN - GET ALL DEFENCE APPLICATIONS
// =====================================================

const getAllDefenceApplications = async (
  req,
  res
) => {
  try {
    const applications = await DefenceApplication.find()
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error(
      "Get Defence applications error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch Defence applications.",
    });
  }
};

// =====================================================
// ADMIN - GET SINGLE DEFENCE APPLICATION
// =====================================================

const getDefenceApplication = async (
  req,
  res
) => {
  try {
    const application =
      await DefenceApplication.findById(
        req.params.id
      );

    if (!application) {
      return res.status(404).json({
        success: false,
        message:
          "Defence application not found.",
      });
    }

    return res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    console.error(
      "Get Defence application error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch Defence application.",
    });
  }
};

// =====================================================
// ADMIN - VERIFY DEFENCE APPLICATION
// =====================================================

const verifyDefenceApplication = async (
  req,
  res
) => {
  try {
    const application =
      await DefenceApplication.findById(
        req.params.id
      );

    if (!application) {
      return res.status(404).json({
        success: false,
        message:
          "Defence application not found.",
      });
    }

    // -------------------------------------------------
    // Update verification
    // -------------------------------------------------

    application.status = "verified";

    application.serviceFeeWaiver = true;

    application.emailTagged = true;

    application.verifiedAt = new Date();

    application.adminRemarks =
      req.body.adminRemarks || "";

    await application.save();

    // -------------------------------------------------
    // Response
    // -------------------------------------------------

    return res.status(200).json({
      success: true,
      message:
        "Defence application verified successfully.",
      application: {
        id: application._id,
        email: application.email,
        status: application.status,
        serviceFeeWaiver:
          application.serviceFeeWaiver,
        emailTagged:
          application.emailTagged,
        verifiedAt:
          application.verifiedAt,
        adminRemarks:
          application.adminRemarks,
      },
    });
  } catch (error) {
    console.error(
      "Verify Defence application error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to verify Defence application.",
    });
  }
};

// =====================================================
// ADMIN - REJECT DEFENCE APPLICATION
// =====================================================

const rejectDefenceApplication = async (
  req,
  res
) => {
  try {
    const application =
      await DefenceApplication.findById(
        req.params.id
      );

    if (!application) {
      return res.status(404).json({
        success: false,
        message:
          "Defence application not found.",
      });
    }

    // -------------------------------------------------
    // Update rejection
    // -------------------------------------------------

    application.status = "rejected";

    application.serviceFeeWaiver = false;

    application.emailTagged = false;

    application.verifiedAt = null;

    application.adminRemarks =
      req.body.adminRemarks || "";

    await application.save();

    // -------------------------------------------------
    // Response
    // -------------------------------------------------

    return res.status(200).json({
      success: true,
      message:
        "Defence application rejected.",
      application: {
        id: application._id,
        email: application.email,
        status: application.status,
        adminRemarks:
          application.adminRemarks,
      },
    });
  } catch (error) {
    console.error(
      "Reject Defence application error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to reject Defence application.",
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  submitDefenceApplication,
  getDefenceStatus,
  getPublicDefenceApplications,
  getAllDefenceApplications,
  getDefenceApplication,
  verifyDefenceApplication,
  rejectDefenceApplication,
};