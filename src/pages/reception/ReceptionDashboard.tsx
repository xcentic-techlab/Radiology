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

  /** LOAD STATS */
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

  /** LOAD DEPARTMENTS */
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

  /** REDIRECT HANDLER */
  const redirect = (filter?: string) => {
    if (!filter) return navigate("/reception/patients");
    navigate(`/reception/patients?filter=${filter}`);
  };


  /** SOFT MEDICAL COLOR ICONS */
  const iconColor = "text-blue-500"; // Soft, premium hospital blue


  const statCards = [
    {
      title: "Total Patients",
      value: stats.totalPatients,
      icon: UserCircle,
      action: () => redirect(),
      iconColor,
    },
    {
      title: "Paid Patients",
      value: stats.paid,
      icon: IndianRupee,
      action: () => redirect("paid"),
      iconColor: "text-emerald-600",
    },
    {
      title: "Pending Payments",
      value: stats.pending,
      icon: IndianRupee,
      action: () => redirect("pending"),
      iconColor: "text-amber-600",
    },
    {
      title: "Assigned to Department",
      value: stats.assigned,
      icon: Building2,
      action: () => setSelectDeptOpen(true),
      iconColor: "text-purple-600",
    },
  ];


  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* HEADER */}
<div className="text-center">
  <h1 className="text-4xl font-bold text-slate-800 tracking-tight">
    Reception Dashboard
  </h1>
  <p className="text-slate-500">
    Manage patient registrations & payments
  </p>
</div>


        {/* STATS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: i * 0.08,
                duration: 0.4,
                type: "spring",
                damping: 14,
              }}
            >
              <Card
                onClick={stat.action}
                className="
                  cursor-pointer 
                  border border-slate-300 
                  bg-white 
                  hover:shadow-md 
                  rounded-xl 
                  transition-all 
                  p-2
                "
              >
                <CardHeader className="flex items-center justify-between pb-1">
                  <CardTitle className="text-sm text-slate-700 font-medium">
                    {stat.title}
                  </CardTitle>

                  <stat.icon className={`h-7 w-7 ${stat.iconColor}`} />
                </CardHeader>

                <CardContent>
                  <div className="text-3xl font-bold text-slate-800">
                    {loading ? "…" : stat.value}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* SELECT DEPARTMENT POPUP (PREMIUM ROUNDED + RESPONSIVE) */}
      {selectDeptOpen && (
        <motion.div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 140, damping: 17 }}
            className="
              bg-white 
              w-full max-w-md 
              border border-slate-200 
              rounded-2xl 
              shadow-xl 
              p-6 
              space-y-4
            "
          >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold text-slate-800">
                Select Department
              </h2>
              <X
                className="w-6 h-6 cursor-pointer text-slate-700 hover:text-red-600 transition"
                onClick={() => setSelectDeptOpen(false)}
              />
            </div>

            {/* LIST */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {departments.length > 0 ? (
                departments.map((dept) => (
                  <button
                    key={dept._id}
                    className="
                      w-full text-left 
                      px-4 py-2.5 
                      rounded-lg 
                      border border-slate-300 
                      text-slate-700 
                      hover:bg-slate-100 
                      transition
                    "
                    onClick={() => {
                      setSelectDeptOpen(false);
                      navigate(
                        `/reception/patients?filter=assigned&department=${dept.name.toLowerCase()}`
                      );
                    }}
                  >
                    {dept.name}
                  </button>
                ))
              ) : (
                <p className="text-sm text-center text-red-500">
                  No departments found.
                </p>
              )}
            </div>

            {/* CANCEL */}
            <Button
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 mt-2 rounded-lg"
              onClick={() => setSelectDeptOpen(false)}
            >
              Cancel
            </Button>
          </motion.div>
        </motion.div>
      )}
    </DashboardLayout>
  );
};

export default ReceptionDashboard;
