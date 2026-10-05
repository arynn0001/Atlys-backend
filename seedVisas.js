require("dotenv").config();

const mongoose = require("mongoose");

const connectDB = require("./config/db");
const Country = require("./models/Country");
const Visa = require("./models/Visa");

const visaData = [
  // ==========================================
  // UNITED KINGDOM
  // ==========================================

  {
    countryCode: "GB",
    name: "UK Standard Visitor Visa",
    category: "tourist",
    visaType: "Standard Visitor Visa",

    shortDescription:
      "Short-term visa for tourism and visiting the UK.",

    description:
      "Sample ATLYS visa listing for visitors travelling to the United Kingdom.",

    processingTime: "15-30 working days",
    stayDuration: "Up to 6 months",
    validity: "Up to 6 months",

    entryType: "multiple",

    governmentFee: 15000,
    serviceFee: 999,

    currency: "INR",

    eligibility: [
      "Valid passport",
      "Proof of funds",
      "Travel itinerary",
      "Accommodation details",
      "Proof of ties to home country"
    ],

    documentsRequired: [
      {
        name: "Passport",
        required: true
      },
      {
        name: "Bank Statement",
        required: true
      },
      {
        name: "Travel Itinerary",
        required: true
      },
      {
        name: "Accommodation Proof",
        required: true
      },
      {
        name: "Photograph",
        required: true
      }
    ],

    popular: true
  },

  {
    countryCode: "GB",
    name: "UK Student Visa",
    category: "student",
    visaType: "Student Visa",

    shortDescription:
      "Visa for eligible students studying in the UK.",

    description:
      "Sample ATLYS visa listing for students planning to study in the United Kingdom.",

    processingTime: "15-30 working days",
    stayDuration: "Course duration",
    validity: "Course duration",

    entryType: "multiple",

    governmentFee: 45000,
    serviceFee: 1499,

    currency: "INR",

    eligibility: [
      "Valid passport",
      "CAS from educational institution",
      "Proof of funds",
      "Academic documents"
    ],

    documentsRequired: [
      {
        name: "Passport",
        required: true
      },
      {
        name: "CAS Letter",
        required: true
      },
      {
        name: "Bank Statement",
        required: true
      },
      {
        name: "Academic Documents",
        required: true
      }
    ],

    popular: true
  },

  // ==========================================
  // UNITED STATES
  // ==========================================

  {
    countryCode: "US",
    name: "US B1/B2 Visitor Visa",
    category: "tourist",
    visaType: "B1/B2 Visitor Visa",

    shortDescription:
      "Visitor visa for tourism and eligible business travel.",

    description:
      "Sample ATLYS visa listing for visitors travelling to the United States.",

    processingTime:
      "Varies by appointment availability",

    stayDuration:
      "As permitted by CBP",

    validity:
      "Subject to visa issuance",

    entryType: "multiple",

    governmentFee: 20000,
    serviceFee: 1499,

    currency: "INR",

    eligibility: [
      "Valid passport",
      "DS-160 confirmation",
      "Proof of financial capacity",
      "Interview appointment"
    ],

    documentsRequired: [
      {
        name: "Passport",
        required: true
      },
      {
        name: "DS-160 Confirmation",
        required: true
      },
      {
        name: "Bank Statement",
        required: true
      },
      {
        name: "Photograph",
        required: true
      }
    ],

    popular: true
  },

  {
    countryCode: "US",
    name: "US F-1 Student Visa",
    category: "student",
    visaType: "F-1 Student Visa",

    shortDescription:
      "Student visa for eligible academic programs.",

    description:
      "Sample ATLYS visa listing for students travelling to the United States.",

    processingTime:
      "Varies by appointment availability",

    stayDuration: "Program dependent",
    validity: "Subject to visa issuance",

    entryType: "multiple",

    governmentFee: 30000,
    serviceFee: 1499,

    currency: "INR",

    eligibility: [
      "Valid passport",
      "I-20",
      "SEVIS payment",
      "DS-160 confirmation",
      "Financial documents"
    ],

    documentsRequired: [
      {
        name: "Passport",
        required: true
      },
      {
        name: "I-20",
        required: true
      },
      {
        name: "SEVIS Receipt",
        required: true
      },
      {
        name: "DS-160 Confirmation",
        required: true
      },
      {
        name: "Financial Documents",
        required: true
      }
    ],

    popular: true
  },

  // ==========================================
  // CANADA
  // ==========================================

  {
    countryCode: "CA",
    name: "Canada Visitor Visa",
    category: "tourist",
    visaType: "Visitor Visa",

    shortDescription:
      "Temporary resident visa for eligible visitors.",

    description:
      "Sample ATLYS visa listing for visitors travelling to Canada.",

    processingTime: "Varies",
    stayDuration: "As authorized",
    validity: "Subject to visa issuance",

    entryType: "multiple",

    governmentFee: 9000,
    serviceFee: 999,

    currency: "INR",

    eligibility: [
      "Valid passport",
      "Proof of funds",
      "Travel history",
      "Purpose of travel"
    ],

    documentsRequired: [
      {
        name: "Passport",
        required: true
      },
      {
        name: "Bank Statement",
        required: true
      },
      {
        name: "Travel Itinerary",
        required: true
      },
      {
        name: "Photograph",
        required: true
      }
    ],

    popular: true
  },

  {
    countryCode: "CA",
    name: "Canada Study Permit",
    category: "student",
    visaType: "Study Permit",

    shortDescription:
      "Permit for eligible students studying in Canada.",

    description:
      "Sample ATLYS visa listing for students planning to study in Canada.",

    processingTime: "Varies",
    stayDuration: "Program dependent",
    validity: "Program dependent",

    entryType: "multiple",

    governmentFee: 15000,
    serviceFee: 1499,

    currency: "INR",

    eligibility: [
      "Valid passport",
      "Letter of acceptance",
      "Proof of funds",
      "Academic documents"
    ],

    documentsRequired: [
      {
        name: "Passport",
        required: true
      },
      {
        name: "Letter of Acceptance",
        required: true
      },
      {
        name: "Proof of Funds",
        required: true
      },
      {
        name: "Academic Documents",
        required: true
      }
    ],

    popular: false
  },

  // ==========================================
  // AUSTRALIA
  // ==========================================

  {
    countryCode: "AU",
    name: "Australia Visitor Visa",
    category: "tourist",
    visaType: "Visitor Visa",

    shortDescription:
      "Visitor visa for eligible tourism and visit purposes.",

    description:
      "Sample ATLYS visa listing for visitors travelling to Australia.",

    processingTime: "Varies",
    stayDuration: "As granted",
    validity: "As granted",

    entryType: "multiple",

    governmentFee: 12000,
    serviceFee: 999,

    currency: "INR",

    eligibility: [
      "Valid passport",
      "Financial evidence",
      "Travel purpose",
      "Health and character requirements where applicable"
    ],

    documentsRequired: [
      {
        name: "Passport",
        required: true
      },
      {
        name: "Bank Statement",
        required: true
      },
      {
        name: "Travel Itinerary",
        required: true
      },
      {
        name: "Photograph",
        required: true
      }
    ],

    popular: true
  },

  // ==========================================
  // UAE
  // ==========================================

  {
    countryCode: "AE",
    name: "UAE Tourist Visa",
    category: "tourist",
    visaType: "Tourist Visa",

    shortDescription:
      "Tourist visa option for eligible visitors to the UAE.",

    description:
      "Sample ATLYS visa listing for travellers visiting the United Arab Emirates.",

    processingTime: "3-7 working days",
    stayDuration: "As granted",
    validity: "As granted",

    entryType: "single",

    governmentFee: 7500,
    serviceFee: 799,

    currency: "INR",

    eligibility: [
      "Valid passport",
      "Passport photograph",
      "Travel details",
      "Accommodation details"
    ],

    documentsRequired: [
      {
        name: "Passport",
        required: true
      },
      {
        name: "Passport Photograph",
        required: true
      },
      {
        name: "Flight Details",
        required: true
      },
      {
        name: "Accommodation Proof",
        required: false
      }
    ],

    popular: true
  },

  // ==========================================
  // SINGAPORE
  // ==========================================

  {
    countryCode: "SG",
    name: "Singapore Tourist Visa",
    category: "tourist",
    visaType: "Tourist Visa",

    shortDescription:
      "Short-term visitor visa for eligible travellers.",

    description:
      "Sample ATLYS visa listing for travellers visiting Singapore.",

    processingTime: "3-7 working days",
    stayDuration: "As granted",
    validity: "As granted",

    entryType: "multiple",

    governmentFee: 3000,
    serviceFee: 499,

    currency: "INR",

    eligibility: [
      "Valid passport",
      "Recent photograph",
      "Travel itinerary",
      "Accommodation details"
    ],

    documentsRequired: [
      {
        name: "Passport",
        required: true
      },
      {
        name: "Photograph",
        required: true
      },
      {
        name: "Travel Itinerary",
        required: true
      },
      {
        name: "Accommodation Proof",
        required: false
      }
    ],

    popular: true
  },

  // ==========================================
  // FRANCE
  // ==========================================

  {
    countryCode: "FR",
    name: "France Schengen Tourist Visa",
    category: "tourist",
    visaType: "Schengen Visa",

    shortDescription:
      "Short-stay Schengen visa for eligible tourism travel.",

    description:
      "Sample ATLYS visa listing for travellers visiting France and the Schengen area.",

    processingTime: "Varies",
    stayDuration:
      "Up to applicable Schengen short-stay limit",

    validity: "As granted",

    entryType: "single-multiple",

    governmentFee: 9000,
    serviceFee: 999,

    currency: "INR",

    eligibility: [
      "Valid passport",
      "Travel insurance",
      "Proof of accommodation",
      "Financial documents",
      "Travel itinerary"
    ],

    documentsRequired: [
      {
        name: "Passport",
        required: true
      },
      {
        name: "Travel Insurance",
        required: true
      },
      {
        name: "Bank Statement",
        required: true
      },
      {
        name: "Accommodation Proof",
        required: true
      },
      {
        name: "Travel Itinerary",
        required: true
      }
    ],

    popular: true
  },

  // ==========================================
  // GERMANY
  // ==========================================

  {
    countryCode: "DE",
    name: "Germany Schengen Tourist Visa",
    category: "tourist",
    visaType: "Schengen Visa",

    shortDescription:
      "Short-stay Schengen visa for eligible visitors.",

    description:
      "Sample ATLYS visa listing for travellers visiting Germany and the Schengen area.",

    processingTime: "Varies",
    stayDuration:
      "Up to applicable Schengen short-stay limit",

    validity: "As granted",

    entryType: "single-multiple",

    governmentFee: 9000,
    serviceFee: 999,

    currency: "INR",

    eligibility: [
      "Valid passport",
      "Travel insurance",
      "Proof of accommodation",
      "Financial documents"
    ],

    documentsRequired: [
      {
        name: "Passport",
        required: true
      },
      {
        name: "Travel Insurance",
        required: true
      },
      {
        name: "Bank Statement",
        required: true
      },
      {
        name: "Accommodation Proof",
        required: true
      }
    ],

    popular: false
  },

  // ==========================================
  // JAPAN
  // ==========================================

  {
    countryCode: "JP",
    name: "Japan Tourist Visa",
    category: "tourist",
    visaType: "Tourist Visa",

    shortDescription:
      "Tourist visa for eligible travellers visiting Japan.",

    description:
      "Sample ATLYS visa listing for tourism travel to Japan.",

    processingTime: "Varies",
    stayDuration: "As granted",
    validity: "As granted",

    entryType: "single",

    governmentFee: 3000,
    serviceFee: 699,

    currency: "INR",

    eligibility: [
      "Valid passport",
      "Travel itinerary",
      "Financial documents",
      "Accommodation details"
    ],

    documentsRequired: [
      {
        name: "Passport",
        required: true
      },
      {
        name: "Travel Itinerary",
        required: true
      },
      {
        name: "Bank Statement",
        required: true
      },
      {
        name: "Accommodation Proof",
        required: true
      }
    ],

    popular: true
  },

  // ==========================================
  // THAILAND
  // ==========================================

  {
    countryCode: "TH",
    name: "Thailand Tourist Visa",
    category: "tourist",
    visaType: "Tourist Visa",

    shortDescription:
      "Tourist visa option for eligible visitors to Thailand.",

    description:
      "Sample ATLYS visa listing for travellers visiting Thailand.",

    processingTime: "Varies",
    stayDuration: "As granted",
    validity: "As granted",

    entryType: "single",

    governmentFee: 3000,
    serviceFee: 499,

    currency: "INR",

    eligibility: [
      "Valid passport",
      "Travel itinerary",
      "Accommodation details",
      "Financial evidence"
    ],

    documentsRequired: [
      {
        name: "Passport",
        required: true
      },
      {
        name: "Travel Itinerary",
        required: true
      },
      {
        name: "Accommodation Proof",
        required: true
      },
      {
        name: "Bank Statement",
        required: false
      }
    ],

    popular: true
  }
];

