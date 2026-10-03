import mongoose from "mongoose";

/**
 * File Mongoose Schema
 * Stores metadata and provider account mapping for uploaded files.
 */
const fileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    cloudAccountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CloudAccount",
      required: [true, "Cloud Account ID is required"],
      index: true,
    },
    provider: {
      type: String,
      enum: ["google", "onedrive", "dropbox"],
      default: "google",
      required: true,
    },
    providerFileId: {
      type: String,
      required: [true, "Provider file ID is required"],
    },
    name: {
      type: String,
      required: [true, "File name is required"],
      trim: true,
    },
    size: {
      type: Number,
      default: 0,
    },
    mimeType: {
      type: String,
      default: "application/octet-stream",
    },
    parentId: {
      type: String,
      default: "root",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to quickly find files for a specific user within a folder
fileSchema.index({ userId: 1, parentId: 1 });

/**
 * Method to return safe JSON object for API responses
 */
fileSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    userId: this.userId,
    cloudAccountId: this.cloudAccountId,
    provider: this.provider,
    providerFileId: this.providerFileId,
    name: this.name,
    size: this.size,
    mimeType: this.mimeType,
    parentId: this.parentId,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const File = mongoose.model("File", fileSchema);
