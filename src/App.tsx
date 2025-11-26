import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import RoleGuard from "@/components/auth/RoleGuard";
import { useAuthStore } from "@/store/authStore";
import ReportsList from "./pages/department/ReportsList"
import CreateCase from "./pages/department/CreateCase"
import DepartmentTests from "../src/pages/department/DepartmentTests"
/* ===================== AUTH ===================== */
import Login from "@/pages/Login";

/* ===================== ADMIN ===================== */
import AdminDashboard from "@/pages/admin/AdminDashboard";
import Users from "@/pages/admin/Employee";
import Departments from "@/pages/admin/Departments";
import Payments from "@/pages/admin/Payments";
import AdminReports from "@/pages/admin/AdminReports";
import EditReport from "@/pages/admin/EditReport";
import AdminWorkload from "../src/pages/admin/AdminWorkload";
import DepartmentWorkload from "@/pages/admin/DepartmentWorkload";
import UsersFilter from "@/pages/admin/UsersFilter";
import AdminReportsNew from "@/pages/admin/AdminReportsNew";


/* ===================== RECEPTION ===================== */
import ReceptionDashboard from "@/pages/reception/ReceptionDashboard";
import Patients from "@/pages/reception/Patients";

/* ===================== SHARED ===================== */
import CreateReport from "@/pages/department/CreateReport";

/* ===================== DEPARTMENT ===================== */
import DepartmentDashboard from "@/pages/department/DepartmentDashboard";
import Cases from "@/pages/department/Cases";
import ReportDetail from "@/pages/department/ReportDetail";

/* ===================== PATIENT ===================== */
import PatientReports from "@/pages/patient/PatientReports";
import PatientReportDetail from "@/pages/patient/ReportDetail";

/* ===================== MISC ===================== */
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

/* ===================== AUTH REDIRECT LOGIC ===================== */
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* ROOT ============================= */}
          <Route path="/" element={<RootRedirect />} />

          {/* LOGIN =========================== */}
          <Route path="/login" element={<Login />} />

          {/* ===================== ADMIN ROUTES ===================== */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["admin", "super_admin"]}>
                  <AdminDashboard />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/employee"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["admin", "super_admin"]}>
                  <Users />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/departments"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["admin", "super_admin"]}>
                  <Departments />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
  path="/admin/report/:id"
  element={<ReportDetail />}
/>

<Route
  path="/admin/workload"
  element={
    <ProtectedRoute>
      <RoleGuard allowedRoles={["admin","super_admin"]}>
        <AdminWorkload />
      </RoleGuard>
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/workload/:departmentId"
  element={
    <ProtectedRoute>
      <RoleGuard allowedRoles={["admin","super_admin"]}>
        <DepartmentWorkload />
      </RoleGuard>
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/users-filter"
  element={
    <ProtectedRoute>
      <RoleGuard allowedRoles={["admin","super_admin"]}>
        <UsersFilter />
      </RoleGuard>
    </ProtectedRoute>
  }
/>

<Route path="/admin/departments/:id/tests" element={<DepartmentTests />} />


{/* Replace existing admin reports route or add another path */}
<Route
  path="/admin/reports"
  element={
    <ProtectedRoute>
      <RoleGuard allowedRoles={["admin","super_admin"]}>
        <AdminReportsNew />
      </RoleGuard>
    </ProtectedRoute>
  }
/>

          <Route
            path="/admin/payments"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["admin", "super_admin"]}>
                  <Payments />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
  path="/department/reports"
  element={<ReportsList />}
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

          <Route
            path="/admin/edit-report/:id"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["admin", "super_admin"]}>
                  <EditReport />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* ===================== RECEPTION ===================== */}
          <Route
            path="/reception/dashboard"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["reception"]}>
                  <ReceptionDashboard />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reception/patients"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["reception"]}>
                  <Patients />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reception/create-report"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["reception"]}>
                  <CreateReport />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* ===================== DEPARTMENT ===================== */}
          <Route
            path="/department/dashboard"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["department_user"]}>
                  <DepartmentDashboard />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/department/create-reports"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["department_user"]}>
                  <Cases />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/department/report/:id"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["department_user"]}>
                  <ReportDetail />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
  path="/department/create-report/:caseId"
  element={
    <ProtectedRoute>
      <RoleGuard allowedRoles={["department_user", "admin", "super_admin"]}>
        <CreateReport />
      </RoleGuard>
    </ProtectedRoute>
  }
/>

<Route
  path="/department/create-cases"
  element={
    <ProtectedRoute>
      <RoleGuard allowedRoles={["department_user"]}>
        <CreateCase />
      </RoleGuard>
    </ProtectedRoute>
  }
/>



          {/* ===================== PATIENT ===================== */}
          <Route
            path="/patient/reports"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["patient"]}>
                  <PatientReports />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient/report/:id"
            element={
              <ProtectedRoute>
                <RoleGuard allowedRoles={["patient"]}>
                  <PatientReportDetail />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* 404 ======================= */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
