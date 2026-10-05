const Application = require("../models/Application");
const Visa = require("../models/Visa");
const Country = require("../models/Country");

const {
  uploadToBunny
} = require("../utils/bunnyStorage");


// ==========================================
// GENERATE APPLICATION NUMBER
// ==========================================

const generateApplicationNumber = () => {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  const random =
    Math.floor(
      1000 + Math.random() * 9000
    );

  return `ATLYS-${year}${month}${day}-${random}`;
};


// ==========================================
// CREATE APPLICATION
// ==========================================

const createApplication = async (
  req,
  res
) => {
  try {

    const {
      visa,
      country,

      // PERSONAL INFORMATION
      firstName,
      lastName,
      dateOfBirth,
      gender,
      maritalStatus,
      nationality,
      passportNumber,
      passportExpiry,
      passportPlaceOfIssue,
      occupation,

      // ARRIVAL FLIGHT
      arrivalFlightType,
      arrivalFlights,

      // RETURN FLIGHT
      returnFlightType,
      returnFlights,

      // HOTEL
      hotelName,
      thailandProvince,

      // CONTACT
      phone,
      email,

      // ADDITIONAL TRAVEL
      travelDate,
      returnDate,
      purposeOfTravel,
      accommodation

    } = req.body;


    // ==========================================
    // REQUIRED FIELDS
    // ==========================================

    if (
      !visa ||
      !country ||
      !firstName ||
      !lastName ||
      !dateOfBirth ||
      !gender ||
      !nationality ||
      !passportNumber ||
      !passportExpiry ||
      !passportPlaceOfIssue ||
      !phone ||
      !email ||
      !hotelName ||
      !thailandProvince
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields"
      });

    }


    // ==========================================
    // PARSE ARRIVAL FLIGHTS
    // ==========================================

    let parsedArrivalFlights = [];

    try {

      if (arrivalFlights) {

        parsedArrivalFlights =
          typeof arrivalFlights === "string"
            ? JSON.parse(arrivalFlights)
            : arrivalFlights;

      }

    } catch (error) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid arrivalFlights format"
      });

    }


    // ==========================================
    // PARSE RETURN FLIGHTS
    // ==========================================

    let parsedReturnFlights = [];

    try {

      if (returnFlights) {

        parsedReturnFlights =
          typeof returnFlights === "string"
            ? JSON.parse(returnFlights)
            : returnFlights;

      }

    } catch (error) {

      return res.status(400).json({
        success: false,
        message:
          "Invalid returnFlights format"
      });

    }


    // ==========================================
    // NORMALIZE FLIGHT ARRAYS
    // ==========================================

    if (
      !Array.isArray(
        parsedArrivalFlights
      )
    ) {
      parsedArrivalFlights = [];
    }


    if (
      !Array.isArray(
        parsedReturnFlights
      )
    ) {
      parsedReturnFlights = [];
    }


    // ==========================================
    // CHECK VISA + COUNTRY
    // ==========================================

    const visaData =
      await Visa.findOne({
        _id: visa,
        country: country,
        active: true
      });


    if (!visaData) {

      return res.status(404).json({
        success: false,
        message:
          "Visa not found, inactive, or does not belong to selected country"
      });

    }


    // ==========================================
    // CHECK COUNTRY
    // ==========================================

    const countryData =
      await Country.findOne({
        _id: country,
        active: true
      });


    if (!countryData) {

      return res.status(404).json({
        success: false,
        message:
          "Country not found or inactive"
      });

    }


    // ==========================================
    // CHECK EXISTING APPLICATION
    // ==========================================

    const existingApplication =
      await Application.findOne({
        user: req.user._id,
        visa: visa,
        country: country,
        status: {
          $in: [
            "draft",
            "submitted",
            "processing"
          ]
        }
      });


    if (existingApplication) {

      return res.status(400).json({
        success: false,
        message:
          "You already have an active application for this visa and country",
        application:
          existingApplication
      });

    }


    // ==========================================
    // CALCULATE FEES
    // ==========================================

    const governmentFee =
      visaData.governmentFee || 0;

    const serviceFee =
      visaData.serviceFee || 0;

    const totalAmount =
      governmentFee +
      serviceFee;


    // ==========================================
    // GENERATE UNIQUE APPLICATION NUMBER
    // ==========================================

    let applicationNumber;

    let isUnique = false;


    while (!isUnique) {

      applicationNumber =
        generateApplicationNumber();


      const existingNumber =
        await Application.findOne({
          applicationNumber
        });


      if (!existingNumber) {
        isUnique = true;
      }

    }


    // ==========================================
    // CREATE APPLICATION
    // ==========================================

    const application =
      await Application.create({

        // USER
        user: req.user._id,


        // VISA
        visa:
          visaData._id,


        // COUNTRY
        country:
          countryData._id,


        // APPLICATION NUMBER
        applicationNumber,


        // ======================================
        // PERSONAL INFORMATION
        // ======================================

        firstName:
          firstName.trim(),

        lastName:
          lastName.trim(),

        dateOfBirth,

        gender,

        maritalStatus:
          maritalStatus || "",

        nationality:
          nationality.trim(),


        // ======================================
        // PASSPORT INFORMATION
        // ======================================

        passportNumber:
          passportNumber.trim(),

        passportExpiry,

        passportPlaceOfIssue:
          passportPlaceOfIssue.trim(),

        occupation:
          occupation || "",


        // ======================================
        // ARRIVAL FLIGHT
        // ======================================

        arrivalFlightType:
          arrivalFlightType ||
          "direct",

        arrivalFlights:
          parsedArrivalFlights,


        // ======================================
        // RETURN FLIGHT
        // ======================================

        returnFlightType:
          returnFlightType ||
          "direct",

        returnFlights:
          parsedReturnFlights,


        // ======================================
        // HOTEL INFORMATION
        // ======================================

        hotelName:
          hotelName.trim(),

        thailandProvince:
          thailandProvince.trim(),


        // ======================================
        // CONTACT INFORMATION
        // ======================================

        phone:
          phone.trim(),

        email:
          email
            .toLowerCase()
            .trim(),


        // ======================================
        // ADDITIONAL TRAVEL DETAILS
        // ======================================

        travelDate,

        returnDate,

        purposeOfTravel:
          purposeOfTravel || "",

        accommodation:
          accommodation || "",


        // ======================================
        // PAYMENT
        // ======================================

        visaFee:
          governmentFee,

        serviceFee,

        totalAmount,

        paymentStatus:
          "pending",


        // ======================================
        // APPLICATION STATUS
        // ======================================

        status:
          "submitted",

        submittedAt:
          new Date()

      });


    // ==========================================
    // POPULATE APPLICATION
    // ==========================================

    const populatedApplication =
      await Application.findById(
        application._id
      )

        .populate(
          "visa",
          "name category visaType entryType validity stayDuration processingTime governmentFee serviceFee totalFee currency eligibility documentsRequired"
        )

        .populate(
          "country",
          "name code flag image description popular"
        )

        .populate(
          "user",
          "name email phone"
        );


    // ==========================================
    // SUCCESS RESPONSE
    // ==========================================

    return res.status(201).json({

      success: true,

      message:
        "Application submitted successfully",

      application:
        populatedApplication

    });


  } catch (error) {

    console.error(
      "Create Application Error:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Server error",

      error:
        error.message

    });

  }
};


