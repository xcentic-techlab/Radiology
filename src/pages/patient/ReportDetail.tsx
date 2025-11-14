import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { reportsService, Report } from '@/api/reports.service';
import { useToast } from '@/hooks/use-toast';
import { StatusBadge } from '@/components/ui/status-badge';
import { format } from 'date-fns';

const PatientReportDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchReport();
  }, [id]);

  const fetchReport = async () => {
    if (!id) return;
    try {
      const data = await reportsService.getById(id);
      setReport(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load report',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!report) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p>Report not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/patient/reports')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Case #{report.caseNumber}</h1>
            <p className="text-muted-foreground">Report details</p>
          </div>
        </div>

        {/* Case Info */}
        <Card>
          <CardHeader>
            <CardTitle>Case Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Department</Label>
              <p className="font-medium">{report.department.name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Procedure</Label>
              <p className="font-medium">{report.procedure}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Scheduled At</Label>
              <p className="font-medium">
                {format(new Date(report.scheduledAt), 'MMM dd, yyyy HH:mm')}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Status</Label>
              <div className="mt-1">
                <StatusBadge status={report.status} />
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Payment Status</Label>
              <div className="mt-1">
                <StatusBadge status={report.paymentStatus} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report File */}
        {report.reportFile && (
          <Card>
            <CardHeader>
              <CardTitle>Report Document</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{report.reportFile.filename}</p>
                  <p className="text-sm text-muted-foreground">PDF Document</p>
                </div>
                <Button asChild>
                  <a
                    href={report.reportFile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </a>
                </Button>
              </div>

              {/* PDF Viewer */}
              <div className="border rounded-lg overflow-hidden" style={{ height: '600px' }}>
                <iframe
                  src={report.reportFile.url}
                  className="w-full h-full"
                  title="Report PDF"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Findings & Impression */}
        {(report.findings || report.impression) && (
          <Card>
            <CardHeader>
              <CardTitle>Medical Findings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {report.findings && (
                <div>
                  <Label className="text-muted-foreground">Findings</Label>
                  <p className="mt-2 whitespace-pre-wrap">{report.findings}</p>
                </div>
              )}
              {report.impression && (
                <div>
                  <Label className="text-muted-foreground">Impression</Label>
                  <p className="mt-2 whitespace-pre-wrap">{report.impression}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default PatientReportDetail;
