const path = require("path");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const Product = require("./models/Product");
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
      {
        name: "Handmade Linen Tote",
        price: 1299,
        description: "Soft linen everyday tote with reinforced handles, handcrafted in small batches.",
        imageUrl: "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1000&q=80",
        category: "Bags",
        sellerName: "ThreadRoot Studio",
      },
      {
        name: "Minimal Clay Mug Set",
        price: 999,
        description: "Set of two wheel-thrown ceramic mugs with matte glaze and comfortable grip.",
        imageUrl: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=1000&q=80",
        category: "Home",
        sellerName: "EarthKind Pottery",
      },
      {
        name: "Organic Face Serum",
        price: 1499,
        description: "Lightweight botanical serum made for daily hydration and glow.",
        imageUrl: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1000&q=80",
        category: "Beauty",
        sellerName: "Luma Herbals",
      },
      {
        name: "Block Print Summer Shirt",
        price: 1799,
        description: "Breathable cotton shirt featuring hand block print patterns.",
        imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=80",
        category: "Fashion",
        sellerName: "Indigo Alley",
      },
      {
        name: "Desk Plant Starter Kit",
        price: 799,
        description: "Low-maintenance indoor plant kit with ceramic pot and care guide.",
        imageUrl: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1000&q=80",
        category: "Home",
        sellerName: "GreenLittle Co",
      },
      {
        name: "Sterling Silver Charm Anklet",
        price: 2199,
        description: "Delicate handcrafted anklet in sterling silver with tiny charm details.",
        imageUrl: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1000&q=80",
        category: "Accessories",
        sellerName: "MoonMint Atelier",
      },
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
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log("✅ MongoDB connected successfully");
    await seedProductsIfEmpty();
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    isConnected = false;
  }
};

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("DB connection middleware error:", error);
    next();
  }
});

// Start server only in non-serverless environment
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    connectDB();
  });
}

module.exports = app;
