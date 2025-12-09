import axios from "./axios";
export interface Payment {
  _id: string;
  patientId: string;
  reportId: string | null;
  amount: number;
  method: "cash" | "upi" | "card" | "razorpay" | string;
  status: "success" | "pending" | "failed";
  transactionId?: string;
  madeBy: { _id: string; name: string };
  createdAt: string;
  updatedAt: string;
  report:string;
  caseNumber:number;
}
export interface CreatePaymentPayload {
  patientId: string;
  reportId?: string | null;
  amount: number;
  method: string;
  status: string;
  transactionId?: string;
  madeBy?: string; 
}

export const paymentsService = {
  getAll: async (): Promise<Payment[]> => {
    const res = await axios.get("/payments");
    return res.data.payments ?? res.data;
  },

  getByReportId: async (reportId: string): Promise<Payment[]> => {
    const res = await axios.get(`/payments/report/${reportId}`);
    return res.data.payments ?? res.data;
  },

  create: async (data: CreatePaymentPayload): Promise<Payment> => {
    const res = await axios.post("/payments", data);
    return res.data.payment ?? res.data;
  },
  updateStatus: async (id: string, status: string): Promise<Payment> => {
    const res = await axios.patch(`/payments/${id}/status`, { status });
    return res.data.payment ?? res.data;
  },

  fakePayment: async (patientId: string): Promise<Payment> => {
    const res = await axios.post(`/payments/fake/${patientId}`);
    return res.data.payment ?? res.data;
  },
};
