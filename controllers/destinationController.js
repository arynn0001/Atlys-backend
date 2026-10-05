const Destination = require("../models/Destination");

// =========================
// GET ALL DESTINATIONS
// =========================

const getDestinations = async (req, res) => {
  try {
    const filter = {
      active: true
    };

    if (req.query.country) {
      filter.country = req.query.country;
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    const destinations = await Destination.find(filter)
      .populate("country", "name code flag")
      .sort({
        popular: -1,
        name: 1
      });

    res.json({
      success: true,
      count: destinations.length,
      destinations
    });
  } catch (error) {
    console.error("Get Destinations Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// =========================
// GET SINGLE DESTINATION
// =========================

const getDestinationById = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id)
      .populate("country", "name code flag");

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found"
      });
    }

    res.json({
      success: true,
      destination
    });
  } catch (error) {
    console.error("Get Destination Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// =========================
// CREATE DESTINATION
// =========================

const createDestination = async (req, res) => {
  try {
    const {
      name,
      city,
      country,
      image,
      shortDescription,
      description,
      category,
      popular,
      active
    } = req.body;

    if (!name || !city || !country) {
      return res.status(400).json({
        success: false,
        message: "Name, city and country are required"
      });
    }

    const destination = await Destination.create({
      name,
      city,
      country,
      image,
      shortDescription,
      description,
      category,
      popular,
      active
    });

    const populatedDestination = await destination.populate(
      "country",
      "name code flag"
    );

    res.status(201).json({
      success: true,
      message: "Destination created successfully",
      destination: populatedDestination
    });
  } catch (error) {
    console.error("Create Destination Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// =========================
// UPDATE DESTINATION
// =========================

const updateDestination = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found"
      });
    }

    const updatedDestination =
      await Destination.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true
        }
      ).populate("country", "name code flag");

    res.json({
      success: true,
      message: "Destination updated successfully",
      destination: updatedDestination
    });
  } catch (error) {
    console.error("Update Destination Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// =========================
// DELETE DESTINATION
// =========================

const deleteDestination = async (req, res) => {
  try {
    const destination = await Destination.findById(
      req.params.id
    );

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found"
      });
    }

    await Destination.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Destination deleted successfully"
    });
  } catch (error) {
    console.error("Delete Destination Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  getDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination
};