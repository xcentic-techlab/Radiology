import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

const Index = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const redirectMap: Record<string, string> = {
    super_admin: "/admin/dashboard",
    admin: "/admin/dashboard",
    reception: "/reception/dashboard",
    department_user: "/department/dashboard",
    patient: "/patient/reports",
  };

  return (
    <Navigate to={redirectMap[user.role] ?? "/login"} replace />
  );
};

export default Index;
