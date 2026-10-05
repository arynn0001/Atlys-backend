const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["visa", "application"],
      required: true,
      index: true
    },

    // Optional: FAQ ko particular country se connect kar sakte hain
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      default: null
    },

    // Optional: FAQ ko particular visa se connect kar sakte hain
    visa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Visa",
      default: null
    },

    question: {
      type: String,
      required: true,
      trim: true
    },

    answer: {
      type: String,
      required: true,
      trim: true
    },

    order: {
      type: Number,
      default: 0
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

faqSchema.index({
  type: 1,
  active: 1,
  order: 1
});

module.exports = mongoose.model("FAQ", faqSchema);