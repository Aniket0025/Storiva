import { AppError } from "../utils/AppError.js";

/**
 * 404 Not Found Middleware
 * Catches requests to unhandled API endpoints.
 */
export const notFoundHandler = (req, res, next) => {
  next(
    new AppError(
      `Cannot ${req.method} ${req.originalUrl} - Route not found`,
      404,
      "ROUTE_NOT_FOUND"
    )
  );
};
