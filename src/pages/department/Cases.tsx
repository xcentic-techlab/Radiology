import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { casesService } from "@/api/case.service";
import { reportsService } from "@/api/reports.service";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";
import { format, subDays, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { Trash2 } from "lucide-react";


const Cases = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [searchParams] = useSearchParams();

  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
const [deleteLoading, setDeleteLoading] = useState(false);


  const [filters, setFilters] = useState({
    caseId: "",
    patientName: "",
    date: "all",
    customFrom: "",
    customTo: "",
    status: null,
  });



  
const handleDelete = async () => {
  if (!deleteTarget) return;

  setDeleteLoading(true);

  try {
    console.log("DELETE → CASE ID:", deleteTarget._id);
    console.log("DELETE → REPORT ID:", deleteTarget.reportId);

    // 1️⃣ Delete Case (this will auto delete report in backend)
    await casesService.deleteCase(deleteTarget._id);

    toast({
      title: "Deleted",
      description: "Case and linked report deleted successfully.",
    });

    // Remove from UI
    setReports(prev => prev.filter(r => r._id !== deleteTarget._id));
    setFilteredReports(prev => prev.filter(r => r._id !== deleteTarget._id));

  } catch (err) {
    toast({
      title: "Error",
      description: "Failed to delete!",
      variant: "destructive",
    });
  } finally {
    setDeleteLoading(false);
    setDeleteTarget(null);
  }
};



  // Apply URL filters (today, week, month, status)
  useEffect(() => {
    const dateParam = searchParams.get("date");
    const statusParam = searchParams.get("status");

    setFilters((prev) => ({
      ...prev,
      date: dateParam || prev.date,
      status: statusParam || prev.status,
    }));
  }, [searchParams]);

  // Fetch reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        if (!user?.department?._id) return;

        const data = await casesService.getByDepartment(user.department._id);
        setReports(data);
        setFilteredReports(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load cases",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Apply all filters
  useEffect(() => {
    let result = [...reports];

    // CASE ID FILTER
    if (filters.caseId.trim() !== "") {
      const s = filters.caseId.toLowerCase();
      result = result.filter((r) =>
        r.caseNumber?.toLowerCase().includes(s)
      );
    }

    // PATIENT NAME FILTER
    if (filters.patientName.trim() !== "") {
      const s = filters.patientName.toLowerCase();
      result = result.filter((r) => {
        const fullName = `${r.patient?.firstName} ${r.patient?.lastName}`.toLowerCase();
        return fullName.includes(s);
      });
    }

    // STATUS FILTER
    if (filters.status === "pending") {
      result = result.filter((r) => r.status?.toLowerCase() !== "approved");
    }
    if (filters.status === "approved") {
      result = result.filter((r) => r.status?.toLowerCase() === "approved");
    }

    // DATE FILTER
    if (filters.date !== "all") {
      const now = new Date();
      result = result.filter((report) => {
        if (!report.scheduledAt) return false;
        const reportDate = new Date(report.scheduledAt);

        switch (filters.date) {
          case "today":
            return isWithinInterval(reportDate, {
              start: startOfDay(now),
              end: endOfDay(now),
            });

          case "yesterday":
            return isWithinInterval(reportDate, {
              start: startOfDay(subDays(now, 1)),
              end: endOfDay(subDays(now, 1)),
            });

          case "week":
            return reportDate >= subDays(now, 7);

          case "month":
            return reportDate >= subDays(now, 30);

          case "year":
            return reportDate >= subDays(now, 365);

          case "custom":
            if (!filters.customFrom || !filters.customTo) return true;
            return isWithinInterval(reportDate, {
              start: new Date(filters.customFrom),
              end: new Date(filters.customTo),
            });

          default:
            return true;
        }
      });
    }

    setFilteredReports(result);
  }, [filters, reports]);




  return (
    <DashboardLayout>

      
      {deleteTarget && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-6 w-[380px] shadow-xl">

      <h2 className="text-xl font-bold text-black-700">
        Delete Case?
      </h2>

      <p className="text-sm text-slate-600 mt-2">
        This will delete the case permanently.
        {deleteTarget.reportId && (
          <span className="font-semibold text-red-600">
            {" "}
            The attached report will also be deleted.
          </span>
        )}
      </p>

      <div className="flex justify-end gap-3 mt-5">
        <Button
          variant="outline"
          onClick={() => setDeleteTarget(null)}
          className="rounded-lg"
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

      <div className="space-y-10">
        {/* HEADER */}
        <div className="text-center space-y-1">
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight">
            Create Reports
          </h1>
          <p className="text-muted-foreground text-base">
            Manage department reports
          </p>
        </div>




        {/* FILTER CARD */}
        <Card className="bg-white/60 backdrop-blur-md border border-white/40 shadow-xl rounded-2xl">
          <CardHeader className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">

              {/* CASE ID */}
              <Input
                placeholder="Filter by Case ID"
                className="rounded-xl shadow-sm bg-white/50"
                value={filters.caseId}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, caseId: e.target.value }))
                }
              />

              {/* PATIENT NAME */}
              <Input
                placeholder="Filter by Patient Name"
                className="rounded-xl shadow-sm bg-white/50"
                value={filters.patientName}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, patientName: e.target.value }))
                }
              />

              {/* DATE FILTER */}
              <select
                className="border rounded-xl px-3 py-2 bg-white/50 shadow-sm"
                value={filters.date}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, date: e.target.value }))
                }
              >
                <option value="all">All</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last 1 Year</option>
                <option value="custom">Custom</option>
              </select>

              {/* CUSTOM RANGE */}
              {filters.date === "custom" && (
                <>
                  <Input
                    type="date"
                    className="rounded-xl shadow-sm bg-white/50"
                    value={filters.customFrom}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, customFrom: e.target.value }))
                    }
                  />
                  <Input
                    type="date"
                    className="rounded-xl shadow-sm bg-white/50"
                    value={filters.customTo}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, customTo: e.target.value }))
                    }
                  />
                </>
              )}
            </div>
          </CardHeader>

          {/* TABLE */}
          <CardContent>
            <div className="overflow-x-auto rounded-xl border bg-white/70 backdrop-blur-sm shadow-lg">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <TableHead>Case #</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead className="text-right">Action Controls</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        No cases found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredReports.map((report) => (
                      <TableRow
                        key={report._id}
                        className="hover:bg-blue-50 transition"
                      >
                        <TableCell className="font-semibold">
                          {report.caseNumber}
                        </TableCell>

                        <TableCell>
                          {report.patient?.firstName}{" "}
                          {report.patient?.lastName}
                        </TableCell>

                        <TableCell>
                          {report.scheduledAt
                            ? format(
                                new Date(report.scheduledAt),
                                "MMM dd, yyyy HH:mm"
                              )
                            : "-"}
                        </TableCell>

