import dotenv from "dotenv";
import { z } from "zod";

// Load variables from .env file into process.env
dotenv.config();

/**
 * Environment Variable Schema
 * Validates all required environment variables at application startup.
 * If any variable is missing or formatted incorrectly, the app will throw a clear error.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .default("5000"),
  CLIENT_URL: z.string().url().default("http://localhost:5173"),
  MONGODB_URI: z
    .string()
    .min(1, "MONGODB_URI is required to connect to the database"),
  JWT_SECRET: z
    .string()
    .min(10, "JWT_SECRET must be at least 10 characters long")
    .default("super_secret_storiva_jwt_key_change_in_production"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  ENCRYPTION_KEY: z
    .string()
    .min(32, "ENCRYPTION_KEY must be a 32-byte string or hex key")
    .default("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI: z.string().optional(),
});

// Validate process.env against schema
const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Invalid environment variables:", result.error.format());
    process.exit(1);
  }

  return result.data;
};

export const env = parseEnv();
