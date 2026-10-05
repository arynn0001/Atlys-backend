const PriceChangeLog = require("../models/PriceChangeLog");
const Visa = require("../models/Visa");
const Country = require("../models/Country");

// ==========================================
// HELPERS
// ==========================================

const calculateDifference = (
  oldAmount,
  newAmount
) => {
  const differenceAmount =
    Number(newAmount) - Number(oldAmount);

  let differencePercentage = null;

  if (Number(oldAmount) > 0) {
    differencePercentage =
      (differenceAmount / Number(oldAmount)) * 100;
  }

  return {
    differenceAmount,
    differencePercentage,
  };
};

const calculateFeeDifference = (
  newAmount,
  actualFee
) => {
  if (
    actualFee === null ||
    actualFee === undefined ||
    actualFee === "" ||
    Number.isNaN(Number(actualFee))
  ) {
    return {
      feeDifferenceAmount: null,
      feeDifferencePercentage: null,
    };
  }

  const actual = Number(actualFee);
  const current = Number(newAmount);

  const feeDifferenceAmount =
    current - actual;

  let feeDifferencePercentage = null;

  if (actual > 0) {
    feeDifferencePercentage =
      (feeDifferenceAmount / actual) * 100;
  }

  return {
    feeDifferenceAmount,
    feeDifferencePercentage,
  };
};

// ==========================================
// GET PRICE CHANGE LOG
// ==========================================

const getPriceChanges = async (req, res) => {
  try {
    const {
      country,
      visa,
      feeType,
      active,
    } = req.query;

    const filter = {};

    if (country) {
      filter.country = country;
    }

    if (visa) {
      filter.visa = visa;
    }

    if (feeType) {
      filter.feeType = feeType;
    }

    if (active !== undefined) {
      filter.active =
        active === "true";
    }

    const priceChanges =
      await PriceChangeLog.find(filter)
        .populate(
          "country",
          "name code flag image"
        )
        .populate(
          "visa",
          "name category visaType governmentFee serviceFee totalFee currency"
        )
        .sort({
          effectiveDate: -1,
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: priceChanges.length,
      priceChanges,
    });
  } catch (error) {
    console.error(
      "Get Price Changes Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch price changes",
      error: error.message,
    });
  }
};

// ==========================================
// GET SINGLE PRICE CHANGE
// ==========================================

const getPriceChangeById = async (
  req,
  res
) => {
  try {
    const priceChange =
      await PriceChangeLog.findById(
        req.params.id
      )
        .populate(
          "country",
          "name code flag image"
        )
        .populate(
          "visa",
          "name category visaType governmentFee serviceFee totalFee currency"
        );

    if (!priceChange) {
      return res.status(404).json({
        success: false,
        message:
          "Price change not found",
      });
    }

    return res.status(200).json({
      success: true,
      priceChange,
    });
  } catch (error) {
    console.error(
      "Get Price Change Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch price change",
      error: error.message,
    });
  }
};

// ==========================================
// CREATE PRICE CHANGE
// ==========================================
//
// This endpoint:
// 1. Finds the Visa
// 2. Checks current fee
// 3. Updates Visa fee
// 4. Recalculates totalFee
// 5. Creates history record
//
// ==========================================