// ==========================================
// SEED VISAS
// ==========================================

const seedVisas = async () => {
  try {
    await connectDB();

    console.log("=================================");
    console.log("Seeding ATLYS visas...");
    console.log("=================================");

    for (const item of visaData) {
      // Find country
      const country = await Country.findOne({
        code: item.countryCode
      });

      if (!country) {
        console.log(
          `Country not found: ${item.countryCode}`
        );

        continue;
      }

      // Calculate total fee
      const totalFee =
        (item.governmentFee || 0) +
        (item.serviceFee || 0);

      const visa = {
        country: country._id,

        name: item.name,

        category: item.category,

        visaType: item.visaType,

        entryType: item.entryType,

        validity: item.validity,

        stayDuration: item.stayDuration,

        processingTime: item.processingTime,

        governmentFee: item.governmentFee || 0,

        serviceFee: item.serviceFee || 0,

        totalFee,

        currency: item.currency || "INR",

        eligibility: item.eligibility || [],

        documentsRequired:
          item.documentsRequired || [],

        description: item.description || "",

        shortDescription:
          item.shortDescription || "",

        popular: item.popular || false,

        active: true
      };

      // Update existing visa or create new one
      await Visa.findOneAndUpdate(
        {
          country: country._id,
          name: item.name
        },
        visa,
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      );

      console.log(
        `Visa seeded: ${item.name} | Total: ${totalFee} ${item.currency}`
      );
    }

    console.log("=================================");
    console.log("Visa seeding completed");
    console.log("=================================");

    process.exit(0);
  } catch (error) {
    console.error("Visa Seed Error:", error);
    process.exit(1);
  }
};

seedVisas();