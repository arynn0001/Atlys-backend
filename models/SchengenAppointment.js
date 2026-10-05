const mongoose = require("mongoose");

const schengenAppointmentSchema = new mongoose.Schema(
  {
    // =====================================================
    // COMMON RECORD TYPE
    // =====================================================

    recordType: {
      type: String,
      enum: [
        "destination",
        "centre",
        "slot",
        "booking",
        "alert",
      ],
      required: true,
      index: true,
    },

    // =====================================================
    // DESTINATION
    // =====================================================

    name: {
      type: String,
      default: "",
      trim: true,
    },

    slug: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    residenceCountry: {
      type: String,
      default: "India",
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    image: {
      type: String,
      default: "",
      trim: true,
    },

    // =====================================================
    // PARENT REFERENCES
    // =====================================================

    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SchengenAppointment",
      default: null,
    },

    centreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SchengenAppointment",
      default: null,
    },

    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SchengenAppointment",
      default: null,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // =====================================================
    // APPLICATION CENTRE
    // =====================================================

    city: {
      type: String,
      default: "",
      trim: true,
    },

    state: {
      type: String,
      default: "",
      trim: true,
    },

    centreName: {
      type: String,
      default: "",
      trim: true,
    },

    provider: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    website: {
      type: String,
      default: "",
      trim: true,
    },

    // =====================================================
    // PURPOSE
    // =====================================================

    purpose: {
      type: String,
      default: "tourism",
      trim: true,
      lowercase: true,
    },

    // =====================================================
    // SLOT
    // =====================================================

    date: {
      type: Date,
      default: null,
    },

    time: {
      type: String,
      default: "",
      trim: true,
    },

    available: {
      type: Boolean,
      default: true,
    },

    capacity: {
      type: Number,
      default: 1,
      min: 1,
    },

    remainingCapacity: {
      type: Number,
      default: 1,
      min: 0,
    },

    // =====================================================
    // TRAVELLERS
    // =====================================================

    travellers: {
      type: Number,
      default: 1,
      min: 1,
    },

    // =====================================================
    // BOOKING
    // =====================================================

    bookingReference: {
      type: String,
      default: "",
      trim: true,
    },

    bookingStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "cancelled",
        "completed",
      ],
      default: "pending",
    },

    applicantName: {
      type: String,
      default: "",
      trim: true,
    },

    applicantEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    applicantPhone: {
      type: String,
      default: "",
      trim: true,
    },

    // =====================================================
    // ALERT
    // =====================================================

    alertActive: {
      type: Boolean,
      default: true,
    },

    alertEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    alertPhone: {
      type: String,
      default: "",
      trim: true,
    },

    // =====================================================
    // STATUS
    // =====================================================

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

// =========================================================
// INDEXES
// =========================================================

schengenAppointmentSchema.index({
  recordType: 1,
  active: 1,
});

schengenAppointmentSchema.index({
  recordType: 1,
  slug: 1,
});

schengenAppointmentSchema.index({
  recordType: 1,
  destinationId: 1,
});

schengenAppointmentSchema.index({
  recordType: 1,
  centreId: 1,
});

schengenAppointmentSchema.index({
  recordType: 1,
  slotId: 1,
});

schengenAppointmentSchema.index({
  recordType: 1,
  date: 1,
});

schengenAppointmentSchema.index({
  userId: 1,
  recordType: 1,
});

schengenAppointmentSchema.index({
  bookingReference: 1,
});

module.exports = mongoose.model(
  "SchengenAppointment",
  schengenAppointmentSchema
);