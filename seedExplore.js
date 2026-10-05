const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Country = require("./models/Country");
const Destination = require("./models/Destination");

dotenv.config();

/* =========================================================
   COUNTRIES
========================================================= */

const countries = [
  {
    name: "United Kingdom",
    code: "GB",
    flag: "🇬🇧",
    description: "Explore historic cities, royal landmarks and vibrant culture.",
    popular: true,
    active: true
  },
  {
    name: "France",
    code: "FR",
    flag: "🇫🇷",
    description: "Discover art, fashion, cafés and iconic European landmarks.",
    popular: true,
    active: true
  },
  {
    name: "United Arab Emirates",
    code: "AE",
    flag: "🇦🇪",
    description: "Experience futuristic cities, luxury and desert adventures.",
    popular: true,
    active: true
  },
  {
    name: "Japan",
    code: "JP",
    flag: "🇯🇵",
    description: "Discover traditional culture alongside futuristic cities.",
    popular: true,
    active: true
  },
  {
    name: "Singapore",
    code: "SG",
    flag: "🇸🇬",
    description: "A modern city-state filled with food, architecture and experiences.",
    popular: true,
    active: true
  },
  {
    name: "United States",
    code: "US",
    flag: "🇺🇸",
    description: "Explore iconic cities, entertainment and diverse landscapes.",
    popular: true,
    active: true
  },
  {
    name: "Italy",
    code: "IT",
    flag: "🇮🇹",
    description: "Experience ancient history, art, food and Mediterranean beauty.",
    popular: true,
    active: true
  },
  {
    name: "Spain",
    code: "ES",
    flag: "🇪🇸",
    description: "Explore vibrant cities, beaches, architecture and culture.",
    popular: true,
    active: true
  },
  {
    name: "Netherlands",
    code: "NL",
    flag: "🇳🇱",
    description: "Discover canals, museums, cycling culture and charming cities.",
    popular: true,
    active: true
  },
  {
    name: "Indonesia",
    code: "ID",
    flag: "🇮🇩",
    description: "Explore tropical islands, temples, beaches and local culture.",
    popular: true,
    active: true
  },
  {
    name: "Maldives",
    code: "MV",
    flag: "🇲🇻",
    description: "Escape to crystal-clear waters, islands and tropical resorts.",
    popular: true,
    active: true
  },
  {
    name: "Australia",
    code: "AU",
    flag: "🇦🇺",
    description: "Discover iconic cities, beaches and incredible landscapes.",
    popular: true,
    active: true
  },
  {
    name: "Canada",
    code: "CA",
    flag: "🇨🇦",
    description: "Experience modern cities, mountains, lakes and wilderness.",
    popular: true,
    active: true
  },
  {
    name: "Turkey",
    code: "TR",
    flag: "🇹🇷",
    description: "Experience a unique blend of European and Asian cultures.",
    popular: true,
    active: true
  },
  {
    name: "Thailand",
    code: "TH",
    flag: "🇹🇭",
    description: "Discover tropical beaches, street food and vibrant cities.",
    popular: true,
    active: true
  },
  {
    name: "South Korea",
    code: "KR",
    flag: "🇰🇷",
    description: "Explore K-culture, modern cities, food and ancient traditions.",
    popular: true,
    active: true
  },
  {
    name: "Switzerland",
    code: "CH",
    flag: "🇨🇭",
    description: "Discover alpine landscapes, lakes and beautiful mountain towns.",
    popular: true,
    active: true
  },
  {
    name: "Austria",
    code: "AT",
    flag: "🇦🇹",
    description: "Explore imperial architecture, music and Alpine scenery.",
    popular: false,
    active: true
  },
  {
    name: "New Zealand",
    code: "NZ",
    flag: "🇳🇿",
    description: "Adventure through dramatic mountains, lakes and coastlines.",
    popular: true,
    active: true
  },
  {
    name: "Greece",
    code: "GR",
    flag: "🇬🇷",
    description: "Discover islands, ancient ruins and Mediterranean landscapes.",
    popular: true,
    active: true
  },
  {
    name: "Egypt",
    code: "EG",
    flag: "🇪🇬",
    description: "Explore ancient monuments, the Nile and fascinating history.",
    popular: true,
    active: true
  },
  {
    name: "Portugal",
    code: "PT",
    flag: "🇵🇹",
    description: "Discover colorful cities, coastlines and Portuguese culture.",
    popular: false,
    active: true
  }
];


/* =========================================================
   DESTINATIONS
   Direct image CDN URLs only.
========================================================= */

