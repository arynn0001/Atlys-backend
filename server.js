const path = require("path");

const dotenvResult = require("dotenv").config({
  path: path.resolve(__dirname, ".env"),
  override: true
});

if (dotenvResult.error) {
  console.error(
    "ENV LOAD ERROR:",
    dotenvResult.error.message
  );
}

console.log(
  "ENV FILE:",
  path.resolve(__dirname, ".env")
);

console.log(
  "BUNNY ZONE TEST:",
  process.env.BUNNY_STORAGE_ZONE || "undefined"
);

// ==========================================
// DNS
// ==========================================

require("dns").setDefaultResultOrder("ipv4first");

// ==========================================
// IMPORTS
// ==========================================

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

// ==========================================
// ROUTES
// ==========================================

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

const countryRoutes = require("./routes/countryRoutes");
const destinationRoutes = require("./routes/destinationRoutes");
const placeRoutes = require("./routes/placeRoutes");
const experienceRoutes = require("./routes/experienceRoutes");
const eventRoutes = require("./routes/eventRoutes");
const visaRoutes = require("./routes/visaRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const faqRoutes = require("./routes/faqRoutes");
const defenceRoutes = require("./routes/defenceRoutes");

const partnerTypeRoutes = require("./routes/partnerTypeRoutes");
const partnerRoutes = require("./routes/partnerRoutes");

const priceChangeRoutes = require("./routes/priceChangeRoutes");
const schengenAppointmentRoutes = require(
  "./routes/schengenAppointmentRoutes"
);

const newsroomRoutes = require("./routes/newsroomRoutes");
const speedUpdateRoutes = require("./routes/speedUpdateRoutes");

// ==========================================
// MIDDLEWARE
// ==========================================

const {
  protect
} = require("./middleware/authMiddleware");

// ==========================================
// APP
// ==========================================

const app = express();

// ==========================================
// DATABASE
// ==========================================

connectDB();

// ==========================================
// GLOBAL MIDDLEWARE
// ==========================================

app.use(cors());

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true
  })
);

// ==========================================
// STATIC UPLOADS
// ==========================================

// Existing local uploads ke liye.
// Bunny Storage documents is folder mein save nahi honge.

app.use(
  "/uploads",
  express.static("uploads")
);

// ==========================================
// HEALTH CHECK
// ==========================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ATLYS Visa Platform API is running"
  });
});

// ==========================================
// PROTECTED USER ROUTE
// ==========================================

app.get(
  "/api/auth/me",
  protect,
  (req, res) => {
    res.json({
      success: true,
      user: req.user
    });
  }
);

// ==========================================
// AUTH ROUTES
// ==========================================

app.use(
  "/api/auth",
  authRoutes
);

// ==========================================
// ADMIN ROUTES
// ==========================================

app.use(
  "/api/admin",
  adminRoutes
);

// ==========================================
// COUNTRY ROUTES
// ==========================================

app.use(
  "/api/countries",
  countryRoutes
);

// ==========================================
// DESTINATION ROUTES
// ==========================================

app.use(
  "/api/destinations",
  destinationRoutes
);

// ==========================================
// PLACE ROUTES
// ==========================================

app.use(
  "/api/places",
  placeRoutes
);

// ==========================================
// EXPERIENCE ROUTES
// ==========================================

app.use(
  "/api/experiences",
  experienceRoutes
);

// ==========================================
// EVENT ROUTES
// ==========================================

app.use(
  "/api/events",
  eventRoutes
);

// ==========================================
// VISA ROUTES
// ==========================================

app.use(
  "/api/visas",
  visaRoutes
);

// ==========================================
// APPLICATION ROUTES
// ==========================================

app.use(
  "/api/applications",
  applicationRoutes
);

// ==========================================
// FAQ ROUTES
// ==========================================

// Public FAQ APIs:
//
// GET /api/faqs?type=visa
// GET /api/faqs?type=application
// GET /api/faqs?type=visa&country=COUNTRY_ID
// GET /api/faqs?type=visa&visa=VISA_ID

app.use(
  "/api/faqs",
  faqRoutes
);

// ==========================================
// DEFENCE ROUTES
// ==========================================

app.use(
  "/api/defence",
  defenceRoutes
);

// ==========================================
// PARTNER TYPE ROUTES
// ==========================================

app.use(
  "/api/partner-types",
  partnerTypeRoutes
);

// ==========================================
// PARTNER ROUTES
// ==========================================

app.use(
  "/api/partners",
  partnerRoutes
);

// ==========================================
// PRICE CHANGE / FEES ROUTES
// ==========================================

// Public transparency API:
// GET /api/price-changes

// Admin APIs:
// POST   /api/price-changes
// GET    /api/price-changes/:id
// PUT    /api/price-changes/:id
// DELETE /api/price-changes/:id

app.use(
  "/api/price-changes",
  priceChangeRoutes
);

app.use(
  "/api/schengen",
  schengenAppointmentRoutes
);

// ==========================================
// NEWSROOM ROUTES
// ==========================================

// Public API:
// GET /api/newsroom
//
// Admin APIs:
// GET    /api/newsroom/admin/all
// GET    /api/newsroom/admin/:id
// POST   /api/newsroom/admin
// PUT    /api/newsroom/admin/:id
// DELETE /api/newsroom/admin/:id
// PUT    /api/newsroom/admin/:id/toggle

app.use(
  "/api/newsroom",
  newsroomRoutes
);

// ==========================================
// SPEED UPDATES ROUTES
// ==========================================

// Public API:
// GET /api/speedupdates
//
// Admin APIs:
// GET    /api/speedupdates/admin/all
// GET    /api/speedupdates/admin/:id
// POST   /api/speedupdates/admin
// PUT    /api/speedupdates/admin/:id
// DELETE /api/speedupdates/admin/:id
// PUT    /api/speedupdates/admin/:id/toggle

app.use(
  "/api/speedupdates",
  speedUpdateRoutes
);

// ==========================================
// 404 HANDLER
// ==========================================

app.use(
  (req, res) => {
    res.status(404).json({
      success: false,
      message:
        `Route not found: ${req.method} ${req.originalUrl}`
    });
  }
);

// ==========================================
// ERROR HANDLER
// ==========================================

app.use(
  (err, req, res, next) => {
    console.error(
      "Server Error:",
      err
    );

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
);

// ==========================================
// SERVER
// ==========================================

const PORT =
  process.env.PORT || 5000;

app.listen(
  PORT,
  () => {

    console.log(
      "================================="
    );

    console.log(
      `ATLYS Backend running on port ${PORT}`
    );

    console.log(
      `http://localhost:${PORT}`
    );

    console.log(
      "================================="
    );

    // ==========================================
    // BUNNY CONFIGURATION CHECK
    // ==========================================

    console.log(
      "Bunny Storage Zone:",
      process.env.BUNNY_STORAGE_ZONE
        ? "Configured"
        : "Missing"
    );

    console.log(
      "Bunny Storage Key:",
      process.env.BUNNY_STORAGE_ACCESS_KEY
        ? "Configured"
        : "Missing"
    );

    console.log(
      "Bunny Storage Endpoint:",
      process.env.BUNNY_STORAGE_ENDPOINT ||
        "https://storage.bunnycdn.com"
    );

    console.log(
      "Price Change API:",
      `http://localhost:${PORT}/api/price-changes`
    );
  }
);