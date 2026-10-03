import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

import { env } from "./config/env.js";
import { globalRateLimiter } from "./middleware/rateLimiter.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { errorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./modules/auth/auth.routes.js";

const app = express();

// 1. Security HTTP Headers
app.use(helmet());

// 2. CORS Configuration
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

// 3. Request Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 4. Global Rate Limiter
app.use(globalRateLimiter);

// 5. Health Check Endpoint
app.get("/api/v1/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  res.status(200).json({
    success: true,
    data: {
      status: "ok",
      service: "storiva-api",
      timestamp: new Date().toISOString(),
      database: dbStatusMap[dbState] || "unknown",
    },
  });
});

// 6. Application Routes
app.use("/api/v1/auth", authRoutes);

// 6. Handle 404 Unmatched Routes
app.use(notFoundHandler);

// 7. Centralized Error Handler
app.use(errorHandler);

export default app;