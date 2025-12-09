import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSearchParams } from "react-router-dom";
import { departmentsService } from "@/api/departments.service";
import { Trash2 } from "lucide-react";


import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DashboardLayout from '@/components/layout/DashboardLayout';
import { patientsService, Patient } from '@/api/patients.service';
import { useToast } from '@/hooks/use-toast';
import CreatePatientDialog from '@/components/dialogs/CreatePatientDialog';
import { openDummyRazorpay } from "@/utils/razorpay";
import { format } from 'date-fns';

const Patients = () => {
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [params] = useSearchParams();
  const [departments, setDepartments] = useState([]);
  const [searchById, setSearchById] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [patientToDelete, setPatientToDelete] = useState<string | null>(null);


  


const [filters, setFilters] = useState({
  name: "",
  caseType: "",
  payment: params.get("filter") === "paid" ? "paid" :
            params.get("filter") === "pending" ? "pending" : "",
  department: params.get("department") ?? "",
    date: params.get("date") ?? "all",
  customFrom: "",
  customTo: "",
});

useEffect(() => {
  setFilters((prev) => ({
    ...prev,
    date: params.get("date") ?? "all",
    department: params.get("department") ?? "",
    payment:
      params.get("filter") === "paid"
        ? "paid"
        : params.get("filter") === "pending"
        ? "pending"
        : "",
  }));
}, [params]);


useEffect(() => {
  let data = [...patients];

  if (searchById.trim() !== "") {
    data = data.filter((p) =>
      p.patientId?.toLowerCase().includes(searchById.toLowerCase())
    );
  }
  if (search.trim() !== "") {
    data = data.filter(
      (p) =>
        p.firstName.toLowerCase().includes(search.toLowerCase()) ||
        p.lastName.toLowerCase().includes(search.toLowerCase()) ||
        p.contact.phone.includes(search)
    );
  }
  if (filters.name) {
    data = data.filter((p) =>
      (p.firstName + p.lastName)
        .toLowerCase()
        .includes(filters.name.toLowerCase())
    );
  }
  if (filters.caseType) {
    data = data.filter((p) => p.caseType === filters.caseType);
  }
  if (filters.payment) {
    data = data.filter((p) => p.paymentStatus === filters.payment);
  }
if (filters.department) {
  data = data.filter(
    (p) =>
      p.assignedDepartment &&
      p.assignedDepartment.toLowerCase() === filters.department.toLowerCase()
  );
}
  if (filters.date !== "all") {
    const now = new Date();

    data = data.filter((p) => {
      const created = new Date(p.createdAt);

      if (filters.date === "24h")
        return now.getTime() - created.getTime() <= 24 * 60 * 60 * 1000;

      if (filters.date === "yesterday") {
        const diff = now.getDate() - created.getDate();
        return diff === 1;
      }

      if (filters.date === "week")
        return now.getTime() - created.getTime() <= 7 * 24 * 60 * 60 * 1000;

      if (filters.date === "month")
        return now.getTime() - created.getTime() <= 30 * 24 * 60 * 60 * 1000;

      if (filters.date === "custom") {
        if (!filters.customFrom || !filters.customTo) return true;

        return (
          created >= new Date(filters.customFrom) &&
          created <= new Date(filters.customTo)
        );
      }

      return true;
    });
  }

  setFilteredPatients(data);
}, [patients, searchById, search, filters]);




  useEffect(() => {
  fetchPatients();
  fetchDepartments();
}, []);


const fetchDepartments = async () => {
  try {
    const data = await departmentsService.getAll();
    setDepartments(data);
  } catch (error) {
    console.log("ERROR FETCHING DEPARTMENTS:", error);
    toast({
      title: "Error",
      description: "Failed to load departments",
      variant: "destructive",
    });
  }
};



  const fetchPatients = async () => {
    try {
      const data = await patientsService.list();
      setPatients(data);
      setFilteredPatients(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load patients',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  let data = [...patients];

  if (searchById.trim() !== "") {
    data = data.filter((p) =>
      p.patientId?.toLowerCase().includes(searchById.toLowerCase())
    );
  }
  if (search.trim() !== "") {
    data = data.filter(
      (p) =>
        p.firstName.toLowerCase().includes(search.toLowerCase()) ||
        p.lastName.toLowerCase().includes(search.toLowerCase()) ||
        p.contact.phone.includes(search)
    );
  }
  if (filters.name) {
    data = data.filter((p) =>
      (p.firstName + p.lastName).toLowerCase().includes(filters.name.toLowerCase())
    );
  }
  if (filters.caseType) {
    data = data.filter((p) => p.caseType === filters.caseType);
  }
  if (filters.payment) {
    data = data.filter((p) => p.paymentStatus === filters.payment);
  }
if (filters.department) {
  data = data.filter(
    (p) =>
      p.assignedDepartment &&
      p.assignedDepartment.toLowerCase() === filters.department.toLowerCase()
  );
}
  if (filters.date !== "all") {
    const now = new Date();

    data = data.filter((p) => {
      const created = new Date(p.createdAt);

      if (filters.date === "24h")
        return now.getTime() - created.getTime() <= 24 * 60 * 60 * 1000;

      if (filters.date === "yesterday")
        return now.getDate() - created.getDate() === 1;

      if (filters.date === "week")
        return now.getTime() - created.getTime() <= 7 * 24 * 60 * 60 * 1000;

      if (filters.date === "month")
        return now.getTime() - created.getTime() <= 30 * 24 * 60 * 60 * 1000;

      if (filters.date === "custom") {
        if (!filters.customFrom || !filters.customTo) return true;

        return (
          created >= new Date(filters.customFrom) &&
          created <= new Date(filters.customTo)
        );
      }

      return true;
    });
  }

  setFilteredPatients(data);
}, [patients, searchById, search, filters]);


const handleDeletePatient = async () => {
  if (!patientToDelete) return;

  try {
    await patientsService.delete(patientToDelete);

    toast({
      title: "Deleted",
      description: "Patient record removed successfully",
    });

    setDeleteDialogOpen(false);
    fetchPatients();
  } catch (err) {
    toast({
      title: "Error",
      description: "Failed to delete patient",
      variant: "destructive",
    });
  }
};



const handleMarkPaid = async (patient: Patient) => {
  openDummyRazorpay({
    onSuccess: async () => {
      try {
        await patientsService.updatePayment(patient._id);
        const dept = departments.find(
          (d) => d.name.trim().toLowerCase() === patient.assignedDepartment.trim().toLowerCase()
        );

        if (dept) {
          await patientsService.assignDepartment(patient._id, {
            departmentId: dept._id,
            departmentName: dept.name,
          });
        }

        toast({ title: "Payment Successful and Department Assigned" });
        fetchPatients();

      } catch (err) {
        toast({
          title: "Error",
          description: "Payment done but department auto-assign failed",
          variant: "destructive",
        });
      }
    },
  });
};


const handleAssignDepartment = async (patient: Patient) => {
  try {
    const dept = departments.find(
  (d) => d.name.trim().toLowerCase() === patient.assignedDepartment.trim().toLowerCase()
);

    if (!dept) {
      toast({
        title: "Error",
        description: `Department "${patient.assignedDepartment}" not found.`,
        variant: "destructive",
      });
      return;
    }

    await patientsService.assignDepartment(patient._id, {
  departmentId: dept._id,
  departmentName: dept.name,
});

patient.status = "sent_to_department";
patient.departmentAssignedTo = dept._id;
patient.assignedDepartment = dept.name;

toast({
  title: "Assigned!",
  description: `Patient assigned to ${dept.name} and status updated`,
});
fetchPatients();

  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to assign department",
      variant: "destructive",
    });
  }
};
  return (
  <>
    <div className="space-y-6">

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground">Manage and track patient records</p>
        </div>

<Button
  onClick={() => setDialogOpen(true)}
  className="px-6 py-2 rounded-xl bg-blue-600/90 hover:bg-blue-700 
             backdrop-blur-md shadow-lg shadow-blue-500/20 
             text-white font-semibold transition-all"
>
  Add Patient
</Button>


      </div>
      <Card className="backdrop-blur-md bg-white/60 shadow-xl border rounded-2xl">
        <CardHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <Input
              placeholder="Search by Patient ID..."
              value={searchById}
              onChange={(e) => setSearchById(e.target.value)}
              className="shadow-sm focus:ring-2 focus:ring-blue-300 rounded-xl"
            />
            <Input
              placeholder="Search Name..."
              onChange={(e) =>
                setFilters((f) => ({ ...f, name: e.target.value }))
              }
              className="rounded-xl shadow-sm"
            />
            <select
              className="border rounded-xl px-3 py-2 bg-white/70 shadow-sm"
              onChange={(e) =>
                setFilters((f) => ({ ...f, caseType: e.target.value }))
              }
            >
              <option value="">Case Type</option>
              <option value="Urgent">Urgent</option>
              <option value="Routine">Routine</option>
              <option value="Emergency">Emergency</option>
            </select>
            <select
              className="border rounded-xl px-3 py-2 bg-white/70 shadow-sm"
              onChange={(e) =>
                setFilters((f) => ({ ...f, payment: e.target.value }))
              }
            >
              <option value="">Payment</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
            <select
              className="border rounded-xl px-3 py-2 bg-white/70 shadow-sm"
              onChange={(e) =>
                setFilters((f) => ({ ...f, department: e.target.value }))
              }
            >
              <option value="">Department</option>
              <option value="mri">MRI</option>
              <option value="ct scan">CT Scan</option>
              <option value="x-ray">X-Ray</option>
              <option value="ultrasound">UltraSound</option>
            </select>
            <select
              className="border rounded-xl px-3 py-2 bg-white/70 shadow-sm"
              onChange={(e) =>
                setFilters((f) => ({ ...f, date: e.target.value }))
              }
            >
              <option value="all">All</option>
              <option value="24h">Last 24 Hours</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="custom">Custom</option>
            </select>
            {filters.date === "custom" && (
              <div className="col-span-full flex gap-3">
                <input
                  type="date"
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, customFrom: e.target.value }))
                  }
                  className="border rounded-xl px-3 py-2 shadow-sm"
                />
                <input
                  type="date"
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, customTo: e.target.value }))
                  }
                  className="border rounded-xl px-3 py-2 shadow-sm"
                />
              </div>
            )}

          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border shadow-md bg-white/70 backdrop-blur">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Case Type</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Test Name</TableHead>
                  <TableHead>MRP</TableHead>
                  <TableHead>Offer</TableHead>
                  <TableHead>Govt ID</TableHead>
                  <TableHead>Delete</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow
                    key={patient._id}
                    className="cursor-pointer hover:bg-blue-50 transition border-b"
                    onClick={() => setSelectedPatient(patient)}
                  >
                    <TableCell className="font-mono text-blue-700">{patient.patientId || "-"}</TableCell>
                    <TableCell className="font-semibold">{patient.firstName} {patient.lastName}</TableCell>
                    <TableCell>{patient.contact?.phone}</TableCell>
                    <TableCell className="font-medium text-blue-600">{patient.caseType}</TableCell>
                    <TableCell>
                      {patient.paymentStatus === "paid" ? (
                        <span className="text-green-600 font-semibold">Paid</span>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-md"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkPaid(patient);
                          }}
                        >
                          Mark Paid
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold capitalize">
                      {patient.status?.replace("_", " ")}
                    </TableCell>
