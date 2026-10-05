const mongoose = require("mongoose");

const priceChangeLogSchema = new mongoose.Schema(
  {
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      required: true,
    },

    visa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Visa",
      required: true,
    },

    feeType: {
      type: String,
      enum: [
        "governmentFee",
        "serviceFee",
      ],
      required: true,
    },

    oldAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    newAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    /*
     * New fee - old fee
     */
    differenceAmount: {
      type: Number,
      required: true,
    },

    /*
     * ((new - old) / old) * 100
     */
    differencePercentage: {
      type: Number,
      default: null,
    },

    /*
     * Optional actual government / external fee.
     */
    actualFee: {
      type: Number,
      default: null,
      min: 0,
    },

    /*
     * newAmount - actualFee
     */
    feeDifferenceAmount: {
      type: Number,
      default: null,
    },

    /*
     * ((newAmount - actualFee) / actualFee) * 100
     */
    feeDifferencePercentage: {
      type: Number,
      default: null,
    },

    currency: {
      type: String,
      default: "INR",
      trim: true,
      uppercase: true,
    },

    sourceUrl: {
      type: String,
      default: "",
      trim: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    effectiveDate: {
      type: Date,
      default: Date.now,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

priceChangeLogSchema.index({
  country: 1,
});

priceChangeLogSchema.index({
  visa: 1,
});

priceChangeLogSchema.index({
  feeType: 1,
});

priceChangeLogSchema.index({
  effectiveDate: -1,
});

priceChangeLogSchema.index({
  createdAt: -1,
});

module.exports = mongoose.model(
  "PriceChangeLog",
  priceChangeLogSchema
);