import axios from './axios';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'super_admin' | 'admin' | 'reception' | 'department_user' | 'patient';
  department?: {
    _id: string;
    name: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: string;
  department?: string;
}

export const usersService = {
  getAll: async (): Promise<User[]> => {
    const response = await axios.get('/api/users');
    return response.data;
  },

  create: async (data: CreateUserDto): Promise<User> => {
    const response = await axios.post('/api/users', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateUserDto>): Promise<User> => {
    const response = await axios.put(`/api/users/${id}`, data);
    return response.data;
  },
};
