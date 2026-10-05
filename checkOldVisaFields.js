
require("dns").setDefaultResultOrder("ipv4first");

const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Visa = require("./models/Visa");

dotenv.config();

const checkOldVisaFields = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB Connected");
    console.log("=================================");

    const visas = await Visa.find({}).lean();

    let found = false;

    for (const visa of visas) {
      const oldFields = {};

      if (Object.prototype.hasOwnProperty.call(visa, "fee")) {
        oldFields.fee = visa.fee;
      }

      if (Object.prototype.hasOwnProperty.call(visa, "type")) {
        oldFields.type = visa.type;
      }

      if (
        Object.prototype.hasOwnProperty.call(
          visa,
          "requirements"
        )
      ) {
        oldFields.requirements = visa.requirements;
      }

      if (
        Object.prototype.hasOwnProperty.call(
          visa,
          "documents"
        )
      ) {
        oldFields.documents = visa.documents;
      }

      if (Object.keys(oldFields).length > 0) {
        found = true;

        console.log(`Visa: ${visa.name}`);
        console.log("Old fields found:");
        console.log(oldFields);
        console.log("---------------------------------");
      }
    }

    if (!found) {
      console.log(
        "SUCCESS: No old Visa fields exist."
      );
    }

    console.log("=================================");

    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.error(
      "Check Error:",
      error.message
    );

    try {
      await mongoose.connection.close();
    } catch {}

    process.exit(1);
  }
};

checkOldVisaFields();