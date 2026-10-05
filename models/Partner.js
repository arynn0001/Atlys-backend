const mongoose = require("mongoose");

const partnerSchema = new mongoose.Schema(
  {
    partnerType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PartnerType",
      required: true,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    logo: {
      type: String,
      default: "",
      trim: true,
    },

    coverImage: {
      type: String,
      default: "",
      trim: true,
    },

    shortDescription: {
      type: String,
      default: "",
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    website: {
      type: String,
      default: "",
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    country: {
      type: String,
      default: "",
      trim: true,
    },

    city: {
      type: String,
      default: "",
      trim: true,
    },

    featured: {
      type: Boolean,
      default: false,
    },

    active: {
      type: Boolean,
      default: true,
    },

    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

partnerSchema.index({ partnerType: 1 });
partnerSchema.index({ active: 1 });
partnerSchema.index({ featured: 1 });
partnerSchema.index({ displayOrder: 1 });

module.exports = mongoose.model("Partner", partnerSchema);