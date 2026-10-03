/**
 * Global Centralized Error Handling Middleware
 * Ensures every error returned to the client follows the standard response contract.
 */
export const errorHandler = (err, req, res, next) => {
  // Default values for unexpected internal errors
  let statusCode = err.statusCode || 500;
  let errorCode = err.errorCode || "INTERNAL_SERVER_ERROR";
  let message = err.message || "An unexpected error occurred on the server.";

  // Print stack trace in non-production environments for debugging
  if (process.env.NODE_ENV !== "production") {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);
  }

  // Hide internal server error details in production to avoid leaking sensitive data
  if (process.env.NODE_ENV === "production" && !err.isOperational) {
    message = "Internal Server Error";
    errorCode = "INTERNAL_SERVER_ERROR";
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: message,
    },
  });
};
