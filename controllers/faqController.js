const FAQ = require("../models/FAQ");
const Country = require("../models/Country");
const Visa = require("../models/Visa");

// ==========================================
// GET PUBLIC FAQS
// ==========================================

const getFAQs = async (req, res) => {
  try {
    const {
      type,
      country,
      visa
    } = req.query;

    const filter = {
      active: true
    };

    // FAQ type
    if (type) {
      if (!["visa", "application"].includes(type)) {
        return res.status(400).json({
          success: false,
          message: "type must be visa or application"
        });
      }

      filter.type = type;
    }

    // Country filter
    if (country) {
      filter.country = country;
    }

    // Visa filter
    if (visa) {
      filter.visa = visa;
    }

    const faqs = await FAQ.find(filter)
      .populate("country", "name code flag")
      .populate(
        "visa",
        "name category visaType entryType validity stayDuration"
      )
      .sort({
        order: 1,
        createdAt: 1
      });

    return res.status(200).json({
      success: true,
      count: faqs.length,
      faqs
    });

  } catch (error) {
    console.error("Get FAQs Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// ==========================================
// GET SINGLE FAQ
// ==========================================

const getFAQById = async (req, res) => {
  try {
    const faq = await FAQ.findOne({
      _id: req.params.id,
      active: true
    })
      .populate("country", "name code flag")
      .populate(
        "visa",
        "name category visaType entryType validity stayDuration"
      );

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found"
      });
    }

    return res.status(200).json({
      success: true,
      faq
    });

  } catch (error) {
    console.error("Get FAQ Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// ==========================================
// ADMIN - GET ALL FAQS
// ==========================================

const getAllFAQsAdmin = async (req, res) => {
  try {
    const {
      type
    } = req.query;

    const filter = {};

    if (type) {
      filter.type = type;
    }

    const faqs = await FAQ.find(filter)
      .populate("country", "name code")
      .populate("visa", "name category")
      .sort({
        type: 1,
        order: 1,
        createdAt: 1
      });

    return res.status(200).json({
      success: true,
      count: faqs.length,
      faqs
    });

  } catch (error) {
    console.error("Admin Get FAQs Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// ==========================================
// ADMIN - CREATE FAQ
// ==========================================

const createFAQ = async (req, res) => {
  try {
    const {
      type,
      country,
      visa,
      question,
      answer,
      order,
      active
    } = req.body;

    // Required validation
    if (!type || !question || !answer) {
      return res.status(400).json({
        success: false,
        message: "type, question and answer are required"
      });
    }

    if (!["visa", "application"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "type must be visa or application"
      });
    }

    // ==========================================
    // CHECK COUNTRY
    // ==========================================

    if (country) {
      const countryExists = await Country.findById(country);

      if (!countryExists) {
        return res.status(404).json({
          success: false,
          message: "Country not found"
        });
      }
    }

    // ==========================================
    // CHECK VISA
    // ==========================================

    if (visa) {
      const visaExists = await Visa.findById(visa);

      if (!visaExists) {
        return res.status(404).json({
          success: false,
          message: "Visa not found"
        });
      }
    }

    // ==========================================
    // CREATE
    // ==========================================

    const faq = await FAQ.create({
      type,
      country: country || null,
      visa: visa || null,
      question,
      answer,
      order: Number(order) || 0,
      active:
        active === undefined
          ? true
          : active
    });

    return res.status(201).json({
      success: true,
      message: "FAQ created successfully",
      faq
    });

  } catch (error) {
    console.error("Create FAQ Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// ==========================================
// ADMIN - UPDATE FAQ
// ==========================================

const updateFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found"
      });
    }

    const {
      type,
      country,
      visa,
      question,
      answer,
      order,
      active
    } = req.body;

    if (type !== undefined) {
      if (!["visa", "application"].includes(type)) {
        return res.status(400).json({
          success: false,
          message: "type must be visa or application"
        });
      }

      faq.type = type;
    }

    if (country !== undefined) {
      if (country) {
        const countryExists = await Country.findById(country);

        if (!countryExists) {
          return res.status(404).json({
            success: false,
            message: "Country not found"
          });
        }

        faq.country = country;
      } else {
        faq.country = null;
      }
    }

    if (visa !== undefined) {
      if (visa) {
        const visaExists = await Visa.findById(visa);

        if (!visaExists) {
          return res.status(404).json({
            success: false,
            message: "Visa not found"
          });
        }

        faq.visa = visa;
      } else {
        faq.visa = null;
      }
    }

    if (question !== undefined) {
      faq.question = question;
    }

    if (answer !== undefined) {
      faq.answer = answer;
    }

    if (order !== undefined) {
      faq.order = Number(order) || 0;
    }

    if (active !== undefined) {
      if (typeof active !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "active must be true or false"
        });
      }

      faq.active = active;
    }

    await faq.save();

    return res.status(200).json({
      success: true,
      message: "FAQ updated successfully",
      faq
    });

  } catch (error) {
    console.error("Update FAQ Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// ==========================================
// ADMIN - DELETE FAQ
// ==========================================

const deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findById(req.params.id);

    if (!faq) {
      return res.status(404).json({
        success: false,
        message: "FAQ not found"
      });
    }

    // Soft delete
    faq.active = false;

    await faq.save();

    return res.status(200).json({
      success: true,
      message: "FAQ deactivated successfully"
    });

  } catch (error) {
    console.error("Delete FAQ Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


module.exports = {
  getFAQs,
  getFAQById,
  getAllFAQsAdmin,
  createFAQ,
  updateFAQ,
  deleteFAQ
};