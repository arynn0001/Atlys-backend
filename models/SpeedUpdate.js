const mongoose = require("mongoose");

const shipSchema = new mongoose.Schema(
  {
    order: {
      type: Number,
      required: true,
      default: 1
    },
    description: {
      type: String,
      required: true,
      trim: true
    }
  },
  { _id: true }
);

const speedUpdateSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      index: true
    },
    ships: {
      type: [shipSchema],
      default: []
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

speedUpdateSchema.index({ active: 1, date: -1 });

module.exports = mongoose.model("SpeedUpdate", speedUpdateSchema);