import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const cloudAccountService = {
  async getAccounts() {
    const res = await api.get("/cloud-accounts");
    return res.data;
  },

  async initiateGoogleConnect() {
    const res = await api.post("/cloud-accounts/google/connect");
    return res.data;
  },

  async disconnectAccount(accountId) {
    const res = await api.delete(`/cloud-accounts/${accountId}`);
    return res.data;
  },
};
