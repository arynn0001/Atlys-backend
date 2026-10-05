const Place = require("../models/Place");

// =========================
// GET ALL PLACES
// =========================

const getPlaces = async (req, res) => {
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

    const places = await Place.find(filter)
      .populate("destination", "name city")
      .populate("country", "name code flag")
      .sort({
        popular: -1,
        rating: -1,
        name: 1
      });

    res.json({
      success: true,
      count: places.length,
      places
    });
  } catch (error) {
    console.error("Get Places Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// =========================
// GET SINGLE PLACE
// =========================

const getPlaceById = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id)
      .populate("destination", "name city")
      .populate("country", "name code flag");

    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Place not found"
      });
    }

    res.json({
      success: true,
      place
    });
  } catch (error) {
    console.error("Get Place Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// =========================
// CREATE PLACE
// =========================

const createPlace = async (req, res) => {
  try {
    const {
      name,
      destination,
      country,
      image,
      shortDescription,
      description,
      category,
      address,
      rating,
      popular,
      active
    } = req.body;

    if (!name || !destination || !country) {
      return res.status(400).json({
        success: false,
        message: "Name, destination and country are required"
      });
    }

    const place = await Place.create({
      name,
      destination,
      country,
      image,
      shortDescription,
      description,
      category,
      address,
      rating,
      popular,
      active
    });

    const populatedPlace = await place.populate([
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
      message: "Place created successfully",
      place: populatedPlace
    });
  } catch (error) {
    console.error("Create Place Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// =========================
// UPDATE PLACE
// =========================

const updatePlace = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);

    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Place not found"
      });
    }

    const updatedPlace = await Place.findByIdAndUpdate(
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
      message: "Place updated successfully",
      place: updatedPlace
    });
  } catch (error) {
    console.error("Update Place Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// =========================
// DELETE PLACE
// =========================

const deletePlace = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);

    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Place not found"
      });
    }

    await Place.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Place deleted successfully"
    });
  } catch (error) {
    console.error("Delete Place Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  getPlaces,
  getPlaceById,
  createPlace,
  updatePlace,
  deletePlace
};