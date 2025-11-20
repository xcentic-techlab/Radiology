import { NavLink } from "@/components/NavLink";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  CreditCard,
  UserCircle,
  FileSearch,
  Activity,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const Sidebar = () => {
  const { user, logout } = useAuthStore();

  const getMenuItems = () => {
    const role = user?.role;

    if (role === "super_admin" || role === "admin") {
      return [
        { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/admin/users", icon: Users, label: "Users" },
        { to: "/admin/departments", icon: Building2, label: "Departments" },
        { to: "/admin/payments", icon: CreditCard, label: "Payments" },
        { to: "/admin/reports", icon: FileText, label: "All Reports" },
      ];
    }

    if (role === "reception") {
      return [
        { to: "/reception/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/reception/patients", icon: UserCircle, label: "Patients" },
      ];
    }

    if (role === "department_user") {
      return [
        { to: "/department/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/department/cases", icon: FileSearch, label: "Create Report" },
        { to: "/department/create-cases", icon: FileText, label: "Create Cases" },
      ];
    }

    if (role === "patient") {
      return [{ to: "/patient/reports", icon: FileText, label: "My Reports" }];
    }

    return [];
  };

  const menuItems = getMenuItems();

  return (
    <aside
      className="w-64 h-screen flex flex-col border-r 
      bg-gradient-to-b from-[#111827] to-[#1f2937] 
      text-white shadow-2xl"
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-wide">Radiology Portal</h1>
            <p className="text-xs text-gray-300">Radiology System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-3">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-md transition-all",
                "hover:bg-white/10 hover:text-blue-300"
              )}
              activeClassName="bg-white/10 text-blue-400 font-semibold shadow-inner"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </ScrollArea>

      {/* User Section */}
      <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur">
        <div className="mb-3">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-gray-300">{user?.email}</p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          className="w-full justify-start gap-2 bg-red-600 hover:bg-red-700 text-white"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
