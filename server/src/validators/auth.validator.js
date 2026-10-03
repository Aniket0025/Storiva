import { z } from "zod";

/**
 * Registration Validation Schema
 */
export const registerSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name cannot exceed 50 characters"),
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email address format"),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters long")
    .max(100, "Password cannot exceed 100 characters"),
});

/**
 * Login Validation Schema
 */
export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email address format"),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required"),
});

/**
 * Express middleware helper to validate request body against a Zod schema
 */
export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const firstIssue = result.error.issues[0];
    const errorMessage = firstIssue ? firstIssue.message : "Validation failed";
    
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: errorMessage,
        details: result.error.format(),
      },
    });
  }

  // Replace req.body with parsed & sanitized data
  req.body = result.data;
  next();
};
