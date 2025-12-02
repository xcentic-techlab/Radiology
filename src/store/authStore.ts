import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin" | "reception" | "department_user" | "patient";
  department?: {
    _id: string;
    name: string;
  } | null;
  isActive: boolean;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  setLoading: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      loading: true,

      setAuth: (token, user) =>
        set({ token, user, isAuthenticated: true, loading: false }),

      logout: () =>
        set({ token: null, user: null, isAuthenticated: false, loading: false }),

      setLoading: (val) => set({ loading: val }),
    }),
    { name: "auth-storage" }
  )
);
