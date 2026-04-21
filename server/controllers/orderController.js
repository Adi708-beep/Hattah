const Order = require("../models/Order");
const Product = require("../models/Product");
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

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Selected product does not exist",
      });
    }

    const orderPayload = {
      customerName,
      customerEmail: normalizedEmail,
      phone,
      address,
      quantity: Number(quantity) || 1,
      notes: notes || "",
      productId,
    };

    const order = await Order.create(orderPayload);

    let emailSent = false;
    let emailMode = "none";

    try {
      const emailResult = await sendOrderConfirmationEmail({
        customerName,
        customerEmail: normalizedEmail,
        order,
        product,
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
