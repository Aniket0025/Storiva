import { User } from "../modules/users/user.model.js";
import { verifyToken } from "../utils/token.js";
import { AppError } from "../utils/AppError.js";

/**
 * Authentication Middleware
 * Protects routes by verifying JWT token from cookies or Authorization header.
 */
export const authenticate = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    // Support Bearer token header as fallback (useful for API testing tools like Postman)
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        new AppError(
          "Authentication required. Please log in.",
          401,
          "UNAUTHORIZED"
        )
      );
    }

    // Verify token validity
    const decoded = verifyToken(token);

    // Fetch user from database
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(
        new AppError(
          "User account no longer exists.",
          401,
          "USER_NOT_FOUND"
        )
      );
    }

    // Attach authenticated user to request object
    req.user = user;
    next();
  } catch (error) {
    return next(
      new AppError("Invalid or expired session token.", 401, "INVALID_TOKEN")
    );
  }
};
