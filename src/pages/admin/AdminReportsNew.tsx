import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { reportsService } from "@/api/reports.service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";

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
    const matchQ =
      !q ||
      (r.caseNumber || "").toLowerCase().includes(q.toLowerCase()) ||
      (`${r.patient?.firstName || ""} ${r.patient?.lastName || ""}`)
        .toLowerCase()
        .includes(q.toLowerCase());

    const matchStatus = status === "all" ? true : r.status === status;

    return matchQ && matchStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* HEADER */}
        <div className="text-center space-y-1">
          <h1 className="text-4xl font-bold tracking-tight">Reports Overview</h1>
          <p className="text-muted-foreground">Search, filter and review all patient reports</p>
        </div>

        {/* FILTER BAR (GLASSMORPHISM) */}
        <div className="backdrop-blur-lg bg-white/60 border border-white/40 rounded-2xl shadow-xl p-4 flex items-center justify-between">

          {/* LEFT FILTERS */}
          <div className="flex gap-3 w-full">

            {/* SEARCH */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
  placeholder="Search case # or patient name..."
  value={q}
  onChange={(e) => setQ(e.target.value)}
  className="pl-10 bg-white/50 backdrop-blur border border-gray-300/40 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
 />

            </div>

            {/* STATUS FILTER */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border rounded-lg px-3 py-2 bg-white/50 backdrop-blur"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
            </select>
          </div>

          {/* RIGHT BUTTONS */}
          <Button
            onClick={load}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 shadow-md ml-4"
          >
            Refresh
          </Button>

        </div>

        {/* TABLE (GLASS CARD) */}
        <div className="backdrop-blur-lg bg-white/60 border border-white/40 rounded-2xl shadow-xl p-4 overflow-auto">

          <Table>
            <TableHeader className="bg-white/50 backdrop-blur rounded-xl">
              <TableRow>
                <TableHead className="font-semibold">Case #</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="w-32">Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map((r) => (
                <TableRow
                  key={r._id}
                  className="hover:bg-white/40 backdrop-blur transition"
                >
                  <TableCell className="font-semibold">{r.caseNumber}</TableCell>

                  <TableCell>
                    {r.patient ? `${r.patient.firstName} ${r.patient.lastName}` : "-"}
                  </TableCell>

                  <TableCell>{r.department?.name || "-"}</TableCell>

                  <TableCell>
                    <span
                      className={`
                        px-3 py-1 rounded-full text-sm border
                        ${
                          r.status === "approved"
                            ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                            : r.status === "report_uploaded"
                            ? "bg-indigo-100 text-indigo-700 border-indigo-300"
                            : "bg-gray-200 text-gray-700 border-gray-300"
                        }
                      `}
                    >
                      {r.status.replace("_", " ")}
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => navigate(`/admin/report/${r._id}`)}
                      className="rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow"
                    >
                      Open
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

        </div>
      </div>
    </DashboardLayout>
  );
}
