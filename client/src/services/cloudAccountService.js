import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/v1",
  withCredentials: true,
});

export const cloudAccountService = {
  /**
   * Fetch connected cloud accounts for logged-in user
   */
  async getAccounts() {
    const res = await api.get("/cloud-accounts");
    return res.data;
  },

  /**
   * Get Google OAuth authorization URL
   */
  async initiateGoogleConnect() {
    const res = await api.post("/cloud-accounts/google/connect");
    return res.data;
  },

  /**
   * Disconnect a connected cloud account
   */
  async disconnectAccount(accountId) {
    const res = await api.delete(`/cloud-accounts/${accountId}`);
    return res.data;
  },
};
