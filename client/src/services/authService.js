import axios from "axios";

// Configure default Axios instance with credentials (cookies) enabled
const api = axios.create({
  baseURL: "http://localhost:5000/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const authService = {
  /**
   * Register a new user
   */
  async register(data) {
    const response = await api.post("/auth/register", data);
    return response.data;
  },

  /**
   * Login existing user
   */
  async login(credentials) {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  /**
   * Logout user
   */
  async logout() {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  /**
   * Fetch currently authenticated user
   */
  async getMe() {
    const response = await api.get("/auth/me");
    return response.data;
  },
};
