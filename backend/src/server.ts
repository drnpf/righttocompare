import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

// Importing routes
import userRoutes from "./routes/userRoutes";
import phoneRoutes from "./routes/phoneRoutes";

// Loading environment variables
dotenv.config(); // THIS IS FOR DEVELOPMENT maybe we can use system environment variables on production

// Configuration imports
import { connectDB } from "./config/db";
import "./config/firebase";

// Initializing Express App (BACKEND SERVER)
const app: Application = express();
const PORT = process.env.PORT || 5001;

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
  }),
);
app.use(express.json());

/**
 * Database Connection (MongoDB)
 */
connectDB();

/**
 * API Routes
 */
app.use("/api/users", userRoutes);
app.use("/api/phones", phoneRoutes);

// ADD MORE ROUTES HERE

// Health Check Route
app.get("/", (req: Request, res: Response) => {
  res.send("API is running.");
});

// Starting server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
