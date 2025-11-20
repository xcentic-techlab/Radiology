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
      toast({ title: "Error", description: "Failed to load workload", variant: "destructive" });
    }
  }

  function statsForDepartment(dep) {
    const depReports = reports.filter((r) => {
      const d = r.department || r.department?.name || r.department?._id;
      // try matching id or name
      if (typeof dep._id !== "undefined" && r.department?._id) return r.department._id === dep._id;
      if (dep.name && r.department?.name) return r.department.name === dep.name;
      return false;
    });

    const patients = new Set(depReports.map((r) => r.patient?._id || r.patient));
    const assignedUsers = new Set(depReports.map((r) => r.assignedTo?._id || r.assignedTo).filter(Boolean));

    return {
      reports: depReports.length,
      patients: patients.size,
      assigned: assignedUsers.size,
    };
  }

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold mb-4">Department Workload</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {departments.map((d) => {
          const s = statsForDepartment(d);
          return (
            <div key={d._id} className="p-4 border rounded-lg bg-white shadow-sm flex justify-between items-center">
              <div>
                <div className="text-lg font-medium">{d.name}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {s.reports} reports • {s.patients} patients • {s.assigned} assigned
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => navigate(`/admin/workload/${d._id}`)}>Open</Button>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
