import crypto from "crypto";
import { env } from "../config/env.js";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // Standard IV length for AES-GCM

// Derive 32-byte key buffer from ENCRYPTION_KEY
const getMasterKey = () => {
  return crypto
    .createHash("sha256")
    .update(env.ENCRYPTION_KEY)
    .digest();
};

/**
 * Encrypt sensitive plaintext string using AES-256-GCM
 * @param {string} text Plaintext input string
 * @returns {string} Encrypted string in format "iv:authTag:ciphertext"
 */
export const encrypt = (text) => {
  if (!text) return "";

  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getMasterKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
};

/**
 * Decrypt AES-256-GCM encrypted string
 * @param {string} encryptedPayload String formatted as "iv:authTag:ciphertext"
 * @returns {string} Original plaintext string
 */
export const decrypt = (encryptedPayload) => {
  if (!encryptedPayload) return "";

  const parts = encryptedPayload.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted payload format");
  }

  const [ivHex, authTagHex, encryptedHex] = parts;

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const key = getMasterKey();

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};
