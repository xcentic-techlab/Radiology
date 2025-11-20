import { useEffect, useState } from 'react';
import { Plus, Search, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { usersService } from '@/api/users.service';
import { departmentsService } from '@/api/departments.service';
import type { User, Department } from "@/types/models";
import { useToast } from '@/hooks/use-toast';
import { roleLabels } from '@/utils/statusConfig';
import CreateUserDialog from '@/components/dialogs/CreateUserDialog';

const Users = () => {
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  const [search, setSearch] = useState('');
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!Array.isArray(users)) return;

    let filtered = [...users];

    if (search.trim() !== "") {
      filtered = filtered.filter(
        (u) =>
          u.name?.toLowerCase().includes(search.toLowerCase()) ||
          u.email?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filterDepartment !== "all") {
      filtered = filtered.filter(
        (u) => u.department?._id === filterDepartment
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (u) => u.isActive === (filterStatus === "active")
      );
    }

    setFilteredUsers(filtered);
  }, [search, users, filterDepartment, filterStatus]);

  const fetchData = async () => {
    try {
      const [usersData, departmentsData] = await Promise.all([
        usersService.getAll(),
        departmentsService.getAll(),
      ]);

      setUsers(Array.isArray(usersData) ? usersData : []);
      setFilteredUsers(Array.isArray(usersData) ? usersData : []);
      setDepartments(Array.isArray(departmentsData) ? departmentsData : []);

    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId: string, status: boolean) => {
    try {
      await usersService.update(userId, { isActive: !status });

      toast({
        title: 'Success',
        description: 'User status updated',
      });

      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
            <p className="text-muted-foreground">Manage system users and their roles</p>
          </div>

          <Button
  onClick={() => setDialogOpen(true)}
  className="px-6 py-2 rounded-xl bg-blue-600/90 hover:bg-blue-700 
             backdrop-blur-md shadow-lg shadow-blue-500/20 
             text-white font-semibold transition-all"
>
  Add User
</Button>

        </div>

        {/* 🔽 FILTERS + SEARCH */}
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Department */}
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="border rounded-md px-3 py-2 bg-background"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>

            {/* Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded-md px-3 py-2 bg-background"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

          </CardContent>
        </Card>

        {/* USERS TABLE */}
        <Card className="border shadow-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="sticky top-0 bg-muted/40 backdrop-blur z-10">
                <TableRow>
                  <TableHead className="py-4">Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user._id} className="hover:bg-muted/30 transition">
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>

                      <TableCell>
                        <Badge className="bg-gray-100 text-gray-700 border border-gray-300">
  {roleLabels[user.role] ?? user.role}
</Badge>

                      </TableCell>

                      <TableCell><span className="px-2 py-1 rounded-md bg-indigo-100 text-indigo-700 border border-indigo-200">
  {user.department?.name ?? '-'}
</span>
</TableCell>

                      <TableCell>
                        {user.isActive ? (
  <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-300">
    Active
  </Badge>
) : (
  <Badge className="bg-red-100 text-red-700 border border-red-300">
    Inactive
  </Badge>
)}

                      </TableCell>

                      <TableCell className="text-right pr-6">
                        <Button
  variant="ghost"
  size="icon"
  className="h-8 w-8 border border-gray-300 hover:bg-gray-100 rounded-md"
  onClick={() => handleToggleActive(user._id, user.isActive)}
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

      {/* CREATE USER DIALOG */}
      <CreateUserDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={() => {
          setDialogOpen(false);
          fetchData();
        }}
        departments={departments}
      />
    </DashboardLayout>
  );
};

export default Users;
