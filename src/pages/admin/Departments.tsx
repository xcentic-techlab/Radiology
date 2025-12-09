import { useEffect, useState } from 'react';
import { Plus, Power, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { UploadToast } from "@/components/ui/upload-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { departmentsService, Department } from '@/api/departments.service';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import CreateDepartmentDialog from '@/components/dialogs/CreateDepartmentDialog';
import {Trash2} from "lucide-react"
import { useNavigate } from "react-router-dom";
import axios from 'axios';


const Departments = () => {
  const { toast } = useToast();
  const navigate = useNavigate();


  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState("all");

  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
const [deleteLoading, setDeleteLoading] = useState(false);


  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [departments, search, filterStatus]);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const data = await departmentsService.getAll();
      setDepartments(data);
      setFilteredDepartments(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load departments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...departments];

    if (search.trim() !== "") {
      filtered = filtered.filter((d) =>
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.code.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (d) => d.isActive === (filterStatus === "active")
      );
    }

    setFilteredDepartments(filtered);
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await departmentsService.update(id, { isActive: !currentStatus });

      toast({
        title: "Success",
        description: "Department status updated",
      });

      fetchDepartments();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update department",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
  if (!deleteTarget) return;
  setDeleteLoading(true);

  try {
    await departmentsService.delete(deleteTarget._id);

    toast({
      title: "Deleted",
      description: "Department deleted successfully.",
    });

    setDepartments(prev => prev.filter(d => d._id !== deleteTarget._id));
    setFilteredDepartments(prev => prev.filter(d => d._id !== deleteTarget._id));

  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to delete department",
      variant: "destructive",
    });
  } finally {
    setDeleteLoading(false);
    setDeleteTarget(null);
  }
};

  async function loadDepartments() {
    try {
      const res = await departmentsService.getAll();
      setDepartments(res);
    } catch (err) {
      console.log("Failed to load departments");
    }
  } 




async function handleExcelUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (
    ![
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ].includes(file.type)
  ) {
    return toast({
      title: "Invalid File",
      description: "Please upload .xls or .xlsx only",
      variant: "destructive",
    });
  }

  const form = new FormData();
  form.append("file", file);
  const uploadingToast = toast({
    title: "",
    description: <UploadToast />,
    duration: Infinity,
  });

  try {
    const res = await axios.post(
      // await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/upload-excel`, form);
      `/admin/upload-excel`,
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    uploadingToast.dismiss?.();

    toast({
      title: "Upload Successful",
      description: "Departments & Tests imported successfully!",
    });

    fetchDepartments();
  } catch (err) {
    uploadingToast.dismiss?.();

    toast({
      title: "Upload Failed",
      description: err.response?.data?.message || "Something went wrong.",
      variant: "destructive",
    });
  }
}



  return (
    <>

      {deleteTarget && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl p-6 w-[360px] shadow-xl">
      
      <h2 className="text-xl font-bold text-gray-800">Delete Department?</h2>

      <p className="text-sm text-slate-600 mt-2">
        This will permanently delete 
        <span className="font-semibold text-red-600">
          {" "}{deleteTarget.name}
        </span>.
      </p>

      <div className="flex justify-end gap-3 mt-5">
        <Button
          variant="outline"
          className="rounded-lg"
          onClick={() => setDeleteTarget(null)}
        >
          Cancel
        </Button>

        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={deleteLoading}
          className="rounded-lg"
        >
          {deleteLoading ? "Deleting..." : "Delete"}
        </Button>
      </div>
    </div>
  </div>
)}

      <div className="space-y-6">
<div className="flex items-center justify-between flex-wrap gap-4">

  <div>
    <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
    <p className="text-muted-foreground">Manage hospital departments</p>
  </div>
  <div className="flex items-center gap-4 flex-wrap">

    <Button
      onClick={() => setDialogOpen(true)}
      className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
    >
      Add Department
    </Button>

   <div className="p-3 border rounded-xl bg-white/60 backdrop-blur shadow-md w-[230px]">
  <label
    htmlFor="excel-upload"
    className="
      flex items-center justify-center
      w-full h-12
      border-2 border-dashed border-blue-400
      rounded-lg cursor-pointer
      bg-blue-50 hover:bg-blue-100
      transition
      text-sm font-medium text-blue-600
    "
  >
    Upload Departments & Tests
  </label>

  <input
    id="excel-upload"
    type="file"
    accept=".xlsx, .xls"
    className="hidden"
    onChange={handleExcelUpload}
  />
</div>

  </div>
</div>

        <Card className="backdrop-blur-lg bg-white/60 rounded-2xl border border-white/40 shadow-xl">
          <CardHeader>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search departments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 glass-input"
              />
            </div>

            <div className="w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border rounded-md px-3 py-2 w-full bg-white/50 backdrop-blur-lg"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader className="bg-white/50 backdrop-blur-lg rounded-lg">
                <TableRow>
                  <TableHead>Dept ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>

                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>

                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredDepartments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No departments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDepartments.map((dept) => (
                    <TableRow
                      key={dept._id}
                      className="hover:bg-white/40 backdrop-blur transition rounded-lg"
                    >
<TableCell className="text-xs text-gray-700">
  {dept.deptid}
</TableCell>


                      <TableCell className="font-medium">{dept.name}</TableCell>

                      <TableCell>
                        <Badge className="bg-gray-100 text-gray-700 border border-gray-300">
                          {dept.code}
                        </Badge>
                      </TableCell>

                      {/* <TableCell className="max-w-xs truncate">
                        {dept.description || '-'}
                      </TableCell> */}

                      <TableCell>
                        {dept.isActive ? (
                          <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-300">
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700 border border-red-300">
                            Inactive
                          </Badge>
                        )}
                      </TableCell>

<TableCell className="text-right">
  <div className="flex justify-end items-center gap-3">

    <Button
      variant="outline"
      size="sm"
      onClick={() => navigate(`/admin/departments/${dept._id}/tests`)}
      className="rounded-md"
    >
      View Tests
    </Button>

    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 border border-gray-300 hover:bg-gray-100 rounded-md"
      onClick={() => handleToggleActive(dept._id, dept.isActive)}
    >
      <Power className="h-4 w-4 text-gray-700" />
    </Button>

    <button
      onClick={() => setDeleteTarget(dept)}
      className="
        w-9 h-9 flex items-center justify-center 
        rounded-full bg-red-600 text-white shadow-sm
        hover:bg-red-700 transition
      "
    >
      <Trash2 className="w-4 h-4" />
    </button>

  </div>
</TableCell>



                    </TableRow>
                  ))
                )}
              </TableBody>

            </Table>
          </CardContent>
        </Card>
      </div>

      <CreateDepartmentDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={() => {
          setDialogOpen(false);
          fetchDepartments();
        }}
      />
    </>
  );
};

export default Departments;
