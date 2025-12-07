import axios from "./axios";

// 🔥 Payment Type (Adjust as per your backend)
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

// 🔥 Create Payment Payload
export interface CreatePaymentPayload {
  patientId: string;
  reportId?: string | null;
  amount: number;
  method: string;
  status: string;
  transactionId?: string;
  madeBy?: string; // user id
}

export const paymentsService = {

  /** ✅ ADMIN → Get all payments */
  getAll: async (): Promise<Payment[]> => {
    const res = await axios.get("/payments");
    return res.data.payments ?? res.data;   // handles both formats
  },

  /** ✅ Get payments for one report */
  getByReportId: async (reportId: string): Promise<Payment[]> => {
    const res = await axios.get(`/payments/report/${reportId}`);
    return res.data.payments ?? res.data;
  },

  /** ✅ Create a new payment (Reception/Auto) */
  create: async (data: CreatePaymentPayload): Promise<Payment> => {
    const res = await axios.post("/payments", data);
    return res.data.payment ?? res.data;
  },

  /** ✅ Update payment status (Success/Pending/Failed) */
  updateStatus: async (id: string, status: string): Promise<Payment> => {
    const res = await axios.patch(`/payments/${id}/status`, { status });
    return res.data.payment ?? res.data;
  },

  /** 🚀 DEV MODE ONLY → Creates a fake payment entry */
  fakePayment: async (patientId: string): Promise<Payment> => {
    const res = await axios.post(`/payments/fake/${patientId}`);
    return res.data.payment ?? res.data;
  },
};
