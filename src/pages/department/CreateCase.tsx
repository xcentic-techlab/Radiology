
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { patientsService } from "@/api/patients.service";
import { usersService } from "@/api/users.service";
import { casesService } from "@/api/case.service";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/authStore";


const caseSchema = z.object({
  patient: z.string().min(1, "Patient is required"),
  assignedTo: z.string().optional()
});

const Info = ({ label, value }) => (
  <div>
    <Label className="text-muted-foreground">{label}</Label>
    <p className="font-semibold">{value || "—"}</p>
  </div>
);

const CreateCase = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [patients, setPatients] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [patientInfo, setPatientInfo] = useState(null);

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingHistory, setIsEditingHistory] = useState(false);
  const [cases, setCases] = useState([]);
  const [availablePatients, setAvailablePatients] = useState([]);
  




  const { handleSubmit, setValue, watch } = useForm({
    resolver: zodResolver(caseSchema),
  });

  const selectedPatient = watch("patient");
useEffect(() => {
  (async () => {
    try {
      const deptId =
        user?.department?._id ||
        localStorage.getItem("departmentId");


      if (!deptId) {
        return;
      }
      const patientsData = await patientsService.getDepartmentPatientDetails(deptId);
      const usersData = await usersService.getAll();
      const casesData = await casesService.getByDepartment(deptId);

      setCases(casesData);

      const filtered = patientsData.filter(
        (p) =>
          p.departmentAssignedTo === deptId ||
          p.departmentAssignedTo?._id === deptId
      );

      setPatients(filtered);

      const noCasePatients = filtered.filter(
        (p) =>
          !casesData.some((c) => {
            const casePatientId =
              typeof c.patientId === "string" ? c.patientId : c.patientId?._id;

            return casePatientId === p._id;
          })
      );

      setAvailablePatients(noCasePatients);
      setUsers(usersData);

    } catch (err) {
      console.error("ERROR WHILE LOADING:", err);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  })();
}, []);
  useEffect(() => {
    if (!selectedPatient) return setPatientInfo(null);

    (async () => {
      try {
        const p = await patientsService.getById(selectedPatient);
        setPatientInfo(p);

        if (p.defaultProcedure) {
          setValue("procedure", p.defaultProcedure);
        }

        if (p.scheduledAt) {
          setValue("scheduledAt", new Date(p.scheduledAt).toISOString().slice(0, 16));
        }
      } catch (e) {
        console.log("❌ Patient fetch failed", e);
      }
    })();
  }, [selectedPatient]);
  useEffect(() => {
    if (!users.length || !user?.department?._id) return;
    const deptUsers = users.filter(
      (u) =>
        u.role === "department_user" &&
        u?.department?._id === user.department._id
    );
    setFilteredUsers(deptUsers);
  }, [users]);
  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      if (patientInfo.paymentStatus !== "paid") {
        toast({
          title: "Payment Required",
          description: "Please complete payment before opening a case.",
          variant: "destructive",
        });
        return;
      }

      const payload = {
        patientId: data.patient,
        department: user?.department?._id,
        assignedTo: data.assignedTo || undefined
      };

      await casesService.create(payload);

      toast({ title: "Success", description: "Case created successfully" });
      navigate("/department/create-reports");
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to create case",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

return (
  <>
    <div className="max-w-3xl mx-auto space-y-10">

      <div className="text-center space-y-1">
        <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Create Case</h1>
        <p className="text-muted-foreground text-sm">
          Open a new case for a patient
        </p>
      </div>
      <Card className="bg-white/60 backdrop-blur-md border border-white/40 shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Case Details
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            <div className="space-y-2">
              <Label className="font-medium">Select Patient *</Label>
              <Select
                onValueChange={(v) => setValue("patient", v)}
                disabled={loading || isSubmitting}
              >
                <SelectTrigger className="rounded-xl bg-white/50 backdrop-blur-sm shadow-sm">
                  <SelectValue placeholder="Choose patient" />
                </SelectTrigger>

                <SelectContent className="rounded-xl">
                  {availablePatients.length > 0 ? (
                    availablePatients.map((p) => (
                      <SelectItem key={p._id} value={p._id}>
                        {p.firstName} {p.lastName} — {p.contact?.phone}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground px-4 py-2">
                      No available patients
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            {patientInfo && (
              <Card className="rounded-xl bg-white/70 backdrop-blur-md shadow-md border border-white/40">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    Patient Information
                  </CardTitle>
                </CardHeader>

                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">

                  <Info label="Patient ID" value={patientInfo.patientId} />
                  <Info label="Name" value={`${patientInfo.firstName} ${patientInfo.lastName}`} />

                  <Info label="Age" value={patientInfo.age} />
                  <Info label="Gender" value={patientInfo.gender} />

                  <Info label="Phone" value={patientInfo.contact?.phone} />
                  <Info label="Email" value={patientInfo.contact?.email} />

                  <Info label="Address" value={patientInfo.address} />
                  <Info label="Referred Doctor" value={patientInfo.referredDoctor} />
                  <Info 
  label="Test Name" 
  value={patientInfo.selectedTests?.[0]?.name || "—"} 
/>

{/* <Info 
  label="MRP Price" 
  value={patientInfo.selectedTests?.[0]?.mrp ? `₹${patientInfo.selectedTests[0].mrp}` : "—"} 
/>

<Info  
  label="Offer Price" 
  value={patientInfo.selectedTests?.[0]?.offerRate ? `₹${patientInfo.selectedTests[0].offerRate}` : "—"}  
/> */}


                  <div>
                    <Label className="text-muted-foreground">Payment Status</Label>
                    <p
                      className={`w-fit mt-1 px-2 py-1 rounded text-white text-xs font-semibold
                      ${patientInfo.paymentStatus === "paid" ? "bg-green-600" : "bg-red-600"}`}
                    >
                      {patientInfo.paymentStatus.toUpperCase()}
                    </p>
                  </div>

                  <Info label="Case Type" value={patientInfo.caseType} />
                  <Info label="Govt ID Type" value={patientInfo.govtId?.idType} />
                  <Info label="Govt ID Number" value={patientInfo.govtId?.idNumber} />

                  <div className="col-span-2">
                    <Label className="text-muted-foreground">Case Description</Label>
                    <p className="mt-1 bg-white/40 p-2 rounded-xl backdrop-blur-sm shadow-sm text-sm">
                      {patientInfo.caseDescription || "—"}
                    </p>
                  </div>

                </CardContent>
              </Card>
            )}

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => navigate("/department/create-reports")}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting || loading}
                className="rounded-xl bg-blue-600 shadow-lg hover:bg-blue-700"
              >
                Create Case
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>

    </div>
  </>
);

};

export default CreateCase;
