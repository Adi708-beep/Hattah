const mongoose = require("mongoose");

const sellerSchema = new mongoose.Schema(
  {
    brandName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    instagramHandle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    sampleProductLink: {
      type: String,
      required: true,
      trim: true,
    },
    contactInfo: {
      type: String,
      required: true,
      trim: true,
      maxlength: 220,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Seller", sellerSchema);
