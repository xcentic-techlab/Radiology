import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

import { casesService } from "@/api/case.service";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { reportsService } from "@/api/reports.service";
import { patientsService } from "@/api/patients.service";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/ui/status-badge";
import { format } from "date-fns";

const ReportDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  /** REPORT STATES */
  const [findings, setFindings] = useState("");
  const [impression, setImpression] = useState("");
  const [procedure, setProcedure] = useState("");

  /** PATIENT EDIT MODE */
  const [isEditingPatient, setIsEditingPatient] = useState(false);
  const [patientForm, setPatientForm] = useState<any>({});
  const [clinicalHistory, setClinicalHistory] = useState("");
const [previousInjury, setPreviousInjury] = useState("");
const [previousSurgery, setPreviousSurgery] = useState("");
const [initialLoadDone, setInitialLoadDone] = useState(false);
const [indication, setIndication] = useState("");
const [technique, setTechnique] = useState("");
const [conclusion, setConclusion] = useState("");
const [notes, setNotes] = useState("");
const [govIdFile, setGovIdFile] = useState<File | null>(null);
const [govUploading, setGovUploading] = useState(false);




  const [selectedFile, setSelectedFile] = useState<File | null>(null);


  const uploadGovId = async () => {
  if (!govIdFile) return;

  try {
    setGovUploading(true);

    await patientsService.uploadGovtId(report.patient._id, govIdFile);

    toast({
      title: "Uploaded",
      description: "Govt ID updated successfully",
    });

    setGovIdFile(null);
    loadReport(); // refresh UI
  } catch (err) {
    toast({
      title: "Error",
      description: "Govt ID upload failed",
      variant: "destructive",
    });
  } finally {
    setGovUploading(false);
  }
};


  // ###########################
  // LOAD REPORT
  // ###########################
const loadReport = async () => {
  setLoading(true);

  try {
    const data = await reportsService.getById(id as string);
    setReport(data);

    // always update findings
    setFindings(data.findings || "");
    setImpression(data.impression || "");
    setProcedure(data.procedure || "");

    const p = data.patient || {};

    // always update clinical fields
    setClinicalHistory(p.clinicalHistory || "");
    setPreviousInjury(p.previousInjury || "");
    setPreviousSurgery(p.previousSurgery || "");

    setIndication(data.indication || "");
setTechnique(data.technique || "");
setConclusion(data.conclusion || "");
setNotes(data.notes || "");


    // 🚀 PATIENT FORM KO SIRF FIRST TIME LOAD KARO
    if (!initialLoadDone) {
      setPatientForm({
        firstName: p.firstName || "",
        lastName: p.lastName || "",
        phone: p.contact?.phone || "",
        email: p.contact?.email || "",
        age: p.age || "",
        gender: p.gender || "",
        address: p.address || "",
        caseDescription: p.caseDescription || "",
        caseType: p.caseType || "",
        referredDoctor: p.referredDoctor || "",
        idType: p.govtId?.idType || "",
        idNumber: p.govtId?.idNumber || "",
        paymentStatus: p.paymentStatus || "",
      });

      setInitialLoadDone(true);  // mark as loaded
    }

  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to load report",
      variant: "destructive",
    });
  }

  setLoading(false);
};


