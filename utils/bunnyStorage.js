const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const dotenv = require("dotenv");

// ==========================================
// LOAD .ENV DIRECTLY
// ==========================================

const envPath = path.resolve(
  __dirname,
  "../.env"
);

let env = {};

try {
  const envFile = fs.readFileSync(
    envPath,
    "utf8"
  );

  env = dotenv.parse(envFile);

  console.log(
    "Bunny ENV file:",
    envPath
  );

  console.log(
    "Bunny Zone Check:",
    env.BUNNY_STORAGE_ZONE || "MISSING"
  );

  console.log(
    "Bunny CDN Check:",
    env.BUNNY_CDN_HOSTNAME || "MISSING"
  );

} catch (error) {

  console.error(
    "Failed to read .env:",
    error.message
  );

}

// ==========================================
// BUNNY UPLOAD
// ==========================================

const uploadToBunny = async ({
  buffer,
  fileName,
  contentType,
  folder
}) => {

  try {

    // ==========================================
    // CONFIG
    // ==========================================

    const storageZone =
      env.BUNNY_STORAGE_ZONE ||
      process.env.BUNNY_STORAGE_ZONE;

    const accessKey =
      env.BUNNY_STORAGE_ACCESS_KEY ||
      process.env.BUNNY_STORAGE_ACCESS_KEY;

    // ==========================================
    // CDN HOSTNAME
    // ==========================================

    const cdnHostname =
      env.BUNNY_CDN_HOSTNAME ||
      process.env.BUNNY_CDN_HOSTNAME;

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!storageZone) {

      throw new Error(
        "BUNNY_STORAGE_ZONE is missing in .env"
      );

    }

    if (!accessKey) {

      throw new Error(
        "BUNNY_STORAGE_ACCESS_KEY is missing in .env"
      );

    }

    if (!cdnHostname) {

      throw new Error(
        "BUNNY_CDN_HOSTNAME is missing in .env"
      );

    }

    if (!buffer) {

      throw new Error(
        "File buffer is missing"
      );

    }

    // ==========================================
    // STORAGE ENDPOINT
    // ==========================================

    const baseEndpoint =
      env.BUNNY_STORAGE_ENDPOINT ||
      process.env.BUNNY_STORAGE_ENDPOINT ||
      "https://storage.bunnycdn.com";

    const cleanBase =
      baseEndpoint.replace(/\/+$/, "");

    const endpoint =
      cleanBase.endsWith(`/${storageZone}`)
        ? cleanBase
        : `${cleanBase}/${storageZone}`;

    // ==========================================
    // CHECKSUM
    // ==========================================

    const checksum =
      crypto
        .createHash("sha256")
        .update(buffer)
        .digest("hex");

    // ==========================================
    // SAFE FOLDER
    // ==========================================

    const safeFolder =
      folder
        .split("/")
        .filter(Boolean)
        .map(
          item =>
            encodeURIComponent(item)
        )
        .join("/");

    // ==========================================
    // SAFE FILE NAME
    // ==========================================

    const safeFileName =
      encodeURIComponent(fileName);

    // ==========================================
    // CLEAN ENDPOINT
    // ==========================================

    const cleanEndpoint =
      endpoint.replace(/\/+$/, "");

    // ==========================================
    // FINAL STORAGE UPLOAD URL
    // ==========================================

    const uploadUrl =
      `${cleanEndpoint}/${safeFolder}/${safeFileName}`;

    // ==========================================
    // FINAL PUBLIC CDN URL
    // ==========================================

    const cleanCdnHostname =
      cdnHostname
        .replace(/^https?:\/\//, "")
        .replace(/\/+$/, "");

    const publicUrl =
      `https://${cleanCdnHostname}/${safeFolder}/${safeFileName}`;

    // ==========================================
    // LOGS
    // ==========================================

    console.log(
      "================================="
    );

    console.log(
      "BUNNY UPLOAD"
    );

    console.log(
      "Storage Zone:",
      storageZone
    );

    console.log(
      "Upload Folder:",
      folder
    );

    console.log(
      "File Name:",
      fileName
    );

    console.log(
      "Upload URL:",
      uploadUrl
    );

    console.log(
      "Public CDN URL:",
      publicUrl
    );

    console.log(
      "================================="
    );

    // ==========================================
    // UPLOAD TO BUNNY STORAGE
    // ==========================================

    const response = await fetch(
      uploadUrl,
      {
        method: "PUT",

        headers: {
          AccessKey: accessKey,

          "Content-Type":
            contentType ||
            "application/octet-stream",

          Checksum: checksum
        },

        body: buffer
      }
    );

    const responseText =
      await response.text();

    // ==========================================
    // BUNNY ERROR
    // ==========================================

    if (!response.ok) {

      throw new Error(
        `Bunny upload failed (${response.status}): ${responseText}`
      );

    }

    // ==========================================
    // SUCCESS
    // ==========================================

    console.log(
      "Bunny upload successful"
    );

    console.log(
      "Public image URL:",
      publicUrl
    );

    // ==========================================
    // RETURN PUBLIC CDN URL
    // ==========================================

    return {

      success: true,

      // IMPORTANT:
      // MongoDB will store the CDN URL,
      // NOT the Bunny Storage API URL.

      path: publicUrl,

      checksum

    };

  } catch (error) {

    console.error(
      "Bunny Storage Upload Error:",
      error.message
    );

    throw error;

  }

};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
  uploadToBunny
};