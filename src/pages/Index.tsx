import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

const Index = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to appropriate dashboard based on role
  const redirectMap: Record<string, string> = {
    super_admin: '/admin/dashboard',
    admin: '/admin/dashboard',
    reception: '/reception/dashboard',
    department_user: '/department/dashboard',
    patient: '/patient/reports',
  };

  return <Navigate to={redirectMap[user?.role || 'patient'] || '/login'} replace />;
};

export default Index;
