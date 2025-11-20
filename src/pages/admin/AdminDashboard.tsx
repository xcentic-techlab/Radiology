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
  {/* HEADER */}
  <div className="mb-8 text-center">
  <h1 className="text-4xl font-bold tracking-tight">
    Admin Dashboard
  </h1>
  <p className="text-muted-foreground mt-1">
    Overview of system metrics and performance
  </p>
</div>


  {/* CARDS GRID */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {CARDS.map((c, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.07 }}
        whileHover={{ scale: 1.03 }}
        onClick={c.onClick}
        className="cursor-pointer"
      >
        <div
          className="
            p-6 rounded-2xl shadow-lg border 
            bg-white/60 backdrop-blur-md 
            hover:bg-white/80 hover:shadow-xl 
            transition-all duration-200
          "
        >
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-gray-600">{c.title}</span>
              <div className="text-4xl font-bold mt-2 text-gray-900">
                {c.val}
              </div>
            </div>

            <div
              className="
                p-3 rounded-xl bg-primary/10 
                text-primary shadow-sm
              "
            >
              <c.icon className="w-8 h-8" />
            </div>
          </div>
        </div>
      </motion.div>
    ))}
  </div>
</DashboardLayout>

  );
}
