const mongoose = require("mongoose");
const crypto = require("crypto");

const SchengenAppointment = require("../models/SchengenAppointment");

// =========================================================
// HELPERS
// =========================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const createSlug = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const generateBookingReference = () => {
  const random = crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase();

  return `ATLYS-SCH-${Date.now()}-${random}`;
};

const getEarliestSlot = async ({
  destinationId,
  centreId = null,
  purpose = null,
}) => {
  const query = {
    recordType: "slot",
    destinationId,
    active: true,
    available: true,
    remainingCapacity: { $gt: 0 },
    date: { $gte: new Date() },
  };

  if (centreId) {
    query.centreId = centreId;
  }

  if (purpose) {
    query.purpose = purpose.toLowerCase();
  }

  return SchengenAppointment.findOne(query).sort({
    date: 1,
    time: 1,
  });
};

// =========================================================
// DESTINATION - PUBLIC
// =========================================================

// GET /api/schengen/destinations
const getDestinations = async (req, res) => {
  try {
    const {
      residenceCountry = "India",
      search = "",
    } = req.query;

    const query = {
      recordType: "destination",
      active: true,
      residenceCountry,
    };

    if (search.trim()) {
      query.name = {
        $regex: search.trim(),
        $options: "i",
      };
    }

    const destinations =
      await SchengenAppointment.find(query)
        .sort({
          displayOrder: 1,
          name: 1,
        })
        .lean();

    return res.json({
      success: true,
      count: destinations.length,
      destinations,
    });
  } catch (error) {
    console.error("Get Schengen destinations:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch Schengen destinations",
    });
  }
};

// =========================================================
// DESTINATION - PUBLIC SINGLE PAGE
// =========================================================

// GET /api/schengen/:slug
const getDestinationPage = async (req, res) => {
  try {
    const { slug } = req.params;

    const destination =
      await SchengenAppointment.findOne({
        recordType: "destination",
        slug: slug.toLowerCase(),
        active: true,
      }).lean();

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Schengen destination not found",
      });
    }

    const centres =
      await SchengenAppointment.find({
        recordType: "centre",
        destinationId: destination._id,
        active: true,
      })
        .sort({
          displayOrder: 1,
          city: 1,
        })
        .lean();

    const purposes = await SchengenAppointment.distinct(
      "purpose",
      {
        recordType: "slot",
        destinationId: destination._id,
        active: true,
      }
    );

    const centreResults = await Promise.all(
      centres.map(async (centre) => {
        const earliestSlot = await getEarliestSlot({
          destinationId: destination._id,
          centreId: centre._id,
        });

        return {
          ...centre,
          earliestSlot: earliestSlot
            ? {
                id: earliestSlot._id,
                date: earliestSlot.date,
                time: earliestSlot.time,
                purpose: earliestSlot.purpose,
                remainingCapacity:
                  earliestSlot.remainingCapacity,
              }
            : null,
        };
      })
    );

    return res.json({
      success: true,
      destination: {
        id: destination._id,
        name: destination.name,
        slug: destination.slug,
        residenceCountry:
          destination.residenceCountry,
        description: destination.description,
        image: destination.image,
      },
      purposes,
      centres: centreResults,
    });
  } catch (error) {
    console.error("Get Schengen destination page:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch Schengen destination",
    });
  }
};

// =========================================================
// ADMIN - DESTINATION
// =========================================================

// POST /api/schengen/admin/destinations
const createDestination = async (req, res) => {
  try {
    const {
      name,
      residenceCountry = "India",
      description = "",
      image = "",
      displayOrder = 0,
      active = true,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Destination name is required",
      });
    }

    const slug = createSlug(name);

    const existing =
      await SchengenAppointment.findOne({
        recordType: "destination",
        slug,
      });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "This destination already exists",
      });
    }

    const destination =
      await SchengenAppointment.create({
        recordType: "destination",
        name: name.trim(),
        slug,
        residenceCountry:
          residenceCountry.trim(),
        description,
        image,
        displayOrder: Number(displayOrder) || 0,
        active:
          active === false || active === "false"
            ? false
            : true,
      });

    return res.status(201).json({
      success: true,
      message: "Schengen destination created successfully",
      destination,
    });
  } catch (error) {
    console.error("Create destination:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create destination",
    });
  }
};

