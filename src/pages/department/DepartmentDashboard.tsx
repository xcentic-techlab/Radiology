import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, CheckCircle, Clock, FolderPlus } from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const DepartmentDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [pendingCount, setPendingCount] = useState(0);
const [approvedCount, setApprovedCount] = useState(0);


  const [openOverview, setOpenOverview] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);
  const overviewFilters = [
    { label: "Today's Reports", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "Last 7 Days", value: "week" },
    { label: "Last 30 Days", value: "month" },
    { label: "Last 1 Year", value: "year" },
    { label: "Custom Range", value: "custom" },
  ];

  const statusFilters = [
    { label: "Pending Reports", value: "pending" },
    { label: "Approved Reports", value: "approved" },
  ];

  useEffect(() => {
  loadReportCounts();
}, []);

async function loadReportCounts() {
  try {
    // const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reports/department/${user?.department?._id}`);
    const res = await fetch(`/reports/department/${user?.department?._id}`);
    const data = await res.json();

    setPendingCount(data.filter(r => r.status === "pending").length);
    setApprovedCount(data.filter(r => r.status === "approved").length);
  } catch (err) {
    console.log("Failed to load report counts");
  }
}


  return (
    <>
      <div className="space-y-10">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight">
            Department Dashboard
          </h1>
          <p className="text-muted-foreground text-base">
            Manage and track reports efficiently
          </p>

          <div className="flex justify-center mt-3">
            <div className="px-5 py-2 rounded-xl bg-white/70 backdrop-blur-md border shadow">
              <span className="text-sm font-semibold">
                Department:{" "}
                <span className="font-bold capitalize text-blue-700">
                  {user?.department?.name}
                </span>
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            onClick={() => setOpenOverview(true)}
            className="rounded-2xl cursor-pointer bg-blue-50 hover:bg-blue-100 border shadow-md transition"
          >
            <CardHeader className="flex flex-row justify-between">
              <CardTitle>Report Overview</CardTitle>
              <Calendar className="h-7 w-7 text-blue-600" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-700 font-medium">View →</p>
            </CardContent>
          </Card>
          <Card
            onClick={() => setOpenStatus(true)}
            className="rounded-2xl cursor-pointer bg-blue-50 hover:bg-blue-100 border shadow-md transition"
          >
            <CardHeader className="flex flex-row justify-between">
              <CardTitle>Report Status</CardTitle>
              <Clock className="h-7 w-7 text-blue-600" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-700 font-medium">View →</p>
            </CardContent>
          </Card>
          <Card
            onClick={() => navigate("/department/create-cases")}
            className="rounded-2xl cursor-pointer bg-blue-50 hover:bg-blue-100 border shadow-md transition"
          >
            <CardHeader className="flex flex-row justify-between">
              <CardTitle>Quick Create Case</CardTitle>
              <FolderPlus className="h-7 w-7 text-blue-600" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-700 font-medium">Create →</p>
            </CardContent>
          </Card>

        </div>
        <Dialog open={openOverview} onOpenChange={setOpenOverview}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Report Overview
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              {overviewFilters.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() =>
                    navigate(`/department/reports?date=${opt.value}`)
                  }
                  className="p-3 rounded-xl bg-white hover:bg-slate-100 border shadow-sm cursor-pointer transition"
                >
                  {opt.label}
                </div>
              ))}

              <button
                onClick={() => setOpenOverview(false)}
                className="w-full py-2 rounded-xl bg-blue-600 text-white font-semibold"
              >
                Cancel
              </button>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={openStatus} onOpenChange={setOpenStatus}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Report Status
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              {statusFilters.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() =>
                    navigate(`/department/reports?status=${opt.value}`)
                  }
                  className="p-3 rounded-xl bg-white hover:bg-slate-100 border shadow-sm cursor-pointer transition"
                >
                  {opt.label}
                </div>
              ))}

              <button
                onClick={() => setOpenStatus(false)}
                className="w-full py-2 rounded-xl bg-blue-600 text-white font-semibold"
              >
                Cancel
              </button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </>
  );
};

export default DepartmentDashboard;
