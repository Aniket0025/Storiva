/**
 * Custom Operational Error Class for Storiva
 * Used to pass structured error code and HTTP status code throughout the server.
 */
export class AppError extends Error {
  /**
   * @param {string} message - Human-readable error message
   * @param {number} statusCode - HTTP status code (e.g., 400, 401, 404, 500)
   * @param {string} errorCode - Machine-readable error code (e.g., 'RESOURCE_NOT_FOUND')
   */
  constructor(message, statusCode = 500, errorCode = "INTERNAL_SERVER_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true; // Marks error as expected application error (not a crash)

    Error.captureStackTrace(this, this.constructor);
  }
}
