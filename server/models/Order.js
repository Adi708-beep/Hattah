const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 180,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 400,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    orderStatus: {
      type: String,
      enum: ["new", "processing", "fulfilled", "cancelled"],
      default: "new",
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    productId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    productSnapshot: {
      name: { type: String, trim: true, maxlength: 120, default: "" },
      price: { type: Number, min: 0, default: 0 },
      description: { type: String, trim: true, maxlength: 1000, default: "" },
      imageUrl: { type: String, trim: true, default: "" },
      category: { type: String, trim: true, maxlength: 80, default: "" },
      sellerName: { type: String, trim: true, maxlength: 120, default: "" },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
