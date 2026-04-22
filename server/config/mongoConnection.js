const mongoose = require("mongoose");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/hattah";

let mongooseConnection = null;

const connectToDatabase = async () => {
  if (mongooseConnection) {
    console.log("✅ Using existing MongoDB connection");
    return mongooseConnection;
  }

  try {
    console.log("🔄 Establishing new MongoDB connection...");
    const connection = await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 8000,
      family: 4, // Use IPv4, skip trying IPv6
      waitQueueTimeoutMS: 10000,
    });

    mongooseConnection = connection;
    console.log("✅ MongoDB connected successfully");
    return connection;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    mongooseConnection = null;
    throw error;
  }
};

const disconnectFromDatabase = async () => {
  if (mongooseConnection) {
    try {
      await mongoose.disconnect();
      mongooseConnection = null;
      console.log("✅ MongoDB disconnected");
    } catch (error) {
      console.error("❌ MongoDB disconnection error:", error.message);
    }
  }
};

const getConnection = () => mongooseConnection;

module.exports = {
  connectToDatabase,
  disconnectFromDatabase,
  getConnection,
};
