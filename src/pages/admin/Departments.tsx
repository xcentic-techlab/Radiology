import { useEffect, useState } from 'react';
import { Plus, Power, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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

const Departments = () => {
  const { toast } = useToast();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState("all");

  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

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

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
            <p className="text-muted-foreground">Manage hospital departments</p>
          </div>

          <Button
            onClick={() => setDialogOpen(true)}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
          >
            Add Department
          </Button>
        </div>

        {/* GLASS CARD */}
        <Card className="backdrop-blur-lg bg-white/60 rounded-2xl border border-white/40 shadow-xl">
          <CardHeader>

            {/* SEARCH */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search departments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 glass-input"
              />
            </div>

            {/* STATUS FILTER */}
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
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
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
                      <TableCell className="font-medium">{dept.name}</TableCell>

                      <TableCell>
                        <Badge className="bg-gray-100 text-gray-700 border border-gray-300">
                          {dept.code}
                        </Badge>
                      </TableCell>

                      <TableCell className="max-w-xs truncate">
                        {dept.description || '-'}
                      </TableCell>

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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 border border-gray-300 hover:bg-gray-100 rounded-md"
                          onClick={() => handleToggleActive(dept._id, dept.isActive)}
                        >
                          <Power className="h-4 w-4 text-gray-700" />
                        </Button>
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
    </DashboardLayout>
  );
};

export default Departments;