const destinations = [
  {
    name: "London",
    city: "London",
    countryCode: "GB",
    category: "city",
    shortDescription: "Iconic landmarks, royal history and modern city life.",
    description:
      "Discover Big Ben, Tower Bridge, Buckingham Palace and London's vibrant neighborhoods.",
    image:
      "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1400&q=85",
    popular: true,
    active: true
  },

  {
    name: "Paris",
    city: "Paris",
    countryCode: "FR",
    category: "cultural",
    shortDescription: "Art, fashion, cafés and unforgettable landmarks.",
    description:
      "Experience the Eiffel Tower, Louvre, charming streets and classic French culture.",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1400&q=85",
    popular: true,
    active: true
  },

  {
    name: "Dubai",
    city: "Dubai",
    countryCode: "AE",
    category: "city",
    shortDescription: "Luxury, futuristic architecture and desert adventures.",
    description:
      "Experience Burj Khalifa, Palm Jumeirah, Dubai Marina and desert adventures.",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=85",
    popular: true,
    active: true
  },

  {
    name: "Tokyo",
    city: "Tokyo",
    countryCode: "JP",
    category: "city",
    shortDescription: "A fascinating mix of technology and tradition.",
    description:
      "Explore Shibuya, temples, Japanese food and Tokyo's energetic neighborhoods.",
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1400&q=85",
    popular: true,
    active: true
  },

  {
    name: "Singapore",
    city: "Singapore",
    countryCode: "SG",
    category: "city",
    shortDescription: "Modern architecture, food and unforgettable experiences.",
    description:
      "Explore Marina Bay, Gardens by the Bay and Singapore's famous food scene.",
    image:
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1400&q=85",
    popular: true,
    active: true
  },

  {
    name: "New York",
    city: "New York",
    countryCode: "US",
    category: "city",
    shortDescription: "The city that never sleeps.",
    description:
      "Discover Manhattan, Central Park, Times Square, Brooklyn and the Statue of Liberty.",
    image:
      "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?auto=format&fit=crop&w=1400&q=85",
    popular: true,
    active: true
  },

  {
    name: "Rome",
    city: "Rome",
    countryCode: "IT",
    category: "historical",
    shortDescription: "Ancient history, art and incredible Italian food.",
    description:
      "Explore the Colosseum, Vatican City, Trevi Fountain and historic Roman streets.",
    image:
      "https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=1400&q=85",
    popular: true,
    active: true
  },

  {
    name: "Barcelona",
    city: "Barcelona",
    countryCode: "ES",
    category: "cultural",
    shortDescription: "Gaudí architecture, beaches and Mediterranean energy.",
    description:
      "Explore Sagrada Família, Park Güell, Gothic streets and Barcelona's beaches.",
    image:
      "https://images.unsplash.com/photo-1539035104074-dee8f7d1305a?auto=format&fit=crop&w=1400&q=85",
    popular: true,
    active: true
  },

  {
    name: "Amsterdam",
    city: "Amsterdam",
    countryCode: "NL",
    category: "city",
    shortDescription: "Beautiful canals, museums and European charm.",
    description:
      "Explore Amsterdam's canals, museums, historic neighborhoods and cycling culture.",
    image:
      "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&w=1400&q=85",
    popular: true,
    active: true
  },

  {
    name: "Bali",
    city: "Bali",
    countryCode: "ID",
    category: "beach",
    shortDescription: "Tropical landscapes, temples and island adventures.",
    description:
      "Discover Bali's temples, rice terraces, beaches and tropical landscapes.",
    image:
      "https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?auto=format&fit=crop&w=1400&q=85",
    popular: true,
    active: true
  },

  {
    name: "Maldives",
    city: "Malé",
    countryCode: "MV",
    category: "beach",
    shortDescription: "Crystal-clear water and tropical island escapes.",
    description:
      "Relax on beautiful islands surrounded by turquoise waters and coral reefs.",
    image:
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1400&q=85",
    popular: true,
    active: true
  },

  {
    name: "Sydney",
    city: "Sydney",
    countryCode: "AU",
    category: "city",
    shortDescription: "Harbour views, beaches and iconic architecture.",
    description:
      "Experience the Sydney Opera House, Harbour Bridge, Bondi Beach and more.",
    image:
      "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1400&q=85",
    popular: true,
    active: true
  },

  {
    name: "Toronto",
    city: "Toronto",
    countryCode: "CA",
    category: "city",
    shortDescription: "Modern skyline, culture and waterfront experiences.",
    description:
      "Explore Toronto's downtown skyline, CN Tower and Lake Ontario waterfront.",
    image:
      "https://images.unsplash.com/photo-1517935706615-2717063c2225?auto=format&fit=crop&w=1400&q=85",
    popular: true,
    active: true
  },

  {
    name: "Istanbul",
    city: "Istanbul",
    countryCode: "TR",
    category: "historical",
    shortDescription: "Where Europe meets Asia.",
    description:
      "Discover Hagia Sophia, Blue Mosque, Bosphorus and Istanbul's historic streets.",
    image:
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1400&q=85",
    popular: true,
    active: true
  },

  {
    name: "Bangkok",
    city: "Bangkok",
    countryCode: "TH",
    category: "city",
    shortDescription: "Street food, temples and vibrant city life.",
    description:
      "Explore Bangkok's temples, markets, food streets and modern skyline.",
    image:
      "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1400&q=85",
    popular: true,
    active: true
  },

  {
    name: "Seoul",
    city: "Seoul",
    countryCode: "KR",
    category: "city",
    shortDescription: "K-culture, technology and centuries-old traditions.",
    description:
      "Explore Seoul's palaces, markets, neighborhoods and modern culture.",
    image:
      "https://images.unsplash.com/photo-1538485399081-7c897d9b7a5a?auto=format&fit=crop&w=1400&q=85",
    popular: true,
    active: true
  },

  {
    name: "Swiss Alps",
    city: "Interlaken",
    countryCode: "CH",
    category: "mountain",
    shortDescription: "Snowy peaks, alpine villages and beautiful lakes.",
    description:
      "Experience the Swiss Alps, mountain railways and spectacular landscapes.",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1400&q=85",
    popular: true,
    active: true
  },

  {
    name: "Vienna",
    city: "Vienna",
    countryCode: "AT",
    category: "cultural",
    shortDescription: "Imperial architecture, music and elegant cafés.",
    description:
      "Discover Vienna's palaces, museums, classical music and cafés.",
    image:
      "https://images.unsplash.com/photo-1516550893923-42d28e5677af?auto=format&fit=crop&w=1400&q=85",
    popular: false,
    active: true
  },

  {
    name: "Queenstown",
    city: "Queenstown",
    countryCode: "NZ",
    category: "adventure",
    shortDescription: "Mountains, lakes and world-class adventure.",
    description:
      "Explore Queenstown's mountains, lakes and outdoor adventures.",
    image:
      "https://images.unsplash.com/photo-1469521669194-babb45599def?auto=format&fit=crop&w=1400&q=85",
    popular: true,
    active: true
  },

  {
    name: "Santorini",
    city: "Santorini",
    countryCode: "GR",
    category: "beach",
    shortDescription: "Whitewashed villages overlooking the Aegean Sea.",
    description:
      "Enjoy Santorini's famous sunsets, coastal villages and volcanic landscapes.",
    image:
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac1ad?auto=format&fit=crop&w=1400&q=85",
    popular: true,
    active: true
  },

  {
    name: "Cairo",
    city: "Cairo",
    countryCode: "EG",
    category: "historical",
    shortDescription: "Ancient wonders and thousands of years of history.",
    description:
      "Discover the pyramids, museums, Nile River and ancient Egyptian history.",
    image:
      "https://images.unsplash.com/photo-1568322445389-f64ac2515020?auto=format&fit=crop&w=1400&q=85",
    popular: true,
    active: true
  },

  {
    name: "Lisbon",
    city: "Lisbon",
    countryCode: "PT",
    category: "city",
    shortDescription: "Colorful streets, viewpoints and Atlantic charm.",
    description:
      "Explore Lisbon's historic neighborhoods, trams, viewpoints and food.",
    image:
      "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1400&q=85",
    popular: false,
    active: true
  }
];


