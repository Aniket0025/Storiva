import * as authService from "./auth.service.js";
import { setAuthCookie, clearAuthCookie } from "../../utils/token.js";

/**
 * Handle User Registration HTTP Request
 */
export const register = async (req, res, next) => {
  try {
    const { user, token } = await authService.registerUser(req.body);

    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle User Login HTTP Request
 */
export const login = async (req, res, next) => {
  try {
    const { user, token } = await authService.loginUser(req.body);

    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle User Logout HTTP Request
 */
export const logout = async (req, res, next) => {
  try {
    clearAuthCookie(res);

    res.status(200).json({
      success: true,
      data: {
        message: "Logged out successfully",
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Currently Authenticated User Info
 */
export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: req.user.toSafeObject(),
      },
    });
  } catch (error) {
    next(error);
  }
};
