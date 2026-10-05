const Experience = require("../models/Experience");

// =========================
// GET ALL EXPERIENCES
// =========================

const getExperiences = async (req, res) => {
  try {
    const filter = {
      active: true
    };

    if (req.query.destination) {
      filter.destination = req.query.destination;
    }

    if (req.query.country) {
      filter.country = req.query.country;
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    const experiences = await Experience.find(filter)
      .populate("destination", "name city")
      .populate("country", "name code flag")
      .sort({
        popular: -1,
        rating: -1,
        title: 1
      });

    res.json({
      success: true,
      count: experiences.length,
      experiences
    });
  } catch (error) {
    console.error("Get Experiences Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// =========================
// GET SINGLE EXPERIENCE
// =========================

const getExperienceById = async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id)
      .populate("destination", "name city")
      .populate("country", "name code flag");

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: "Experience not found"
      });
    }

    res.json({
      success: true,
      experience
    });
  } catch (error) {
    console.error("Get Experience Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// =========================
// CREATE EXPERIENCE
// =========================

const createExperience = async (req, res) => {
  try {
    const {
      title,
      destination,
      country,
      image,
      shortDescription,
      description,
      category,
      duration,
      price,
      currency,
      rating,
      popular,
      active
    } = req.body;

    if (!title || !destination || !country || !category) {
      return res.status(400).json({
        success: false,
        message:
          "Title, destination, country and category are required"
      });
    }

    const experience = await Experience.create({
      title,
      destination,
      country,
      image,
      shortDescription,
      description,
      category,
      duration,
      price,
      currency,
      rating,
      popular,
      active
    });

    const populatedExperience = await experience.populate([
      {
        path: "destination",
        select: "name city"
      },
      {
        path: "country",
        select: "name code flag"
      }
    ]);

    res.status(201).json({
      success: true,
      message: "Experience created successfully",
      experience: populatedExperience
    });
  } catch (error) {
    console.error("Create Experience Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// =========================
// UPDATE EXPERIENCE
// =========================

const updateExperience = async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: "Experience not found"
      });
    }

    const updatedExperience =
      await Experience.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true
        }
      )
        .populate("destination", "name city")
        .populate("country", "name code flag");

    res.json({
      success: true,
      message: "Experience updated successfully",
      experience: updatedExperience
    });
  } catch (error) {
    console.error("Update Experience Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// =========================
// DELETE EXPERIENCE
// =========================

const deleteExperience = async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);

    if (!experience) {
      return res.status(404).json({
        success: false,
        message: "Experience not found"
      });
    }

    await Experience.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Experience deleted successfully"
    });
  } catch (error) {
    console.error("Delete Experience Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  getExperiences,
  getExperienceById,
  createExperience,
  updateExperience,
  deleteExperience
};