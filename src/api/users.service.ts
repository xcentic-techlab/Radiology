import axios from "./axios";

export const usersService = {
  getAll: async () => {
    const res = await axios.get("/api/users");
    return res.data;
  },

  create: async (data: any) => {
    const res = await axios.post("/api/users", data);
    return res.data;
  },

  update: async (id: string, data: any) => {
    const res = await axios.put(`/api/users/${id}`, data);
    return res.data;
  },

  toggleActive: async (id: string, status: boolean) => {
    const res = await axios.put(`/api/users/${id}`, {
      isActive: !status,
    });
    return res.data;
  },
};
