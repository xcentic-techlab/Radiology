import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { reportsService } from "@/api/reports.service";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/ui/status-badge";
import { format } from "date-fns";

const PatientReports = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const allReports = await reportsService.list(); // 🟢 correct backend function

      const myReports = allReports.filter(
        (r: any) => r.patient?._id === user?._id
      );

      setReports(myReports.reverse());
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">My Reports</h1>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Reports History</h3>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case #</TableHead>
                  <TableHead>Procedure</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
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
                ) : reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No reports found
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((r: any) => (
                    <TableRow key={r._id}>
                      <TableCell>{r.caseNumber}</TableCell>
                      <TableCell>{r.procedure}</TableCell>
                      <TableCell>{r.department?.name}</TableCell>

                      <TableCell>
                        <StatusBadge status={r.status} />
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={r.paymentStatus} />
                      </TableCell>

                      <TableCell>
                        {format(new Date(r.scheduledAt), "MMM dd, yyyy")}
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/patient/report/${r._id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default PatientReports;
