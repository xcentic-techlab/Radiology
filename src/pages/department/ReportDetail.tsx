import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { reportsService, Report } from '@/api/reports.service';
import { useToast } from '@/hooks/use-toast';
import { StatusBadge } from '@/components/ui/status-badge';
import { format } from 'date-fns';

const ReportDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [findings, setFindings] = useState('');
  const [impression, setImpression] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (id) fetchReport();
  }, [id]);

  const fetchReport = async () => {
    if (!id) return;
    try {
      const data = await reportsService.getById(id);
      setReport(data);
      setFindings(data.findings || '');
      setImpression(data.impression || '');
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

  const handleFileUpload = async () => {
    if (!selectedFile || !id) return;
    setUploading(true);
    try {
      await reportsService.uploadReport(id, selectedFile);
      await reportsService.updateStatus(id, 'report_uploaded');
      toast({
        title: 'Success',
        description: 'Report uploaded successfully',
      });
      fetchReport();
      setSelectedFile(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload report',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleStatusChange = async (status: Report['status']) => {
    if (!id) return;
    try {
      await reportsService.updateStatus(id, status);
      toast({
        title: 'Success',
        description: 'Status updated',
      });
      fetchReport();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const handleSaveFindings = async () => {
    if (!id) return;
    try {
      await reportsService.updateFindings(id, { findings, impression });
      toast({
        title: 'Success',
        description: 'Findings saved',
      });
      fetchReport();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save findings',
        variant: 'destructive',
      });
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
          <Button variant="ghost" size="icon" onClick={() => navigate('/department/cases')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Case #{report.caseNumber}</h1>
            <p className="text-muted-foreground">Report details and management</p>
          </div>
        </div>

        {/* Patient & Case Info */}
        <Card>
          <CardHeader>
            <CardTitle>Patient & Case Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Patient Name</Label>
              <p className="font-medium">
                {report.patient.firstName} {report.patient.lastName}
              </p>
            </div>
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
              <Label className="text-muted-foreground">Assigned To</Label>
              <p className="font-medium">{report.assignedTo?.name || 'Unassigned'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Status</Label>
              <div className="mt-1">
                <StatusBadge status={report.status} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Upload */}
        {!report.reportFile && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">Select PDF Report</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  disabled={uploading}
                />
              </div>
              <Button onClick={handleFileUpload} disabled={!selectedFile || uploading}>
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? 'Uploading...' : 'Upload Report'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Uploaded Report */}
        {report.reportFile && (
          <Card>
            <CardHeader>
              <CardTitle>Report File</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{report.reportFile.filename}</p>
                  <a
                    href={report.reportFile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    View Report
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Findings & Impression */}
        <Card>
          <CardHeader>
            <CardTitle>Findings & Impression</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="findings">Findings</Label>
              <Textarea
                id="findings"
                value={findings}
                onChange={(e) => setFindings(e.target.value)}
                rows={5}
                placeholder="Enter your findings..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="impression">Impression</Label>
              <Textarea
                id="impression"
                value={impression}
                onChange={(e) => setImpression(e.target.value)}
                rows={5}
                placeholder="Enter your impression..."
              />
            </div>
            <Button onClick={handleSaveFindings}>Save Findings</Button>
          </CardContent>
        </Card>

        {/* Status Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Status Management</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {report.status === 'created' && (
              <Button onClick={() => handleStatusChange('in_progress')}>
                Start Processing
              </Button>
            )}
            {report.status === 'in_progress' && report.reportFile && (
              <Button onClick={() => handleStatusChange('reviewed')}>
                Mark as Reviewed
              </Button>
            )}
            {report.status === 'reviewed' && (
              <Button onClick={() => handleStatusChange('approved')}>
                Approve Report
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ReportDetail;
