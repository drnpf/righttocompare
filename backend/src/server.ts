import express, { Application, Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import admin from "firebase-admin";

// Importing routes
import userRoutes from "./routes/userRoutes";

// Loading environment variables
dotenv.config(); // THIS IS FOR DEVELOPMENT
// maybe we can use system environment variables on production

// Initializing Firebase Admin SDK
try {
  const serviceAccount = require("../serviceAccountKey.json");
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  console.log("Firebase Admin Initialized");
} catch (error) {
  console.error("Firebase Admin Error: Missing serviceAccountKey.json");
}

// Initializing Express App (BACKEND SERVER)
const app: Application = express();
const PORT = process.env.PORT || 5000;

/**
 * Middleware Configurations (Express)
 * CORS: Allows requests to come in from Frontend (or different servers)
 * JSON: Allows Express to read JSON from HTTP requests
 */
app.use(
  cors({
    // Allows request from the following server URLs
    origin: "http://localhost:3000", // Frontend URL (CHANGE URL HERE ON PRODUCTION)
    credentials: true,
  })
);
app.use(express.json());

/**
 * Database Connection (MongoDB)
 */
const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${(error as Error).message}`);
    process.exit(1);
  }
};
connectDB();

/**
 * API Routes
 */
app.use("/api/users", userRoutes); // User routes (sync, profile, etc.)

// Health Check Route
app.get("/", (req: Request, res: Response) => {
  res.send("API is running.");
});

// Starting server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
