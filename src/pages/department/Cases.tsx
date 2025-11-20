import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";
import { format, subDays, isWithinInterval, startOfDay, endOfDay } from "date-fns";

const Cases = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    caseId: "",
    patientName: "",
    date: "all",
    customFrom: "",
    customTo: "",
  });

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, reports]);

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

  const applyFilters = () => {
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

    // DATE FILTER
    if (filters.date !== "all") {
      const now = new Date();

      result = result.filter((report) => {
        if (!report.scheduledAt) return false;
        const reportDate = new Date(report.scheduledAt);

        switch (filters.date) {
          case "24h":
            return reportDate >= subDays(now, 1);

          case "yesterday":
            return isWithinInterval(reportDate, {
              start: startOfDay(subDays(now, 1)),
              end: endOfDay(subDays(now, 1)),
            });

          case "week":
            return reportDate >= subDays(now, 7);

          case "month":
            return reportDate >= subDays(now, 30);

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
  };

return (
  <DashboardLayout>
    <div className="space-y-10">

      {/* HEADING */}
      <div className="text-center space-y-1">
        <h1 className="text-4xl font-bold text-slate-800 tracking-tight">
          Create Reports
        </h1>
        <p className="text-muted-foreground text-base">
          Manage department reports
        </p>
      </div>

      {/* FILTERS CARD */}
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
              <option value="24h">Last 24 Hours</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="custom">Custom</option>
            </select>

            {/* CUSTOM DATE RANGE */}
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
                  <TableHead className="text-right">Actions</TableHead>
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
                        {report.patient?.firstName} {report.patient?.lastName}
                      </TableCell>

                      <TableCell>
                        {report.scheduledAt
                          ? format(
                              new Date(report.scheduledAt),
                              "MMM dd, yyyy HH:mm"
                            )
                          : "-"}
                      </TableCell>

                      <TableCell>
  <div className="flex justify-end gap-2">

    {/* CREATE BUTTON — logic unchanged */}
    {!report.reportId && (
      <Button
        size="sm"
        className="rounded-lg"
        onClick={() =>
          navigate(`/department/create-report/${report._id}`) // ORIGINAL LOGIC
        }
      >
        Create
      </Button>
    )}

    {/* VIEW BUTTON — original logic restored */}
    {report.reportId && (
      <Button
        size="sm"
        variant="secondary"
        className="rounded-lg"
        onClick={() =>
          navigate(`/department/report/${report.reportId}`) // ORIGINAL LOGIC
        }
      >
        View
      </Button>
    )}

    {/* PDF BUTTON — unchanged */}
    {report.reportFile && (
      <Button
        size="sm"
        variant="outline"
        className="rounded-lg"
        onClick={() => window.open(report.reportFile)}
      >
        PDF
      </Button>
    )}
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
