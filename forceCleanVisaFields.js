require("dns").setDefaultResultOrder("ipv4first");

const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const forceCleanVisaFields = async () => {
  try {
    console.log("=================================");
    console.log("ATLYS FORCE VISA CLEANUP");
    console.log("=================================");

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");

    const collection = mongoose.connection.db.collection("visas");

    // Check before cleanup
    const before = await collection.countDocuments({
      $or: [
        { fee: { $exists: true } },
        { type: { $exists: true } },
        { requirements: { $exists: true } },
        { documents: { $exists: true } }
      ]
    });

    console.log(`Documents containing old fields: ${before}`);

    // Direct MongoDB update
    const result = await collection.updateMany(
      {},
      {
        $unset: {
          fee: "",
          type: "",
          requirements: "",
          documents: ""
        }
      }
    );

    console.log("---------------------------------");
    console.log("Matched documents:", result.matchedCount);
    console.log("Modified documents:", result.modifiedCount);
    console.log("---------------------------------");

    // Verify directly from MongoDB
    const after = await collection.countDocuments({
      $or: [
        { fee: { $exists: true } },
        { type: { $exists: true } },
        { requirements: { $exists: true } },
        { documents: { $exists: true } }
      ]
    });

    console.log(`Documents containing old fields after cleanup: ${after}`);

    if (after === 0) {
      console.log("SUCCESS: All old Visa fields removed.");
    } else {
      console.log("WARNING: Old fields still exist.");
    }

    console.log("=================================");
    console.log("Cleanup completed");
    console.log("=================================");

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error("Cleanup Error:", error);

    try {
      await mongoose.connection.close();
    } catch {}

    process.exit(1);
  }
};

forceCleanVisaFields();