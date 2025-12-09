import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import RoleGuard from "@/components/auth/RoleGuard";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";
import { authService } from "@/api/auth.service";

import Login from "@/pages/Login";

import AdminDashboard from "@/pages/admin/AdminDashboard";
import Users from "@/pages/admin/Employee";
import Departments from "@/pages/admin/Departments";
import Payments from "@/pages/admin/Payments";
import AdminReportsNew from "@/pages/admin/AdminReportsNew";
import EditReport from "@/pages/admin/EditReport";
import AdminWorkload from "@/pages/admin/AdminWorkload";
import DepartmentWorkload from "@/pages/admin/DepartmentWorkload";
import UsersFilter from "@/pages/admin/UsersFilter";
import DepartmentTests from "@/pages/department/DepartmentTests";
import AdminReports from "@/pages/admin/AdminReports";

import ReceptionDashboard from "@/pages/reception/ReceptionDashboard";
import Patients from "@/pages/reception/Patients";

import DepartmentDashboard from "@/pages/department/DepartmentDashboard";
import Cases from "@/pages/department/Cases";
import CreateReport from "@/pages/department/CreateReport";
import ReportDetail from "@/pages/department/ReportDetail";
import ReportsList from "@/pages/department/ReportsList";
import CreateCase from "@/pages/department/CreateCase";

import PatientReports from "@/pages/patient/PatientReports";
import PatientReportDetail from "@/pages/patient/ReportDetail";

import NotFound from "@/pages/NotFound";

import Layout from "./components/Layout";

const queryClient = new QueryClient();

const RootRedirect = () => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const redirectMap: Record<string, string> = {
    super_admin: "/admin/dashboard",
    admin: "/admin/dashboard",
    reception: "/reception/dashboard",
    department_user: "/department/dashboard",
    patient: "/patient/reports",
  };

  return <Navigate to={redirectMap[user?.role || "patient"]} replace />;
};

const App = () => {
  const { token, setAuth, logout, setLoading } = useAuthStore();

useEffect(() => {
  const loadUser = async () => {

    if (token === null) {
      return; 
    }

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await authService.getMe();
      setAuth(token, res.user);
    } catch (err) {
      logout();
    }
  };

  loadUser();
}, [token]);

  
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter>
        <Routes>

          {/* ROOT */}
          <Route path="/" element={<RootRedirect />} />

          {/* LOGIN */}
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["admin", "super_admin"]}>
                  <Layout>
                    <AdminDashboard />
                  </Layout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/employee"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["admin", "super_admin"]}>
                  <Layout>
                    <Users />
                  </Layout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/departments"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["admin", "super_admin"]}>
                  <Layout>
                    <Departments />
                  </Layout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/payments"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["admin", "super_admin"]}>
                  <Layout>
                    <Payments />
                  </Layout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
<Route
  path="/admin/report/:id"
  element={
    <ProtectedRoute>
      <Layout>
        <ReportDetail />
      </Layout>
    </ProtectedRoute>
  }
/>

          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["admin", "super_admin"]}>
                  <Layout>
                    <AdminReportsNew />
                  </Layout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

            <Route
            path="/admin/reports"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["admin", "super_admin"]}>
                  <AdminReports />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route path="/admin/edit-report/:id" element={<EditReport />} />

          <Route
            path="/admin/workload"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["admin", "super_admin"]}>
                  <Layout>
                    <AdminWorkload />
                  </Layout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/workload/:departmentId"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["admin", "super_admin"]}>
                  <Layout>
                    <DepartmentWorkload />
                  </Layout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users-filter"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["admin", "super_admin"]}>
                  <Layout>
                    <UsersFilter />
                  </Layout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/departments/:id/tests"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["admin", "super_admin"]}>
                  <Layout>
                    <DepartmentTests />
                  </Layout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reception/dashboard"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["reception"]}>
                  <Layout>
                    <ReceptionDashboard />
                  </Layout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reception/patients"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["reception"]}>
                  <Layout>
                    <Patients />
                  </Layout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/department/dashboard"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["department_user"]}>
                  <Layout>
                    <DepartmentDashboard />
                  </Layout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/department/create-reports"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["department_user"]}>
                  <Layout>
                    <Cases />
                  </Layout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/department/report/:id"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["department_user"]}>
                  <Layout>
                    <ReportDetail />
                  </Layout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/department/create-report/:caseId"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["department_user", "admin", "super_admin"]}>
                  <Layout>
                    <CreateReport />
                  </Layout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/department/create-cases"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["department_user"]}>
                  <Layout>
                    <CreateCase />
                  </Layout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/department/reports"
            element={
              <Layout>
                <ReportsList />
              </Layout>
            }
          />
          <Route
            path="/patient/reports"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["patient"]}>
                  <Layout>
                    <PatientReports />
                  </Layout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient/report/:id"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["patient"]}>
                  <Layout>
                    <PatientReportDetail />
                  </Layout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* 404 PAGE */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
