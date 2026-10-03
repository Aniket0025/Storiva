import rateLimit from "express-rate-limit";

/**
 * General API Rate Limiter
 * Restricts client request frequency to protect backend infrastructure.
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: "draft-8", // Return standard rate limit info in headers
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests from this IP. Please try again later.",
    },
  },
});
