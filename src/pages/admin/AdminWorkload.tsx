import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { departmentsService } from "@/api/departments.service";
import { reportsService } from "@/api/reports.service";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function AdminWorkload() {
  const [departments, setDepartments] = useState([]);
  const [reports, setReports] = useState([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      const [deps, reps] = await Promise.all([
        departmentsService.getAll(),
        reportsService.getAllForAdmin(),
      ]);
      setDepartments(deps || []);
      setReports(reps || []);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load workload",
        variant: "destructive",
      });
    }
  }

  function statsForDepartment(dep) {
    const depReports = reports.filter((r) => {
      if (dep._id && r.department?._id) return r.department._id === dep._id;
      if (dep.name && r.department?.name) return r.department.name === dep.name;
      return false;
    });

    const patients = new Set(depReports.map((r) => r.patient?._id));
    const assignedUsers = new Set(depReports.map((r) => r.assignedTo?._id).filter(Boolean));

    return {
      reports: depReports.length,
      patients: patients.size,
      assigned: assignedUsers.size,
    };
  }

  return (
    <DashboardLayout>
      {/* HEADER */}
      <div className="text-center mb-8 space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Department Workload</h1>
        <p className="text-muted-foreground">
          Monitor workload distribution across all departments
        </p>
      </div>

      {/* GRID OF DEPARTMENTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {departments.map((d) => {
          const s = statsForDepartment(d);

          return (
            <div
              key={d._id}
              className="
                backdrop-blur-lg bg-white/60 
                border border-white/40 
                shadow-xl rounded-2xl 
                p-5 flex flex-col justify-between transition
                hover:bg-white/80 hover:shadow-2xl
              "
            >
              {/* Department Title */}
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">{d.name}</h2>
                <p className="text-sm text-muted-foreground">
                  Summary of department activity
                </p>
              </div>

              {/* Stats */}
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">Reports</span>
                  <span className="font-semibold">{s.reports}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-700">Patients</span>
                  <span className="font-semibold">{s.patients}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-700">Assigned Users</span>
                  <span className="font-semibold">{s.assigned}</span>
                </div>
              </div>

              {/* Footer Button */}
              <div className="mt-5 flex justify-end">
                <Button
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 shadow"
                  onClick={() => navigate(`/admin/workload/${d._id}`)}
                >
                  Open
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
