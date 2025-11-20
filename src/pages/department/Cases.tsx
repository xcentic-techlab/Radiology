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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Create Reports</h1>
          <p className="text-muted-foreground">Manage department reports</p>
        </div>

        {/* FILTERS */}
        <Card>
          <CardHeader className="flex flex-col gap-4">

            <div className="flex flex-wrap gap-4 items-center">

              {/* CASE ID FILTER */}
              <Input
                placeholder="Filter by Case ID"
                className="w-full sm:w-56"
                value={filters.caseId}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, caseId: e.target.value }))
                }
              />

              {/* PATIENT NAME FILTER */}
              <Input
                placeholder="Filter by Patient Name"
                className="w-full sm:w-56"
                value={filters.patientName}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, patientName: e.target.value }))
                }
              />

              {/* DATE FILTER */}
              <select
                className="border rounded px-3 py-2"
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
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={filters.customFrom}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, customFrom: e.target.value }))
                    }
                  />
                  <Input
                    type="date"
                    value={filters.customTo}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, customTo: e.target.value }))
                    }
                  />
                </div>
              )}
            </div>
          </CardHeader>

          {/* TABLE */}
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case #</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredReports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No cases found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReports.map((report) => (
                    <TableRow key={report._id}>
                      <TableCell>{report.caseNumber}</TableCell>

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
  {/* If NO report exists */}
  {!report.reportId && (
    <Button
      size="sm"
      onClick={() =>
        navigate(`/department/create-report/${report._id}`) // CASE ID
      }
    >
      Create
    </Button>
  )}

  {/* If report EXISTS */}
  {report.reportId && (
    <Button
      size="sm"
      variant="secondary"
      onClick={() =>
        navigate(`/department/report/${report.reportId}`) // REPORT ID
      }
    >
      View
    </Button>
  )}


                          {report.reportFile && (
                            <Button
                              size="sm"
                              variant="outline"
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
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Cases;
