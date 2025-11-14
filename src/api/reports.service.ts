import axios from './axios';

export interface Report {
  _id: string;
  caseNumber: string;
  patient: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  department: {
    _id: string;
    name: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
  };
  status: 'created' | 'in_progress' | 'report_uploaded' | 'reviewed' | 'approved' | 'cancelled' | 'paid';
  procedure: string;
  scheduledAt: string;
  reportFile?: {
    url: string;
    filename: string;
  };
  findings?: string;
  impression?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

export interface CreateReportDto {
  patient: string;
  department: string;
  assignedTo?: string;
  procedure: string;
  scheduledAt: string;
}

export const reportsService = {
  getAll: async (): Promise<Report[]> => {
    const response = await axios.get('/api/reports');
    return response.data;
  },

  getById: async (id: string): Promise<Report> => {
    const response = await axios.get(`/api/reports/${id}`);
    return response.data;
  },

  create: async (data: CreateReportDto): Promise<Report> => {
    const response = await axios.post('/api/reports', data);
    return response.data;
  },

  uploadReport: async (id: string, file: File): Promise<Report> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`/api/reports/${id}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateStatus: async (id: string, status: Report['status']): Promise<Report> => {
    const response = await axios.patch(`/api/reports/${id}/status`, { status });
    return response.data;
  },

  updateFindings: async (id: string, data: { findings?: string; impression?: string }): Promise<Report> => {
    const response = await axios.patch(`/api/reports/${id}/status`, data);
    return response.data;
  },
};
