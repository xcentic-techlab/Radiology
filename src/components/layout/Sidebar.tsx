import { NavLink } from '@/components/NavLink';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const Sidebar = () => {
  const { user, logout } = useAuthStore();

  const getMenuItems = () => {
    const role = user?.role;

    if (role === 'super_admin' || role === 'admin') {
      return [
        { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/admin/users', icon: Users, label: 'Users' },
        { to: '/admin/departments', icon: Building2, label: 'Departments' },
        { to: '/admin/payments', icon: CreditCard, label: 'Payments' },
        { to: '/admin/reports', icon: FileText, label: 'All Reports' }
      ];
    }

    if (role === 'reception') {
      return [
        { to: '/reception/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/reception/patients', icon: UserCircle, label: 'Patients' },
      ];
    }

    if (role === 'department_user') {
      return [
        { to: '/department/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/department/cases', icon: FileSearch, label: 'Create Report' },
        { to: '/department/create-cases', icon: FileText, label: 'Create Cases' }

      ];
    }

    if (role === 'patient') {
      return [
        { to: '/patient/reports', icon: FileText, label: 'My Reports' },
      ];
    }

    return [];
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <Activity className="h-8 w-8 text-sidebar-primary" />
          <div>
            <h1 className="text-xl font-bold text-sidebar-foreground">Radiology Portal</h1>
            <p className="text-xs text-sidebar-foreground/60">Radiology System</p>
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
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </ScrollArea>

      {/* User section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="mb-3">
          <p className="text-sm font-medium text-sidebar-foreground">{user?.name}</p>
          <p className="text-xs text-sidebar-foreground/60">{user?.email}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
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
