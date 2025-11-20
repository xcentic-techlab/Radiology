import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { reportsService } from "@/api/reports.service";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const DepartmentDashboard = () => {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      if (!user?.department?._id) {
        setLoading(false);
        return;
      }

      const reports = await reportsService.getByDepartment(
        user.department._id
      );

 const approved = reports.filter(
  (r) => r.status?.toLowerCase() === "approved"
).length;

const pending = reports.filter(
  (r) => r.status?.toLowerCase() !== "approved"
).length;



      setStats({ pending, approved });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard stats",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Pending Reports",
      value: stats.pending,
      icon: Clock,
      color: "bg-yellow-100 text-yellow-600",
      route: "/department/reports?status=pending",
    },
    {
      title: "Approved Reports",
      value: stats.approved,
      icon: CheckCircle,
      color: "bg-green-100 text-green-600",
      route: "/department/reports?status=approved",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* ⭐ Top Header Section With Department Name */}
        <div>
          <h1 className="text-3xl font-bold">Department Dashboard</h1>

          <p className="text-muted-foreground mt-1">
            Manage and track all your department reports
          </p>

          <div className="text-lg font-semibold text-primary mt-2">
            Department:{" "}
            <span className="font-bold">
              {user?.department?.name || "Not Assigned"}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                onClick={() => navigate(stat.route)}
                className="rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-border/40"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>

                  <div className={`p-2 rounded-full ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="text-3xl font-bold">
                    {loading ? "..." : stat.value}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Click to view details
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DepartmentDashboard;
