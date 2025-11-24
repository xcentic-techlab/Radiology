import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { reportsService } from "@/api/reports.service";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/ui/status-badge";
import { format } from "date-fns";

const PatientReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = async () => {
    try {
      const data = await reportsService.getById(id!);
      setReport(data);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };  

  if (loading) return <DashboardLayout>Loading...</DashboardLayout>;
  if (!report)
    return <DashboardLayout>❌ Report Not Found</DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/patient/reports")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <h1 className="text-3xl font-bold">Case #{report.caseNumber}</h1>

        <Card>
          <CardHeader>
            <CardTitle>Case Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <p><b>Department:</b> {report.department.name}</p>
            <p><b>Procedure:</b> {report.procedure}</p>
            <p><b>Status:</b> <StatusBadge status={report.status} /></p>
            <p><b>Payment:</b> <StatusBadge status={report.paymentStatus} /></p>
            <p>
              <b>Scheduled:</b> {format(new Date(report.scheduledAt), "MMM dd, yyyy HH:mm")}
            </p>
          </CardContent>
        </Card>

        {report.reportFile && (
          <Card>
            <CardHeader>
              <CardTitle>Report File</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              <Button asChild>
                <a href={report.reportFile.url} download target="_blank">
                  <Download className="mr-2 h-4 w-4" /> Download Report
                </a>
              </Button>

              <iframe
                src={report.reportFile.url}
                className="w-full h-[600px] border rounded-lg"
              />
            </CardContent>
          </Card>
        )}

        {(report.findings || report.impression) && (
          <Card>
            <CardHeader>
              <CardTitle>Doctor Findings</CardTitle>
            </CardHeader>

            <CardContent>
              {report.findings && (
                <p><b>Findings:</b> {report.findings}</p>
              )}

              {report.impression && (
                <p><b>Impression:</b> {report.impression}</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PatientReportDetail;
