const Product = require("../models/Product");
const { DEFAULT_PRODUCTS, findDefaultProductById } = require("../data/defaultProducts");

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
    let products = [];
    try {
      const dbProducts = await Product.find(query).sort({ createdAt: -1 }).maxTimeMS(5000).lean().hint({ _id: 1 });
      products = dbProducts;
      console.log(`✅ Found ${products.length} products from database`);
    } catch (dbError) {
      console.warn(`⚠️ Database query failed (${dbError.message}), using default products`);
      products = DEFAULT_PRODUCTS;
    }

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("❌ Error in getProducts:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    
    // First check default products (for fallback when DB is unavailable)
    const defaultProduct = findDefaultProductById(productId);
    if (defaultProduct) {
      console.log(`✅ Found product ${productId} in defaults`);
      return res.status(200).json({
        success: true,
        data: defaultProduct,
      });
    }

    // Then try database
    console.log(`🔍 Searching database for product ${productId}`);
    const product = await Product.findById(productId).maxTimeMS(5000);

    if (!product) {
      console.warn(`⚠️ Product ${productId} not found`);
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    console.log(`✅ Found product ${productId} in database`);
    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("❌ Error fetching product:", error.message);
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
