const mongoose = require("mongoose");

const newsroomArticleSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      required: true,
      trim: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      default: null
    },
    url: {
      type: String,
      default: "",
      trim: true
    },
    active: {
      type: Boolean,
      default: true
    },
    displayOrder: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

newsroomArticleSchema.index({ active: 1, displayOrder: 1 });
newsroomArticleSchema.index({ date: -1 });

module.exports = mongoose.model("NewsroomArticle", newsroomArticleSchema);