<TableCell>
  {patient.assignedDepartment ? (
    <div className="text-blue-700 font-semibold flex flex-col">
      <span>{patient.assignedDepartment}</span>

    </div>
  ) : (
    <span className="text-red-600 font-semibold">Pending</span>
  )}
</TableCell>


<TableCell>
  {patient.selectedTests?.[0] ? (
    <div className="flex flex-col leading-tight">
      <span className="font-semibold">
        {patient.selectedTests[0].name.replace(/\n/g, " ")}
      </span>

      <span className="text-xs text-gray-500">
        ID: {patient.selectedTests[0].testId}
      </span>

      <span className="text-xs text-gray-500">
        Code: {patient.selectedTests[0].code}
      </span>
    </div>
  ) : (
    "-"
  )}
</TableCell>


<TableCell>
  ₹{patient.selectedTests?.[0]?.mrp || "-"}
</TableCell>

<TableCell>
  ₹{patient.selectedTests?.[0]?.offerRate || "-"}
</TableCell>


<TableCell>
  {patient.govtId ? (
    <div className="flex flex-col items-center gap-2">
      {patient.govtId.fileUrl && (
        <img
          src={patient.govtId.fileUrl}
          alt="Govt ID"
          className="h-16 w-28 rounded border shadow object-cover cursor-pointer
                     hover:scale-105 transition"
          onClick={(e) => {
            e.stopPropagation();
            window.open(patient.govtId.fileUrl, "_blank");
          }}
        />
      )}
      <div className="text-center leading-tight">
        <p className="text-sm font-semibold">
          {patient.govtId.idType || "N/A"}
        </p>

        <p className="text-xs text-gray-700">
          {patient.govtId.idNumber || "N/A"}
        </p>
      </div>

    </div>
  ) : (
    "-"
  )}
