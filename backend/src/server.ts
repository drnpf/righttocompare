import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import { noSqlSanitizer } from "./middleware/security";

// Configurations and Routes
import { connectDB } from "./config/db";
import "./config/firebase";
import userRoutes from "./routes/userRoutes";
import phoneRoutes from "./routes/phoneRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import discussionRoutes from "./routes/discussionRoutes";
import scraperRoutes from "./routes/scraperRoutes";
import chatbotRoutes from "./routes/chatbotRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import { initializeEmailService } from "./services/emailService";
import { startDailyDigestScheduler } from "./services/notificationService";
import trendsRoutes from "./routes/trendsRoutes";
import inAppNotificationRoutes from "./routes/inAppNotificationRoutes";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5001;

// ------------------------------------------------------------
// | NETWORK AND PROXY SETTINGS
// -----------------------------------------------------------
app.set("trust proxy", 1); // Gets client's real IP from x-forwarded-for header rather than IP of load balancer/server

// ------------------------------------------------------------
// | TRANSPORT AND HEADER SECURITY
// -----------------------------------------------------------
// HTML header information minimization
app.use(helmet());

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

// ------------------------------------------------------------
// | TRAFFIC AND DOS PROTECTION
// -----------------------------------------------------------
// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests. Please try again later.",
  standardHeaders: true,
  legacyHeaders: true,
});
//app.use("/api", limiter);

// ------------------------------------------------------------
// | DATA PARSING AND SANITIZATION
// -----------------------------------------------------------
// JSON parser
app.use(express.json({ limit: "10kb" })); // Guard against large payload DoS

// Data sanitization
app.use(noSqlSanitizer); // NoSQL query sanitization against injection attacks
app.use(hpp()); // HTTP sanitization against input manipulation attacks

// ------------------------------------------------------------
// | DATABASE AND API ROUTES
// -----------------------------------------------------------
connectDB();
initializeEmailService();

app.use("/api/users", userRoutes);
app.use("/api/phones", phoneRoutes);
app.use("/api/phones", reviewRoutes); // Review routes nested under phones
app.use("/api/discussions", discussionRoutes); // Discussion thread routes
app.use("/api/scraper", scraperRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/trends", trendsRoutes);
app.use("/api/notifications", inAppNotificationRoutes);

// ------------------------------------------------------------
// | HEALTH CHECK AND ERROR HANDLING
// -----------------------------------------------------------
app.get("/", (req: Request, res: Response) => {
  res.send("API is running.");
});

// Starting server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startDailyDigestScheduler();
});
