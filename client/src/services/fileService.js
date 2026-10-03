import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/v1",
  withCredentials: true,
});

export const fileService = {
  /**
   * List files and folders for a parent folder
   */
  async listItems(parentId = "root") {
    const res = await api.get(`/files?parentId=${parentId}`);
    return res.data;
  },

  /**
   * Upload file to server
   */
  async uploadFile(formData) {
    const res = await api.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  /**
   * Rename a file
   */
  async renameFile(fileId, newName) {
    const res = await api.patch(`/files/${fileId}`, { name: newName });
    return res.data;
  },

  /**
   * Delete a file
   */
  async deleteFile(fileId) {
    const res = await api.delete(`/files/${fileId}`);
    return res.data;
  },

  /**
   * Create a new folder
   */
  async createFolder(name, parentId = "root") {
    const res = await api.post("/folders", { name, parentId });
    return res.data;
  },

  /**
   * Rename a folder
   */
  async renameFolder(folderId, newName) {
    const res = await api.patch(`/folders/${folderId}`, { name: newName });
    return res.data;
  },

  /**
   * Delete a folder
   */
  async deleteFolder(folderId) {
    const res = await api.delete(`/folders/${folderId}`);
    return res.data;
  },

  /**
   * Search files and folders by query string
   */
  async search(query) {
    const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
    return res.data;
  },
};
