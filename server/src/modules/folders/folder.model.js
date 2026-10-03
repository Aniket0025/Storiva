import mongoose from "mongoose";

/**
 * Folder Mongoose Schema
 * Stores metadata and provider mapping for logical and cloud folders.
 */
const folderSchema = new mongoose.Schema(
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
    },
    provider: {
      type: String,
      enum: ["google", "onedrive", "dropbox"],
      default: "google",
      required: true,
    },
    providerFolderId: {
      type: String,
      required: [true, "Provider folder ID is required"],
    },
    name: {
      type: String,
      required: [true, "Folder name is required"],
      trim: true,
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

// Compound index for user folder navigation
folderSchema.index({ userId: 1, parentId: 1 });

/**
 * Method to return safe JSON object for API responses
 */
folderSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    userId: this.userId,
    cloudAccountId: this.cloudAccountId,
    provider: this.provider,
    providerFolderId: this.providerFolderId,
    name: this.name,
    parentId: this.parentId,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const Folder = mongoose.model("Folder", folderSchema);
