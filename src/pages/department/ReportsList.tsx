import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { reportsService } from "@/api/reports.service";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { useAuthStore } from "@/store/authStore";

const ReportsList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);

  const status = params.get("status"); // ?status=approved
  const { user } = useAuthStore();

  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const title =
    status === "approved"
      ? "Approved Reports"
      : status === "pending"
      ? "Pending Reports"
      : "Reports";

  useEffect(() => {
    fetchReports();
  }, [status]);

  const fetchReports = async () => {
    try {
      if (!user?.department?._id) return;

      const all = await reportsService.getByDepartment(user.department._id);

      let filtered = all;

      if (status === "approved") {
        filtered = all.filter((r) => r.status === "approved");
      }

      if (status === "pending") {
        filtered = all.filter((r) => r.status !== "approved");
      }

      setReports(all);
      setFilteredReports(filtered);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">{title}</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : filteredReports.length === 0 ? (
            <p>No reports found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case #</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report._id}>
                    <TableCell>{report.caseNumber}</TableCell>

                    <TableCell>
                      {report.patient?.firstName} {report.patient?.lastName}
                    </TableCell>

                    <TableCell className="capitalize">{report.status}</TableCell>

                    <TableCell>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          navigate(`/department/report/${report._id}`)
                        }
                      >
                        View
                      </Button>

                      {report.reportFile?.url && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="ml-2"
                          onClick={() =>
                            window.open(report.reportFile.url, "_blank")
                          }
                        >
                          PDF
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default ReportsList;
