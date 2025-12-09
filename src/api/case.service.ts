import axios from "./axios";

export const casesService = {
  getByDepartment: async (deptId: string) => {
    const res = await axios.get(`/cases/department/${deptId}`);
    return res.data;
  },

  getById: async (id: string) => {
    const res = await axios.get(`/cases/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await axios.post("/cases/create", data);
    return res.data;
  },
  assign: async (caseId: string, assignedTo: string) => {
    const res = await axios.put(`/cases/${caseId}/assign`, { assignedTo });
    return res.data;
  },
  update: async (caseId: string, data: any) => {
    const res = await axios.put(`/cases/${caseId}`, data);
    return res.data;
  },
  uploadReport: async (caseId: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);

    const res = await axios.post(`/cases/${caseId}/upload-report`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  },
  createReport: async (caseId: string) => {
    const res = await axios.post(`/reports/create/${caseId}`);
    return res.data;
  },

  deleteCase: async (caseId) => {
  const res = await axios.delete(`/cases/${caseId}`);
  return res.data;
}

};
