const mongoose = require("mongoose");

// ==========================================
// ARRIVAL FLIGHT SCHEMA
// ==========================================

const arrivalFlightSchema = new mongoose.Schema(
  {
    flightNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },

    arrivalDate: {
      type: Date,
      required: true
    }
  },
  {
    _id: false
  }
);

// ==========================================
// RETURN FLIGHT SCHEMA
// ==========================================

const returnFlightSchema = new mongoose.Schema(
  {
    flightNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },

    departureDate: {
      type: Date,
      required: true
    }
  },
  {
    _id: false
  }
);

// ==========================================
// APPLICATION SCHEMA
// ==========================================

const applicationSchema = new mongoose.Schema(
  {
    // ==========================================
    // USER / VISA / COUNTRY
    // ==========================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    visa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Visa",
      required: true
    },

    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      required: true
    },

    applicationNumber: {
      type: String,
      required: true,
      unique: true
    },

    // ==========================================
    // PERSONAL INFORMATION
    // ==========================================

    firstName: {
      type: String,
      required: true,
      trim: true
    },

    lastName: {
      type: String,
      required: true,
      trim: true
    },

    dateOfBirth: {
      type: Date,
      required: true
    },

    gender: {
      type: String,
      enum: [
        "male",
        "female",
        "other"
      ],
      required: true
    },

    maritalStatus: {
      type: String,
      enum: [
        "single",
        "married",
        "divorced",
        "widowed",
        "separated"
      ],
      default: ""
    },

    passportNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },

    passportExpiry: {
      type: Date,
      required: true
    },

    passportPlaceOfIssue: {
      type: String,
      required: true,
      trim: true
    },

    nationality: {
      type: String,
      required: true,
      trim: true
    },

    occupation: {
      type: String,
      default: "",
      trim: true
    },

    // ==========================================
    // ARRIVAL FLIGHT
    // ==========================================

    arrivalFlightType: {
      type: String,
      enum: [
        "direct",
        "multi-stop"
      ],
      default: "direct"
    },

    arrivalFlights: {
      type: [arrivalFlightSchema],
      default: []
    },

    // ==========================================
    // RETURN FLIGHT
    // ==========================================

    returnFlightType: {
      type: String,
      enum: [
        "direct",
        "multi-stop"
      ],
      default: "direct"
    },

    returnFlights: {
      type: [returnFlightSchema],
      default: []
    },

    // ==========================================
    // HOTEL DETAILS
    // ==========================================

    hotelName: {
      type: String,
      required: true,
      trim: true
    },

    thailandProvince: {
      type: String,
      required: true,
      trim: true
    },

    // ==========================================
    // CONTACT DETAILS
    // ==========================================

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    phone: {
      type: String,
      required: true,
      trim: true
    },

    // ==========================================
    // OLD / GENERAL TRAVEL DETAILS
    // ==========================================

    travelDate: {
      type: Date
    },

    returnDate: {
      type: Date
    },

    purposeOfTravel: {
      type: String,
      default: ""
    },

    accommodation: {
      type: String,
      default: ""
    },

    // ==========================================
    // DOCUMENTS
    // ==========================================

    documents: [
      {
        name: {
          type: String,
          required: true
        },

        fileUrl: {
          type: String,
          required: true
        },

        uploadedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    // ==========================================
    // PAYMENT
    // ==========================================

    visaFee: {
      type: Number,
      default: 0
    },

    serviceFee: {
      type: Number,
      default: 0
    },

    totalAmount: {
      type: Number,
      default: 0
    },

    paymentStatus: {
      type: String,
      enum: [
        "pending",
        "paid",
        "failed",
        "refunded"
      ],
      default: "pending"
    },

    // ==========================================
    // APPLICATION STATUS
    // ==========================================

    status: {
      type: String,
      enum: [
        "draft",
        "submitted",
        "processing",
        "approved",
        "rejected"
      ],
      default: "draft"
    },

    adminRemarks: {
      type: String,
      default: ""
    },

    submittedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Application",
  applicationSchema
);