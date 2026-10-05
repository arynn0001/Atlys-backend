const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Destination = require("./models/Destination");
const Place = require("./models/Place");
const Experience = require("./models/Experience");

dotenv.config();

/*
=========================================================
UNIQUE IMAGE LIBRARY
=========================================================
*/

const images = [
  "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1494783367193-149034c05e8f?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1484318571209-661cf29a69c3?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1547036967-23d11aacaee0?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1529260830199-42c24126f198?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1498307833015-e7b400441eb8?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1514924013411-cbf25faa35bb?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1494522358652-f30e61a60313?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1400&q=85"
];


/*
=========================================================
GET IMAGE
=========================================================
*/

function getImage(index, offset = 0) {
  return images[(index + offset) % images.length];
}


/*
=========================================================
UPDATE IMAGES ONLY
=========================================================
*/

async function updateImagesOnly(
  Model,
  collectionName,
  imageOffset
) {
  const records = await Model.find({})
    .select("_id name title")
    .sort({
      createdAt: 1,
      _id: 1
    })
    .lean();

  console.log("");
  console.log(
    `Updating ${collectionName}: ${records.length} records`
  );

  for (let i = 0; i < records.length; i++) {
    const record = records[i];

    const image = getImage(
      i,
      imageOffset
    );

    await Model.updateOne(
      {
        _id: record._id
      },
      {
        $set: {
          image
        }
      }
    );

    console.log(
      `${String(i + 1).padStart(3, "0")} ✓ ${
        record.name ||
        record.title ||
        "Unnamed"
      }`
    );
  }

  return records.length;
}


/*
=========================================================
MAIN
=========================================================
*/

async function fixExploreImages() {

  try {

    console.log("");
    console.log("==============================================");
    console.log("ATLYS EXPLORE IMAGE REPAIR");
    console.log("==============================================");

    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      "✓ MongoDB connected"
    );


    /*
    ---------------------------------------------
    DESTINATIONS
    ---------------------------------------------
    */

    const destinationCount =
      await updateImagesOnly(
        Destination,
        "Destinations",
        0
      );


    /*
    ---------------------------------------------
    PLACES
    ---------------------------------------------
    */

    const placeCount =
      await updateImagesOnly(
        Place,
        "Places",
        22
      );


    /*
    ---------------------------------------------
    EXPERIENCES
    ---------------------------------------------
    */

    const experienceCount =
      await updateImagesOnly(
        Experience,
        "Experiences",
        44
      );


    /*
    ---------------------------------------------
    RESULT
    ---------------------------------------------
    */

    console.log("");
    console.log("==============================================");
    console.log("IMAGE REPAIR COMPLETED");
    console.log("==============================================");

    console.log(
      `Destinations updated: ${destinationCount}`
    );

    console.log(
      `Places updated: ${placeCount}`
    );

    console.log(
      `Experiences updated: ${experienceCount}`
    );

    console.log("");
    console.log(
      "✓ Only image fields were updated"
    );

    console.log(
      "✓ Existing categories were untouched"
    );

    console.log(
      "✓ Existing records were not deleted"
    );

    console.log(
      "✓ Explore images updated successfully"
    );

    console.log("==============================================");
    console.log("");


    await mongoose.disconnect();

    process.exit(0);

  } catch (error) {

    console.error("");
    console.error(
      "❌ Image repair failed:"
    );

    console.error(
      error.message
    );

    console.error("");

    try {
      await mongoose.disconnect();
    } catch (e) {}

    process.exit(1);
  }
}


fixExploreImages();