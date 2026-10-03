import mongoose from "mongoose";
import { encrypt, decrypt } from "../../utils/crypto.js";

/**
 * CloudAccount Mongoose Schema
 * Stores metadata and encrypted credentials for connected cloud accounts (Google Drive, etc.)
 */
const cloudAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    provider: {
      type: String,
      enum: ["google", "onedrive", "dropbox"],
      default: "google",
      required: true,
    },
    providerAccountId: {
      type: String,
      required: [true, "Provider account ID is required"],
    },
    email: {
      type: String,
      required: [true, "Provider account email is required"],
      lowercase: true,
      trim: true,
    },
    encryptedAccessToken: {
      type: String,
      required: true,
      select: false, // Never return access token by default in queries
    },
    encryptedRefreshToken: {
      type: String,
      required: true,
      select: false, // Never return refresh token by default in queries
    },
    tokenExpiresAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED", "REVOKED"],
      default: "ACTIVE",
    },
    storage: {
      total: { type: Number, default: 0 },
      used: { type: Number, default: 0 },
      available: { type: Number, default: 0 },
    },
    lastStorageSyncAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user cannot connect the exact same provider email multiple times
cloudAccountSchema.index({ userId: 1, provider: 1, email: 1 }, { unique: true });

/**
 * Instance helper method to get decrypted access token
 */
cloudAccountSchema.methods.getDecryptedAccessToken = function () {
  return decrypt(this.encryptedAccessToken);
};

/**
 * Instance helper method to get decrypted refresh token
 */
cloudAccountSchema.methods.getDecryptedRefreshToken = function () {
  return decrypt(this.encryptedRefreshToken);
};

/**
 * Helper to update tokens safely with encryption
 */
cloudAccountSchema.methods.setTokens = function (accessToken, refreshToken, expiresAt) {
  this.encryptedAccessToken = encrypt(accessToken);
  if (refreshToken) {
    this.encryptedRefreshToken = encrypt(refreshToken);
  }
  this.tokenExpiresAt = expiresAt;
  this.status = "ACTIVE";
};

/**
 * Method to return safe JSON object for API responses (strictly strips tokens)
 */
cloudAccountSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    userId: this.userId,
    provider: this.provider,
    providerAccountId: this.providerAccountId,
    email: this.email,
    status: this.status,
    storage: this.storage,
    tokenExpiresAt: this.tokenExpiresAt,
    lastStorageSyncAt: this.lastStorageSyncAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const CloudAccount = mongoose.model("CloudAccount", cloudAccountSchema);
