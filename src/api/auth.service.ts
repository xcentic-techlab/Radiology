import axios from "./axios";

export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await axios.post("/api/auth/login", credentials);
    return res.data;
  },

  getMe: async () => {
    const res = await axios.get("/api/auth/me");
    return res.data;
  },

  logout: () => {
    localStorage.removeItem("auth-token");
  },
};
