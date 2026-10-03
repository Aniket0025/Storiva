import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const authService = {
  async register(data) {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  async login(credentials) {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  async logout() {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  async getMe() {
    const response = await api.get("/auth/me");
    return response.data;
  },
};