useEffect(() => {
  if (id) loadReport();
}, [id]);



  // ###########################
  // SAVE PATIENT DETAILS
  // ###########################
  const savePatientDetails = async () => {
    try {
      setSaving(true);

      await patientsService.update(report.patient._id, {
        firstName: patientForm.firstName,
        lastName: patientForm.lastName,
        address: patientForm.address,
        age: patientForm.age,
        gender: patientForm.gender,
        caseDescription: patientForm.caseDescription,
        caseType: patientForm.caseType,
        referredDoctor: patientForm.referredDoctor,
        contact: {
          phone: patientForm.phone,
          email: patientForm.email,
        },
        govtId: {
          idType: patientForm.idType,
          idNumber: patientForm.idNumber,
        },
      });

      toast({ title: "Success", description: "Patient updated" });
      setIsEditingPatient(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update patient details",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // ###########################
  // SAVE REPORT FINDINGS
  // ###########################
  const saveFindings = async () => {
    try {
      setSaving(true);
      await reportsService.update(report._id, {
  procedure,
  indication,
  technique,
  findings,
  impression,
  conclusion,
  notes,
});

      toast({ title: "Saved", description: "Findings updated" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save findings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // ###########################
  // FILE UPLOAD
  // ###########################
  const uploadFile = async () => {
    if (!selectedFile) return;
    setUploading(true);

    try {
      await reportsService.uploadFile(report._id, selectedFile);
      toast({ title: "Uploaded", description: "File uploaded successfully" });
      setSelectedFile(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "File upload failed",
        variant: "destructive",
      });
    }

    setUploading(false);
  };

  // ###########################
  // UPDATE WORKFLOW STATUS
  // ###########################
const changeStatus = async (status) => {
  try {
    setSaving(true);

    await reportsService.update(report._id, { status });

    const caseId = report.caseId || report.case?._id || report.case;
    if (!caseId) return;

    // case follows report
    await casesService.update(caseId, { status });

    toast({ title: "Updated", description: `Marked as ${status}` });

    loadReport();
  } catch (error) {
    console.error(error);
  } finally {
    setSaving(false);
  }
};

  // ###########################
// SAVE CLINICAL HISTORY
// ###########################
const saveClinicalHistory = async () => {
  try {
    setSaving(true);

    await patientsService.update(report.patient._id, {
      clinicalHistory,
      previousInjury,
      previousSurgery,
    });

    toast({
      title: "Saved",
      description: "Clinical history updated",
    });
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to update clinical history",
      variant: "destructive",
    });
  } finally {
    setSaving(false);
  }
};


const saveProcedureDetails = async () => {
  try {
    setSaving(true);

    await reportsService.update(report._id, {
      procedure,
      indication,
      technique,
      conclusion,
      notes,
    });

    toast({
      title: "Saved",
      description: "Procedure details updated successfully",
    });

  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to update procedure details",
      variant: "destructive",
    });
  } finally {
    setSaving(false);
  }
};


  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">Loading...</div>
      </DashboardLayout>
    );
  }

  const InputField = ({ label, value, onChange }: any) => (
    <div className="flex flex-col">
      <Label>{label}</Label>
      <Input value={value} onChange={onChange} />
    </div>
  );

  

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div>
            <h1 className="text-3xl font-bold">Case #{report.caseNumber}</h1>
            <p className="text-muted-foreground">Report details</p>
          </div>

          <div className="ml-auto flex gap-3 items-center">
            <StatusBadge status={report.status} />
            <Button size="sm" onClick={() => loadReport()}>
              Refresh
            </Button>
          </div>
        </div>

        {/* PATIENT CARD */}
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Patient Information</CardTitle>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditingPatient(!isEditingPatient)}
            >
              {isEditingPatient ? "Cancel" : "Edit"}
            </Button>
          </CardHeader>

          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {!isEditingPatient ? (
              <>
                <div>
                  <Label>Patient</Label>
                  <p>
                    {patientForm.firstName} {patientForm.lastName}
                  </p>
                  <p className="text-muted-foreground">{patientForm.phone}</p>
                  <p className="text-muted-foreground">{patientForm.email}</p>
                </div>

                <div>
                  <Label>Gender / Age</Label>
                  <p>
                    {patientForm.gender} / {patientForm.age}
                  </p>
                </div>

                <div>
                  <Label>Address</Label>
                  <p>{patientForm.address}</p>
                </div>

                <div>
                  <Label>Case Type</Label>
                  <p>{patientForm.caseType}</p>
                </div>

                <div>
                  <Label>Case Description</Label>
                  <p>{patientForm.caseDescription}</p>
                </div>

                <div>
                  <Label>Govt ID</Label>
                  <p>
                    {patientForm.idType} — {patientForm.idNumber}
                  </p>
                </div>

                <div>
                  <Label>Referred Doctor</Label>
                  <p>{patientForm.referredDoctor}</p>
                </div>
                <div className="col-span-3 border p-3 rounded-lg">
  <Label>Government ID</Label>

  {report.patient.govtId?.fileUrl ? (
    <div className="flex items-start justify-between mt-2">
      <div className="flex gap-3 items-center">
        <img
          src={report.patient.govtId.fileUrl}
          className="h-20 w-32 rounded border cursor-pointer"
          onClick={() =>
            window.open(report.patient.govtId.fileUrl, "_blank")
          }
        />

        <div>
          <p className="text-sm">
            {report.patient.govtId.idType} — {report.patient.govtId.idNumber}
          </p>
        </div>
      </div>

      <div>
        <Input
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => setGovIdFile(e.target.files?.[0] || null)}
        />

        <Button
          className="mt-2"
          size="sm"
          disabled={!govIdFile || govUploading}
          onClick={uploadGovId}
        >
          {govUploading ? "Uploading..." : "Replace Govt ID"}
        </Button>
      </div>
    </div>
  ) : (
    <>
      <div className="flex gap-3 mt-2">
        <Input
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => setGovIdFile(e.target.files?.[0] || null)}
        />

        <Button
          size="sm"
          disabled={!govIdFile || govUploading}
          onClick={uploadGovId}
        >
          {govUploading ? "Uploading..." : "Upload Govt ID"}
        </Button>
      </div>
    </>
  )}
