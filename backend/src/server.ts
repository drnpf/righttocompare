import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import { noSqlSanitizer } from "./middleware/security";

// Importing routes
import userRoutes from "./routes/userRoutes";
import phoneRoutes from "./routes/phoneRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import discussionRoutes from "./routes/discussionRoutes";
import scraperRoutes from "./routes/scraperRoutes";
import chatbotRoutes from "./routes/chatbotRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import trendsRoutes from "./routes/trendsRoutes";

// Loading environment variables
dotenv.config(); // THIS IS FOR DEVELOPMENT maybe we can use system environment variables on production

// Configuration imports
import { connectDB } from "./config/db";
import "./config/firebase";

// Initializing Express App (BACKEND SERVER)
const app: Application = express();
const PORT = process.env.PORT || 5001;

// App settings
app.set("trust proxy", 1); // Gets client's real IP from x-forwarded-for header rather than IP of load balancer/server

/**
 * Middleware Configurations (Express)
 * Helmet: Hides sensitive header information that is not needed in request
 * Express-Rate-Limit: Rate limits requests based on IP
 * CORS: Allows requests to come in from Frontend (or different servers)
 * JSON: Allows Express to read JSON from HTTP requests
 * Express-Mongo-Sanitize: Prevents NoSQL injection attacks by stripping $ and .
 * HPP: Protects against HTTP parameter input manipulation attacks
 */
// HTML header information minimization
app.use(helmet());

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: true,
});
app.use("/api", limiter);

// CORS setup
app.use(
  cors({
    // Allows request from the following server URLs
    origin: "http://localhost:3000", // Frontend URL (CHANGE URL HERE ON PRODUCTION)
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// JSON parser
app.use(express.json({ limit: "10kb" })); // Guard against large payload DoS

// Data sanitization
app.use(noSqlSanitizer); // NoSQL query sanitization against injection attacks
app.use(hpp()); // HTTP sanitization against input manipulation attacks

/**
 * Database Connection (MongoDB)
 */
connectDB();

/**
 * API Routes
 */
app.use("/api/users", userRoutes);
app.use("/api/phones", phoneRoutes);
app.use("/api/phones", reviewRoutes); // Review routes nested under phones
app.use("/api/discussions", discussionRoutes); // Discussion thread routes
app.use("/api/scraper", scraperRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/trends", trendsRoutes);

// Health Check Route
app.get("/", (req: Request, res: Response) => {
  res.send("API is running.");
});

// Starting server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
