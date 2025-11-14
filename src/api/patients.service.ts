import axios from './axios';

export interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: 'male' | 'female' | 'other';
  contact: {
    phone: string;
    email?: string;
    address?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatientDto {
  firstName: string;
  lastName: string;
  dob: string;
  gender: 'male' | 'female' | 'other';
  contact: {
    phone: string;
    email?: string;
    address?: string;
  };
}

export const patientsService = {
  getAll: async (): Promise<Patient[]> => {
    const response = await axios.get('/api/patients');
    return response.data;
  },

  create: async (data: CreatePatientDto): Promise<Patient> => {
    const response = await axios.post('/api/patients', data);
    return response.data;
  },
};
