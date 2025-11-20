import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSearchParams } from "react-router-dom";
import { departmentsService } from "@/api/departments.service";

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

  


const [filters, setFilters] = useState({
  name: "",
  caseType: "",
  payment: params.get("filter") === "paid" ? "paid" :
            params.get("filter") === "pending" ? "pending" : "",
  department: params.get("department") ?? "",
  date: "all",
  customFrom: "",
  customTo: "",
});

useEffect(() => {
  let data = [...patients];

  // -------------------------------
  // 1) SEARCH BY PATIENT ID
  // -------------------------------
  if (searchById.trim() !== "") {
    data = data.filter((p) =>
      p.patientId?.toLowerCase().includes(searchById.toLowerCase())
    );
  }

  // -------------------------------
  // 2) NORMAL SEARCH (name/phone)
  // -------------------------------
  if (search.trim() !== "") {
    data = data.filter(
      (p) =>
        p.firstName.toLowerCase().includes(search.toLowerCase()) ||
        p.lastName.toLowerCase().includes(search.toLowerCase()) ||
        p.contact.phone.includes(search)
    );
  }

  // -------------------------------
  // 3) NAME FILTER
  // -------------------------------
  if (filters.name) {
    data = data.filter((p) =>
      (p.firstName + p.lastName)
        .toLowerCase()
        .includes(filters.name.toLowerCase())
    );
  }

  // -------------------------------
  // 4) CASE TYPE FILTER
  // -------------------------------
  if (filters.caseType) {
    data = data.filter((p) => p.caseType === filters.caseType);
  }

  // -------------------------------
  // 5) PAYMENT FILTER
  // -------------------------------
  if (filters.payment) {
    data = data.filter((p) => p.paymentStatus === filters.payment);
  }

  // -------------------------------
  // 6) DEPARTMENT FILTER
  // -------------------------------
  if (filters.department) {
    data = data.filter((p) => p.assignedDepartment === filters.department);
  }

  // -------------------------------
  // 7) DATE FILTER
  // -------------------------------
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
    console.log("🔥 FETCHED DEPARTMENTS:", data);
    setDepartments(data);
  } catch (error) {
    console.log("🚨 ERROR FETCHING DEPARTMENTS:", error);
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

  // SEARCH BY ID
  if (searchById.trim() !== "") {
    data = data.filter((p) =>
      p.patientId?.toLowerCase().includes(searchById.toLowerCase())
    );
  }

  // NORMAL SEARCH
  if (search.trim() !== "") {
    data = data.filter(
      (p) =>
        p.firstName.toLowerCase().includes(search.toLowerCase()) ||
        p.lastName.toLowerCase().includes(search.toLowerCase()) ||
        p.contact.phone.includes(search)
    );
  }

  // NAME FILTER
  if (filters.name) {
    data = data.filter((p) =>
      (p.firstName + p.lastName).toLowerCase().includes(filters.name.toLowerCase())
    );
  }

  // CASE TYPE
  if (filters.caseType) {
    data = data.filter((p) => p.caseType === filters.caseType);
  }

  // PAYMENT
  if (filters.payment) {
    data = data.filter((p) => p.paymentStatus === filters.payment);
  }

  // DEPARTMENT
  if (filters.department) {
    data = data.filter((p) => p.assignedDepartment === filters.department);
  }

  // DATE
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




const handleMarkPaid = async (patient: Patient) => {
  openDummyRazorpay({
    // name: patient.firstName + " " + patient.lastName,
    // amount: 500, // 💰 test amount
    onSuccess: async () => {
      await patientsService.updatePayment(patient._id);
      toast({ title: "Payment Successful" });
      fetchPatients();
    },
  });
};

const handleAssignDepartment = async (patient: Patient) => {
  try {
    const dept = departments.find(
  (d) => d.name.trim().toLowerCase() === patient.assignedDepartment.trim().toLowerCase()
);
console.log("Departments in DB:", departments);


console.log(patient);

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

// force update inside list without waiting
patient.status = "sent_to_department";
patient.departmentAssignedTo = dept._id;
patient.assignedDepartment = dept.name;

toast({
  title: "Assigned!",
  description: `Patient assigned to ${dept.name} and status updated`,
});

// reload entire list to ensure UI updates
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
  <DashboardLayout>
    <div className="space-y-6">

      {/* HEADER */}
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

      {/* FILTERS CARD (Glass + Responsive Grid) */}
      <Card className="backdrop-blur-md bg-white/60 shadow-xl border rounded-2xl">
        <CardHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">

            {/* Patient ID Search */}
            <Input
              placeholder="Search by Patient ID..."
              value={searchById}
              onChange={(e) => setSearchById(e.target.value)}
              className="shadow-sm focus:ring-2 focus:ring-blue-300 rounded-xl"
            />

            {/* Name */}
            <Input
              placeholder="Search Name..."
              onChange={(e) =>
                setFilters((f) => ({ ...f, name: e.target.value }))
              }
              className="rounded-xl shadow-sm"
            />

            {/* Case Type */}
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

            {/* Payment */}
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

            {/* Department */}
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

            {/* Date Filter */}
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

            {/* Custom Dates */}
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

        {/* TABLE */}
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
                  <TableHead>Govt ID</TableHead>
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

                    {/* Payment */}
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

                    {/* Status */}
                    <TableCell className="font-semibold capitalize">
                      {patient.status?.replace("_", " ")}
                    </TableCell>

                    {/* Department */}
                    <TableCell>
                      {patient.paymentStatus !== "paid" ? (
                        <span className="text-yellow-700 font-semibold">Payment Pending</span>
                      ) : !patient.departmentAssignedTo ? (
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAssignDepartment(patient);
                          }}
                        >
                          Assign Dept
                        </Button>
                      ) : (
                        <span className="text-blue-700 font-semibold">
                          {patient.assignedDepartment}
                        </span>
                      )}
                    </TableCell>

                    {/* Govt ID */}
                    <TableCell>
                      {patient.govtId?.fileUrl ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={patient.govtId.fileUrl}
                            alt="Govt ID"
                            className="h-10 w-16 rounded border shadow cursor-pointer hover:scale-110 transition"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(patient.govtId.fileUrl, "_blank");
                            }}
                          />
                          <span className="text-sm font-semibold">{patient.govtId.idType}</span>
                        </div>
                      ) : "-"}
                    </TableCell>

                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* PATIENT DETAILS MODAL */}
    {selectedPatient && (
      <Dialog
        open={true}
        onOpenChange={(open) => !open && setSelectedPatient(null)}
      >
        <DialogContent className="max-w-xl rounded-2xl shadow-2xl bg-white/80 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Patient Details — {selectedPatient.firstName} {selectedPatient.lastName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2 text-sm">
            <p><b>Patient ID:</b> {selectedPatient.patientId}</p>
            <p><b>Age / Gender:</b> {selectedPatient.age} / {selectedPatient.gender}</p>
            <p><b>Phone:</b> {selectedPatient.contact.phone}</p>
            <p><b>Email:</b> {selectedPatient.contact.email || "-"}</p>
            <p><b>Address:</b> {selectedPatient.address}</p>
            <hr />
            <p><b>Case Type:</b> {selectedPatient.caseType}</p>
            <p><b>Description:</b> {selectedPatient.caseDescription}</p>
            <p><b>Referred Doctor:</b> {selectedPatient.referredDoctor}</p>
            <hr />
            <p><b>Payment Status:</b> {selectedPatient.paymentStatus}</p>
            <p><b>Report Status:</b> {selectedPatient.status}</p>
            <p><b>Assigned Dept:</b> {selectedPatient.assignedDepartment || "-"}</p>
            <hr />
            <p><b>Clinical History:</b> {selectedPatient.clinicalHistory || "-"}</p>
            <p><b>Previous Injury:</b> {selectedPatient.previousInjury || "-"}</p>
            <p><b>Previous Surgery:</b> {selectedPatient.previousSurgery || "-"}</p>
            <hr />
            <p><b>Govt ID:</b> {selectedPatient.govtId?.idType}</p>
            <p><b>ID Number:</b> {selectedPatient.govtId?.idNumber}</p>
          </div>

          <Button className="mt-4" onClick={() => setSelectedPatient(null)}>
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
  </DashboardLayout>
);

};

export default Patients;
