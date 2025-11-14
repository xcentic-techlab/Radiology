import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import RoleGuard from "@/components/auth/RoleGuard";
import { useAuthStore } from "@/store/authStore";

// Auth
import Login from "@/pages/Login";

// Admin
import AdminDashboard from "@/pages/admin/AdminDashboard";
import Users from "@/pages/admin/Users";
import Departments from "@/pages/admin/Departments";
import Payments from "@/pages/admin/Payments";

// Reception
import ReceptionDashboard from "@/pages/reception/ReceptionDashboard";
import Patients from "@/pages/reception/Patients";
import CreateReport from "@/pages/reception/CreateReport";

// Department
import DepartmentDashboard from "@/pages/department/DepartmentDashboard";
import Cases from "@/pages/department/Cases";
import ReportDetail from "@/pages/department/ReportDetail";

// Patient
import PatientReports from "@/pages/patient/PatientReports";
import PatientReportDetail from "@/pages/patient/ReportDetail";

import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const RootRedirect = () => {
  const { user, isAuthenticated } = useAuthStore();

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['super_admin', 'admin']}>
                  <AdminDashboard />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['super_admin', 'admin']}>
                  <Users />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/departments"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['super_admin', 'admin']}>
                  <Departments />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['super_admin', 'admin']}>
                  <Payments />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* Reception Routes */}
          <Route
            path="/reception/dashboard"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['reception']}>
                  <ReceptionDashboard />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reception/patients"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['reception']}>
                  <Patients />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reception/create-report"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['reception']}>
                  <CreateReport />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* Department Routes */}
          <Route
            path="/department/dashboard"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['department_user']}>
                  <DepartmentDashboard />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/department/cases"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['department_user']}>
                  <Cases />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/department/report/:id"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['department_user']}>
                  <ReportDetail />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* Patient Routes */}
          <Route
            path="/patient/reports"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['patient']}>
                  <PatientReports />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/report/:id"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={['patient']}>
                  <PatientReportDetail />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
