import axios from './axios';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: 'super_admin' | 'admin' | 'reception' | 'department_user' | 'patient';
    department?: string;
    isActive: boolean;
  };
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axios.post('/api/auth/login', credentials);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await axios.get('/api/auth/me');
    return response.data;
  },

  logout: () => {
    // Clear token from storage (handled by zustand store)
    localStorage.removeItem('auth-token');
  },
};
