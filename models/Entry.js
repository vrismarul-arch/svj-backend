const mongoose = require("mongoose");

const entrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
    companyName: { type: String, required: true },
    requirement: { type: String, default: "" },

    requirementType: {
      type: String,
      enum: [
        "Boom Barrier",
        "Swing Barrier",
        "Flap Barrier",
        "Turnstile",
        "Baggage Scanner",
        "Metal Detector",
        "Bollard System",
        "Home Automation",
      ],
      required: true,
    },

    brands: {
      type: [String],
      enum: ["Essl", "Came", "ZKT", "Hikvision", "Honeywell"],
      default: [],
    },

    images: {
      type: [String],
      validate: [arrayLimit, "{PATH} exceeds the limit of 5 images"],
    },

    pdfUrl: { type: String, default: "" }, // Added for storing PDF link

    status: {
      type: String,
      enum: ["Pending", "Action In Progress", "Completed", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

function arrayLimit(val) {
  return val.length <= 5;
}

module.exports = mongoose.model("Entry", entrySchema);
