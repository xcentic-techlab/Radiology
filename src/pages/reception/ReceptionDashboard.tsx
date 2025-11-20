import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { UserCircle, IndianRupee, Building2, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { patientsService } from "@/api/patients.service";
import { departmentsService } from "@/api/departments.service";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const ReceptionDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [selectDeptOpen, setSelectDeptOpen] = useState(false);

  const [departments, setDepartments] = useState([]);

  const [stats, setStats] = useState({
    totalPatients: 0,
    paid: 0,
    pending: 0,
    assigned: 0,
  });

  useEffect(() => {
    fetchStats();
    fetchDepartments();
  }, []);

  /** ⚡ LOAD ALL PATIENTS COUNT/STATS */
  const fetchStats = async () => {
    try {
      const patients = await patientsService.list();

      setStats({
        totalPatients: patients.length,
        paid: patients.filter((p) => p.paymentStatus === "paid").length,
        pending: patients.filter((p) => p.paymentStatus === "pending").length,
        assigned: patients.filter((p) => p.departmentAssignedTo).length,
      });
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

  /** ⚡ LOAD DEPARTMENTS (Admin style) */
  const fetchDepartments = async () => {
    try {
      const data = await departmentsService.getAll();
      setDepartments(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load departments",
        variant: "destructive",
      });
    }
  };

  /** ⚡ NORMAL CARD REDIRECT */
  const redirect = (filter?: string) => {
    if (!filter) return navigate("/reception/patients");
    navigate(`/reception/patients?filter=${filter}`);
  };

  const statCards = [
    {
      title: "Total Patients",
      value: stats.totalPatients,
      icon: UserCircle,
      color: "text-blue-600",
      bg: "bg-blue-100",
      action: () => redirect(),
    },
    {
      title: "Paid Patients",
      value: stats.paid,
      icon: IndianRupee,
      color: "text-green-600",
      bg: "bg-green-100",
      action: () => redirect("paid"),
    },
    {
      title: "Pending Payments",
      value: stats.pending,
      icon: IndianRupee,
      color: "text-yellow-700",
      bg: "bg-yellow-200",
      action: () => redirect("pending"),
    },
    {
      title: "Assigned to Department",
      value: stats.assigned,
      icon: Building2,
      color: "text-purple-600",
      bg: "bg-purple-100",
      action: () => setSelectDeptOpen(true),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Reception Dashboard</h1>
          <p className="text-muted-foreground">
            Manage patient registrations & payments
          </p>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card
                className="cursor-pointer hover:shadow-lg transition"
                onClick={stat.action}
              >
                <CardHeader className="flex items-center justify-between pb-1">
                  <CardTitle className="text-sm text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon
                    className={`h-8 w-8 p-1 rounded ${stat.bg} ${stat.color}`}
                  />
                </CardHeader>

                <CardContent>
                  <div className="text-4xl font-bold">
                    {loading ? "..." : stat.value}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ⚡ DYNAMIC DEPARTMENT SELECT POPUP (ADMIN STYLE) */}
      {selectDeptOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-80 space-y-4 shadow-xl">

            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Select Department</h2>
              <X
                className="w-5 h-5 cursor-pointer hover:text-red-600"
                onClick={() => setSelectDeptOpen(false)}
              />
            </div>

            {departments.length > 0 ? (
              departments.map((dept) => (
                <Button
                  key={dept._id}
                  variant="outline"
                  className="w-full text-left"
                  onClick={() => {
                    setSelectDeptOpen(false);
                    navigate(
                      `/reception/patients?filter=assigned&department=${dept.name.toLowerCase()}`
                    );
                  }}
                >
                  {dept.name}
                </Button>
              ))
            ) : (
              <p className="text-sm text-center text-red-500">
                No departments found.
              </p>
            )}

            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setSelectDeptOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ReceptionDashboard;
