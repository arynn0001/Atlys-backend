require("dotenv").config();

const mongoose = require("mongoose");

const Country = require("./models/Country");
const Destination = require("./models/Destination");
const Event = require("./models/Event");

const events = [
  // =========================
  // MUSIC
  // =========================

  {
    title: "Live Music Festival",
    destination: "London",
    countryCode: "GB",
    category: "music",
    shortDescription:
      "A weekend of live music featuring artists from around the world.",
    description:
      "Enjoy live performances, food stalls and an energetic festival atmosphere in London.",
    venue: "Hyde Park",
    address: "Hyde Park, London",
    eventDate: "2026-10-10T18:00:00",
    endDate: "2026-10-10T23:00:00",
    price: 75,
    currency: "GBP",
    organizer: "ATLYS Events",
    rating: 4.8,
    featured: true,
    popular: true
  },

  {
    title: "Paris Jazz Evening",
    destination: "Paris",
    countryCode: "FR",
    category: "music",
    shortDescription:
      "An intimate evening of live jazz in the heart of Paris.",
    description:
      "Spend an evening enjoying live jazz performances in a stylish Parisian venue.",
    venue: "Le Trianon",
    address: "80 Boulevard de Rochechouart, Paris",
    eventDate: "2026-10-17T19:30:00",
    endDate: "2026-10-17T23:00:00",
    price: 60,
    currency: "EUR",
    organizer: "Paris Live",
    rating: 4.7,
    featured: true,
    popular: true
  },

  // =========================
  // SPORTS
  // =========================

  {
    title: "London Football Experience",
    destination: "London",
    countryCode: "GB",
    category: "sports",
    shortDescription:
      "Experience the atmosphere of live football in London.",
    description:
      "Enjoy a premium football experience including stadium access and match-day atmosphere.",
    venue: "Emirates Stadium",
    address: "Hornsey Road, London",
    eventDate: "2026-11-01T15:00:00",
    endDate: "2026-11-01T18:00:00",
    price: 120,
    currency: "GBP",
    organizer: "ATLYS Sports",
    rating: 4.9,
    featured: true,
    popular: true
  },

  {
    title: "Dubai International Tennis Event",
    destination: "Dubai",
    countryCode: "AE",
    category: "sports",
    shortDescription:
      "Watch professional tennis in a world-class sporting venue.",
    description:
      "Enjoy an exciting day of professional tennis and premium sporting entertainment.",
    venue: "Dubai Tennis Stadium",
    address: "Al Garhoud, Dubai",
    eventDate: "2026-11-15T16:00:00",
    endDate: "2026-11-15T21:00:00",
    price: 250,
    currency: "AED",
    organizer: "Dubai Sports",
    rating: 4.8,
    featured: true,
    popular: true
  },

  // =========================
  // ART
  // =========================

  {
    title: "Modern Art Exhibition",
    destination: "Paris",
    countryCode: "FR",
    category: "art",
    shortDescription:
      "Explore contemporary works from emerging artists.",
    description:
      "Discover paintings, installations and contemporary artwork from international artists.",
    venue: "Grand Palais",
    address: "Avenue Winston Churchill, Paris",
    eventDate: "2026-10-25T10:00:00",
    endDate: "2026-10-25T20:00:00",
    price: 25,
    currency: "EUR",
    organizer: "Paris Art Collective",
    rating: 4.8,
    featured: true,
    popular: true
  },

  {
    title: "Tokyo Digital Art Night",
    destination: "Tokyo",
    countryCode: "JP",
    category: "art",
    shortDescription:
      "A futuristic digital art experience in Tokyo.",
    description:
      "Experience immersive digital installations combining technology, light and sound.",
    venue: "Mori Art Center",
    address: "Roppongi, Tokyo",
    eventDate: "2026-11-08T17:00:00",
    endDate: "2026-11-08T22:00:00",
    price: 3500,
    currency: "JPY",
    organizer: "Tokyo Digital Arts",
    rating: 4.9,
    featured: true,
    popular: true
  },

  // =========================
  // CULTURE
  // =========================

  {
    title: "Japanese Culture Festival",
    destination: "Tokyo",
    countryCode: "JP",
    category: "culture",
    shortDescription:
      "Discover traditional Japanese culture, food and performances.",
    description:
      "Experience traditional performances, crafts, food and cultural activities.",
    venue: "Yoyogi Park",
    address: "Shibuya, Tokyo",
    eventDate: "2026-10-31T11:00:00",
    endDate: "2026-10-31T20:00:00",
    price: 1500,
    currency: "JPY",
    organizer: "Tokyo Culture Society",
    rating: 4.8,
    featured: true,
    popular: true
  },

  {
    title: "Dubai Heritage Evening",
    destination: "Dubai",
    countryCode: "AE",
    category: "culture",
    shortDescription:
      "Discover Emirati traditions, music and local cuisine.",
    description:
      "Enjoy an evening celebrating Emirati heritage through performances, food and traditional activities.",
    venue: "Al Fahidi Historical District",
    address: "Al Fahidi, Dubai",
    eventDate: "2026-11-20T17:00:00",
    endDate: "2026-11-20T22:00:00",
    price: 80,
    currency: "AED",
    organizer: "Dubai Heritage",
    rating: 4.7,
    featured: false,
    popular: true
  },

  // =========================
  // FOOD & DRINK
  // =========================

  {
    title: "London Street Food Festival",
    destination: "London",
    countryCode: "GB",
    category: "food-drink",
    shortDescription:
      "Taste dishes from local chefs and international food makers.",
    description:
      "Spend a day discovering street food, desserts, drinks and live cooking experiences.",
    venue: "Borough Market",
    address: "8 Southwark Street, London",
    eventDate: "2026-10-18T12:00:00",
    endDate: "2026-10-18T21:00:00",
    price: 20,
    currency: "GBP",
    organizer: "London Food Collective",
    rating: 4.8,
    featured: true,
    popular: true
  },

  {
    title: "Singapore Food & Night Market",
    destination: "Singapore",
    countryCode: "SG",
    category: "food-drink",
    shortDescription:
      "An evening filled with Singaporean flavours and local favourites.",
    description:
      "Explore food stalls, desserts, drinks and live entertainment at a vibrant night market.",
    venue: "Marina Bay",
    address: "Marina Bay, Singapore",
    eventDate: "2026-11-07T17:00:00",
    endDate: "2026-11-07T23:00:00",
    price: 15,
    currency: "SGD",
    organizer: "Singapore Food Events",
    rating: 4.9,
    featured: true,
    popular: true
  },

  // =========================
  // FESTIVALS
  // =========================

  {
    title: "London Autumn Festival",
    destination: "London",
    countryCode: "GB",
    category: "festivals",
    shortDescription:
      "Celebrate autumn with music, food, art and entertainment.",
    description:
      "A colourful city festival featuring performances, food, markets and family activities.",
    venue: "Southbank Centre",
    address: "Belvedere Road, London",
    eventDate: "2026-10-24T12:00:00",
    endDate: "2026-10-24T22:00:00",
    price: 30,
    currency: "GBP",
    organizer: "London Festival Group",
    rating: 4.6,
    featured: false,
    popular: true
  },

  {
    title: "Singapore Lights Festival",
    destination: "Singapore",
    countryCode: "SG",
    category: "festivals",
    shortDescription:
      "A spectacular festival of lights across Singapore.",
    description:
      "Explore illuminated installations, performances and interactive light experiences around the city.",
    venue: "Marina Bay",
    address: "Marina Bay, Singapore",
    eventDate: "2026-12-05T18:00:00",
    endDate: "2026-12-05T23:00:00",
    price: 25,
    currency: "SGD",
    organizer: "Singapore Lights",
    rating: 4.9,
    featured: true,
    popular: true
  },

  // =========================
  // ENTERTAINMENT
  // =========================

  {
    title: "Dubai Comedy Night",
    destination: "Dubai",
    countryCode: "AE",
    category: "entertainment",
    shortDescription:
      "An evening of stand-up comedy and live entertainment.",
    description:
      "Enjoy performances from popular comedians in a relaxed entertainment venue.",
    venue: "Dubai Opera",
    address: "Downtown Dubai",
    eventDate: "2026-10-30T20:00:00",
    endDate: "2026-10-30T23:00:00",
    price: 180,
    currency: "AED",
    organizer: "Dubai Entertainment",
    rating: 4.7,
    featured: true,
    popular: true
  },

  {
    title: "Tokyo Entertainment Night",
    destination: "Tokyo",
    countryCode: "JP",
    category: "entertainment",
    shortDescription:
      "A night of performances, music and modern entertainment.",
    description:
      "Enjoy a combination of live performances, music and immersive entertainment in Tokyo.",
    venue: "Tokyo Dome City",
    address: "Bunkyo, Tokyo",
    eventDate: "2026-11-21T18:00:00",
    endDate: "2026-11-21T23:00:00",
    price: 6000,
    currency: "JPY",
    organizer: "Tokyo Entertainment",
    rating: 4.8,
    featured: true,
    popular: true
  }
];