/* =========================================================
   SEED DATABASE
========================================================= */

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("");
    console.log("======================================");
    console.log("ATLYS EXPLORE SEED");
    console.log("======================================");
    console.log("MongoDB connected");


    /* -----------------------------------------
       COUNTRIES
    ----------------------------------------- */

    const countryMap = {};

    for (const country of countries) {
      const savedCountry = await Country.findOneAndUpdate(
        {
          code: country.code
        },
        country,
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true
        }
      );

      countryMap[country.code] = savedCountry._id;
    }

    console.log(
      `Countries ready: ${countries.length}`
    );


    /* -----------------------------------------
       DESTINATIONS
    ----------------------------------------- */

    for (const destination of destinations) {
      const countryId =
        countryMap[destination.countryCode];

      if (!countryId) {
        console.log(
          `Skipping ${destination.name}: country not found`
        );
        continue;
      }

      await Destination.findOneAndUpdate(
        {
          name: destination.name,
          country: countryId
        },
        {
          name: destination.name,
          city: destination.city,
          country: countryId,
          image: destination.image,
          shortDescription: destination.shortDescription,
          description: destination.description,
          category: destination.category,
          popular: destination.popular,
          active: destination.active
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true
        }
      );

      console.log(
        `✓ ${destination.name}`
      );
    }


    console.log("");
    console.log(
      `Destinations ready: ${destinations.length}`
    );

    console.log("");
    console.log(
      "✓ ATLYS Explore data seeded successfully"
    );

    console.log("======================================");
    console.log("");


    await mongoose.disconnect();

    process.exit(0);

  } catch (error) {

    console.error("");
    console.error("❌ SEED ERROR");
    console.error(error.message);
    console.error("");

    try {
      await mongoose.disconnect();
    } catch (disconnectError) {}

    process.exit(1);
  }
};

seedData();