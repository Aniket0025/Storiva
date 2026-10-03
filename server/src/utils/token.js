import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

/**
 * Generate a JWT token for an authenticated user
 * @param {string} userId
 * @returns {string} Signed JWT token string
 */
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

/**
 * Verify and decode a JWT token
 * @param {string} token
 * @returns {object} Decoded token payload
 */
export const verifyToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};

/**
 * Set authentication cookie on Express response
 * @param {object} res - Express response object
 * @param {string} token - Signed JWT token
 */
export const setAuthCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true, // Prevents client-side JS from reading cookie (protects against XSS)
    secure: env.NODE_ENV === "production", // Only send over HTTPS in production
    sameSite: "lax", // Protects against CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });
};

/**
 * Clear authentication cookie from Express response
 * @param {object} res - Express response object
 */
export const clearAuthCookie = (res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });
};
