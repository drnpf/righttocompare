// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDb = require("./config/db");
const profileRoutes = require("./routes/profileRoutes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
connectDb();

// Simple health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "RightToCompare backend running" });
});

// Profile routes (your main vertical slice)
app.use("/api/profile", profileRoutes);

// TODO (teammate): add phone routes, review routes, recommendation endpoints, etc.

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Backend server listening on port ${PORT}`);
});