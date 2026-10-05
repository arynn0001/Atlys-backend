const Visa = require("../models/Visa");
const Country = require("../models/Country");
const PriceChangeLog = require("../models/PriceChangeLog");

const {
  uploadToBunny
} = require("../utils/bunnyStorage");

// ==========================================
// HELPERS
// ==========================================

// ==========================================
// VALIDATE ESTIMATED VISA DATE
// ==========================================

const parseEstimatedVisaDate = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date;
};

// ==========================================
// FORMAT DATE LABEL  ->  "08 OCT 26"
// ==========================================

const formatApprovalDateLabel = (date) => {
  if (!date) return null;

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) {
    return null;
  }

  const day = String(d.getDate()).padStart(2, "0");

  const month = d
    .toLocaleString("en-US", { month: "short" })
    .toUpperCase();

  const year = String(d.getFullYear()).slice(-2);

  return `${day} ${month} ${year}`;
};

// ==========================================
// CALCULATE FEE DIFFERENCE
// ==========================================

const calculateFeeDifference = (
  oldAmount,
  newAmount
) => {
  const oldValue = Number(oldAmount || 0);
  const newValue = Number(newAmount || 0);

  const difference =
    newValue - oldValue;

  let percentage = null;

  if (oldValue !== 0) {
    percentage =
      (difference / oldValue) * 100;
  }

  return {
    difference,
    percentage
  };
};

// ==========================================
// CREATE PRICE CHANGE LOG
// ==========================================

const createFeeChangeLog = async ({
  visa,
  feeType,
  oldAmount,
  newAmount,
  actualFee,
  sourceUrl,
  reason,
  description,
  effectiveDate
}) => {
  const {
    difference,
    percentage
  } = calculateFeeDifference(
    oldAmount,
    newAmount
  );

  let feeDifferenceAmount = null;
  let feeDifferencePercentage = null;

  if (
    actualFee !== undefined &&
    actualFee !== null &&
    actualFee !== ""
  ) {
    const actualValue =
      Number(actualFee);

    if (
      !Number.isNaN(actualValue) &&
      actualValue >= 0
    ) {
      feeDifferenceAmount =
        newAmount - actualValue;

      if (actualValue !== 0) {
        feeDifferencePercentage =
          (
            (newAmount - actualValue) /
            actualValue
          ) * 100;
      }
    }
  }

  const log =
    await PriceChangeLog.create({
      country: visa.country,
      visa: visa._id,
      feeType,

      oldAmount,
      newAmount,

      differenceAmount:
        difference,

      differencePercentage:
        percentage,

      actualFee:
        actualFee !== undefined &&
        actualFee !== null &&
        actualFee !== ""
          ? Number(actualFee)
          : null,

      feeDifferenceAmount,

      feeDifferencePercentage,

      currency:
        visa.currency || "INR",

      sourceUrl:
        sourceUrl
          ? String(sourceUrl).trim()
          : "",

      reason:
        reason
          ? String(reason).trim()
          : `${feeType === "governmentFee"
              ? "Government"
              : "Service"} fee updated`,

      description:
        description
          ? String(description).trim()
          : "",

      effectiveDate:
        effectiveDate
          ? new Date(effectiveDate)
          : new Date(),

      active: true
    });

  return log;
};

// ==========================================
// GET ALL VISAS
// ==========================================

