import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Building2, FileText, DollarSign } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { usersService } from "@/api/users.service";
import { departmentsService } from "@/api/departments.service";
import { reportsService } from "@/api/reports.service";
import { paymentsService } from "@/api/payments.service";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDepartments: 0,
    totalReports: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const [users, departments, reports, payments] = await Promise.all([
        usersService.getAll(),
        departmentsService.getAll(),
        reportsService.getAllForAdmin(),
        paymentsService.getAll(),
      ]);

      const revenue = (payments || [])
        .filter((p) => p.status === "success")
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      setStats({
        totalUsers: (users || []).length,
        totalDepartments: (departments || []).length,
        totalReports: (reports || []).length,
        totalRevenue: revenue,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load stats",
        variant: "destructive",
      });
    }
  }

  const CARDS = [
    {
      title: "Total Reports",
      val: stats.totalReports,
      icon: FileText,
      onClick: () => navigate("/admin/reports"),
    },
    {
      title: "Workload (Departments)",
      val: stats.totalDepartments,
      icon: Building2,
      onClick: () => navigate("/admin/workload"),
    },
    {
      title: "Revenue",
      val: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      onClick: () => navigate("/admin/payments"),
    },
    {
      title: "Total Users",
      val: stats.totalUsers,
      icon: Users,
      onClick: () => navigate("/admin/users-filter"),
    },
  ];

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {CARDS.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            onClick={c.onClick}
            className="cursor-pointer"
          >
            <div className="p-5 border rounded-xl shadow bg-white hover:bg-gray-50 transition">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-gray-500 text-sm">{c.title}</span>
                  <div className="text-3xl font-bold mt-2">{c.val}</div>
                </div>
                <c.icon className="w-10 h-10 text-primary" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  );
}
