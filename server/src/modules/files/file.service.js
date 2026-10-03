import { File } from "./file.model.js";
import { Folder } from "../folders/folder.model.js";
import { CloudAccount } from "../cloudAccounts/cloudAccount.model.js";
import { storageManager } from "../storage/storageManager.service.js";
import { AppError } from "../../utils/AppError.js";

/**
 * File & Storage Orchestration Service
 */
export const fileService = {
  /**
   * Upload a new file using MOST_AVAILABLE_SPACE strategy
   * @param {string} userId
   * @param {object} fileParams - { name, size, mimeType, parentId, providerFileId }
   * @returns {Promise<object>} Safe file object
   */
  async uploadFile(userId, { name, size = 0, mimeType = "application/octet-stream", parentId = "root", providerFileId }) {
    // 1. Select eligible account with greatest available capacity
    const winningAccount = await storageManager.selectUploadDestination(userId, size);

    const fileDoc = await File.create({
      userId,
      cloudAccountId: winningAccount._id,
      provider: winningAccount.provider,
      providerFileId: providerFileId || `prov_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name,
      size,
      mimeType,
      parentId,
    });

    // 2. Update storage usage numbers on winning account
    winningAccount.storage.used += size;
    winningAccount.storage.available = Math.max(0, winningAccount.storage.total - winningAccount.storage.used);
    await winningAccount.save();

    return fileDoc.toSafeObject();
  },

  /**
   * List files and folders for a specific parent folder
   * @param {string} userId
   * @param {string} parentId
   */
  async listItems(userId, parentId = "root") {
    const [files, folders] = await Promise.all([
      File.find({ userId, parentId }),
      Folder.find({ userId, parentId }),
    ]);

    return {
      files: files.map((f) => f.toSafeObject()),
      folders: folders.map((fd) => fd.toSafeObject()),
    };
  },

  /**
   * Get single file by ID ensuring ownership
   */
  async getFileById(userId, fileId) {
    const file = await File.findOne({ _id: fileId, userId });
    if (!file) {
      throw new AppError("File not found.", 404, "FILE_NOT_FOUND");
    }
    return file.toSafeObject();
  },

  /**
   * Rename a file
   */
  async renameFile(userId, fileId, newName) {
    if (!newName || newName.trim().length === 0) {
      throw new AppError("New file name is required.", 400, "VALIDATION_ERROR");
    }

    const file = await File.findOne({ _id: fileId, userId });
    if (!file) {
      throw new AppError("File not found.", 404, "FILE_NOT_FOUND");
    }

    file.name = newName.trim();
    await file.save();

    return file.toSafeObject();
  },

  /**
   * Delete a file metadata record and update storage usage
   */
  async deleteFile(userId, fileId) {
    const file = await File.findOne({ _id: fileId, userId });
    if (!file) {
      throw new AppError("File not found.", 404, "FILE_NOT_FOUND");
    }

    await File.deleteOne({ _id: fileId, userId });

    // Reclaim storage capacity on cloud account
    const cloudAccount = await CloudAccount.findById(file.cloudAccountId);
    if (cloudAccount) {
      cloudAccount.storage.used = Math.max(0, cloudAccount.storage.used - file.size);
      cloudAccount.storage.available = Math.max(0, cloudAccount.storage.total - cloudAccount.storage.used);
      await cloudAccount.save();
    }

    return true;
  },

  /**
   * Search files and folders by query string
   */
  async searchItems(userId, query) {
    if (!query || query.trim().length === 0) {
      return { files: [], folders: [] };
    }

    const regex = new RegExp(query.trim(), "i");

    const [files, folders] = await Promise.all([
      File.find({ userId, name: regex }).limit(50),
      Folder.find({ userId, name: regex }).limit(50),
    ]);

    return {
      files: files.map((f) => f.toSafeObject()),
      folders: folders.map((fd) => fd.toSafeObject()),
    };
  },
};
