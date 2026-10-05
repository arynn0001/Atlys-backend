const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      required: true
    },

    destination: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Destination",
      required: true
    },

    category: {
      type: String,
      enum: [
        "music",
        "sports",
        "art",
        "culture",
        "food-drink",
        "festivals",
        "entertainment"
      ],
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

    venue: {
      type: String,
      default: ""
    },

    address: {
      type: String,
      default: ""
    },

    eventDate: {
      type: Date,
      required: true
    },

    endDate: {
      type: Date
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

    ticketUrl: {
      type: String,
      default: ""
    },

    organizer: {
      type: String,
      default: ""
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },

    featured: {
      type: Boolean,
      default: false
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

module.exports = mongoose.model("Event", eventSchema);