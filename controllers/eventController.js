const Event = require("../models/Event");

// =========================
// GET ALL EVENTS
// =========================

const getEvents = async (req, res) => {
  try {
    const filter = {
      active: true
    };

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.country) {
      filter.country = req.query.country;
    }

    if (req.query.destination) {
      filter.destination = req.query.destination;
    }

    if (req.query.featured === "true") {
      filter.featured = true;
    }

    if (req.query.popular === "true") {
      filter.popular = true;
    }

    if (req.query.from) {
      filter.eventDate = {
        ...filter.eventDate,
        $gte: new Date(req.query.from)
      };
    }

    if (req.query.to) {
      filter.eventDate = {
        ...filter.eventDate,
        $lte: new Date(req.query.to)
      };
    }

    const events = await Event.find(filter)
      .populate("country", "name code flag")
      .populate("destination", "name city")
      .sort({
        eventDate: 1
      });

    res.json({
      success: true,
      count: events.length,
      events
    });
  } catch (error) {
    console.error("Get Events Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// =========================
// GET SINGLE EVENT
// =========================

const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("country", "name code flag")
      .populate("destination", "name city");

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    res.json({
      success: true,
      event
    });
  } catch (error) {
    console.error("Get Event Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// =========================
// CREATE EVENT
// =========================

const createEvent = async (req, res) => {
  try {
    const {
      title,
      country,
      destination,
      category,
      image,
      shortDescription,
      description,
      venue,
      address,
      eventDate,
      endDate,
      price,
      currency,
      ticketUrl,
      organizer,
      rating,
      featured,
      popular,
      active
    } = req.body;

    if (
      !title ||
      !country ||
      !destination ||
      !category ||
      !eventDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, country, destination, category and event date are required"
      });
    }

    const event = await Event.create({
      title,
      country,
      destination,
      category,
      image,
      shortDescription,
      description,
      venue,
      address,
      eventDate,
      endDate,
      price,
      currency,
      ticketUrl,
      organizer,
      rating,
      featured,
      popular,
      active
    });

    const populatedEvent = await event.populate([
      {
        path: "country",
        select: "name code flag"
      },
      {
        path: "destination",
        select: "name city"
      }
    ]);

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event: populatedEvent
    });
  } catch (error) {
    console.error("Create Event Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// =========================
// UPDATE EVENT
// =========================

const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    )
      .populate("country", "name code flag")
      .populate("destination", "name city");

    res.json({
      success: true,
      message: "Event updated successfully",
      event: updatedEvent
    });
  } catch (error) {
    console.error("Update Event Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// =========================
// DELETE EVENT
// =========================

const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found"
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Event deleted successfully"
    });
  } catch (error) {
    console.error("Delete Event Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
};