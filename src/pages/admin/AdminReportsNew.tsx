import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { reportsService } from "@/api/reports.service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function AdminReportsNew() {
  const [reports, setReports] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await reportsService.getAllForAdmin();
      setReports(res || []);
    } catch {
      toast({ title: "Error", description: "Failed to load reports", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const filtered = reports.filter((r) => {
    const matchQ = !q || (r.caseNumber || "").toLowerCase().includes(q.toLowerCase()) || (`${r.patient?.firstName || ""} ${r.patient?.lastName || ""}`).toLowerCase().includes(q.toLowerCase());
    const matchStatus = status === "all" ? true : r.status === status;
    return matchQ && matchStatus;
  });

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <Input placeholder="Search case # or patient" value={q} onChange={(e) => setQ(e.target.value)} />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="border px-2 py-1 rounded">
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="report_uploaded">Report Uploaded</option>
          </select>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => load()}>Refresh</Button>
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Case #</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r) => (
              <TableRow key={r._id}>
                <TableCell>{r.caseNumber}</TableCell>
                <TableCell>{r.patient ? `${r.patient.firstName} ${r.patient.lastName}` : "-"}</TableCell>
                <TableCell>{r.department?.name || "-"}</TableCell>
                <TableCell>{r.status}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" onClick={() => navigate(`/admin/report/${r._id}`)}>Open</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
}
