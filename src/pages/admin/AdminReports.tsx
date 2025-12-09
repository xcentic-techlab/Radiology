import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { reportsService } from "@/api/reports.service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { casesService } from "@/api/case.service";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/authStore";

export default function AdminReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [filteredReports, setFilteredReports] = useState<any[]>([]);

  const [search, setSearch] = useState("");
  const [filterCase, setFilterCase] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDept, setFilterDept] = useState("all");

  const [filterDate, setFilterDate] = useState("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
    const [loading, setLoading] = useState(true);
      const { toast } = useToast();
        const { user } = useAuthStore();

  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [search, filterCase, filterStatus, filterDept, filterDate, customFrom, customTo, reports]);

  async function load() {
    const data = await reportsService.getAllForAdmin();
    setReports(data);
    setFilteredReports(data);
  }


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


  function color(status: string) {
    return status === "approved"
      ? "bg-green-600"
      : status === "report_uploaded"
      ? "bg-purple-600"
      : "bg-gray-500";
  }

  function applyFilters() {
    let data = [...reports];

    if (search.trim()) {
      data = data.filter(
        (r) =>
          r.caseNumber.toLowerCase().includes(search.toLowerCase()) ||
          `${r.patient?.firstName} ${r.patient?.lastName}`
            .toLowerCase()
            .includes(search.toLowerCase())
      );
    }

    if (filterCase.trim()) {
      data = data.filter((r) =>
        r.caseNumber.toLowerCase().includes(filterCase.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      data = data.filter((r) => r.status === filterStatus);
    }
    if (filterDept !== "all") {
      data = data.filter(
        (r) => r.department?.name?.toLowerCase() === filterDept.toLowerCase()
      );
    }
    if (filterDate !== "all") {
      const now = new Date();

      data = data.filter((r) => {
        const created = new Date(r.createdAt);

        if (filterDate === "today")
          return created.toDateString() === now.toDateString();

        if (filterDate === "24h")
          return now.getTime() - created.getTime() <= 24 * 60 * 60 * 1000;

        if (filterDate === "yesterday") {
          const diff =
            new Date(now.toDateString()).getTime() -
            new Date(created.toDateString()).getTime();
          return diff === 24 * 60 * 60 * 1000;
        }

        if (filterDate === "week")
          return now.getTime() - created.getTime() <= 7 * 24 * 60 * 60 * 1000;

        if (filterDate === "month")
          return now.getTime() - created.getTime() <= 30 * 24 * 60 * 60 * 1000;

        if (filterDate === "custom") {
          if (!customFrom || !customTo) return true;
          const from = new Date(customFrom);
          const to = new Date(customTo);
          return created >= from && created <= to;
        }

        return true;
      });
    }

    setFilteredReports(data);
  }

  return (
    <>
      <div className="space-y-6">
        
        <div>
          <h1 className="text-3xl font-semibold">All Reports</h1>
          <p className="text-muted-foreground">Monitor and filter all reports</p>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Input
              placeholder="Filter by Case Number..."
              value={filterCase}
              onChange={(e) => setFilterCase(e.target.value)}
            />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border px-3 py-2 rounded-md"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="report_uploaded">Report Uploaded</option>
              <option value="pending">Pending</option>
            </select>
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="border px-3 py-2 rounded-md"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="24h">Last 24 Hours</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="custom">Custom</option>
            </select>
            {filterDate === "custom" && (
              <>
                <input
                  type="date"
                  className="border px-3 py-2 rounded"
                  onChange={(e) => setCustomFrom(e.target.value)}
                />
                <input
                  type="date"
                  className="border px-3 py-2 rounded"
                  onChange={(e) => setCustomTo(e.target.value)}
                />
              </>
            )}

          </div>
        </div>
        <div className="bg-white rounded-lg border shadow-sm p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case #</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredReports.map((r) => (
                <TableRow key={r._id}>
                  <TableCell className="font-semibold">{r.caseNumber}</TableCell>
                  <TableCell>
                    {r.patient?.firstName} {r.patient?.lastName}
                  </TableCell>
                  <TableCell>{r.department?.name}</TableCell>
                  <TableCell>
                    <Badge className={`${color(r.status)} text-white`}>
                      {r.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
<TableCell className="text-right space-x-2">

  {/* EDIT */}
  <Button
    size="sm"
    variant="outline"
    onClick={() => navigate(`/admin/report/${r._id}`)}
  >
    Edit
  </Button>

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