// PUT /api/schengen/admin/destinations/:id
const updateDestination = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid destination ID",
      });
    }

    const destination =
      await SchengenAppointment.findOne({
        _id: id,
        recordType: "destination",
      });

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    const {
      name,
      residenceCountry,
      description,
      image,
      displayOrder,
      active,
    } = req.body;

    if (name !== undefined) {
      const newName = name.trim();
      const newSlug = createSlug(newName);

      const duplicate =
        await SchengenAppointment.findOne({
          _id: { $ne: id },
          recordType: "destination",
          slug: newSlug,
        });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "Another destination with this name exists",
        });
      }

      destination.name = newName;
      destination.slug = newSlug;
    }

    if (residenceCountry !== undefined) {
      destination.residenceCountry =
        residenceCountry.trim();
    }

    if (description !== undefined) {
      destination.description = description;
    }

    if (image !== undefined) {
      destination.image = image;
    }

    if (displayOrder !== undefined) {
      destination.displayOrder =
        Number(displayOrder) || 0;
    }

    if (active !== undefined) {
      destination.active =
        active === true || active === "true";
    }

    await destination.save();

    return res.json({
      success: true,
      message: "Destination updated successfully",
      destination,
    });
  } catch (error) {
    console.error("Update destination:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update destination",
    });
  }
};

// DELETE /api/schengen/admin/destinations/:id
const deleteDestination = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid destination ID",
      });
    }

    const destination =
      await SchengenAppointment.findOne({
        _id: id,
        recordType: "destination",
      });

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    destination.active = false;

    await destination.save();

    await SchengenAppointment.updateMany(
      {
        recordType: {
          $in: ["centre", "slot"],
        },
        destinationId: destination._id,
      },
      {
        $set: {
          active: false,
        },
      }
    );

    return res.json({
      success: true,
      message:
        "Destination and related appointment data deactivated successfully",
    });
  } catch (error) {
    console.error("Delete destination:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete destination",
    });
  }
};

// =========================================================
// CENTRES
// =========================================================

// GET /api/schengen/:destinationId/centres
const getCentres = async (req, res) => {
  try {
    const { destinationId } = req.params;

    if (!isValidObjectId(destinationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid destination ID",
      });
    }

    const destination =
      await SchengenAppointment.findOne({
        _id: destinationId,
        recordType: "destination",
        active: true,
      });

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    const centres =
      await SchengenAppointment.find({
        recordType: "centre",
        destinationId,
        active: true,
      }).sort({
        displayOrder: 1,
        city: 1,
      });

    return res.json({
      success: true,
      count: centres.length,
      centres,
    });
  } catch (error) {
    console.error("Get centres:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch application centres",
    });
  }
};

// POST /api/schengen/admin/centres
const createCentre = async (req, res) => {
  try {
    const {
      destinationId,
      city,
      state = "",
      centreName,
      provider = "",
      address = "",
      phone = "",
      website = "",
      displayOrder = 0,
      active = true,
    } = req.body;

    if (!isValidObjectId(destinationId)) {
      return res.status(400).json({
        success: false,
        message: "Valid destinationId is required",
      });
    }

    if (!city || !city.trim()) {
      return res.status(400).json({
        success: false,
        message: "City is required",
      });
    }

    if (!centreName || !centreName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Centre name is required",
      });
    }

    const destination =
      await SchengenAppointment.findOne({
        _id: destinationId,
        recordType: "destination",
        active: true,
      });

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    const centre =
      await SchengenAppointment.create({
        recordType: "centre",
        destinationId,
        name: centreName.trim(),
        centreName: centreName.trim(),
        city: city.trim(),
        state: state.trim(),
        provider: provider.trim(),
        address: address.trim(),
        phone: phone.trim(),
        website: website.trim(),
        displayOrder: Number(displayOrder) || 0,
        active:
          active === false || active === "false"
            ? false
            : true,
      });

    return res.status(201).json({
      success: true,
      message: "Application centre created successfully",
      centre,
    });
  } catch (error) {
    console.error("Create centre:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create application centre",
    });
  }
};

