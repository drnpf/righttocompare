require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Importing routes
const authRoutes = require("./routes/authRoutes");

// Initializing the app
const app = express();
app.use(cors());
app.use(express.json());

// Connecting Database
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });

// Setting up routes
app.use("/api/auth", authRoutes);

// Starting server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port ${PORT}");
});
