import { google } from "googleapis";
import { StorageProvider } from "../interfaces/StorageProvider.js";
import { env } from "../../config/env.js";

/**
 * GoogleDriveProvider Implementation
 * Interacts with Google Drive API v3 behind Storiva's StorageProvider abstraction interface.
 */
export class GoogleDriveProvider extends StorageProvider {
  /**
   * @param {object} cloudAccountDoc - CloudAccount Mongoose document
   */
  constructor(cloudAccountDoc) {
    super(cloudAccountDoc);

    this.oauth2Client = new google.auth.OAuth2(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_REDIRECT_URI
    );

    // Retrieve decrypted tokens
    const accessToken = cloudAccountDoc.getDecryptedAccessToken();
    const refreshToken = cloudAccountDoc.getDecryptedRefreshToken();

    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    this.drive = google.drive({ version: "v3", auth: this.oauth2Client });
  }

  /**
   * Ensure access token is valid, refreshing if expired
   */
  async ensureValidToken() {
    if (this.account.tokenExpiresAt && new Date(this.account.tokenExpiresAt) <= new Date()) {
      try {
        const { credentials } = await this.oauth2Client.refreshAccessToken();
        const expiresAt = new Date(Date.now() + (credentials.expiry_date || 3600 * 1000));
        
        // Update account document in DB
        this.account.setTokens(credentials.access_token, credentials.refresh_token, expiresAt);
        await this.account.save();
      } catch (error) {
        this.account.status = "EXPIRED";
        await this.account.save();
        throw new Error(`Google OAuth token refresh failed: ${error.message}`);
      }
    }
  }

  /**
   * Get storage quota details from Google Drive
   */
  async getStorageInfo() {
    await this.ensureValidToken();

    const response = await this.drive.about.get({
      fields: "storageQuota, user",
    });

    const quota = response.data.storageQuota || {};
    const limit = parseInt(quota.limit || "0", 10);
    const usage = parseInt(quota.usage || "0", 10);
    const available = Math.max(0, limit - usage);

    // Update account DB record
    this.account.storage = { total: limit, used: usage, available };
    this.account.lastStorageSyncAt = new Date();
    await this.account.save();

    return { total: limit, used: usage, available };
  }

  /**
   * List files in a parent folder
   */
  async listFiles(folderId = "root") {
    await this.ensureValidToken();

    const response = await this.drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "files(id, name, mimeType, size, createdTime, modifiedTime)",
      pageSize: 100,
    });

    return response.data.files || [];
  }

  /**
   * Get metadata for a single file
   */
  async getFile(fileId) {
    await this.ensureValidToken();

    const response = await this.drive.files.get({
      fileId,
      fields: "id, name, mimeType, size, createdTime, modifiedTime",
    });

    return response.data;
  }

  /**
   * Create a folder
   */
  async createFolder(folderName, parentId = "root") {
    await this.ensureValidToken();

    const response = await this.drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
        parents: [parentId],
      },
      fields: "id, name, mimeType, createdTime",
    });

    return response.data;
  }

  /**
   * Rename a file or folder
   */
  async renameFile(fileId, newName) {
    await this.ensureValidToken();

    const response = await this.drive.files.update({
      fileId,
      requestBody: {
        name: newName,
      },
      fields: "id, name, mimeType, modifiedTime",
    });

    return response.data;
  }

  /**
   * Delete a file or folder
   */
  async deleteFile(fileId) {
    await this.ensureValidToken();

    await this.drive.files.delete({ fileId });
    return true;
  }

  /**
   * Search files matching query string
   */
  async searchFiles(query) {
    await this.ensureValidToken();

    const sanitizedQuery = query.replace(/'/g, "\\'");
    const response = await this.drive.files.list({
      q: `name contains '${sanitizedQuery}' and trashed = false`,
      fields: "files(id, name, mimeType, size, createdTime, modifiedTime)",
      pageSize: 50,
    });

    return response.data.files || [];
  }
}