// PUT /api/schengen/admin/centres/:id
const updateCentre = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid centre ID",
      });
    }

    const centre =
      await SchengenAppointment.findOne({
        _id: id,
        recordType: "centre",
      });

    if (!centre) {
      return res.status(404).json({
        success: false,
        message: "Application centre not found",
      });
    }

    const {
      city,
      state,
      centreName,
      provider,
      address,
      phone,
      website,
      displayOrder,
      active,
    } = req.body;

    if (city !== undefined) {
      centre.city = city.trim();
    }

    if (state !== undefined) {
      centre.state = state.trim();
    }

    if (centreName !== undefined) {
      centre.centreName = centreName.trim();
      centre.name = centreName.trim();
    }

    if (provider !== undefined) {
      centre.provider = provider.trim();
    }

    if (address !== undefined) {
      centre.address = address.trim();
    }

    if (phone !== undefined) {
      centre.phone = phone.trim();
    }

    if (website !== undefined) {
      centre.website = website.trim();
    }

    if (displayOrder !== undefined) {
      centre.displayOrder =
        Number(displayOrder) || 0;
    }

    if (active !== undefined) {
      centre.active =
        active === true || active === "true";
    }

    await centre.save();

    return res.json({
      success: true,
      message: "Application centre updated successfully",
      centre,
    });
  } catch (error) {
    console.error("Update centre:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update application centre",
    });
  }
};

// DELETE /api/schengen/admin/centres/:id
const deleteCentre = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid centre ID",
      });
    }

    const centre =
      await SchengenAppointment.findOne({
        _id: id,
        recordType: "centre",
      });

    if (!centre) {
      return res.status(404).json({
        success: false,
        message: "Application centre not found",
      });
    }

    centre.active = false;
    await centre.save();

    await SchengenAppointment.updateMany(
      {
        recordType: "slot",
        centreId: centre._id,
      },
      {
        $set: {
          active: false,
          available: false,
        },
      }
    );

    return res.json({
      success: true,
      message:
        "Application centre and related slots deactivated successfully",
    });
  } catch (error) {
    console.error("Delete centre:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete application centre",
    });
  }
};

// =========================================================
// SLOTS
// =========================================================

// GET /api/schengen/:destinationId/slots
const getSlots = async (req, res) => {
  try {
    const { destinationId } = req.params;

    const {
      centreId,
      purpose,
      fromDate,
      toDate,
      available = "true",
    } = req.query;

    if (!isValidObjectId(destinationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid destination ID",
      });
    }

    const query = {
      recordType: "slot",
      destinationId,
      active: true,
    };

    if (centreId) {
      if (!isValidObjectId(centreId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid centre ID",
        });
      }

      query.centreId = centreId;
    }

    if (purpose) {
      query.purpose = purpose.toLowerCase();
    }

    if (available !== "all") {
      query.available = available === "true";
      query.remainingCapacity = {
        $gt: 0,
      };
    }

    if (fromDate || toDate) {
      query.date = {};

      if (fromDate) {
        const start = new Date(fromDate);

        if (Number.isNaN(start.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid fromDate",
          });
        }

        query.date.$gte = start;
      }

      if (toDate) {
        const end = new Date(toDate);

        if (Number.isNaN(end.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid toDate",
          });
        }

        end.setHours(23, 59, 59, 999);

        query.date.$lte = end;
      }
    }

    const slots =
      await SchengenAppointment.find(query)
        .sort({
          date: 1,
          time: 1,
        })
        .lean();

    return res.json({
      success: true,
      count: slots.length,
      slots,
    });
  } catch (error) {
    console.error("Get slots:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch appointment slots",
    });
  }
};