const getVisas = async (req, res) => {
  try {
    const filter = {
      active: true
    };

    // ========================================
    // FILTER BY COUNTRY
    // ========================================

    if (req.query.country) {
      filter.country =
        req.query.country;
    }

    // ========================================
    // FILTER BY CATEGORY
    // ========================================

    if (req.query.category) {
      filter.category =
        req.query.category;
    }

    // ========================================
    // FILTER BY POPULAR
    // ========================================

    if (req.query.popular === "true") {
      filter.popular = true;
    }

    // ========================================
    // FETCH VISAS
    // ========================================

    const visas =
      await Visa.find(filter)
        .populate(
          "country",
          "name code flag image latitude longitude"
        )
        .sort({
          popular: -1,
          name: 1
        });

    return res.status(200).json({
      success: true,
      count: visas.length,
      visas
    });

  } catch (error) {
    console.error(
      "Get Visas Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// ==========================================
// GET VISA CARDS
// ==========================================

const getVisaCards = async (req, res) => {
  try {
    const filter = {
      active: true
    };

    // ========================================
    // OPTIONAL COUNTRY FILTER
    // ========================================

    if (req.query.country) {
      filter.country =
        req.query.country;
    }

    // ========================================
    // OPTIONAL CATEGORY FILTER
    // ========================================

    if (req.query.category) {
      filter.category =
        req.query.category;
    }

    // ========================================
    // OPTIONAL POPULAR FILTER
    // ========================================

    if (req.query.popular === "true") {
      filter.popular = true;
    }

    // ========================================
    // FETCH VISAS
    // ========================================

    const visas =
      await Visa.find(filter)
        .populate(
          "country",
          "name code flag image latitude longitude"
        )
        .sort({
          popular: -1,
          name: 1
        });

    // ========================================
    // CREATE CARD RESPONSE
    // ========================================

    const cards =
      visas.map((visa) => ({
        id: visa._id,

        // ====================================
        // COUNTRY
        // ====================================

        country: {
          id:
            visa.country?._id || null,

          name:
            visa.country?.name || "",

          code:
            visa.country?.code || "",

          flag:
            visa.country?.flag || "",

          image:
            visa.country?.image || "",

          latitude:
            visa.country?.latitude ?? null,

          longitude:
            visa.country?.longitude ?? null
        },

        // ====================================
        // VISA
        // ====================================

        visa: {
          id: visa._id,

          name:
            visa.name || "",

          type:
            visa.visaType ||
            "E-VISA",

          validity:
            visa.validity || "",

          stayDuration:
            visa.stayDuration || "",

          processingTime:
            visa.processingTime || "",

          estimatedVisaDate:
            visa.estimatedVisaDate || null,

          category:
            visa.category || "",

          entryType:
            visa.entryType || "",

          image:
            visa.image || "",

          documentsRequired:
            (visa.documentsRequired || [])
              .map((document) => ({
                name:
                  document.name,

                required:
                  document.required !== false
              }))
        },

        // ====================================
        // PRICING
        // ====================================

        pricing: {
          governmentFee:
            visa.governmentFee || 0,

          serviceFee:
            visa.serviceFee || 0,

          totalFee:
            visa.totalFee || 0,

          currency:
            visa.currency || "INR"
        },

        // ====================================
        // DESCRIPTION
        // ====================================

        description:
          visa.description || "",

        shortDescription:
          visa.shortDescription || "",

        // ====================================
        // STATUS
        // ====================================

        popular:
          visa.popular === true,

        active:
          visa.active === true
      }));

    return res.status(200).json({
      success: true,
      count: cards.length,
      cards
    });

  } catch (error) {
    console.error(
      "Get Visa Cards Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch visa cards",
      error:
        error.message
    });
  }
};

// ==========================================
// GET SINGLE VISA
// ==========================================

const getVisaById = async (req, res) => {
  try {
    const visa =
      await Visa.findById(
        req.params.id
      )
        .populate(
          "country",
          "name code flag image latitude longitude"
        );

    if (!visa) {
      return res.status(404).json({
        success: false,
        message:
          "Visa not found"
      });
    }

    return res.status(200).json({
      success: true,
      visa
    });

  } catch (error) {
    console.error(
      "Get Visa Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error",
      error:
        error.message
    });
  }
};

// ==========================================
// GET VISAS BY COUNTRY
// ==========================================

const getVisasByCountry =
  async (req, res) => {
    try {
      const {
        countryId
      } = req.params;

      // ======================================
      // CHECK COUNTRY
      // ======================================

      const country =
        await Country.findOne({
          _id: countryId,
          active: true
        });

      if (!country) {
        return res.status(404).json({
          success: false,
          message:
            "Country not found or inactive"
        });
      }

      // ======================================
      // FETCH VISAS
      // ======================================

      const visas =
        await Visa.find({
          country: countryId,
          active: true
        })
          .populate(
            "country",
            "name code flag image latitude longitude"
          )
          .sort({
            popular: -1,
            name: 1
          });

      return res.status(200).json({
        success: true,

        count:
          visas.length,

        country: {
          id:
            country._id,

          name:
            country.name,

          code:
            country.code,

          flag:
            country.flag,

          image:
            country.image || "",

          latitude:
            country.latitude ?? null,

          longitude:
            country.longitude ?? null
        },

        visas
      });

    } catch (error) {
      console.error(
        "Get Visas By Country Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Server error",
        error:
          error.message
      });
    }
  };

