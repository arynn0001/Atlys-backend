const mongoose = require("mongoose");

const countrySchema = new mongoose.Schema(
  {
    // =========================
    // COUNTRY BASIC DETAILS
    // =========================

    name: {
      type: String,
      required: true,
      trim: true
    },

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },

    flag: {
      type: String,
      required: true,
      trim: true
    },

    // =========================
    // COUNTRY IMAGE
    // =========================

    image: {
      type: String,
      default: ""
    },

    // =========================
    // COUNTRY DESCRIPTION
    // =========================

    description: {
      type: String,
      default: ""
    },

    // =========================
    // MAP COORDINATES
    // =========================

    latitude: {
      type: Number,
      default: null
    },

    longitude: {
      type: Number,
      default: null
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

module.exports = mongoose.model(
  "Country",
  countrySchema
);