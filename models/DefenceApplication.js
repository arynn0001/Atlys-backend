const mongoose = require("mongoose");

const defenceApplicationSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true
    },

    lastName: {
      type: String,
      required: true,
      trim: true
    },

    defenceId: {
      type: String,
      required: true,
      trim: true
    },

    passportNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },

    phone: {
      type: String,
      required: true,
      trim: true
    },

    defenceIdDocument: {
      type: String,
      default: ""
    },

    status: {
      type: String,
      enum: [
        "pending",
        "verified",
        "rejected"
      ],
      default: "pending"
    },

    serviceFeeWaiver: {
      type: Boolean,
      default: false
    },

    emailTagged: {
      type: Boolean,
      default: false
    },

    verifiedAt: {
      type: Date,
      default: null
    },

    adminRemarks: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);


/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
| Search/filtering ke liye useful.
*/

defenceApplicationSchema.index({
  email: 1
});

defenceApplicationSchema.index({
  status: 1
});

defenceApplicationSchema.index({
  createdAt: -1
});

defenceApplicationSchema.index({
  defenceId: 1
});

defenceApplicationSchema.index({
  passportNumber: 1
});


module.exports = mongoose.model(
  "DefenceApplication",
  defenceApplicationSchema
);