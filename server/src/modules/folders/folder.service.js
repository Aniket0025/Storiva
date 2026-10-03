import { Folder } from "./folder.model.js";
import { CloudAccount } from "../cloudAccounts/cloudAccount.model.js";
import { AppError } from "../../utils/AppError.js";

export const folderService = {
  /**
   * Create a new folder
   */
  async createFolder(userId, { name, parentId = "root" }) {
    if (!name || name.trim().length === 0) {
      throw new AppError("Folder name is required.", 400, "VALIDATION_ERROR");
    }

    const activeAccount = await CloudAccount.findOne({ userId, status: "ACTIVE" });
    if (!activeAccount) {
      throw new AppError(
        "No connected active cloud account found. Please connect Google Drive first.",
        400,
        "NO_CONNECTED_ACCOUNTS"
      );
    }

    const folder = await Folder.create({
      userId,
      cloudAccountId: activeAccount._id,
      provider: activeAccount.provider,
      providerFolderId: `fold_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      parentId,
    });

    return folder.toSafeObject();
  },

  /**
   * Rename an existing folder
   */
  async renameFolder(userId, folderId, newName) {
    if (!newName || newName.trim().length === 0) {
      throw new AppError("New folder name is required.", 400, "VALIDATION_ERROR");
    }

    const folder = await Folder.findOne({ _id: folderId, userId });
    if (!folder) {
      throw new AppError("Folder not found.", 404, "FOLDER_NOT_FOUND");
    }

    folder.name = newName.trim();
    await folder.save();

    return folder.toSafeObject();
  },

  /**
   * Delete a folder
   */
  async deleteFolder(userId, folderId) {
    const folder = await Folder.findOne({ _id: folderId, userId });
    if (!folder) {
      throw new AppError("Folder not found.", 404, "FOLDER_NOT_FOUND");
    }

    await Folder.deleteOne({ _id: folderId, userId });
    return true;
  },
};
