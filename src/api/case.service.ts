import axios from "./axios";

export const casesService = {
  // Get all cases (department wise)
  getByDepartment: async (deptId: string) => {
    const res = await axios.get(`/api/cases/department/${deptId}`);
    return res.data;
  },

  // Single case details
  getById: async (id: string) => {
    const res = await axios.get(`/api/cases/${id}`);
    return res.data;
  },

  // Create case
  create: async (data: any) => {
    const res = await axios.post("/api/cases/create", data);
    return res.data;
  },

  // Assign staff
  assign: async (caseId: string, assignedTo: string) => {
    const res = await axios.put(`/api/cases/${caseId}/assign`, { assignedTo });
    return res.data;
  },

  // Update case
  update: async (caseId: string, data: any) => {
    const res = await axios.put(`/api/cases/${caseId}`, data);
    return res.data;
  },

  // Upload report file
  uploadReport: async (caseId: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);

    const res = await axios.post(`/api/cases/${caseId}/upload-report`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  },

  // Create empty report
  createReport: async (caseId: string) => {
    const res = await axios.post(`/api/reports/create/${caseId}`);
    return res.data;
  },

  deleteCase: async (caseId) => {
  const res = await axios.delete(`/api/cases/${caseId}`);
  return res.data;
}

};