// GET /api/schengen/:destinationId/earliest
const getEarliestSlots = async (req, res) => {
  try {
    const { destinationId } = req.params;
    const { purpose } = req.query;

    if (!isValidObjectId(destinationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid destination ID",
      });
    }

    const centres =
      await SchengenAppointment.find({
        recordType: "centre",
        destinationId,
        active: true,
      }).lean();

    const result = await Promise.all(
      centres.map(async (centre) => {
        const earliest =
          await getEarliestSlot({
            destinationId,
            centreId: centre._id,
            purpose,
          });

        return {
          centre: {
            id: centre._id,
            name: centre.centreName,
            city: centre.city,
            state: centre.state,
            provider: centre.provider,
          },
          earliestSlot: earliest
            ? {
                id: earliest._id,
                date: earliest.date,
                time: earliest.time,
                purpose: earliest.purpose,
                remainingCapacity:
                  earliest.remainingCapacity,
              }
            : null,
        };
      })
    );

    return res.json({
      success: true,
      centres: result,
    });
  } catch (error) {
    console.error("Get earliest slots:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch earliest appointment slots",
    });
  }
};

// POST /api/schengen/admin/slots
const createSlot = async (req, res) => {
  try {
    const {
      destinationId,
      centreId,
      purpose = "tourism",
      date,
      time = "",
      capacity = 1,
      available = true,
    } = req.body;

    if (!isValidObjectId(destinationId)) {
      return res.status(400).json({
        success: false,
        message: "Valid destinationId is required",
      });
    }

    if (!isValidObjectId(centreId)) {
      return res.status(400).json({
        success: false,
        message: "Valid centreId is required",
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Appointment date is required",
      });
    }

    const slotDate = new Date(date);

    if (Number.isNaN(slotDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment date",
      });
    }

    const destination =
      await SchengenAppointment.findOne({
        _id: destinationId,
        recordType: "destination",
        active: true,
      });

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    const centre =
      await SchengenAppointment.findOne({
        _id: centreId,
        recordType: "centre",
        destinationId,
        active: true,
      });

    if (!centre) {
      return res.status(404).json({
        success: false,
        message:
          "Application centre not found for this destination",
      });
    }

    const slotCapacity =
      Math.max(1, Number(capacity) || 1);

    const slot =
      await SchengenAppointment.create({
        recordType: "slot",
        destinationId,
        centreId,
        purpose: String(purpose)
          .trim()
          .toLowerCase(),
        date: slotDate,
        time: String(time).trim(),
        capacity: slotCapacity,
        remainingCapacity:
          available === false ||
          available === "false"
            ? 0
            : slotCapacity,
        available:
          available === false ||
          available === "false"
            ? false
            : true,
        active: true,
      });

    return res.status(201).json({
      success: true,
      message: "Appointment slot created successfully",
      slot,
    });
  } catch (error) {
    console.error("Create slot:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create appointment slot",
    });
  }
};

// PUT /api/schengen/admin/slots/:id
const updateSlot = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid slot ID",
      });
    }

    const slot =
      await SchengenAppointment.findOne({
        _id: id,
        recordType: "slot",
      });

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Appointment slot not found",
      });
    }

    const {
      purpose,
      date,
      time,
      capacity,
      available,
      active,
    } = req.body;

    if (purpose !== undefined) {
      slot.purpose = String(purpose)
        .trim()
        .toLowerCase();
    }

    if (date !== undefined) {
      const newDate = new Date(date);

      if (Number.isNaN(newDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid appointment date",
        });
      }

      slot.date = newDate;
    }

    if (time !== undefined) {
      slot.time = String(time).trim();
    }

    if (capacity !== undefined) {
      const newCapacity =
        Math.max(1, Number(capacity) || 1);

      const alreadyBooked =
        slot.capacity - slot.remainingCapacity;

      if (newCapacity < alreadyBooked) {
        return res.status(400).json({
          success: false,
          message:
            "Capacity cannot be lower than already booked travellers",
        });
      }

      slot.capacity = newCapacity;

      slot.remainingCapacity =
        newCapacity - alreadyBooked;
    }

    if (available !== undefined) {
      const isAvailable =
        available === true ||
        available === "true";

      slot.available =
        isAvailable &&
        slot.remainingCapacity > 0;
    }

    if (active !== undefined) {
      slot.active =
        active === true ||
        active === "true";
    }

    await slot.save();

    return res.json({
      success: true,
      message: "Appointment slot updated successfully",
      slot,
    });
  } catch (error) {
    console.error("Update slot:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update appointment slot",
    });
  }
};

