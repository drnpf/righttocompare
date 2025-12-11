// backend/config/db.js
const mongoose = require("mongoose");

async function connectDb() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("MONGO_URI is not set in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      // these options are mostly defaults now, but explicit is fine
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✅ Connected to MongoDB Atlas");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
}

module.exports = connectDb;
