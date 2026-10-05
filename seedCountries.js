require("dotenv").config();

const mongoose = require("mongoose");
const Country = require("./models/Country");

const countries = [
  {
    name: "United Kingdom",
    code: "GB",
    flag: "🇬🇧",
    image: "",
    description:
      "Explore visa options for travelling to the United Kingdom.",
    popular: true,
    active: true
  },
  {
    name: "United States",
    code: "US",
    flag: "🇺🇸",
    image: "",
    description:
      "Explore visa options for travelling to the United States.",
    popular: true,
    active: true
  },
  {
    name: "Canada",
    code: "CA",
    flag: "🇨🇦",
    image: "",
    description:
      "Explore visa options for travelling to Canada.",
    popular: true,
    active: true
  },
  {
    name: "Australia",
    code: "AU",
    flag: "🇦🇺",
    image: "",
    description:
      "Explore visa options for travelling to Australia.",
    popular: true,
    active: true
  },
  {
    name: "United Arab Emirates",
    code: "AE",
    flag: "🇦🇪",
    image: "",
    description:
      "Explore visa options for travelling to the United Arab Emirates.",
    popular: true,
    active: true
  },
  {
    name: "Singapore",
    code: "SG",
    flag: "🇸🇬",
    image: "",
    description:
      "Explore visa options for travelling to Singapore.",
    popular: true,
    active: true
  },
  {
    name: "France",
    code: "FR",
    flag: "🇫🇷",
    image: "",
    description:
      "Explore visa options for travelling to France.",
    popular: false,
    active: true
  },
  {
    name: "Germany",
    code: "DE",
    flag: "🇩🇪",
    image: "",
    description:
      "Explore visa options for travelling to Germany.",
    popular: false,
    active: true
  },
  {
    name: "Japan",
    code: "JP",
    flag: "🇯🇵",
    image: "",
    description:
      "Explore visa options for travelling to Japan.",
    popular: false,
    active: true
  },
  {
    name: "Thailand",
    code: "TH",
    flag: "🇹🇭",
    image: "",
    description:
      "Explore visa options for travelling to Thailand.",
    popular: false,
    active: true
  }
];

const seedCountries = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");

    for (const country of countries) {
      await Country.findOneAndUpdate(
        { code: country.code },
        country,
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      );
    }

    console.log("Countries seeded successfully");
    console.log(`Total countries: ${countries.length}`);

    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.error("Seed Countries Error:", error);

    await mongoose.connection.close();

    process.exit(1);
  }
};

seedCountries();