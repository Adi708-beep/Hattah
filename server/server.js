const path = require("path");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const Product = require("./models/Product");
const { DEFAULT_PRODUCTS } = require("./data/defaultProducts");
const productRoutes = require("./routes/productRoutes");
const sellerRoutes = require("./routes/sellerRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/hattah";

// Middleware
app.use(cors());
app.use(express.json());

// Request logging for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use(express.static(path.join(__dirname, "../public")));

// Health check
app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "HATTAH API is running",
  });
});

// API Routes
app.use("/api/products", productRoutes);
app.use("/api/sellers", sellerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

// Fallback to index.html for client-side routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

const seedProductsIfEmpty = async () => {
  try {
    const count = await Product.countDocuments();
    if (count > 0) {
      console.log(`✅ Database ready with ${count} products`);
      return;
    }

    await Product.insertMany([
      ...DEFAULT_PRODUCTS.map(({ _id, ...product }) => product),
    ]);
    console.log("✅ Products seeded successfully");
  } catch (error) {
    console.error("❌ Error seeding products:", error.message);
  }
};

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    console.log("🔄 Establishing MongoDB connection...");
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 5,
      minPoolSize: 1,
      family: 4,
      waitQueueTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    
    // Warm up the connection
    await Product.countDocuments();
    
    isConnected = true;
    console.log("✅ MongoDB connected and verified");
    await seedProductsIfEmpty();
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    isConnected = false;
    throw error;
  }
};

// Middleware to ensure DB connection
let dbConnecting = false;
let connectionAttempts = 0;

app.use(async (req, res, next) => {
  try {
    if (!isConnected && !dbConnecting) {
      dbConnecting = true;
      connectionAttempts++;
      console.log(`🔗 Connection attempt #${connectionAttempts}`);
      
      try {
        await connectDB();
      } catch (error) {
        console.error(`❌ Connection attempt #${connectionAttempts} failed:`, error.message);
      }
      
      dbConnecting = false;
    }
    next();
  } catch (error) {
    console.error("❌ Middleware error:", error.message);
    dbConnecting = false;
    next();
  }
});

// Start server only in non-serverless environment
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    connectDB();
  });
} else {
  // For Vercel serverless, warm up connection immediately on module load
  console.log("📦 Vercel serverless detected, warming up MongoDB connection...");
  connectDB().catch(err => console.error("❌ Warmup failed:", err.message));
}

module.exports = app;
