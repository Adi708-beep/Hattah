const Product = require("../models/Product");

const DEFAULT_PRODUCTS = [
  {
    _id: "1",
    name: "Handmade Linen Tote",
    price: 1299,
    description: "Soft linen everyday tote with reinforced handles, handcrafted in small batches.",
    imageUrl: "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1000&q=80",
    category: "Bags",
    sellerName: "ThreadRoot Studio",
  },
  {
    _id: "2",
    name: "Minimal Clay Mug Set",
    price: 999,
    description: "Set of two wheel-thrown ceramic mugs with matte glaze and comfortable grip.",
    imageUrl: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=1000&q=80",
    category: "Home",
    sellerName: "EarthKind Pottery",
  },
  {
    _id: "3",
    name: "Organic Face Serum",
    price: 1499,
    description: "Lightweight botanical serum made for daily hydration and glow.",
    imageUrl: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1000&q=80",
    category: "Beauty",
    sellerName: "Luma Herbals",
  },
  {
    _id: "4",
    name: "Block Print Summer Shirt",
    price: 1799,
    description: "Breathable cotton shirt featuring hand block print patterns.",
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=80",
    category: "Fashion",
    sellerName: "Indigo Alley",
  },
];

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