<TableCell className="text-right">
  <div className="flex justify-end items-center gap-3">

    {/* CREATE BUTTON */}
    {!report.reportId && (
      <Button
        size="sm"
        className="rounded-md bg-blue-600 text-white px-3 py-1.5 shadow-sm 
                   hover:bg-blue-700 transition"
        onClick={async () => {
          try {
            const res = await casesService.createReport(report._id);
            navigate(`/department/report/${res?.reportId}`);
          } catch {
            toast({
              title: "Error",
              description: "Unable to create report",
              variant: "destructive",
            });
          }
        }}
      >
        Create
      </Button>
    )}

    {/* VIEW BUTTON */}
    {report.reportId && (
      <Button
        size="sm"
        variant="secondary"
        className="rounded-md shadow-sm px-3 py-1.5 hover:bg-gray-200 transition"
        onClick={() => navigate(`/department/report/${report.reportId}`)}
      >
        View
      </Button>
    )}

    {/* PDF BUTTON */}
    {report.reportFile && (
      <Button
        size="sm"
        variant="outline"
        className="rounded-md shadow-sm px-3 py-1.5 hover:bg-gray-100 transition"
        onClick={() => window.open(report.reportFile)}
      >
        PDF
      </Button>
    )}

    {/* DELETE ICON ROUND BUTTON */}
    <button
      onClick={() => setDeleteTarget(report)}
      className="
        w-9 h-9 flex items-center justify-center 
        rounded-full bg-red-600 text-white shadow-sm
        hover:bg-red-700 transition
      "
    >
      <Trash2 className="w-4 h-4" />
    </button>

  </div>
</TableCell>



                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Cases;
