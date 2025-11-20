import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { reportsService } from "@/api/reports.service";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function EditReport() {
  const { id } = useParams();
  const [report, setReport] = useState<any>(null);

  const [procedure, setProc] = useState("");
  const [findings, setFind] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const r = await reportsService.getById(id!);
    setReport(r);
    setProc(r.procedure);
    setFind(r.findings);
  }

  async function save() {
    await reportsService.update(id!, { procedure, findings });
    alert("Updated");
  }

  if (!report) return <DashboardLayout>Loading...</DashboardLayout>;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold">Edit Report</h1>

      <div className="space-y-4 max-w-xl mt-6">
        <Input value={procedure} onChange={(e) => setProc(e.target.value)} />
        <Textarea value={findings} onChange={(e) => setFind(e.target.value)} />

        <Button onClick={save}>Save</Button>
      </div>
    </DashboardLayout>
  );
}
