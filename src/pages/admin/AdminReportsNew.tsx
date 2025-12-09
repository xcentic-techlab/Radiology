import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { reportsService } from "@/api/reports.service";
import { departmentsService } from "@/api/departments.service";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Trash2 } from "lucide-react";



export default function AdminReportsNew() {
  const [reports, setReports] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState(null);
const [deleteLoading, setDeleteLoading] = useState(false);



  const [searchParams] = useSearchParams();
const deptFromURL = searchParams.get("dept");

useEffect(() => {
  if (deptFromURL) {
    setDeptFilter(deptFromURL);
  }
}, [deptFromURL]);



  useEffect(() => {
    load();
    loadDepartments();
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

  async function loadDepartments() {
    try {
      const res = await departmentsService.getAll();
      setDepartments(res);
    } catch {
      console.log("Failed to load departments");
    }
  }

const filtered = reports.filter((r) => {
  const searchText = q.toLowerCase();

  const matchSearch =
    !q ||
    (r.caseNumber || "").toLowerCase().includes(searchText) ||
    (`${r.patient?.firstName || ""} ${r.patient?.lastName || ""}`)
      .toLowerCase()
      .includes(searchText) ||
    (r.department?.name || "").toLowerCase().includes(searchText);

  const matchStatus = status === "all" ? true : r.status === status;

  const matchDept =
    deptFilter === "all" ? true : r.department?._id === deptFilter;

  return matchSearch && matchStatus && matchDept;
});

async function handleDelete() {
  if (!deleteTarget) return;

  setDeleteLoading(true);

  try {
    await reportsService.deleteReport(deleteTarget._id);

    toast({
      title: "Deleted",
      description: "Report deleted successfully.",
    });

    setReports(prev => prev.filter(r => r._id !== deleteTarget._id));
  } catch {
    toast({
      title: "Error",
      description: "Failed to delete report",
      variant: "destructive",
    });
  } finally {
    setDeleteLoading(false);
    setDeleteTarget(null);
  }
}



  return (
    <>

      {deleteTarget && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-2xl w-[380px] shadow-xl">

      <h2 className="text-xl font-bold text-gray-900">
        Delete Report?
      </h2>

      <p className="text-sm text-gray-600 mt-2">
        This action cannot be undone.
      </p>

      <div className="flex justify-end gap-3 mt-5">
        <Button
          variant="outline"
          className="rounded-lg"
          onClick={() => setDeleteTarget(null)}
        >
          Cancel
        </Button>

        <Button
          variant="destructive"
          className="rounded-lg"
          onClick={handleDelete}
          disabled={deleteLoading}
        >
          {deleteLoading ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </div>
  </div>
)}


      <div className="space-y-6">

        {/* HEADER */}
        <div className="text-center space-y-1">
          <h1 className="text-4xl font-bold tracking-tight">Reports Overview</h1>
          <p className="text-muted-foreground">Search, filter and review all patient reports</p>
        </div>

        {/* FILTER BAR */}
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
                className="pl-10 bg-white/50 backdrop-blur border border-gray-300/40 shadow-none focus-visible:ring-0"
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

            {/* DEPARTMENT FILTER (NEW) */}
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 bg-white/50 backdrop-blur"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
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

        {/* TABLE */}
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
                      className={`px-3 py-1 rounded-full text-sm border ${
                        r.status === "approved"
                          ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                          : r.status === "report_uploaded"
                          ? "bg-indigo-100 text-indigo-700 border-indigo-300"
                          : "bg-gray-200 text-gray-700 border-gray-300"
                      }`}
                    >
                      {r.status.replace("_", " ")}
                    </span>
                  </TableCell>
<TableCell className="text-right">
  <div className="flex justify-end items-center gap-3">

    {/* OPEN BUTTON */}
    <Button
      size="sm"
      onClick={() => navigate(`/admin/report/${r._id}`)}
      className="rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow"
    >
      Open
    </Button>

    {/* DELETE ROUND ICON BUTTON */}
    <button
      onClick={() => setDeleteTarget(r)}
      className="w-9 h-9 flex items-center justify-center 
                 rounded-full bg-red-600 text-white shadow-sm
                 hover:bg-red-700 transition"
    >
      <Trash2 className="w-4 h-4" />
    </button>

  </div>
</TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>

        </div>
      </div>
    </>
  );
}
