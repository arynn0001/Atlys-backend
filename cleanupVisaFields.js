require("dns").setDefaultResultOrder("ipv4first");

const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Visa = require("./models/Visa");

dotenv.config();

const cleanupVisaFields = async () => {
  try {
    console.log("=================================");
    console.log("ATLYS VISA DATABASE CLEANUP");
    console.log("=================================");

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");

    const visas = await Visa.find({});

    console.log(`Total visas found: ${visas.length}`);

    let cleaned = 0;

    for (const visa of visas) {
      const result = await Visa.updateOne(
        { _id: visa._id },
        {
          $unset: {
            fee: "",
            type: "",
            requirements: "",
            documents: ""
          }
        }
      );

      if (result.modifiedCount > 0) {
        cleaned++;
        console.log(
          `Cleaned: ${visa.name}`
        );
      }
    }

    console.log("---------------------------------");
    console.log(`Visas cleaned: ${cleaned}`);
    console.log("---------------------------------");

    // VERIFY
    const oldFieldCheck = await Visa.findOne({
      $or: [
        { fee: { $exists: true } },
        { type: { $exists: true } },
        { requirements: { $exists: true } },
        { documents: { $exists: true } }
      ]
    }).lean();

    if (oldFieldCheck) {
      console.log(
        "WARNING: Old fields still exist in database."
      );
    } else {
      console.log(
        "SUCCESS: No old Visa fields found."
      );
    }

    console.log("=================================");
    console.log("Visa cleanup completed");
    console.log("=================================");

    await mongoose.connection.close();

    process.exit(0);

  } catch (error) {
    console.error(
      "Visa Cleanup Error:",
      error.message
    );

    try {
      await mongoose.connection.close();
    } catch {}

    process.exit(1);
  }
};

cleanupVisaFields();