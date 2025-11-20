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
      const depReports = (all || []).filter((r) => r.department?._id === departmentId || r.department === departmentId);
      setReports(depReports);

      // fetch patient details for counts (fetch only unique)
      const uniquePatientIds = [
  ...new Set(
    depReports
      .map((r) => (r.patient?._id || r.patient) as string)
      .filter(Boolean)
  ),
];

const map: Record<string, any> = {};

await Promise.all(
  uniquePatientIds.map(async (pid: string) => {
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
      toast({ title: "Error", description: "Failed to load department data", variant: "destructive" });
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

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Department Reports</h1>
        <div className="flex gap-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border rounded px-2 py-1">
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="uploaded">Report Uploaded</option>
          </select>
          <Button onClick={() => navigate(-1)}>Back</Button>
        </div>
      </div>

      {loading ? <div>Loading...</div> : (
        <>
          <div className="mb-4">
            <div className="text-sm text-muted-foreground">Total reports: {reports.length}</div>
            <div className="text-sm text-muted-foreground">Unique patients: {Object.keys(patientsMap).length}</div>
          </div>

          <div className="bg-white rounded shadow overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case #</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => {
                  const pid = r.patient?._id || r.patient;
                  const p = patientsMap[pid];
                  return (
                    <TableRow key={r._id}>
                      <TableCell>{r.caseNumber}</TableCell>
                      <TableCell>{p ? `${p.firstName} ${p.lastName}` : pid}</TableCell>
                      <TableCell>{r.status}</TableCell>
                      <TableCell>{r.assignedTo?.name || r.assignedTo}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" onClick={() => navigate(`/admin/report/${r._id}`)}>Open</Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