// ==========================================
// GET MY APPLICATIONS
// ==========================================

const getMyApplications =
  async (
    req,
    res
  ) => {

    try {

      const applications =
        await Application.find({
          user: req.user._id
        })

          .populate(
            "visa",
            "name category visaType entryType validity stayDuration processingTime governmentFee serviceFee totalFee currency eligibility documentsRequired"
          )

          .populate(
            "country",
            "name code flag image description popular"
          )

          .sort({
            createdAt: -1
          });


      return res.json({

        success: true,

        count:
          applications.length,

        applications

      });


    } catch (error) {

      console.error(
        "Get My Applications Error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Server error",

        error:
          error.message

      });

    }

  };


// ==========================================
// GET MY SINGLE APPLICATION
// ==========================================

const getMyApplicationById =
  async (
    req,
    res
  ) => {

    try {

      const application =
        await Application.findOne({

          _id:
            req.params.id,

          user:
            req.user._id

        })

          .populate(
            "visa",
            "name category visaType entryType validity stayDuration processingTime governmentFee serviceFee totalFee currency eligibility documentsRequired"
          )

          .populate(
            "country",
            "name code flag image description popular"
          )

          .populate(
            "user",
            "name email phone"
          );


      if (!application) {

        return res.status(404).json({

          success: false,

          message:
            "Application not found"

        });

      }


      return res.json({

        success: true,

        application

      });


    } catch (error) {

      console.error(
        "Get My Application Error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Server error",

        error:
          error.message

      });

    }

  };