</div>

              </>
            ) : (
              <>
                <InputField
                  label="First Name"
                  value={patientForm.firstName}
                  onChange={(e: any) =>
                    setPatientForm({ ...patientForm, firstName: e.target.value })
                  }
                />

                <InputField
                  label="Last Name"
                  value={patientForm.lastName}
                  onChange={(e: any) =>
                    setPatientForm({ ...patientForm, lastName: e.target.value })
                  }
                />

                <InputField
                  label="Phone"
                  value={patientForm.phone}
                  onChange={(e: any) =>
                    setPatientForm({ ...patientForm, phone: e.target.value })
                  }
                />

                <InputField
                  label="Email"
                  value={patientForm.email}
                  onChange={(e: any) =>
                    setPatientForm({ ...patientForm, email: e.target.value })
                  }
                />

                <InputField
                  label="Age"
                  value={patientForm.age}
                  onChange={(e: any) =>
                    setPatientForm({ ...patientForm, age: e.target.value })
                  }
                />

                <InputField
                  label="Gender"
                  value={patientForm.gender}
                  onChange={(e: any) =>
                    setPatientForm({ ...patientForm, gender: e.target.value })
                  }
                />

                <InputField
                  label="Address"
                  value={patientForm.address}
                  onChange={(e: any) =>
                    setPatientForm({ ...patientForm, address: e.target.value })
                  }
                />

                <InputField
                  label="Case Type"
                  value={patientForm.caseType}
                  onChange={(e: any) =>
                    setPatientForm({ ...patientForm, caseType: e.target.value })
                  }
                />

                <InputField
                  label="Case Description"
                  value={patientForm.caseDescription}
                  onChange={(e: any) =>
                    setPatientForm({
                      ...patientForm,
                      caseDescription: e.target.value,
                    })
                  }
                />

                <InputField
                  label="Govt ID Type"
                  value={patientForm.idType}
                  onChange={(e: any) =>
                    setPatientForm({ ...patientForm, idType: e.target.value })
                  }
                />

                <InputField
                  label="Govt ID Number"
                  value={patientForm.idNumber}
                  onChange={(e: any) =>
                    setPatientForm({ ...patientForm, idNumber: e.target.value })
                  }
                />

                <InputField
                  label="Referred Doctor"
                  value={patientForm.referredDoctor}
                  onChange={(e: any) =>
                    setPatientForm({
                      ...patientForm,
                      referredDoctor: e.target.value,
                    })
                  }
                />

                <Button
                  className="mt-4 col-span-3"
                  onClick={savePatientDetails}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Patient Details"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>


<Card>
  <CardHeader>
    <CardTitle>Procedure Details</CardTitle>
  </CardHeader>

  <CardContent className="space-y-4">
    <div>
      <Label>Procedure</Label>
      <Input
        value={procedure}
        onChange={(e) => setProcedure(e.target.value)}
      />
    </div>

    <div>
      <Label>Indication</Label>
      <Textarea
        rows={2}
        value={indication}
        onChange={(e) => setIndication(e.target.value)}
      />
    </div>

    <div>
      <Label>Technique</Label>
      <Textarea
        rows={2}
        value={technique}
        onChange={(e) => setTechnique(e.target.value)}
      />
    </div>

    <div>
      <Label>Conclusion</Label>
      <Textarea
        rows={2}
        value={conclusion}
        onChange={(e) => setConclusion(e.target.value)}
      />
    </div>

    <div>
      <Label>Notes</Label>
      <Textarea
        rows={2}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
    </div>

    {/* SAVE BUTTON FOR THIS SECTION */}
    <Button onClick={saveProcedureDetails} disabled={saving}>
      {saving ? "Saving..." : "Save Procedure Details"}
    </Button>
  </CardContent>
</Card>

        {/* Clinical history (patient model) */}
        <Card>
          <CardHeader>
            <CardTitle>Clinical History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Clinical history</Label>
              <Textarea rows={3} value={clinicalHistory} onChange={(e) => setClinicalHistory(e.target.value)} />
            </div>
            <div>
              <Label>Previous injury</Label>
              <Textarea rows={2} value={previousInjury} onChange={(e) => setPreviousInjury(e.target.value)} />
            </div>
            <div>
              <Label>Previous surgery</Label>
              <Textarea rows={2} value={previousSurgery} onChange={(e) => setPreviousSurgery(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <Button onClick={saveClinicalHistory} disabled={saving}>Save Clinical History</Button>
            </div>
          </CardContent>
        </Card>

        
        {/* Findings & Impression */}
        <Card>
          <CardHeader>
            <CardTitle>Findings & Impression</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Findings</Label>
              <Textarea rows={8} value={findings} onChange={(e) => setFindings(e.target.value)} />
            </div>
            <div>
              <Label>Impression</Label>
              <Textarea rows={5} value={impression} onChange={(e) => setImpression(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <Button onClick={saveFindings} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            </div>
          </CardContent>
        </Card>

        {/* File upload / view */}
        <Card>
          <CardHeader>
            <CardTitle>Report File</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!report.reportFile ? (
              <div className="space-y-3">
                <Label>Upload final PDF</Label>
                <div className="flex gap-2 items-center">
                  <Input type="file" accept="application/pdf,image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} disabled={uploading} />
                  <Button onClick={uploadFile} disabled={!selectedFile || uploading}>
                    <Upload className="mr-2 h-4 w-4" /> {uploading ? 'Uploading…' : 'Upload'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">{report.reportFile?.filename || 'Report.pdf'}</p>
                    <a href={report.reportFile?.url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">View / Download</a>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => { navigator.clipboard?.writeText(report.reportFile?.url || ''); toast({ title: 'Copied', description: 'File URL copied' }); }}>Copy URL</Button>
                  <Button size="sm" variant="outline" onClick={() => { setSelectedFile(null); setReport({ ...report, reportFile: null }); }}>Replace</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>





        {/* Workflow actions */}
<Card>
  <CardHeader>
    <CardTitle>Workflow</CardTitle>
  </CardHeader>

  <CardContent className="flex flex-wrap gap-3">

    {/* Show Approve btn only when PENDING */}
    {report.status === "pending" && (
      <Button onClick={() => changeStatus("approved")}>
        Approve Report
      </Button>
    )}

    {/* Already Approved */}
    {report.status === "approved" && (
      <StatusBadge status="approved" />
    )}


  </CardContent>
</Card>


      </div>
    </DashboardLayout>
  );
};

export default ReportDetail;
