import { create } from "zustand";
import { authService } from "../services/authService";

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,

  /**
   * Check if user has an active session cookie on app load
   */
  checkAuth: async () => {
    set({ loading: true, error: null });
    try {
      const res = await authService.getMe();
      set({ user: res.data.user, isAuthenticated: true, loading: false });
    } catch (err) {
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  /**
   * Login user
   */
  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const res = await authService.login(credentials);
      set({ user: res.data.user, isAuthenticated: true, loading: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error?.message || "Login failed";
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  /**
   * Register user
   */
  register: async (data) => {
    set({ loading: true, error: null });
    try {
      const res = await authService.register(data);
      set({ user: res.data.user, isAuthenticated: true, loading: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error?.message || "Registration failed";
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      await authService.logout();
    } catch (err) {
      // Ignore logout network errors
    } finally {
      set({ user: null, isAuthenticated: false, loading: false, error: null });
    }
  },
}));
