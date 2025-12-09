import { useState } from "react";
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
  LogOut,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);

  const getMenuItems = () => {
    const role = user?.role;

    if (role === "super_admin" || role === "admin") {
      return [
        { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/admin/employee", icon: Users, label: "Employee" },
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
        { to: "/department/create-reports", icon: FileSearch, label: "Create Report" },
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
    <>
      <div className="md:hidden fixed top-0 left-0 w-full bg-gray-900 text-white px-4 py-3 flex items-center justify-between z-50">
        <h1 className="text-lg font-semibold">Star Radiology</h1>
        <button onClick={() => setOpen(true)}>
          <Menu className="h-7 w-7" />
        </button>
      </div>
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 flex flex-col border-r",
          "bg-gradient-to-b from-[#111827] to-[#1f2937] text-white shadow-2xl",
          "transition-transform duration-300 z-50",
          open ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0 md:static"
        )}
      >
        <div className="p-6 border-b border-white/10 flex flex-col items-center text-center">
          <img
            src="/images/starradiology_logo-1.png"
            alt="logo"
            className="h-14 mb-3"
          />
          <h1 className="text-lg font-semibold">Star Radiology</h1>
          <p className="text-xs text-blue-200">Quality You Can Trust</p>
        </div>
        <ScrollArea className="flex-1 py-4">
          <nav className="space-y-1 px-3">
            {menuItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-md transition-all",
                  "hover:bg-white/10 hover:text-blue-300"
                )}
                activeClassName="bg-white/10 text-blue-400 font-semibold"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </ScrollArea>
        <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-gray-300">{user?.email}</p>

          <Button
            variant="secondary"
            size="sm"
            className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