</TableCell>




<TableCell className="text-center">
  <Button
    size="icon"
    variant="destructive"
    className="h-8 w-8 rounded-full"
    onClick={(e) => {
      e.stopPropagation();
      setPatientToDelete(patient._id);
      setDeleteDialogOpen(true);
    }}
  >
    <Trash2 className="h-4 w-4" />
  </Button>
</TableCell>



                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>

    {selectedPatient && (
      <Dialog
        open={true}
        onOpenChange={(open) => !open && setSelectedPatient(null)}
      >
<DialogContent className="max-w-3xl w-full rounded-2xl bg-white/90 backdrop-blur-xl shadow-2xl p-6">
  <DialogHeader className="flex flex-col items-center text-center mb-4">
    <DialogTitle className="text-xl font-bold">
      Patient Details — {selectedPatient.firstName} {selectedPatient.lastName}
    </DialogTitle>
  </DialogHeader>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">

    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-blue-800 mb-2">Basic Information</h3>
        <div className="space-y-1">
          <p><b>Patient ID:</b> {selectedPatient.patientId}</p>
          <p><b>Age / Gender:</b> {selectedPatient.age} / {selectedPatient.gender}</p>
          <p><b>Phone:</b> {selectedPatient.contact.phone}</p>
          <p><b>Email:</b> {selectedPatient.contact.email || "-"}</p>
          <p><b>Address:</b> {selectedPatient.address}</p>
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-blue-800 mb-2">Case Details</h3>
        <div className="space-y-1">
          <p><b>Case Type:</b> {selectedPatient.caseType}</p>
          <p><b>Description:</b> {selectedPatient.caseDescription}</p>
          <p><b>Referred Doctor:</b> {selectedPatient.referredDoctor || "-"}</p>
        </div>
      </div>
    </div>


    <div className="space-y-4">

      <div>
        <h3 className="font-semibold text-blue-800 mb-2">Status</h3>
        <div className="space-y-1">
          <p><b>Payment Status:</b> {selectedPatient.paymentStatus}</p>
          <p><b>Report Status:</b> {selectedPatient.status}</p>
          <p><b>Assigned Dept:</b> {selectedPatient.assignedDepartment || "-"}</p>
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-blue-800 mb-2">Medical History</h3>
        <div className="space-y-1">
          <p><b>Clinical History:</b> {selectedPatient.clinicalHistory || "-"}</p>
          <p><b>Previous Injury:</b> {selectedPatient.previousInjury || "-"}</p>
          <p><b>Previous Surgery:</b> {selectedPatient.previousSurgery || "-"}</p>
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-blue-800 mb-2">Government ID</h3>
        <div className="space-y-1">
          <p><b>ID Type:</b> {selectedPatient.govtId?.idType || "-"}</p>
          <p><b>ID Number:</b> {selectedPatient.govtId?.idNumber || "-"}</p>
        </div>
      </div>
<div>
  <h3 className="font-semibold text-blue-800 mb-2">Selected Test</h3>

  {selectedPatient.selectedTests && selectedPatient.selectedTests.length > 0 ? (
    selectedPatient.selectedTests.map((t, index) => (
      <div
        key={index}
      >
        <p><b>Test Name:</b> {t.name}</p>
        <p><b>Test ID:</b> {t.testId}</p>
        <p><b>Code:</b> {t.code}</p>
        <p>
          <b>MRP:</b> ₹{t.mrp}  
          &nbsp;&nbsp;
          <b>Offer Rate:</b> ₹{t.offerRate}
        </p>
      </div>
    ))
  ) : (
    <p className="text-sm text-muted-foreground">No test selected</p>
  )}
</div>


    </div>
  </div>

  <Button
    className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
    onClick={() => setSelectedPatient(null)}
  >
    Close
  </Button>
</DialogContent>

      </Dialog>
    )}

    {/* CREATE PATIENT DIALOG */}
    <CreatePatientDialog
      open={dialogOpen}
      onClose={() => setDialogOpen(false)}
      onSuccess={() => {
        setDialogOpen(false);
        fetchPatients();
      }}
    />

    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
  <DialogContent className="max-w-sm rounded-xl shadow-xl">
    <DialogHeader>
      <DialogTitle className="text-lg font-bold text-black-600">
        Confirm Delete
      </DialogTitle>
    </DialogHeader>

    <p className="text-sm text-gray-600">
      Are you sure you want to delete this patient?
      This action cannot be undone.
    </p>

    <div className="flex justify-end gap-3 mt-5">
      <Button
        variant="outline"
        className="rounded-lg"
        onClick={() => setDeleteDialogOpen(false)}
      >
        Cancel
      </Button>

      <Button
        className="bg-red-600 hover:bg-red-700 text-white rounded-lg"
        onClick={handleDeletePatient}
      >
        Delete
      </Button>
    </div>
  </DialogContent>
</Dialog>

  </>
);

};

export default Patients;
