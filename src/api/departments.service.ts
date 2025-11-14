import axios from './axios';

export interface Department {
  _id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentDto {
  name: string;
  code: string;
  description?: string;
}

export const departmentsService = {
  getAll: async (): Promise<Department[]> => {
    const response = await axios.get('/api/departments');
    return response.data;
  },

  create: async (data: CreateDepartmentDto): Promise<Department> => {
    const response = await axios.post('/api/departments', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateDepartmentDto>): Promise<Department> => {
    const response = await axios.put(`/api/departments/${id}`, data);
    return response.data;
  },
};
