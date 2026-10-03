import { CloudAccount } from "../cloudAccounts/cloudAccount.model.js";
import { AppError } from "../../utils/AppError.js";

/**
 * Storage Manager Service
 * Manages aggregate storage capacity calculations and account destination selection.
 */
export const storageManager = {
  /**
   * Get aggregate storage summary for a user across all active connected accounts
   * @param {string} userId
   * @returns {Promise<{ total: number, used: number, available: number, connectedAccountsCount: number }>}
   */
  async getAggregateStorage(userId) {
    const accounts = await CloudAccount.find({ userId, status: "ACTIVE" });

    const summary = accounts.reduce(
      (acc, accDoc) => {
        acc.total += accDoc.storage.total || 0;
        acc.used += accDoc.storage.used || 0;
        acc.available += accDoc.storage.available || 0;
        return acc;
      },
      { total: 0, used: 0, available: 0, connectedAccountsCount: accounts.length }
    );

    return summary;
  },

  /**
   * Select best eligible upload destination account using MOST_AVAILABLE_SPACE strategy
   * @param {string} userId
   * @param {number} requiredBytes - Size of file to upload
   * @returns {Promise<CloudAccount>} Winning destination cloud account
   */
  async selectUploadDestination(userId, requiredBytes = 0) {
    const activeAccounts = await CloudAccount.find({
      userId,
      status: "ACTIVE",
    });

    if (activeAccounts.length === 0) {
      throw new AppError(
        "No active cloud accounts connected. Please connect a Google Drive account first.",
        400,
        "NO_CONNECTED_ACCOUNTS"
      );
    }

    // Filter accounts that have enough available capacity
    const eligibleAccounts = activeAccounts.filter(
      (acc) => acc.storage.available >= requiredBytes
    );

    if (eligibleAccounts.length === 0) {
      throw new AppError(
        "No connected storage account has enough available space for this upload.",
        400,
        "STORAGE_LIMIT_EXCEEDED"
      );
    }

    // Strategy: MOST_AVAILABLE_SPACE -> Sort descending by available capacity
    eligibleAccounts.sort((a, b) => b.storage.available - a.storage.available);

    // Return the account with the greatest available capacity
    return eligibleAccounts[0];
  },
};
