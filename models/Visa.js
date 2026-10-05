const mongoose = require("mongoose");

const visaSchema = new mongoose.Schema(
  {
    // =========================
    // COUNTRY
    // =========================

    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      required: true
    },


    // =========================
    // VISA BASIC DETAILS
    // =========================

    name: {
      type: String,
      required: true,
      trim: true
    },

    category: {
      type: String,
      enum: [
        "tourist",
        "student",
        "business",
        "work",
        "transit",
        "family"
      ],
      required: true
    },

    visaType: {
      type: String,
      default: "",
      trim: true
    },

    entryType: {
      type: String,
      enum: [
        "single",
        "multiple",
        "single-multiple"
      ],
      default: "single"
    },


    // =========================
    // VISA DURATION
    // =========================

    validity: {
      type: String,
      default: "",
      trim: true
    },

    stayDuration: {
      type: String,
      default: "",
      trim: true
    },

    processingTime: {
      type: String,
      default: "",
      trim: true
    },

    // =========================
    // ESTIMATED VISA DATE
    // =========================

    estimatedVisaDate: {
      type: Date,
      default: null
    },


    // =========================
    // MAP CARD EXTRAS
    // =========================

    visaStatus: {
      type: String,
      enum: [
        "guaranteed",
        "normal",
        "fast_track"
      ],
      default: "normal"
    },

    badgeText: {
      type: String,
      default: "",
      trim: true
    },

    detailUrl: {
      type: String,
      default: "",
      trim: true
    },


    // =========================
    // PRICING
    // =========================

    governmentFee: {
      type: Number,
      default: 0,
      min: 0
    },

    serviceFee: {
      type: Number,
      default: 0,
      min: 0
    },

    totalFee: {
      type: Number,
      default: 0,
      min: 0
    },

    currency: {
      type: String,
      default: "INR",
      trim: true,
      uppercase: true
    },


    // =========================
    // ELIGIBILITY
    // =========================

    eligibility: [
      {
        type: String,
        trim: true
      }
    ],


    // =========================
    // REQUIRED DOCUMENTS
    // =========================

    documentsRequired: [
      {
        name: {
          type: String,
          required: true,
          trim: true
        },

        required: {
          type: Boolean,
          default: true
        }
      }
    ],


    // =========================
    // BACKGROUND IMAGE
    // =========================
    //
    // Bunny CDN public URL
    //
    // Example:
    // https://atlys.b-cdn.net/visas/...
    //
    // =========================

    image: {
      type: String,
      default: "",
      trim: true
    },


    // =========================
    // DESCRIPTION
    // =========================

    description: {
      type: String,
      default: ""
    },

    shortDescription: {
      type: String,
      default: ""
    },


    // =========================
    // STATUS
    // =========================

    popular: {
      type: Boolean,
      default: false
    },

    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);


module.exports =
  mongoose.model(
    "Visa",
    visaSchema
  );