// ==========================================
// GET VISA MAP DATA
// ==========================================
//
// PUBLIC API
// GET /api/visas/map
//
// Optional Query Params:
// ?country=COUNTRY_ID
// ?category=tourist
// ?popular=true
// ?ne_lat=..&ne_lng=..&sw_lat=..&sw_lng=..
//
// ==========================================

const getVisaMapData = async (req, res) => {
  try {
    const filter = {
      active: true,
      estimatedVisaDate: {
        $ne: null
      }
    };

    // ========================================
    // OPTIONAL FILTERS
    // ========================================

    if (req.query.country) {
      filter.country = req.query.country;
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.popular === "true") {
      filter.popular = true;
    }

    // ========================================
    // FETCH VISAS
    // ========================================

    const visas = await Visa.find(filter)
      .populate(
        "country",
        "name code flag image latitude longitude"
      )
      .sort({
        estimatedVisaDate: 1
      });

    // ========================================
    // GROUP BY COUNTRY
    // ========================================
    //
    // Screenshot mein ek country ka ek hi card
    // dikh raha hai. Isliye har country ka
    // sirf earliest estimatedVisaDate wala
    // visa bhejna hai.
    //
    // ========================================

    const countryMap = new Map();

    visas.forEach((visa) => {
      if (
        !visa.country ||
        visa.country.latitude === null ||
        visa.country.latitude === undefined ||
        visa.country.longitude === null ||
        visa.country.longitude === undefined
      ) {
        return;
      }

      const countryId = String(visa.country._id);

      // Already added -> skip
      // (sorted by date, so pehla hi earliest hai)
      if (countryMap.has(countryId)) {
        return;
      }

      countryMap.set(countryId, visa);
    });

    // ========================================
    // BUILD MAP RESPONSE
    // ========================================

    const mapData = Array.from(
      countryMap.values()
    ).map((visa) => ({
      id: visa._id,

      // ==================================
      // COUNTRY
      // ==================================

      country: {
        id: visa.country._id,
        name: visa.country.name,
        code: visa.country.code,
        flag: visa.country.flag,
        image: visa.country.image || ""
      },

      // ==================================
      // VISA
      // ==================================

      visa: {
        id: visa._id,
        name: visa.name,
        category: visa.category,
        visaType: visa.visaType || "",
        entryType: visa.entryType || "",
        validity: visa.validity || "",
        stayDuration: visa.stayDuration || "",
        processingTime: visa.processingTime || "",
        image: visa.image || ""
      },

      // ==================================
      // MAP LOCATION
      // ==================================

      location: {
        latitude: visa.country.latitude,
        longitude: visa.country.longitude
      },

      // ==================================
      // APPROVAL DATE
      // ==================================

      estimatedVisaDate: visa.estimatedVisaDate,

      approvalDateLabel: formatApprovalDateLabel(
        visa.estimatedVisaDate
      ),

      // ==================================
      // CARD EXTRAS (screenshot UI)
      // ==================================

      visaStatus: visa.visaStatus || "normal",

      badgeText: visa.badgeText || "",

      // ==================================
      // PRICING (optional display)
      // ==================================

      startingPrice: visa.totalFee || 0,

      currency: visa.currency || "INR",

      // ==================================
      // ACTION
      // ==================================

      detailUrl:
        visa.detailUrl ||
        `/en-IN/visa/${
          (visa.country.code || "").toLowerCase()
        }`
    }));

    return res.status(200).json({
      success: true,
      count: mapData.length,
      data: mapData
    });

  } catch (error) {
    console.error(
      "Get Visa Map Data Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch visa map data",
      error: error.message
    });
  }
};