// DELETE /api/schengen/admin/slots/:id
const deleteSlot = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid slot ID",
      });
    }

    const slot =
      await SchengenAppointment.findOne({
        _id: id,
        recordType: "slot",
      });

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Appointment slot not found",
      });
    }

    slot.active = false;
    slot.available = false;

    await slot.save();

    return res.json({
      success: true,
      message: "Appointment slot deactivated successfully",
    });
  } catch (error) {
    console.error("Delete slot:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete appointment slot",
    });
  }
};

// =========================================================
// BOOKING
// =========================================================

// POST /api/schengen/book
const bookAppointment = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const {
      slotId,
      travellers = 1,
      applicantName = "",
      applicantEmail = "",
      applicantPhone = "",
    } = req.body;

    if (!isValidObjectId(slotId)) {
      return res.status(400).json({
        success: false,
        message: "Valid slotId is required",
      });
    }

    const travellerCount =
      Math.max(1, Number(travellers) || 1);

    // Atomically reserve the required capacity.
    const slot =
      await SchengenAppointment.findOneAndUpdate(
        {
          _id: slotId,
          recordType: "slot",
          active: true,
          available: true,
          remainingCapacity: {
            $gte: travellerCount,
          },
        },
        {
          $inc: {
            remainingCapacity: -travellerCount,
          },
        },
        {
          new: true,
        }
      );

    if (!slot) {
      return res.status(409).json({
        success: false,
        message:
          "This slot is no longer available for the requested number of travellers",
      });
    }

    if (slot.remainingCapacity === 0) {
      slot.available = false;
      await slot.save();
    }

    const booking =
      await SchengenAppointment.create({
        recordType: "booking",
        destinationId: slot.destinationId,
        centreId: slot.centreId,
        slotId: slot._id,
        userId,
        travellers: travellerCount,
        bookingReference:
          generateBookingReference(),
        bookingStatus: "confirmed",
        applicantName:
          applicantName.trim(),
        applicantEmail:
          applicantEmail.trim().toLowerCase(),
        applicantPhone:
          applicantPhone.trim(),
        active: true,
      });

    return res.status(201).json({
      success: true,
      message:
        "Schengen appointment booked successfully",
      booking,
    });
  } catch (error) {
    console.error("Book appointment:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to book appointment",
    });
  }
};

// GET /api/schengen/bookings/my
const getMyBookings = async (req, res) => {
  try {
    const bookings =
      await SchengenAppointment.find({
        recordType: "booking",
        userId: req.user._id,
      })
        .sort({
          createdAt: -1,
        })
        .lean();

    const enrichedBookings =
      await Promise.all(
        bookings.map(async (booking) => {
          const [
            destination,
            centre,
            slot,
          ] = await Promise.all([
            SchengenAppointment.findById(
              booking.destinationId
            ).lean(),

            SchengenAppointment.findById(
              booking.centreId
            ).lean(),

            SchengenAppointment.findById(
              booking.slotId
            ).lean(),
          ]);

          return {
            ...booking,
            destination,
            centre,
            slot,
          };
        })
      );

    return res.json({
      success: true,
      count: enrichedBookings.length,
      bookings: enrichedBookings,
    });
  } catch (error) {
    console.error("Get my bookings:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};

// GET /api/schengen/admin/bookings
const getAllBookings = async (req, res) => {
  try {
    const {
      status,
      destinationId,
      centreId,
    } = req.query;

    const query = {
      recordType: "booking",
    };

    if (status) {
      query.bookingStatus = status;
    }

    if (destinationId) {
      query.destinationId = destinationId;
    }

    if (centreId) {
      query.centreId = centreId;
    }

    const bookings =
      await SchengenAppointment.find(query)
        .sort({
          createdAt: -1,
        })
        .lean();

    return res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get all bookings:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch appointment bookings",
    });
  }
};

// PUT /api/schengen/admin/bookings/:id/status
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "confirmed",
      "cancelled",
      "completed",
    ];

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status",
      });
    }

    const booking =
      await SchengenAppointment.findOne({
        _id: id,
        recordType: "booking",
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    booking.bookingStatus = status;

    await booking.save();

    return res.json({
      success: true,
      message: "Booking status updated successfully",
      booking,
    });
  } catch (error) {
    console.error("Update booking status:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update booking status",
    });
  }
};

