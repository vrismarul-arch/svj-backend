const mongoose = require("mongoose");

const entrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Full name
    phoneNumber: { type: String, required: true }, // Contact number
    email: { type: String, required: true }, // Mail ID
    companyName: { type: String, required: true }, // Company name
    requirement: { type: String, default: "" }, // Notes / Requirement description

    // Store uploaded image URLs from Supabase
    images: {
      type: [String], // Array of image URLs
      validate: [arrayLimit, "{PATH} exceeds the limit of 5 images"],
    },

    status: {
      type: String,
      enum: ["Pending", "Action In Progress", "Completed", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

// Validation function for max 5 images
function arrayLimit(val) {
  return val.length <= 5;
}

module.exports = mongoose.model("Entry", entrySchema);
