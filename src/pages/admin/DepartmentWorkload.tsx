import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useParams, useNavigate } from "react-router-dom";
import { reportsService } from "@/api/reports.service";
import { patientsService } from "@/api/patients.service";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

export default function DepartmentWorkload() {
  const { departmentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [reports, setReports] = useState([]);
  const [patientsMap, setPatientsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (departmentId) load();
  }, [departmentId, filter]);

  async function load() {
    setLoading(true);
    try {
      const all = await reportsService.getAllForAdmin();

      const depReports = (all || []).filter(
        (r) =>
          r.department?._id === departmentId ||
          r.department === departmentId
      );

      setReports(depReports);

      // fetch unique patient details
      const uniquePatientIds = [
        ...new Set(
          depReports
            .map((r) => r.patient?._id || r.patient)
            .filter(Boolean)
        ),
      ];

      const map = {};
      await Promise.all(
        uniquePatientIds.map(async (pid) => {
          try {
            const p = await patientsService.getById(pid);
            map[pid] = p;
          } catch {
            map[pid] = null;
          }
        })
      );

      setPatientsMap(map);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load department data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const filtered = reports.filter((r) => {
    if (filter === "all") return true;
    if (filter === "pending") return r.status === "pending";
    if (filter === "approved") return r.status === "approved";
    if (filter === "uploaded") return r.status === "report_uploaded";
    return true;
  });

  const badgeClass = (status) =>
    status === "approved"
      ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
      : status === "report_uploaded"
      ? "bg-indigo-100 text-indigo-700 border border-indigo-300"
      : "bg-gray-200 text-gray-700 border border-gray-300";

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Department Workload</h1>
            <p className="text-muted-foreground">
              Review all report activities under this department
            </p>
          </div>

          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 bg-white/50 backdrop-blur"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="uploaded">Report Uploaded</option>
            </select>

            <Button
              onClick={() => navigate(-1)}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
            >
              Back
            </Button>
          </div>
        </div>

        {/* STATS CARD */}
        {/* <div className="backdrop-blur-lg bg-white/60 border border-white/40 shadow-xl rounded-2xl p-4 flex gap-10">
          <div>
            <p className="text-sm text-muted-foreground">Total Reports</p>
            <p className="text-2xl font-semibold">{reports.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Unique Patients</p>
            <p className="text-2xl font-semibold">
              {Object.keys(patientsMap).length}
            </p>
          </div>
        </div> */}

        {/* TABLE */}
        <div className="backdrop-blur-lg bg-white/60 border border-white/40 shadow-xl rounded-2xl p-4 overflow-auto">
          <Table>
            <TableHeader className="bg-white/50 backdrop-blur rounded-xl">
              <TableRow>
                <TableHead className="w-40">Case #</TableHead>
                <TableHead className="w-60">Patient</TableHead>
                <TableHead className="w-40 text-center">Status</TableHead>
                <TableHead className="w-40">Assigned</TableHead>
                <TableHead className="text-right w-24">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map((r) => {
                const pid = r.patient?._id || r.patient;
                const p = patientsMap[pid];

                return (
                  <TableRow
                    key={r._id}
                    className="hover:bg-white/40 backdrop-blur transition"
                  >
                    <TableCell className="py-2 font-semibold">
                      {r.caseNumber}
                    </TableCell>

                    <TableCell className="py-2">
                      {p ? `${p.firstName} ${p.lastName}` : pid}
                    </TableCell>

                    <TableCell className="py-2 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-sm border ${badgeClass(
                          r.status
                        )}`}
                      >
                        {r.status.replace("_", " ")}
                      </span>
                    </TableCell>

                    <TableCell className="py-2">
                      {r.assignedTo?.name || r.assignedTo || "-"}
                    </TableCell>

                    <TableCell className="text-right py-2">
                      <Button
                        size="sm"
                        className="rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => navigate(`/admin/report/${r._id}`)}
                      >
                        Open
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
}