// =========================================================
// SLOT ALERTS
// =========================================================

// POST /api/schengen/alerts
const createAlert = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required",
      });
    }

    const {
      destinationId,
      centreId = null,
      purpose = "",
      alertEmail = "",
      alertPhone = "",
    } = req.body;

    if (!isValidObjectId(destinationId)) {
      return res.status(400).json({
        success: false,
        message: "Valid destinationId is required",
      });
    }

    if (
      centreId &&
      !isValidObjectId(centreId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid centreId",
      });
    }

    const destination =
      await SchengenAppointment.findOne({
        _id: destinationId,
        recordType: "destination",
        active: true,
      });

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: "Destination not found",
      });
    }

    const duplicate =
      await SchengenAppointment.findOne({
        recordType: "alert",
        userId,
        destinationId,
        centreId,
        purpose:
          purpose.trim().toLowerCase(),
        alertActive: true,
      });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message:
          "An active alert already exists for this selection",
      });
    }

    const alert =
      await SchengenAppointment.create({
        recordType: "alert",
        userId,
        destinationId,
        centreId,
        purpose:
          purpose.trim().toLowerCase(),
        alertEmail:
          alertEmail.trim().toLowerCase(),
        alertPhone:
          alertPhone.trim(),
        alertActive: true,
      });

    return res.status(201).json({
      success: true,
      message: "Appointment alert created successfully",
      alert,
    });
  } catch (error) {
    console.error("Create alert:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create appointment alert",
    });
  }
};

// GET /api/schengen/alerts/my
const getMyAlerts = async (req, res) => {
  try {
    const alerts =
      await SchengenAppointment.find({
        recordType: "alert",
        userId: req.user._id,
      })
        .sort({
          createdAt: -1,
        })
        .lean();

    return res.json({
      success: true,
      count: alerts.length,
      alerts,
    });
  } catch (error) {
    console.error("Get my alerts:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch appointment alerts",
    });
  }
};

// DELETE /api/schengen/alerts/:id
const deleteAlert = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid alert ID",
      });
    }

    const alert =
      await SchengenAppointment.findOne({
        _id: id,
        recordType: "alert",
        userId: req.user._id,
      });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found",
      });
    }

    alert.alertActive = false;
    alert.active = false;

    await alert.save();

    return res.json({
      success: true,
      message: "Appointment alert removed successfully",
    });
  } catch (error) {
    console.error("Delete alert:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove appointment alert",
    });
  }
};

// =========================================================
// ADMIN - ALL DATA
// =========================================================

// GET /api/schengen/admin/all
const getAdminOverview = async (req, res) => {
  try {
    const [
      destinations,
      centres,
      slots,
      bookings,
      alerts,
    ] = await Promise.all([
      SchengenAppointment.countDocuments({
        recordType: "destination",
      }),

      SchengenAppointment.countDocuments({
        recordType: "centre",
      }),

      SchengenAppointment.countDocuments({
        recordType: "slot",
      }),

      SchengenAppointment.countDocuments({
        recordType: "booking",
      }),

      SchengenAppointment.countDocuments({
        recordType: "alert",
        alertActive: true,
      }),
    ]);

    return res.json({
      success: true,
      stats: {
        destinations,
        centres,
        slots,
        bookings,
        activeAlerts: alerts,
      },
    });
  } catch (error) {
    console.error("Get admin overview:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch Schengen overview",
    });
  }
};

// =========================================================
// EXPORTS
// =========================================================

module.exports = {
  getDestinations,
  getDestinationPage,

  createDestination,
  updateDestination,
  deleteDestination,

  getCentres,
  createCentre,
  updateCentre,
  deleteCentre,

  getSlots,
  getEarliestSlots,
  createSlot,
  updateSlot,
  deleteSlot,

  bookAppointment,
  getMyBookings,

  getAllBookings,
  updateBookingStatus,

  createAlert,
  getMyAlerts,
  deleteAlert,

  getAdminOverview,
};