const createPriceChange = async (
  req,
  res
) => {
  try {
    const {
      country,
      visa,
      feeType,
      newAmount,
      actualFee,
      currency,
      sourceUrl,
      reason,
      description,
      effectiveDate,
    } = req.body;

    // ----------------------------------------
    // VALIDATION
    // ----------------------------------------

    if (
      !country ||
      !visa ||
      !feeType ||
      newAmount === undefined ||
      newAmount === null ||
      !reason
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Country, visa, fee type, new amount and reason are required",
      });
    }

    if (
      ![
        "governmentFee",
        "serviceFee",
      ].includes(feeType)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid fee type",
      });
    }

    const parsedNewAmount =
      Number(newAmount);

    if (
      Number.isNaN(parsedNewAmount) ||
      parsedNewAmount < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "New amount must be a valid non-negative number",
      });
    }

    // ----------------------------------------
    // COUNTRY
    // ----------------------------------------

    const countryData =
      await Country.findById(country);

    if (!countryData) {
      return res.status(404).json({
        success: false,
        message: "Country not found",
      });
    }

    // ----------------------------------------
    // VISA
    // ----------------------------------------

    const visaData =
      await Visa.findById(visa);

    if (!visaData) {
      return res.status(404).json({
        success: false,
        message: "Visa not found",
      });
    }

    // ----------------------------------------
    // VISA / COUNTRY MATCH
    // ----------------------------------------

    if (
      String(visaData.country) !==
      String(country)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Selected visa does not belong to selected country",
      });
    }

    // ----------------------------------------
    // OLD FEE
    // ----------------------------------------

    const oldAmount =
      Number(
        visaData[feeType] || 0
      );

    // ----------------------------------------
    // DIFFERENCE
    // ----------------------------------------

    const {
      differenceAmount,
      differencePercentage,
    } = calculateDifference(
      oldAmount,
      parsedNewAmount
    );

    // ----------------------------------------
    // ACTUAL FEE DIFFERENCE
    // ----------------------------------------

    const {
      feeDifferenceAmount,
      feeDifferencePercentage,
    } = calculateFeeDifference(
      parsedNewAmount,
      actualFee
    );

    // ----------------------------------------
    // UPDATE VISA
    // ----------------------------------------

    visaData[feeType] =
      parsedNewAmount;

    visaData.totalFee =
      Number(
        visaData.governmentFee || 0
      ) +
      Number(
        visaData.serviceFee || 0
      );

    if (currency) {
      visaData.currency =
        String(currency)
          .trim()
          .toUpperCase();
    }

    await visaData.save();

    // ----------------------------------------
    // CREATE HISTORY
    // ----------------------------------------

    const priceChange =
      await PriceChangeLog.create({
        country:
          countryData._id,

        visa:
          visaData._id,

        feeType,

        oldAmount,

        newAmount:
          parsedNewAmount,

        differenceAmount,

        differencePercentage,

        actualFee:
          actualFee === "" ||
          actualFee === undefined ||
          actualFee === null
            ? null
            : Number(actualFee),

        feeDifferenceAmount,

        feeDifferencePercentage,

        currency:
          visaData.currency || "INR",

        sourceUrl:
          sourceUrl || "",

        reason:
          String(reason).trim(),

        description:
          description || "",

        effectiveDate:
          effectiveDate || new Date(),

        active: true,
      });

    // ----------------------------------------
    // RESPONSE
    // ----------------------------------------

    const populated =
      await PriceChangeLog.findById(
        priceChange._id
      )
        .populate(
          "country",
          "name code flag image"
        )
        .populate(
          "visa",
          "name category visaType governmentFee serviceFee totalFee currency"
        );

    return res.status(201).json({
      success: true,
      message:
        "Visa fee updated and price change recorded successfully",

      priceChange:
        populated,

      updatedVisa:
        visaData,
    });
  } catch (error) {
    console.error(
      "Create Price Change Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update visa fee",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE HISTORY RECORD
// ==========================================

const updatePriceChange = async (
  req,
  res
) => {
  try {
    const priceChange =
      await PriceChangeLog.findById(
        req.params.id
      );

    if (!priceChange) {
      return res.status(404).json({
        success: false,
        message:
          "Price change not found",
      });
    }

    const {
      actualFee,
      sourceUrl,
      reason,
      description,
      effectiveDate,
      active,
    } = req.body;

    if (actualFee !== undefined) {
      if (
        actualFee === "" ||
        actualFee === null
      ) {
        priceChange.actualFee =
          null;

        priceChange.feeDifferenceAmount =
          null;

        priceChange.feeDifferencePercentage =
          null;
      } else {
        const actual =
          Number(actualFee);

        if (
          Number.isNaN(actual) ||
          actual < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Actual fee must be a valid non-negative number",
          });
        }

        priceChange.actualFee =
          actual;

        const {
          feeDifferenceAmount,
          feeDifferencePercentage,
        } = calculateFeeDifference(
          priceChange.newAmount,
          actual
        );

        priceChange.feeDifferenceAmount =
          feeDifferenceAmount;

        priceChange.feeDifferencePercentage =
          feeDifferencePercentage;
      }
    }

    if (sourceUrl !== undefined) {
      priceChange.sourceUrl =
        String(sourceUrl).trim();
    }

    if (reason !== undefined) {
      if (!String(reason).trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Reason cannot be empty",
        });
      }

      priceChange.reason =
        String(reason).trim();
    }

    if (description !== undefined) {
      priceChange.description =
        description;
    }

    if (effectiveDate !== undefined) {
      priceChange.effectiveDate =
        effectiveDate;
    }

    if (active !== undefined) {
      priceChange.active =
        active === true ||
        active === "true";
    }

    await priceChange.save();

    const populated =
      await PriceChangeLog.findById(
        priceChange._id
      )
        .populate(
          "country",
          "name code flag image"
        )
        .populate(
          "visa",
          "name category visaType governmentFee serviceFee totalFee currency"
        );

    return res.status(200).json({
      success: true,
      message:
        "Price change updated successfully",
      priceChange:
        populated,
    });
  } catch (error) {
    console.error(
      "Update Price Change Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update price change",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE / DEACTIVATE HISTORY
// ==========================================

const deletePriceChange = async (
  req,
  res
) => {
  try {
    const priceChange =
      await PriceChangeLog.findById(
        req.params.id
      );

    if (!priceChange) {
      return res.status(404).json({
        success: false,
        message:
          "Price change not found",
      });
    }

    priceChange.active = false;

    await priceChange.save();

    return res.status(200).json({
      success: true,
      message:
        "Price change deactivated successfully",
    });
  } catch (error) {
    console.error(
      "Delete Price Change Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to deactivate price change",
      error: error.message,
    });
  }
};

module.exports = {
  getPriceChanges,
  getPriceChangeById,
  createPriceChange,
  updatePriceChange,
  deletePriceChange,
};