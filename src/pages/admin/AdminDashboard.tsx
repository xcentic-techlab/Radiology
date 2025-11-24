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
import { X } from "lucide-react";


export default function AdminDashboard() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDepartments: 0,
    totalReports: 0,
    totalRevenue: 0,
  });

  const [departments, setDepartments] = useState([]);
  const [revenueModal, setRevenueModal] = useState(false);

  const [openDeptModal, setOpenDeptModal] = useState(false);

  useEffect(() => {
    loadStats();
    loadDepartments();
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
        totalUsers: users.length,
        totalDepartments: departments.length,
        totalReports: reports.length,
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

  async function loadDepartments() {
    try {
      const res = await departmentsService.getAll();
      setDepartments(res);
    } catch (err) {
      console.log("Failed to load departments");
    }
  }

  const CARDS = [
    {
      title: "Total Reports",
      subtitle: "View →",
      value: stats.totalReports,
      icon: FileText,
      onClick: () => setOpenDeptModal(true),
    },
    {
      title: "Workload (Departments)",
      subtitle: "View →",
      value: stats.totalDepartments,
      icon: Building2,
      onClick: () => navigate("/admin/workload"),
    },
{
  title: "Revenue",
  subtitle: "View →",
  value: `₹${stats.totalRevenue.toLocaleString()}`,
  icon: DollarSign,
  onClick: () => setRevenueModal(true),
},
    {
      title: "Total Employee",
      subtitle: "View →",
      value: stats.totalUsers,
      icon: Users,
      onClick: () => navigate("/admin/users-filter"),
    },
  ];


  

  return (
    <DashboardLayout>

      {/* HEADER */}
      <div className="text-center space-y-2 mt-6">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground text-base">
          Overview of system metrics and performance
        </p>
      </div>

      {/* UPDATED UI CARDS (Screenshot style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">

        {CARDS.map((c, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            onClick={c.onClick}
            className="cursor-pointer"
          >
            <div className="
              bg-blue-50 border border-blue-100 
              rounded-2xl p-6 shadow-sm 
              hover:bg-[#e8f1ff] hover:shadow-xl 
              transition-all duration-200
              flex justify-between items-start
            ">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">{c.title}</h2>
               <p className="text-3xl font-bold text-gray-900 mt-3">{c.value}</p>


                <button className="text-blue-600 mt-4 hover:underline text-sm font-medium">
                  {c.subtitle}
                </button>
              </div>

              <c.icon className="w-8 h-8 text-blue-600" />
            </div>
          </motion.div>
        ))}

      </div>

      {/* DEPARTMENT SELECT MODAL */}
      {openDeptModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-6 w-[360px] shadow-xl relative">

      {/* CLOSE ICON */}
      <button
        onClick={() => setOpenDeptModal(false)}
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-200"
      >
        <X className="w-5 h-5 text-gray-600" />
      </button>

      <h2 className="text-xl font-bold text-gray-800">Department Reports</h2>

      <div className="mt-4 space-y-3">
        {departments.map((d) => (
          <button
            key={d._id}
            onClick={() => {
              setOpenDeptModal(false);
              navigate(`/admin/reports?dept=${d._id}`);
            }}
            className="w-full text-left px-4 py-2 rounded-lg border hover:bg-gray-100 transition"
          >
            {d.name}
          </button>
        ))}
      </div>

      <div className="flex justify-end mt-5">
        <button
          onClick={() => setOpenDeptModal(false)}
          className="px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700"
        >
          Cancel
        </button>
      </div>

    </div>
  </div>
)}



{revenueModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-6 w-[360px] shadow-xl relative">

      {/* CLOSE ICON */}
      <button
        onClick={() => setRevenueModal(false)}
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-200"
      >
        <X className="w-5 h-5 text-gray-600" />
      </button>

      <h2 className="text-xl font-bold text-gray-800 text-center">
        Choose Payment Status
      </h2>

      <div className="mt-5 space-y-3">

        <button
          onClick={() => {
            setRevenueModal(false);
            navigate("/admin/payments?status=pending");
          }}
          className="w-full px-4 py-3 text-left rounded-lg border hover:bg-gray-100 transition"
        >
          Pending Payments
        </button>

        <button
          onClick={() => {
            setRevenueModal(false);
            navigate("/admin/payments?status=success");
          }}
          className="w-full px-4 py-3 text-left rounded-lg border hover:bg-gray-100 transition"
        >
          Successful Payments
        </button>

      </div>

      <div className="flex justify-end mt-5">
        <button
          onClick={() => setRevenueModal(false)}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
        >
          Cancel
        </button>
      </div>

    </div>
  </div>
)}


    </DashboardLayout>
  );
}
