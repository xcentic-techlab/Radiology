import axios from "./axios";

export const reportsService = {
  list: async () => {
    const res = await axios.get("/reports");
    return res.data;
  },

  getAllForAdmin: async () => {
    const res = await axios.get("/reports/department/all");
    return res.data;
  },
  getAll: async () => {
  const res = await axios.get("/reports");
  return res.data;
},


  getByDepartment: async (deptId: string) => {
    const res = await axios.get(`/reports/department/${deptId}`);
    return res.data;
  },


  getDepartmentCases: async (deptId: string) => {
    const res = await axios.get(`/reports/department/${deptId}`);
    return res.data;
  },

  getById: async (id: string) => {
    const res = await axios.get(`/reports/${id}`);
    return res.data;
  },

  create: async (data: any) => {
    const res = await axios.post("/reports/create", data);
    return res.data;
  },

uploadFile: async (reportId: string, file: File) => {
  const fd = new FormData();
  fd.append("file", file);

  const res = await axios.post(`/reports/upload/${reportId}`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
},



  update: async (id: string, data: any) => {
    const res = await axios.put(`/reports/${id}`, data);
    return res.data;
  },

  approve: async (id: string) => {
    const res = await axios.post(`/reports/${id}/approve`);
    return res.data;
  },

    deleteReport: async (reportId: string) => {
    const res = await axios.delete(`/reports/${reportId}`);
    return res.data;
  }
};
