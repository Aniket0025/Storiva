import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const fileService = {
  async listItems(parentId = "root") {
    const res = await api.get(`/files?parentId=${parentId}`);
    return res.data;
  },

  async uploadFile(formData) {
    const res = await api.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  async renameFile(fileId, newName) {
    const res = await api.patch(`/files/${fileId}`, { name: newName });
    return res.data;
  },

  async deleteFile(fileId) {
    const res = await api.delete(`/files/${fileId}`);
    return res.data;
  },

  async createFolder(name, parentId = "root") {
    const res = await api.post("/folders", { name, parentId });
    return res.data;
  },

  async renameFolder(folderId, newName) {
    const res = await api.patch(`/folders/${folderId}`, { name: newName });
    return res.data;
  },

  async deleteFolder(folderId) {
    const res = await api.delete(`/folders/${folderId}`);
    return res.data;
  },

  async search(query) {
    const res = await api.get(`/search?q=${encodeURIComponent(query)}`);
    return res.data;
  },
};
