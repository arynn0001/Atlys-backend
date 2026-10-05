const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema(
  {
    name: {
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
        "landmark",
        "museum",
        "beach",
        "park",
        "religious",
        "shopping",
        "historical",
        "nature",
        "adventure",
        "other"
      ],
      default: "landmark"
    },

    address: {
      type: String,
      default: ""
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

module.exports = mongoose.model("Place", placeSchema);