/**
 * StorageProvider Interface Contract
 * Abstract base class that all cloud storage providers (GoogleDriveProvider, OneDriveProvider, etc.) must implement.
 */
export class StorageProvider {
  constructor(account) {
    if (this.constructor === StorageProvider) {
      throw new Error("Cannot instantiate abstract class StorageProvider directly.");
    }
    this.account = account;
  }

  /**
   * Fetch current storage quota details (total, used, available)
   * @returns {Promise<{ total: number, used: number, available: number }>}
   */
  async getStorageInfo() {
    throw new Error("Method 'getStorageInfo()' must be implemented.");
  }

  /**
   * List files in folder or root
   * @param {string} folderId
   * @returns {Promise<Array>}
   */
  async listFiles(folderId = "root") {
    throw new Error("Method 'listFiles()' must be implemented.");
  }

  /**
   * Get single file metadata
   * @param {string} fileId
   * @returns {Promise<object>}
   */
  async getFile(fileId) {
    throw new Error("Method 'getFile()' must be implemented.");
  }

  /**
   * Upload file to provider
   * @param {object} fileStreamOrBuffer
   * @param {object} metadata
   * @returns {Promise<object>}
   */
  async uploadFile(fileStreamOrBuffer, metadata) {
    throw new Error("Method 'uploadFile()' must be implemented.");
  }

  /**
   * Download file from provider
   * @param {string} fileId
   * @returns {Promise<Stream>}
   */
  async downloadFile(fileId) {
    throw new Error("Method 'downloadFile()' must be implemented.");
  }

  /**
   * Delete file from provider
   * @param {string} fileId
   * @returns {Promise<boolean>}
   */
  async deleteFile(fileId) {
    throw new Error("Method 'deleteFile()' must be implemented.");
  }

  /**
   * Rename file or folder
   * @param {string} fileId
   * @param {string} newName
   * @returns {Promise<object>}
   */
  async renameFile(fileId, newName) {
    throw new Error("Method 'renameFile()' must be implemented.");
  }

  /**
   * Create folder in provider
   * @param {string} folderName
   * @param {string} parentId
   * @returns {Promise<object>}
   */
  async createFolder(folderName, parentId = "root") {
    throw new Error("Method 'createFolder()' must be implemented.");
  }

  /**
   * Search files by query
   * @param {string} query
   * @returns {Promise<Array>}
   */
  async searchFiles(query) {
    throw new Error("Method 'searchFiles()' must be implemented.");
  }
}