const seedEvents = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");

    // =========================
    // GET DESTINATIONS
    // =========================

    const destinations = await Destination.find({
      name: {
        $in: [
          "London",
          "Paris",
          "Dubai",
          "Singapore",
          "Tokyo"
        ]
      }
    });

    const destinationMap = {};

    destinations.forEach((destination) => {
      destinationMap[destination.name] =
        destination._id;
    });

    // =========================
    // GET COUNTRIES
    // =========================

    const countries = await Country.find({
      code: {
        $in: [
          "GB",
          "FR",
          "AE",
          "SG",
          "JP"
        ]
      }
    });

    const countryMap = {};

    countries.forEach((country) => {
      countryMap[country.code] =
        country._id;
    });

    // =========================
    // INSERT / UPDATE EVENTS
    // =========================

    for (const data of events) {
      const destinationId =
        destinationMap[data.destination];

      const countryId =
        countryMap[data.countryCode];

      if (!destinationId || !countryId) {
        console.log(
          `Skipping event: ${data.title}`
        );
        continue;
      }

      await Event.findOneAndUpdate(
        {
          title: data.title,
          destination: destinationId
        },
        {
          title: data.title,
          country: countryId,
          destination: destinationId,
          category: data.category,
          image: "",
          shortDescription:
            data.shortDescription,
          description: data.description,
          venue: data.venue,
          address: data.address,
          eventDate: data.eventDate,
          endDate: data.endDate,
          price: data.price,
          currency: data.currency,
          ticketUrl: "",
          organizer: data.organizer,
          rating: data.rating,
          featured: data.featured,
          popular: data.popular,
          active: true
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      );

      console.log(
        `Event ready: ${data.title}`
      );
    }

    console.log("");
    console.log("================================");
    console.log("EVENT DATA SEEDED SUCCESSFULLY");
    console.log("================================");
    console.log(`Total events: ${events.length}`);

    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.error("Seed Events Error:", error);

    await mongoose.connection.close();

    process.exit(1);
  }
};

seedEvents();