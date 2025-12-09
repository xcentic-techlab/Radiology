
import api from "@/api/axios";


export interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  age?: number;
  gender: string;
  contact: { phone: string; email?: string };
  caseType?: string;
  caseDescription?: string;
  paymentStatus: "pending" | "paid";
  status: string;
  assignedDepartment?: string;
  departmentAssignedTo?: string;

selectedTests?: {
  testId: number;
  name: string;
  mrp: number;
  offerRate: number;
  code: string;
   deptid: number;
}[];


  govtId?: {
    idType: string;
    idNumber: string;
    fileUrl?: string;
  };

  clinicalHistory?: string;
  previousInjury?: string;
  previousSurgery?: string;
  patientId?: string;
  referredDoctor?: string;
  address?: string;
  createdAt?: string;
}



export const patientsService = {
  list: async () => {
    const res = await api.get("/patients");
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get(`/patients/${id}`);
    return res.data;
  },
  update: async (id: string, data: any) => {
    const res = await api.put(`/patients/${id}`, data);
    return res.data;
  },
  
  create: async (data: any) => {
    const res = await api.post("/patients", data);
    return res.data;
  },
  updatePayment: async (id:string) => {
    return api.post(`/patients/${id}/payment`);
  },

assignDepartment: async (id, data) => {
  return api.post(`/patients/${id}/assign-department`, data);
},

getDepartmentPatientDetails: async (patientId: string) => {
  const res = await api.get(`/departments/${patientId}/patients`);
  return res.data;
},

updateHistory: async (patientId: string, data: any) => {
  const res = await api.put(`/departments/${patientId}/update-history`, data);
  return res.data;
},

  getByDepartment: async (deptId: string) => {
  const res = await api.get(`/patients/department/${deptId}`);
  return res.data;
},

uploadGovtId: async (id: string, file: File) => {
  const form = new FormData();
  form.append("file", file);

  const res = await api.post(`/patients/${id}/upload-govt-id`, form, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  
  return res.data;
},

delete: async (id: string) => {
  const res = await api.delete(`/patients/${id}`);
  return res.data;
},



};


// export const patientsService = {
//   list: async () => {
//     const res = await axios.get("/api/patients");
//     return res.data;

//   },


//   create: async (data: any) => {
//     const res = await axios.post("/api/patients", data);
//     return res.data;
//   },

//   markPaid: async (id: string) => {
//     const res = await axios.post(`/api/patients/${id}/payment`);
//     return res.data;
//   },

//   assignDepartment: async (id: string, data: { departmentId: string; departmentName: string }) => {
//     const res = await axios.post(`/api/patients/${id}/assign-department`, data);
//     return res.data;
//   },

//   getDeptPatients: async (deptId: string) => {
//     const res = await axios.get(`/api/departments/${deptId}/patients`);
//     return res.data;
//   },
// };
