import axios from './axios';

export interface Payment {
  _id: string;
  report: {
    _id: string;
    caseNumber: string;
  };
  amount: number;
  method: 'cash' | 'card' | 'online' | 'insurance';
  status: 'pending' | 'success' | 'failed' | 'refunded';
  transactionId?: string;
  madeBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentDto {
  report: string;
  amount: number;
  method: 'cash' | 'card' | 'online' | 'insurance';
  transactionId?: string;
}

export const paymentsService = {
  getAll: async (): Promise<Payment[]> => {
    const response = await axios.get('/api/payments');
    return response.data;
  },

  getByReportId: async (reportId: string): Promise<Payment[]> => {
    const response = await axios.get(`/api/payments/report/${reportId}`);
    return response.data;
  },

  create: async (data: CreatePaymentDto): Promise<Payment> => {
    const response = await axios.post('/api/payments', data);
    return response.data;
  },

  updateStatus: async (id: string, status: Payment['status']): Promise<Payment> => {
    const response = await axios.patch(`/api/payments/${id}/status`, { status });
    return response.data;
  },
};
