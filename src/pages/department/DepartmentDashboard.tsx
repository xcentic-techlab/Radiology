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
    <div className="space-y-10">

      {/* HEADER SECTION */}
<div className="space-y-3">

  {/* CENTER HEADING */}
  <div className="text-center">
    <h1 className="text-4xl font-bold text-slate-800 tracking-tight">
      Department Dashboard
    </h1>

    <p className="text-muted-foreground text-base">
      Manage and track all your department reports
    </p>
  </div>

  {/* BADGE — BELOW HEADING, RIGHT SIDE */}
  <div className="flex justify-end">
    <div
      className="px-5 py-2 rounded-xl 
                 bg-white/60 backdrop-blur-md 
                 border border-white/40 shadow-md"
    >
      <span className="text-sm font-semibold text-primary">
        Department:{" "}
        <span className="font-bold capitalize">
          {user?.department?.name || "Not Assigned"}
        </span>
      </span>
    </div>
  </div>

</div>



      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15 }}
          >
            <Card
              onClick={() => navigate(stat.route)}
              className="rounded-2xl cursor-pointer 
                         bg-white/50 backdrop-blur-md 
                         border border-white/40 shadow-lg 
                         hover:shadow-xl hover:scale-[1.02]
                         transition-all duration-300"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>

                {/* Icon bubble */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`p-2 rounded-full ${stat.color} shadow-sm`}
                >
                  <stat.icon className="h-6 w-6" />
                </motion.div>
              </CardHeader>

              <CardContent>
                <div className="text-4xl font-extrabold tracking-tight">
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
