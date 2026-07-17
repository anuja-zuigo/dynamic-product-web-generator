import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import authRouter from "./routes/auth.router.js";
import healthRouter from "./routes/health.router.js";

const app = express();

// Use the authentication router
app.use("/auth", authRouter);
app.use("/api/v1/health", healthRouter);

/**
 * Global Middlewares
 */

// Parse incoming JSON requests
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Secure common HTTP headers
app.use(helmet());

// Log HTTP requests
app.use(morgan("dev"));

/**
 * Default Route
 */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Dynamic Product Management API is running 🚀",
  });
});

export default app;