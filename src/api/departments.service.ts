import api from "@/api/axios";

export interface DepartmentPayload {
  name: string;
  code: string;
  description?: string;
  isActive?: boolean;   // <-- ADD THIS
}

// 🔥 YEH ADD KARNA ZARURI HAI
export interface Department {
  _id: string;
  name: string;
   deptid: number; 
  code: string;
  description?: string;
  isActive: boolean;
}

export const departmentsService = {
  getAll: async () => {
    const res = await api.get("/departments");

    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.data.departments)) return res.data.departments;

    return [];
  },

  create: async (data: DepartmentPayload) => {
    const res = await api.post("/departments", data);
    return res.data;
  },

  update: async (id: string, data: Partial<DepartmentPayload>) => {
    const res = await api.put(`/departments/${id}`, data);
    return res.data;
  },

  delete: async (id: string) => {
  const res = await api.delete(`/departments/${id}`);
  return res.data;
}

};
