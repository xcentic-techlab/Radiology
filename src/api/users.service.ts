import axios from "./axios";

export const usersService = {

delete: async (id: string) => {
  const res = await axios.delete(`/users/${id}`);
  return res.data;
},
  getAll: async () => {
    const res = await axios.get("/users");
    return res.data;
  },

  create: async (data: any) => {
    const res = await axios.post("/users", data);
    return res.data;
  },

  update: async (id: string, data: any) => {
    const res = await axios.put(`/users/${id}`, data);
    return res.data;
  },

  toggleActive: async (id: string, status: boolean) => {
    const res = await axios.put(`/users/${id}`, {
      isActive: !status,
    });
    return res.data;
  },
};
