const Seller = require("../models/Seller");

const createSeller = async (req, res) => {
  try {
    const seller = await Seller.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Seller onboarding submitted successfully",
      data: seller,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to submit seller onboarding",
      error: error.message,
    });
  }
};

module.exports = {
  createSeller,
};