// ==========================================
// CREATE VISA
// ==========================================

const createVisa = async (req, res) => {
  try {
    const {
      country,
      name,
      category,
      visaType,
      entryType,
      validity,
      stayDuration,
      processingTime,
      estimatedVisaDate,
      visaStatus,
      badgeText,
      detailUrl,
      governmentFee,
      serviceFee,
      currency,
      eligibility,
      documentsRequired,
      description,
      shortDescription,
      popular,
      active
    } = req.body;

    // ========================================
    // REQUIRED FIELDS
    // ========================================

    if (
      !country ||
      !name ||
      !category
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Country, name and category are required"
      });
    }

    // ========================================
    // CHECK COUNTRY
    // ========================================

    const countryData =
      await Country.findOne({
        _id: country,
        active: true
      });

    if (!countryData) {
      return res.status(404).json({
        success: false,
        message:
          "Country not found or inactive"
      });
    }

    // ========================================
    // VALIDATE ESTIMATED VISA DATE
    // ========================================

    const parsedEstimatedVisaDate =
      parseEstimatedVisaDate(
        estimatedVisaDate
      );

    if (
      parsedEstimatedVisaDate === false
    ) {
      return res.status(400).json({
        success: false,
        message:
          "estimatedVisaDate must be a valid date"
      });
    }

    // ========================================
    // VALIDATE FEES
    // ========================================

    const finalGovernmentFee =
      Number(
        governmentFee
      ) || 0;

    const finalServiceFee =
      Number(
        serviceFee
      ) || 0;

    if (
      finalGovernmentFee < 0 ||
      finalServiceFee < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Fees cannot be negative"
      });
    }

    // ========================================
    // TOTAL FEE
    // ========================================

    const totalFee =
      finalGovernmentFee +
      finalServiceFee;

    // ========================================
    // PARSE ELIGIBILITY
    // ========================================

    let parsedEligibility =
      eligibility || [];

    if (
      typeof parsedEligibility ===
      "string"
    ) {
      try {
        parsedEligibility =
          JSON.parse(
            parsedEligibility
          );
      } catch (error) {
        parsedEligibility =
          parsedEligibility
            .split(",")
            .map(
              (item) =>
                item.trim()
            )
            .filter(Boolean);
      }
    }

    if (
      !Array.isArray(
        parsedEligibility
      )
    ) {
      parsedEligibility = [];
    }

    // ========================================
    // PARSE DOCUMENTS
    // ========================================

    let parsedDocuments =
      documentsRequired || [];

    if (
      typeof parsedDocuments ===
      "string"
    ) {
      try {
        parsedDocuments =
          JSON.parse(
            parsedDocuments
          );
      } catch (error) {
        parsedDocuments = [];
      }
    }

    if (
      !Array.isArray(
        parsedDocuments
      )
    ) {
      parsedDocuments = [];
    }

    // ========================================
    // UPLOAD VISA IMAGE
    // ========================================

    let imageUrl = "";

    if (req.file) {
      const extension =
        req.file.originalname
          .includes(".")
          ? req.file.originalname
              .substring(
                req.file.originalname
                  .lastIndexOf(".")
              )
              .toLowerCase()
          : ".jpg";

      const fileName =
        `${Date.now()}-${Math.round(
          Math.random() * 1e9
        )}${extension}`;

      const bunnyFile =
        await uploadToBunny({
          buffer:
            req.file.buffer,

          fileName,

          contentType:
            req.file.mimetype,

          folder:
            `visas/${countryData._id}`
        });

      imageUrl =
        bunnyFile.path;
    }

    // ========================================
    // CREATE VISA
    // ========================================

    const visa =
      await Visa.create({
        country:
          countryData._id,

        name:
          String(name).trim(),

        category,

        visaType:
          visaType || "",

        entryType:
          entryType || "single",

        validity:
          validity || "",

        stayDuration:
          stayDuration || "",

        processingTime:
          processingTime || "",

        estimatedVisaDate:
          parsedEstimatedVisaDate,

        visaStatus:
          visaStatus || "normal",

        badgeText:
          badgeText || "",

        detailUrl:
          detailUrl || "",

        governmentFee:
          finalGovernmentFee,

        serviceFee:
          finalServiceFee,

        totalFee,

        currency:
          currency
            ? String(currency)
                .trim()
                .toUpperCase()
            : "INR",

        eligibility:
          parsedEligibility,

        documentsRequired:
          parsedDocuments,

        image:
          imageUrl,

        description:
          description || "",

        shortDescription:
          shortDescription || "",

        popular:
          popular === true ||
          popular === "true",

        active:
          active !== false &&
          active !== "false"
      });

    // ========================================
    // POPULATE
    // ========================================

    const populatedVisa =
      await Visa.findById(
        visa._id
      )
        .populate(
          "country",
          "name code flag image latitude longitude"
        );

    return res.status(201).json({
      success: true,
      message:
        "Visa created successfully",
      visa:
        populatedVisa
    });

  } catch (error) {
    console.error(
      "Create Visa Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error",
      error:
        error.message
    });
  }
};

