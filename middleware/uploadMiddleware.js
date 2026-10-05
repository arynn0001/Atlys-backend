const multer = require("multer");

// ==========================================
// MEMORY STORAGE
// ==========================================

const storage = multer.memoryStorage();

// ==========================================
// ALLOWED FILE TYPES
// ==========================================

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png"
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only PDF, JPG, JPEG and PNG files are allowed"
      ),
      false
    );
  }
};

// ==========================================
// MULTER
// ==========================================

const uploadDocument = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

module.exports = {
  uploadDocument
};