// ==========================================
// ADMIN - GET ALL APPLICATIONS
// ==========================================

const getAllApplications =
  async (
    req,
    res
  ) => {

    try {

      const filter = {};


      if (req.query.status) {

        filter.status =
          req.query.status;

      }


      const applications =
        await Application.find(
          filter
        )

          .populate(
            "user",
            "name email phone"
          )

          .populate(
            "visa",
            "name category visaType entryType validity stayDuration processingTime governmentFee serviceFee totalFee currency eligibility documentsRequired"
          )

          .populate(
            "country",
            "name code flag image description popular"
          )

          .sort({
            createdAt: -1
          });


      return res.json({

        success: true,

        count:
          applications.length,

        applications

      });


    } catch (error) {

      console.error(
        "Get All Applications Error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Server error",

        error:
          error.message

      });

    }

  };


// ==========================================
// ADMIN - GET SINGLE APPLICATION
// ==========================================

const getApplicationById =
  async (
    req,
    res
  ) => {

    try {

      const application =
        await Application.findById(
          req.params.id
        )

          .populate(
            "user",
            "name email phone"
          )

          .populate(
            "visa",
            "name category visaType entryType validity stayDuration processingTime governmentFee serviceFee totalFee currency eligibility documentsRequired"
          )

          .populate(
            "country",
            "name code flag image description popular"
          );


      if (!application) {

        return res.status(404).json({

          success: false,

          message:
            "Application not found"

        });

      }


      return res.json({

        success: true,

        application

      });


    } catch (error) {

      console.error(
        "Get Application Error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Server error",

        error:
          error.message

      });

    }

  };


// ==========================================
// ADMIN - UPDATE APPLICATION
// ==========================================

const updateApplicationStatus =
  async (
    req,
    res
  ) => {

    try {

      const {
        status,
        adminRemarks,
        paymentStatus
      } = req.body;


      const allowedStatuses = [

        "draft",

        "submitted",

        "processing",

        "approved",

        "rejected"

      ];


      const allowedPaymentStatuses = [

        "pending",

        "paid",

        "failed",

        "refunded"

      ];


      // STATUS VALIDATION

      if (
        status &&
        !allowedStatuses.includes(
          status
        )
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Invalid application status"

        });

      }


      // PAYMENT STATUS VALIDATION

      if (
        paymentStatus &&
        !allowedPaymentStatuses.includes(
          paymentStatus
        )
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Invalid payment status"

        });

      }


      // FIND APPLICATION

      const application =
        await Application.findById(
          req.params.id
        );


      if (!application) {

        return res.status(404).json({

          success: false,

          message:
            "Application not found"

        });

      }


      // UPDATE STATUS

      if (status) {

        application.status =
          status;


        if (
          status === "submitted" &&
          !application.submittedAt
        ) {

          application.submittedAt =
            new Date();

        }

      }


      // UPDATE REMARKS

      if (
        adminRemarks !== undefined
      ) {

        application.adminRemarks =
          String(
            adminRemarks
          ).trim();

      }


      // UPDATE PAYMENT STATUS

      if (paymentStatus) {

        application.paymentStatus =
          paymentStatus;

      }


      await application.save();


      // POPULATE UPDATED DATA

      const updatedApplication =
        await Application.findById(
          application._id
        )

          .populate(
            "user",
            "name email phone"
          )

          .populate(
            "visa",
            "name category visaType entryType validity stayDuration processingTime governmentFee serviceFee totalFee currency eligibility documentsRequired"
          )

          .populate(
            "country",
            "name code flag image description popular"
          );


      return res.json({

        success: true,

        message:
          "Application updated successfully",

        application:
          updatedApplication

      });


    } catch (error) {

      console.error(
        "Update Application Error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Server error",

        error:
          error.message

      });

    }

  };


