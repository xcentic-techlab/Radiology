export interface Department {
  _id: string;
  name: string;
  code: string;
  isActive: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "super_admin" | "reception" | "department_user" | "patient";
  department?: Department | null;
  isActive: boolean;
}
