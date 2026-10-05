const path = require("path");
const crypto = require("crypto");

const Country = require("../models/country");
const { uploadToBunny } = require("../utils/bunnyStorage");


// =====================================================
// HELPER
// =====================================================

const createUniqueFileName = (originalName) => {
  const extension = path.extname(originalName).toLowerCase();

  const baseName = path
    .basename(originalName, extension)
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();

  const uniqueId = crypto.randomBytes(6).toString("hex");

  return `${baseName || "file"}-${Date.now()}-${uniqueId}${extension}`;
};


// =====================================================
// HELPER
// VALIDATE COORDINATES
// =====================================================

const parseCoordinate = (value, type) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return false;
  }

  if (type === "latitude") {
    if (number < -90 || number > 90) {
      return false;
    }
  }

  if (type === "longitude") {
    if (number < -180 || number > 180) {
      return false;
    }
  }

  return number;
};


// =====================================================
// GET ALL ACTIVE COUNTRIES
// USER + ADMIN
// =====================================================

const getCountries = async (req, res) => {
  try {

    const countries = await Country.find({
      active: true,
    }).sort({
      popular: -1,
      name: 1,
    });

    return res.status(200).json({
      success: true,
      count: countries.length,
      countries,
    });

  } catch (error) {

    console.error("Get Countries Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });

  }
};


// =====================================================
// GET SINGLE COUNTRY
// USER + ADMIN
// =====================================================

const getCountryById = async (req, res) => {
  try {

    const country =
      await Country.findById(
        req.params.id
      );

    if (!country) {

      return res.status(404).json({
        success: false,
        message: "Country not found",
      });

    }

    return res.status(200).json({
      success: true,
      country,
    });

  } catch (error) {

    console.error(
      "Get Country Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });

  }
};


// =====================================================
// CREATE COUNTRY
// ADMIN ONLY
// FLAG + IMAGE UPLOAD
// =====================================================

const createCountry = async (req, res) => {

  console.log("\n========================================");
  console.log("CREATE COUNTRY REQUEST");
  console.log("========================================");

  try {

    // =================================================
    // REQUEST DATA
    // =================================================

    console.log(
      "Content-Type:",
      req.headers["content-type"]
    );

    console.log(
      "Request Body:",
      req.body
    );

    console.log(
      "Request Files:",
      req.files
    );


    const {
      name,
      code,
      description,
      latitude,
      longitude,
      popular,
      active,
    } = req.body;


    // =================================================
    // BASIC VALIDATION
    // =================================================

    if (!name || !name.trim()) {

      console.log(
        "❌ Country name missing"
      );

      return res.status(400).json({
        success: false,
        message: "Country name is required",
      });

    }


    if (!code || !code.trim()) {

      console.log(
        "❌ Country code missing"
      );

      return res.status(400).json({
        success: false,
        message: "Country code is required",
      });

    }


    const normalizedName =
      name.trim();

    const normalizedCode =
      code.trim().toUpperCase();


    console.log(
      "Country Name:",
      normalizedName
    );

    console.log(
      "Country Code:",
      normalizedCode
    );


    // =================================================
    // VALIDATE LATITUDE
    // =================================================

    const parsedLatitude =
      parseCoordinate(
        latitude,
        "latitude"
      );


    if (
      parsedLatitude === false
    ) {

      return res.status(400).json({
        success: false,
        message:
          "latitude must be a valid number between -90 and 90",
      });

    }


    // =================================================
    // VALIDATE LONGITUDE
    // =================================================

    const parsedLongitude =
      parseCoordinate(
        longitude,
        "longitude"
      );


    if (
      parsedLongitude === false
    ) {

      return res.status(400).json({
        success: false,
        message:
          "longitude must be a valid number between -180 and 180",
      });

    }


    // =================================================
    // FILE VALIDATION
    // =================================================

    const flagFile =
      req.files?.flag?.[0];

    const imageFile =
      req.files?.image?.[0];


    console.log(
      "Flag File:",
      flagFile
        ? `${flagFile.originalname} | ${flagFile.mimetype} | ${flagFile.size} bytes`
        : "NOT FOUND"
    );


    console.log(
      "Country Image:",
      imageFile
        ? `${imageFile.originalname} | ${imageFile.mimetype} | ${imageFile.size} bytes`
        : "NOT FOUND"
    );


    if (!flagFile) {

      console.log(
        "❌ FLAG FILE MISSING"
      );

      return res.status(400).json({
        success: false,
        message:
          "Country flag file is required",
      });

    }


    if (!imageFile) {

      console.log(
        "❌ COUNTRY IMAGE FILE MISSING"
      );

      return res.status(400).json({
        success: false,
        message:
          "Country image file is required",
      });

    }


    console.log(
      "✅ Both files received successfully"
    );


    // =================================================
    // CHECK DUPLICATE COUNTRY CODE
    // =================================================

    console.log(
      `Checking whether country code "${normalizedCode}" already exists...`
    );


    const existingCountry =
      await Country.findOne({
        code: normalizedCode,
      });


    if (existingCountry) {

      console.log(
        `❌ Country code "${normalizedCode}" already exists`
      );

      return res.status(400).json({
        success: false,
        message:
          `Country code ${normalizedCode} already exists`,
      });

    }


    console.log(
      "✅ Country code is available"
    );


    // =================================================
    // CREATE UNIQUE FILE NAMES
    // =================================================

    const flagFileName =
      createUniqueFileName(
        flagFile.originalname
      );


    const imageFileName =
      createUniqueFileName(
        imageFile.originalname
      );


    console.log(
      "Generated Flag File Name:",
      flagFileName
    );

    console.log(
      "Generated Image File Name:",
      imageFileName
    );


    // =================================================
    // UPLOAD FLAG TO BUNNY
    // =================================================

    console.log(
      "⬆️ Uploading country flag to Bunny..."
    );


    const flagUpload =
      await uploadToBunny({

        buffer:
          flagFile.buffer,

        fileName:
          flagFileName,

        contentType:
          flagFile.mimetype,

        folder:
          "countries/flags",

      });


    console.log(
      "✅ Flag uploaded successfully"
    );

    console.log(
      "Flag Path:",
      flagUpload.path
    );


    // =================================================
    // UPLOAD COUNTRY IMAGE TO BUNNY
    // =================================================

    console.log(
      "⬆️ Uploading country image to Bunny..."
    );


    const imageUpload =
      await uploadToBunny({

        buffer:
          imageFile.buffer,

        fileName:
          imageFileName,

        contentType:
          imageFile.mimetype,

        folder:
          "countries/images",

      });


    console.log(
      "✅ Country image uploaded successfully"
    );

    console.log(
      "Image Path:",
      imageUpload.path
    );


    // =================================================
    // CREATE COUNTRY IN MONGODB
    // =================================================

    console.log(
      "💾 Creating country in MongoDB..."
    );


    const country =
      await Country.create({

        name:
          normalizedName,

        code:
          normalizedCode,

        flag:
          flagUpload.path,

        image:
          imageUpload.path,

        description:
          description || "",

        latitude:
          parsedLatitude,

        longitude:
          parsedLongitude,

        popular:
          popular === true ||
          popular === "true",

        active:
          active !== false &&
          active !== "false",

      });


    console.log(
      "========================================"
    );

    console.log(
      "✅ COUNTRY CREATED SUCCESSFULLY"
    );

    console.log(
      "Country ID:",
      country._id
    );

    console.log(
      "Country:",
      country.name
    );

    console.log(
      "Code:",
      country.code
    );

    console.log(
      "Latitude:",
      country.latitude
    );

    console.log(
      "Longitude:",
      country.longitude
    );

    console.log(
      "========================================\n"
    );


    return res.status(201).json({

      success: true,

      message:
        "Country created successfully",

      country,

    });


  } catch (error) {

    console.error(
      "\n========================================"
    );

    console.error(
      "❌ CREATE COUNTRY ERROR"
    );

    console.error(
      "========================================"
    );

    console.error(
      "Error Name:",
      error.name
    );

    console.error(
      "Error Message:",
      error.message
    );

    console.error(
      "Error Stack:",
      error.stack
    );

    console.error(
      "========================================\n"
    );


    return res.status(500).json({

      success: false,

      message:
        error.message ||
        "Server error",

    });

  }

};


// =====================================================
// UPDATE COUNTRY
// ADMIN ONLY
// OPTIONAL FLAG + IMAGE UPLOAD
// =====================================================

const updateCountry = async (req, res) => {

  console.log("\n========================================");
  console.log("UPDATE COUNTRY REQUEST");
  console.log("========================================");

  try {

    const country =
      await Country.findById(
        req.params.id
      );


    if (!country) {

      return res.status(404).json({

        success: false,

        message:
          "Country not found",

      });

    }


    const {
      name,
      code,
      description,
      latitude,
      longitude,
      popular,
      active,
    } = req.body;


    // =================================================
    // UPDATE NAME
    // =================================================

    if (
      name !== undefined
    ) {

      if (
        !name.trim()
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Country name cannot be empty",

        });

      }


      country.name =
        name.trim();

    }


    // =================================================
    // UPDATE CODE
    // =================================================

    if (
      code !== undefined
    ) {

      if (
        !code.trim()
      ) {

        return res.status(400).json({

          success: false,

          message:
            "Country code cannot be empty",

        });

      }


      const normalizedCode =
        code
          .trim()
          .toUpperCase();


      const existingCountry =
        await Country.findOne({

          code:
            normalizedCode,

          _id: {
            $ne:
              country._id,
          },

        });


      if (
        existingCountry
      ) {

        return res.status(400).json({

          success: false,

          message:
            `Country code ${normalizedCode} already exists`,

        });

      }


      country.code =
        normalizedCode;

    }


    // =================================================
    // UPDATE DESCRIPTION
    // =================================================

    if (
      description !== undefined
    ) {

      country.description =
        description;

    }


    // =================================================
    // UPDATE LATITUDE
    // =================================================

    if (
      latitude !== undefined
    ) {

      const parsedLatitude =
        parseCoordinate(
          latitude,
          "latitude"
        );


      if (
        parsedLatitude === false
      ) {

        return res.status(400).json({

          success: false,

          message:
            "latitude must be a valid number between -90 and 90",

        });

      }


      country.latitude =
        parsedLatitude;

    }


    // =================================================
    // UPDATE LONGITUDE
    // =================================================

    if (
      longitude !== undefined
    ) {

      const parsedLongitude =
        parseCoordinate(
          longitude,
          "longitude"
        );


      if (
        parsedLongitude === false
      ) {

        return res.status(400).json({

          success: false,

          message:
            "longitude must be a valid number between -180 and 180",

        });

      }


      country.longitude =
        parsedLongitude;

    }


    // =================================================
    // UPDATE POPULAR
    // =================================================

    if (
      popular !== undefined
    ) {

      if (
        popular !== true &&
        popular !== false &&
        popular !== "true" &&
        popular !== "false"
      ) {

        return res.status(400).json({

          success: false,

          message:
            "popular must be true or false",

        });

      }


      country.popular =
        popular === true ||
        popular === "true";

    }


    // =================================================
    // UPDATE ACTIVE
    // =================================================

    if (
      active !== undefined
    ) {

      if (
        active !== true &&
        active !== false &&
        active !== "true" &&
        active !== "false"
      ) {

        return res.status(400).json({

          success: false,

          message:
            "active must be true or false",

        });

      }


      country.active =
        active === true ||
        active === "true";

    }


    // =================================================
    // OPTIONAL FLAG UPDATE
    // =================================================

    const flagFile =
      req.files?.flag?.[0];


    if (flagFile) {

      console.log(
        "⬆️ Updating country flag..."
      );


      const flagFileName =
        createUniqueFileName(
          flagFile.originalname
        );


      const flagUpload =
        await uploadToBunny({

          buffer:
            flagFile.buffer,

          fileName:
            flagFileName,

          contentType:
            flagFile.mimetype,

          folder:
            "countries/flags",

        });


      country.flag =
        flagUpload.path;


      console.log(
        "✅ Country flag updated"
      );

    }


    // =================================================
    // OPTIONAL IMAGE UPDATE
    // =================================================

    const imageFile =
      req.files?.image?.[0];


    if (imageFile) {

      console.log(
        "⬆️ Updating country image..."
      );


      const imageFileName =
        createUniqueFileName(
          imageFile.originalname
        );


      const imageUpload =
        await uploadToBunny({

          buffer:
            imageFile.buffer,

          fileName:
            imageFileName,

          contentType:
            imageFile.mimetype,

          folder:
            "countries/images",

        });


      country.image =
        imageUpload.path;


      console.log(
        "✅ Country image updated"
      );

    }


    // =================================================
    // SAVE
    // =================================================

    await country.save();


    console.log(
      "✅ Country updated successfully"
    );


    return res.status(200).json({

      success: true,

      message:
        "Country updated successfully",

      country,

    });


  } catch (error) {

    console.error(
      "\n========================================"
    );

    console.error(
      "❌ UPDATE COUNTRY ERROR"
    );

    console.error(
      "========================================"
    );

    console.error(
      "Error Name:",
      error.name
    );

    console.error(
      "Error Message:",
      error.message
    );

    console.error(
      "Error Stack:",
      error.stack
    );

    console.error(
      "========================================\n"
    );


    return res.status(500).json({

      success: false,

      message:
        error.message ||
        "Server error",

    });

  }

};


// =====================================================
// DELETE / DEACTIVATE COUNTRY
// ADMIN ONLY
// =====================================================

const deleteCountry = async (req, res) => {
  try {

    const country =
      await Country.findById(
        req.params.id
      );


    if (!country) {

      return res.status(404).json({

        success: false,

        message:
          "Country not found",

      });

    }


    country.active =
      false;


    await country.save();


    return res.status(200).json({

      success: true,

      message:
        "Country deactivated successfully",

    });

  } catch (error) {

    console.error(
      "Delete Country Error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Server error",

      error:
        error.message,

    });

  }
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {

  getCountries,

  getCountryById,

  createCountry,

  updateCountry,

  deleteCountry,

};
