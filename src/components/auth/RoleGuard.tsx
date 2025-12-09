import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
}

const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const { user } = useAuthStore();

  if (!user || !allowedRoles.includes(user.role)) {
    const redirectMap: Record<string, string> = {
      super_admin: '/admin/dashboard',
      admin: '/admin/dashboard',
      reception: '/reception/dashboard',
      department_user: '/department/dashboard',
      patient: '/patient/reports',
    };

    return <Navigate to={redirectMap[user?.role || 'patient'] || '/login'} replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
