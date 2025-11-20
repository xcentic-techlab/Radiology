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
    <div className="max-w-3xl mx-auto space-y-10">

      {/* PAGE TITLE */}
      <div className="text-center space-y-1">
        <h1 className="text-4xl font-bold text-slate-800 tracking-tight">
          Create Report
        </h1>
        <p className="text-muted-foreground text-sm">
          Fill details to generate patient report
        </p>
      </div>

      {/* MAIN CARD */}
      <Card className="bg-white/60 backdrop-blur-md border border-white/40 shadow-xl rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold">
            Report Details
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Case Number: <span className="font-semibold">{caseData.caseNumber}</span>
          </p>
        </CardHeader>

        <CardContent className="pt-4">
          <form className="space-y-6" onSubmit={handleSubmit(submitReport)}>

            {/* FIELD: Procedure */}
            <div className="space-y-1">
              <label className="font-medium">Procedure</label>
              <Input
                className="rounded-xl bg-white/50 shadow-sm backdrop-blur-sm"
                {...register("procedure")}
              />
            </div>

            {/* FIELD: Indication */}
            <div className="space-y-1">
              <label className="font-medium">Indication</label>
              <Textarea
                rows={2}
                className="rounded-xl bg-white/50 shadow-sm backdrop-blur-sm"
                {...register("indication")}
              />
            </div>

            {/* FIELD: Technique */}
            <div className="space-y-1">
              <label className="font-medium">Technique</label>
              <Textarea
                rows={2}
                className="rounded-xl bg-white/50 shadow-sm backdrop-blur-sm"
                {...register("technique")}
              />
            </div>

            {/* FIELD: Findings */}
            <div className="space-y-1">
              <label className="font-medium">Findings</label>
              <Textarea
                rows={4}
                className="rounded-xl bg-white/50 shadow-sm backdrop-blur-sm"
                {...register("findings")}
              />
            </div>

            {/* FIELD: Impression */}
            <div className="space-y-1">
              <label className="font-medium">Impression</label>
              <Textarea
                rows={3}
                className="rounded-xl bg-white/50 shadow-sm backdrop-blur-sm"
                {...register("impression")}
              />
            </div>

            {/* FIELD: Conclusion */}
            <div className="space-y-1">
              <label className="font-medium">Conclusion</label>
              <Textarea
                rows={3}
                className="rounded-xl bg-white/50 shadow-sm backdrop-blur-sm"
                {...register("conclusion")}
              />
            </div>

            {/* FIELD: Notes */}
            <div className="space-y-1">
              <label className="font-medium">Notes</label>
              <Textarea
                rows={2}
                className="rounded-xl bg-white/50 shadow-sm backdrop-blur-sm"
                {...register("notes")}
              />
            </div>

            {/* PDF Upload */}
            <div className="space-y-1">
              <label className="font-medium">Upload PDF Report</label>
              <Input
                type="file"
                accept="application/pdf,image/*"
                className="rounded-xl bg-white/50 shadow-sm backdrop-blur-sm"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-4 flex justify-end">
  <Button
    type="submit"
    className="rounded-xl px-6 py-2 bg-blue-600 hover:bg-blue-700 shadow-lg"
  >
    Save Report
  </Button>
</div>

          </form>
        </CardContent>
      </Card>
    </div>
  </DashboardLayout>
);

};

export default CreateReport;