// ==========================================
// ADMIN - DELETE APPLICATION
// ==========================================

const deleteApplication =
  async (
    req,
    res
  ) => {

    try {

      const application =
        await Application.findById(
          req.params.id
        );


      if (!application) {

        return res.status(404).json({

          success: false,

          message:
            "Application not found"

        });

      }


      await Application.findByIdAndDelete(
        req.params.id
      );


      return res.json({

        success: true,

        message:
          "Application deleted successfully"

      });


    } catch (error) {

      console.error(
        "Delete Application Error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Server error",

        error:
          error.message

      });

    }

  };


// ==========================================
// USER - UPLOAD APPLICATION DOCUMENT
// BUNNY STORAGE
// ==========================================

const uploadApplicationDocument =
  async (
    req,
    res
  ) => {

    try {

      const {
        id
      } = req.params;


      const {
        documentName
      } = req.body;


      // DOCUMENT NAME

      if (
        !documentName ||
        !documentName.trim()
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Document name is required"

        });

      }


      // FILE

      if (!req.file) {

        return res.status(400).json({

          success: false,

          message:
            "Please upload a document"

        });

      }


      // FIND APPLICATION

      const application =
        await Application.findOne({

          _id: id,

          user:
            req.user._id

        });


      if (!application) {

        return res.status(404).json({

          success: false,

          message:
            "Application not found"

        });

      }


      // CHECK STATUS

      if (
        application.status ===
          "approved" ||

        application.status ===
          "rejected"
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Documents cannot be uploaded for this application"

        });

      }


      // FILE NAME

      const originalName =
        req.file.originalname ||
        "document";


      const extension =
        originalName.includes(".")
          ? originalName
              .substring(
                originalName.lastIndexOf(".")
              )
              .toLowerCase()
          : "";


      const uniqueFileName =
        `${Date.now()}-${Math.round(
          Math.random() * 1e9
        )}${extension}`;


      // BUNNY FOLDER

      const bunnyFolder =
        `applications/${application._id}`;


      // UPLOAD TO BUNNY

      const bunnyFile =
        await uploadToBunny({

          buffer:
            req.file.buffer,

          fileName:
            uniqueFileName,

          contentType:
            req.file.mimetype,

          folder:
            bunnyFolder

        });


      // SAVE PUBLIC URL

      const documentPath =
        bunnyFile.path;


      application.documents.push({

        name:
          documentName.trim(),

        fileUrl:
          documentPath,

        uploadedAt:
          new Date()

      });


      await application.save();


      // POPULATE

      const updatedApplication =
        await Application.findById(
          application._id
        )

          .populate(
            "visa",
            "name category visaType entryType validity stayDuration processingTime governmentFee serviceFee totalFee currency eligibility documentsRequired"
          )

          .populate(
            "country",
            "name code flag image description popular"
          )

          .populate(
            "user",
            "name email phone"
          );


      // RESPONSE

      return res.status(200).json({

        success: true,

        message:
          "Document uploaded successfully",

        document:
          application.documents[
            application.documents.length - 1
          ],

        application:
          updatedApplication

      });


    } catch (error) {

      console.error(
        "Upload Application Document Error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          "Document upload failed",

        error:
          error.message

      });

    }

  };


// ==========================================
// EXPORTS
// ==========================================

module.exports = {

  createApplication,

  getMyApplications,

  getMyApplicationById,

  getAllApplications,

  getApplicationById,

  updateApplicationStatus,

  deleteApplication,

  uploadApplicationDocument

};