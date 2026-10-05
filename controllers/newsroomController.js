const mongoose = require("mongoose");
const NewsroomArticle = require("../models/NewsroomArticle");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// PUBLIC - GET ACTIVE ARTICLES
const getPublicNewsroom = async (req, res) => {
  try {
    const articles = await NewsroomArticle.find({ active: true })
      .sort({ displayOrder: 1, date: -1 })
      .lean();

    return res.json({
      success: true,
      count: articles.length,
      articles
    });
  } catch (error) {
    console.error("Get public newsroom error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch newsroom articles"
    });
  }
};

// ADMIN - GET ALL
const getAllNewsroom = async (req, res) => {
  try {
    const { active, search } = req.query;
    const query = {};

    if (active === "true") query.active = true;
    if (active === "false") query.active = false;

    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { source: { $regex: search.trim(), $options: "i" } }
      ];
    }

    const articles = await NewsroomArticle.find(query)
      .sort({ displayOrder: 1, date: -1 })
      .lean();

    return res.json({
      success: true,
      count: articles.length,
      articles
    });
  } catch (error) {
    console.error("Get all newsroom error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch newsroom articles"
    });
  }
};

// ADMIN - GET SINGLE
const getSingleNewsroom = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid article ID"
      });
    }

    const article = await NewsroomArticle.findById(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found"
      });
    }

    return res.json({ success: true, article });
  } catch (error) {
    console.error("Get single newsroom error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch article"
    });
  }
};

// ADMIN - CREATE
const createNewsroom = async (req, res) => {
  try {
    const { source, title, date, url, displayOrder, active } = req.body;

    if (!source || !source.trim()) {
      return res.status(400).json({
        success: false,
        message: "Source is required"
      });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required"
      });
    }

    let parsedDate = null;
    if (date) {
      parsedDate = new Date(date);
      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date"
        });
      }
    }

    const article = await NewsroomArticle.create({
      source: source.trim(),
      title: title.trim(),
      date: parsedDate,
      url: url ? url.trim() : "",
      displayOrder: Number(displayOrder) || 0,
      active: active === false || active === "false" ? false : true
    });

    return res.status(201).json({
      success: true,
      message: "Article created successfully",
      article
    });
  } catch (error) {
    console.error("Create newsroom error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create article"
    });
  }
};

// ADMIN - UPDATE
const updateNewsroom = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid article ID"
      });
    }

    const article = await NewsroomArticle.findById(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found"
      });
    }

    const { source, title, date, url, displayOrder, active } = req.body;

    if (source !== undefined) {
      if (!source.trim()) {
        return res.status(400).json({
          success: false,
          message: "Source cannot be empty"
        });
      }
      article.source = source.trim();
    }

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Title cannot be empty"
        });
      }
      article.title = title.trim();
    }

    if (date !== undefined) {
      if (date === null || date === "") {
        article.date = null;
      } else {
        const parsedDate = new Date(date);
        if (Number.isNaN(parsedDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid date"
          });
        }
        article.date = parsedDate;
      }
    }

    if (url !== undefined) article.url = url.trim();
    if (displayOrder !== undefined) article.displayOrder = Number(displayOrder) || 0;
    if (active !== undefined) article.active = active === true || active === "true";

    await article.save();

    return res.json({
      success: true,
      message: "Article updated successfully",
      article
    });
  } catch (error) {
    console.error("Update newsroom error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update article"
    });
  }
};

// ADMIN - DELETE
const deleteNewsroom = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid article ID"
      });
    }

    const article = await NewsroomArticle.findByIdAndDelete(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found"
      });
    }

    return res.json({
      success: true,
      message: "Article deleted successfully"
    });
  } catch (error) {
    console.error("Delete newsroom error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete article"
    });
  }
};

// ADMIN - TOGGLE ACTIVE
const toggleNewsroomActive = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid article ID"
      });
    }

    const article = await NewsroomArticle.findById(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found"
      });
    }

    article.active = !article.active;
    await article.save();

    return res.json({
      success: true,
      message: `Article ${article.active ? "activated" : "deactivated"} successfully`,
      article
    });
  } catch (error) {
    console.error("Toggle newsroom error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle article status"
    });
  }
};

module.exports = {
  getPublicNewsroom,
  getAllNewsroom,
  getSingleNewsroom,
  createNewsroom,
  updateNewsroom,
  deleteNewsroom,
  toggleNewsroomActive
};