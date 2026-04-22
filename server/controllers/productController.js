const Product = require("../models/Product");

const getProducts = async (req, res) => {
  try {
    console.log("📦 Processing GET /api/products request");
    const { category, minPrice, maxPrice } = req.query;
    const query = {};

    if (category) {
      query.category = category;
      console.log(`🔍 Filtering by category: ${category}`);
    }

    if (minPrice || maxPrice) {
      query.price = {};

      if (minPrice) {
        query.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        query.price.$lte = Number(maxPrice);
      }
      console.log(`💰 Filtering by price:`, query.price);
    }

    console.log("⏳ Executing database query...");
    const products = await Product.find(query).sort({ createdAt: -1 }).maxTimeMS(8000);

    console.log(`✅ Found ${products.length} products`);
    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("❌ Error fetching products:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
};