// ==========================================
// UPDATE VISA
// ==========================================

const updateVisa = async (req, res) => {
  try {
    const visa =
      await Visa.findById(
        req.params.id
      );

    if (!visa) {
      return res.status(404).json({
        success: false,
        message:
          "Visa not found"
      });
    }

    const {
      country,
      name,
      category,
      visaType,
      entryType,
      validity,
      stayDuration,
      processingTime,
      estimatedVisaDate,
      visaStatus,
      badgeText,
      detailUrl,
      governmentFee,
      serviceFee,
      currency,
      eligibility,
      documentsRequired,
      description,
      shortDescription,
      popular,
      active,

      // ======================================
      // PRICE CHANGE METADATA
      // ======================================

      feeChangeReason,
      feeChangeDescription,
      feeEffectiveDate,
      feeActualAmount,
      feeSourceUrl
    } = req.body;

    // ========================================
    // STORE OLD FEE VALUES
    // BEFORE ANY UPDATE
    // ========================================

    const oldGovernmentFee =
      Number(
        visa.governmentFee || 0
      );

    const oldServiceFee =
      Number(
        visa.serviceFee || 0
      );

    // ========================================
    // COUNTRY UPDATE
    // ========================================

    if (
      country !== undefined
    ) {
      const countryData =
        await Country.findOne({
          _id: country,
          active: true
        });

      if (!countryData) {
        return res.status(404).json({
          success: false,
          message:
            "Country not found or inactive"
        });
      }

      visa.country =
        countryData._id;
    }

    // ========================================
    // BASIC DETAILS
    // ========================================

    if (
      name !== undefined
    ) {
      if (
        !String(name).trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Visa name cannot be empty"
        });
      }

      visa.name =
        String(name).trim();
    }

    if (
      category !== undefined
    ) {
      visa.category =
        category;
    }

    if (
      visaType !== undefined
    ) {
      visa.visaType =
        visaType;
    }

    if (
      entryType !== undefined
    ) {
      visa.entryType =
        entryType;
    }

    // ========================================
    // DURATION
    // ========================================

    if (
      validity !== undefined
    ) {
      visa.validity =
        validity;
    }

    if (
      stayDuration !== undefined
    ) {
      visa.stayDuration =
        stayDuration;
    }

    if (
      processingTime !== undefined
    ) {
      visa.processingTime =
        processingTime;
    }

    // ========================================
    // ESTIMATED VISA DATE
    // ========================================

    if (
      estimatedVisaDate !== undefined
    ) {
      const parsedEstimatedVisaDate =
        parseEstimatedVisaDate(
          estimatedVisaDate
        );

      if (
        parsedEstimatedVisaDate === false
      ) {
        return res.status(400).json({
          success: false,
          message:
            "estimatedVisaDate must be a valid date"
        });
      }

      visa.estimatedVisaDate =
        parsedEstimatedVisaDate;
    }

    // ========================================
    // MAP CARD EXTRAS
    // ========================================

    if (visaStatus !== undefined) {
      visa.visaStatus = visaStatus;
    }

    if (badgeText !== undefined) {
      visa.badgeText = badgeText;
    }

    if (detailUrl !== undefined) {
      visa.detailUrl = detailUrl;
    }

    // ========================================
    // FEES
    // ========================================

    if (
      governmentFee !== undefined
    ) {
      const newGovernmentFee =
        Number(
          governmentFee
        );

      if (
        Number.isNaN(
          newGovernmentFee
        ) ||
        newGovernmentFee < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "governmentFee must be a valid non-negative number"
        });
      }

      visa.governmentFee =
        newGovernmentFee;
    }

    if (
      serviceFee !== undefined
    ) {
      const newServiceFee =
        Number(
          serviceFee
        );

      if (
        Number.isNaN(
          newServiceFee
        ) ||
        newServiceFee < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "serviceFee must be a valid non-negative number"
        });
      }

      visa.serviceFee =
        newServiceFee;
    }

    // ========================================
    // RECALCULATE TOTAL FEE
    // ========================================

    visa.totalFee =
      Number(
        visa.governmentFee || 0
      ) +
      Number(
        visa.serviceFee || 0
      );

    // ========================================
    // CURRENCY
    // ========================================

    if (
      currency !== undefined
    ) {
      visa.currency =
        String(currency)
          .trim()
          .toUpperCase();
    }

    // ========================================
    // ELIGIBILITY
    // ========================================

    if (
      eligibility !== undefined
    ) {
      let parsedEligibility =
        eligibility;

      if (
        typeof parsedEligibility ===
        "string"
      ) {
        try {
          parsedEligibility =
            JSON.parse(
              parsedEligibility
            );
        } catch (error) {
          parsedEligibility =
            parsedEligibility
              .split(",")
              .map(
                (item) =>
                  item.trim()
              )
              .filter(Boolean);
        }
      }

      if (
        !Array.isArray(
          parsedEligibility
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "eligibility must be an array"
        });
      }

      visa.eligibility =
        parsedEligibility;
    }

    // ========================================
    // DOCUMENTS
    // ========================================

    if (
      documentsRequired !== undefined
    ) {
      let parsedDocuments =
        documentsRequired;

      if (
        typeof parsedDocuments ===
        "string"
      ) {
        try {
          parsedDocuments =
            JSON.parse(
              parsedDocuments
            );
        } catch (error) {
          parsedDocuments = [];
        }
      }

      if (
        !Array.isArray(
          parsedDocuments
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "documentsRequired must be an array"
        });
      }

      visa.documentsRequired =
        parsedDocuments;
    }

    // ========================================
    // DESCRIPTION
    // ========================================

    if (
      description !== undefined
    ) {
      visa.description =
        description;
    }

    if (
      shortDescription !== undefined
    ) {
      visa.shortDescription =
        shortDescription;
    }

    // ========================================
    // BACKGROUND IMAGE
    // ========================================

    if (req.file) {
      const extension =
        req.file.originalname
          .includes(".")
          ? req.file.originalname
              .substring(
                req.file.originalname
                  .lastIndexOf(".")
              )
              .toLowerCase()
          : ".jpg";

      const fileName =
        `${Date.now()}-${Math.round(
          Math.random() * 1e9
        )}${extension}`;

      const bunnyFile =
        await uploadToBunny({
          buffer:
            req.file.buffer,

          fileName,

          contentType:
            req.file.mimetype,

          folder:
            `visas/${visa.country}`
        });

      visa.image =
        bunnyFile.path;
    }

    // ========================================
    // STATUS
    // ========================================

    if (
      popular !== undefined
    ) {
      const normalizedPopular =
        popular === true ||
        popular === "true";

      visa.popular =
        normalizedPopular;
    }

    if (
      active !== undefined
    ) {
      const normalizedActive =
        active === true ||
        active === "true";

      visa.active =
        normalizedActive;
    }

    // ========================================
    // CHECK WHETHER FEES CHANGED
    // ========================================

    const newGovernmentFee =
      Number(
        visa.governmentFee || 0
      );

    const newServiceFee =
      Number(
        visa.serviceFee || 0
      );

    const governmentFeeChanged =
      oldGovernmentFee !==
      newGovernmentFee;

    const serviceFeeChanged =
      oldServiceFee !==
      newServiceFee;

    // ========================================
    // VALIDATE FEE EFFECTIVE DATE
    // ========================================

    let parsedFeeEffectiveDate =
      new Date();

    if (
      feeEffectiveDate !== undefined &&
      feeEffectiveDate !== null &&
      feeEffectiveDate !== ""
    ) {
      parsedFeeEffectiveDate =
        new Date(
          feeEffectiveDate
        );

      if (
        Number.isNaN(
          parsedFeeEffectiveDate.getTime()
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "feeEffectiveDate must be a valid date"
        });
      }
    }

    // ========================================
    // VALIDATE ACTUAL FEE
    // ========================================

    let parsedActualFee =
      null;

    if (
      feeActualAmount !== undefined &&
      feeActualAmount !== null &&
      feeActualAmount !== ""
    ) {
      parsedActualFee =
        Number(
          feeActualAmount
        );

      if (
        Number.isNaN(
          parsedActualFee
        ) ||
        parsedActualFee < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "feeActualAmount must be a valid non-negative number"
        });
      }
    }

    // ========================================
    // SAVE UPDATED VISA
    // ========================================

    await visa.save();

    // ========================================
    // CREATE GOVERNMENT FEE CHANGE LOG
    // ========================================

    if (
      governmentFeeChanged
    ) {
      try {
        await createFeeChangeLog({
          visa,

          feeType:
            "governmentFee",

          oldAmount:
            oldGovernmentFee,

          newAmount:
            newGovernmentFee,

          actualFee:
            parsedActualFee,

          sourceUrl:
            feeSourceUrl,

          reason:
            feeChangeReason ||
            "Government fee updated",

          description:
            feeChangeDescription,

          effectiveDate:
            parsedFeeEffectiveDate
        });
      } catch (logError) {
        console.error(
          "Government Fee Change Log Error:",
          logError
        );
      }
    }

    // ========================================
    // CREATE SERVICE FEE CHANGE LOG
    // ========================================

    if (
      serviceFeeChanged
    ) {
      try {
        await createFeeChangeLog({
          visa,

          feeType:
            "serviceFee",

          oldAmount:
            oldServiceFee,

          newAmount:
            newServiceFee,

          actualFee:
            null,

          sourceUrl:
            feeSourceUrl,

          reason:
            feeChangeReason ||
            "Service fee updated",

          description:
            feeChangeDescription,

          effectiveDate:
            parsedFeeEffectiveDate
        });
      } catch (logError) {
        console.error(
          "Service Fee Change Log Error:",
          logError
        );
      }
    }

    // ========================================
    // POPULATE UPDATED VISA
    // ========================================

    const updatedVisa =
      await Visa.findById(
        visa._id
      )
        .populate(
          "country",
          "name code flag image latitude longitude"
        );

    // ========================================
    // RESPONSE
    // ========================================

    return res.status(200).json({
      success: true,

      message:
        governmentFeeChanged ||
        serviceFeeChanged
          ? "Visa updated successfully and fee change logged"
          : "Visa updated successfully",

      feeChange: {
        governmentFeeChanged,

        serviceFeeChanged,

        oldGovernmentFee,

        newGovernmentFee,

        oldServiceFee,

        newServiceFee,

        newTotalFee:
          updatedVisa.totalFee
      },

      visa:
        updatedVisa
    });

  } catch (error) {
    console.error(
      "Update Visa Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error",
      error:
        error.message
    });
  }
};

// ==========================================
// DELETE / DEACTIVATE VISA
// ==========================================

const deleteVisa = async (req, res) => {
  try {
    const visa =
      await Visa.findById(
        req.params.id
      );

    if (!visa) {
      return res.status(404).json({
        success: false,
        message:
          "Visa not found"
      });
    }

    // ========================================
    // SOFT DELETE
    // ========================================

    visa.active =
      false;

    await visa.save();

    return res.status(200).json({
      success: true,
      message:
        "Visa deactivated successfully"
    });

  } catch (error) {
    console.error(
      "Delete Visa Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error",
      error:
        error.message
    });
  }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  getVisas,
  getVisaCards,
  getVisaById,
  getVisasByCountry,
  getVisaMapData,
  createVisa,
  updateVisa,
  deleteVisa
};