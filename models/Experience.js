const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: true
    },

    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      required: true
    },

    image: {
      type: String,
      default: ""
    },

    shortDescription: {
      type: String,
      default: ""
    },

    description: {
      type: String,
      default: ""
    },

    category: {
      type: String,
      enum: [
        "food",
        "city-tour",
        "adventure",
        "cultural",
        "nightlife",
        "shopping",
        "workshop",
        "nature",
        "other"
      ],
      required: true
    },

    duration: {
      type: String,
      default: ""
    },

    price: {
      type: Number,
      default: 0,
      min: 0
    },

    currency: {
      type: String,
      default: "INR"
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },

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

module.exports = mongoose.model("Experience", experienceSchema);