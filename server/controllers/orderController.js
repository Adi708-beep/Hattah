const Order = require("../models/Order");
const Product = require("../models/Product");
const mongoose = require("mongoose");
const { findDefaultProductById } = require("../data/defaultProducts");
const { sendOrderConfirmationEmail } = require("../services/emailService");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createOrder = async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      phone,
      address,
      quantity,
      notes,
      productId,
    } = req.body;

    const normalizedEmail = String(customerEmail || "").trim().toLowerCase();

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    const normalizedProductId = String(productId || "").trim();
    const product = mongoose.Types.ObjectId.isValid(normalizedProductId)
      ? await Product.findById(normalizedProductId)
      : null;
    const fallbackProduct = product || findDefaultProductById(normalizedProductId);

    if (!fallbackProduct) {
      return res.status(404).json({
        success: false,
        message: "Selected product does not exist",
      });
    }

    const productSnapshot = {
      name: fallbackProduct.name,
      price: fallbackProduct.price,
      description: fallbackProduct.description,
      imageUrl: fallbackProduct.imageUrl,
      category: fallbackProduct.category,
      sellerName: fallbackProduct.sellerName,
    };

    const orderPayload = {
      customerName,
      customerEmail: normalizedEmail,
      phone,
      address,
      quantity: Number(quantity) || 1,
      notes: notes || "",
      productId: normalizedProductId,
      productSnapshot,
    };

    const order = await Order.create(orderPayload);

    let emailSent = false;
    let emailMode = "none";

    try {
      const emailResult = await sendOrderConfirmationEmail({
        customerName,
        customerEmail: normalizedEmail,
        order,
        product: fallbackProduct,
      });

      emailSent = true;
      emailMode = emailResult.mode;
    } catch (emailError) {
      console.error("Failed to send order confirmation email:", emailError.message);
    }

    return res.status(201).json({
      success: true,
      message: emailSent
        ? "Order placed successfully and confirmation email sent"
        : "Order placed successfully. Confirmation email is pending",
      data: {
        order,
        emailSent,
        emailMode,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to submit order request",
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
};
