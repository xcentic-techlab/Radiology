import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { UserCircle, Building2, X, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { patientsService } from "@/api/patients.service";
import { departmentsService } from "@/api/departments.service";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import CreatePatientDialog from "@/components/dialogs/CreatePatientDialog";

const ReceptionDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [selectDeptOpen, setSelectDeptOpen] = useState(false);
  const [showOverview, setShowOverview] = useState(false);
  const [allPatients, setAllPatients] = useState([]);

  const [quickAdd, setQuickAdd] = useState(false);

  const [departments, setDepartments] = useState([]);
  const [deptCounts, setDeptCounts] = useState({});

const calculateDeptCounts = (patients) => {
  const countMap = {};

  patients.forEach((p) => {
    const deptId = p.departmentAssignedTo;
    if (deptId) {
      if (!countMap[deptId]) countMap[deptId] = 0;
      countMap[deptId]++;
    }
  });

  setDeptCounts(countMap);
};



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
    setAllPatients(patients);

    setStats({
      totalPatients: patients.length,
      paid: patients.filter((p) => p.paymentStatus === "paid").length,
      pending: patients.filter((p) => p.paymentStatus === "pending").length,
      assigned: patients.filter((p) => p.departmentAssignedTo).length,
    });

    calculateDeptCounts(patients);
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

const statCards = [
  {
    title: "Patient Overview",
    icon: UserCircle,
    iconColor: "text-blue-600",
    bg: "from-blue-50 to-blue-100",
    action: () => setShowOverview(true),
  },
  {
    title: "Assigned to Department",
    icon: Building2,
    iconColor: "text-blue-600",
    bg: "from-blue-50 to-blue-100",
    action: () => setSelectDeptOpen(true),
  },
  {
    title: "Quick Add Patient",
    icon: Plus,
    iconColor: "text-blue-600",
    bg: "from-blue-50 to-blue-100",
    action: () => setQuickAdd(true),
  },
];


  return (
    <>
      <div className="space-y-8">
      
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight">
            Reception Dashboard
          </h1>
          <p className="text-slate-500">
            Manage patient registrations & payments
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {statCards.map((card, index) => (
    <motion.div
      key={card.title}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        onClick={card.action}
        className={`
          cursor-pointer
          rounded-2xl
          border
          shadow-sm
          hover:shadow-lg
          transition-all
          duration-300
          bg-gradient-to-br ${card.bg}
          p-6
          h-40 flex flex-col justify-between
        `}
      >
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-slate-800">
            {card.title}
          </CardTitle>
          <card.icon className={`h-10 w-10 ${card.iconColor}`} />
        </div>

        <div className="flex items-center justify-end">
          <button className="text-sm font-medium text-blue-700 hover:underline">
            View →
          </button>
        </div>
      </Card>
    </motion.div>
  ))}
</div>

      </div>
{showOverview && (
  <motion.div
    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 15 }}
      className="bg-white max-w-md w-full rounded-2xl shadow-xl p-6"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Patient Overview</h2>
        <X
          className="w-6 h-6 cursor-pointer"
          onClick={() => setShowOverview(false)}
        />
      </div>
      <div className="space-y-3">
        {[
          { label: "Today's Patients", value: "24h" },
          { label: "Yesterday", value: "yesterday" },
          { label: "Last 7 Days", value: "week" },
          { label: "Last 30 Days", value: "month" },
          { label: "Custom Range", value: "custom" },
        ].map((item) => (
          <button
            key={item.value}
            className="w-full text-left p-3 border rounded-lg hover:bg-slate-100 transition"
            onClick={() => {
              setShowOverview(false);
              navigate(`/reception/patients?date=${item.value}`);
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
      <button
        onClick={() => setShowOverview(false)}
        className="
          w-full mt-5 py-2.5 
          bg-blue-500 hover:bg-blue-600
          text-white text-sm font-semibold
          rounded-xl shadow-md transition
        "
      >
        Cancel
      </button>
    </motion.div>
  </motion.div>
)}
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
            className="bg-white w-full max-w-md border rounded-2xl shadow-xl p-6 space-y-4"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold text-slate-800">
                Select Department
              </h2>
              <X
                className="w-6 h-6 cursor-pointer text-slate-700 hover:text-red-600 transition"
                onClick={() => setSelectDeptOpen(false)}
              />
            </div>

<div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-none">
  {departments?.length > 0 ? (
    departments.map((dept) => {
      const count = deptCounts[dept._id] || 0;

      return (
        <button
          key={dept._id}
          className="w-full flex items-center justify-between 
                     px-4 py-2.5 rounded-lg border 
                     hover:bg-slate-100 transition"
          onClick={() => {
            setSelectDeptOpen(false);
            navigate(
              `/reception/patients?filter=assigned&department=${dept.name.toLowerCase()}`
            );
          }}
        >
          <span className="font-medium text-slate-700">{dept.name}</span>

          <span
            className="bg-blue-100 text-blue-700 
                       px-3 py-1 rounded-full 
                       text-sm font-semibold"
          >
            {count}
          </span>
        </button>
      );
    })
  ) : (
    <p className="text-sm text-center text-red-500">No departments found.</p>
  )}
</div>




            <Button
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 mt-2 rounded-lg"
              onClick={() => setSelectDeptOpen(false)}
            >
              Cancel
            </Button>
          </motion.div>
        </motion.div>
      )}
      <CreatePatientDialog
        open={quickAdd}
        onClose={() => setQuickAdd(false)}
        onSuccess={() => {
          setQuickAdd(false);
          fetchStats();
        }}
      />

    </>
  );
};

export default ReceptionDashboard;
