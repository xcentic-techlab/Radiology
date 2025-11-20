import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { casesService } from "@/api/case.service";
import { reportsService } from "@/api/reports.service";
import { useToast } from "@/hooks/use-toast";

const CreateReport = () => {
  const { toast } = useToast();
  const { caseId } = useParams();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState(null);
  const [file, setFile] = useState<File | null>(null);

  const { register, handleSubmit, setValue } = useForm();

  useEffect(() => {
    loadCase();
  }, []);

  const loadCase = async () => {
    try {
      const data = await casesService.getById(caseId);
      setCaseData(data);
      setValue("procedure", data.procedure || "");
    } catch {
      toast({ title: "Error", description: "Failed to load case" });
    }
  };

  const submitReport = async (data) => {
    try {
      const payload = {
  caseId: caseData._id,   // ⭐ REQUIRED
  patientId: caseData.patientId._id,
  department: caseData.department,
  procedure: data.procedure,
  indication: data.indication,
  technique: data.technique,
  findings: data.findings,
  impression: data.impression,
  conclusion: data.conclusion,
  notes: data.notes,
  assignedTo: caseData.assignedTo?._id,
};


      const report = await reportsService.create(payload);

      // FILE UPLOAD
      if (file) {
        await reportsService.uploadFile(report._id, file);
      }

      // UPDATE CASE (attach report + status)
await casesService.update(caseData._id, {
  reportId: report._id,
  status: "created"
});

toast({
  title: "Success",
  description: "Report created successfully.",
});

// Redirect to view page
navigate(`/department/report/${report._id}`);

    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to create report",
      });
    }
  };

  if (!caseData) return <p>Loading...</p>;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create Report</CardTitle>
            <p className="text-sm text-muted-foreground">
              Case Number: {caseData.caseNumber}
            </p>
          </CardHeader>

          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit(submitReport)}>
              <div>
                <label>Procedure</label>
                <Input {...register("procedure")} />
              </div>

              <div>
                <label>Indication</label>
                <Textarea rows={2} {...register("indication")} />
              </div>

              <div>
                <label>Technique</label>
                <Textarea rows={2} {...register("technique")} />
              </div>

              <div>
                <label>Findings</label>
                <Textarea rows={4} {...register("findings")} />
              </div>

              <div>
                <label>Impression</label>
                <Textarea rows={3} {...register("impression")} />
              </div>

              <div>
                <label>Conclusion</label>
                <Textarea rows={3} {...register("conclusion")} />
              </div>

              <div>
                <label>Notes</label>
                <Textarea rows={2} {...register("notes")} />
              </div>

              {/* PDF UPLOAD */}
              <div>
                <label>Upload PDF Report (optional)</label>
                <Input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>

              <Button type="submit">Save Report</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateReport;
