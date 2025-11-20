import { useEffect, useState } from 'react';
import { Plus, Search, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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

  // ⭐ FILTER LOGIC
  useEffect(() => {
    if (!Array.isArray(users)) return;

    let filtered = [...users];

    // 🔍 Search by name/email
    if (search.trim() !== "") {
      filtered = filtered.filter(
        (u) =>
          u.name?.toLowerCase().includes(search.toLowerCase()) ||
          u.email?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // 🏥 Department filter
    if (filterDepartment !== "all") {
      filtered = filtered.filter(
        (u) => u.department?._id === filterDepartment
      );
    }

    // 🔘 Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(
        (u) => u.isActive === (filterStatus === "active")
      );
    }

    setFilteredUsers(filtered);
  }, [search, users, filterDepartment, filterStatus]);

  // ⭐ FETCH USERS + DEPARTMENTS
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

  // ⭐ TOGGLE ACTIVE / INACTIVE
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Users Management</h1>
            <p className="text-muted-foreground">
              Manage system users and their roles
            </p>
          </div>

          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        {/* USERS TABLE */}
        <Card>
          <CardHeader>
            
            {/* 🔍 SEARCH */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 🔽 FILTERS */}
            <div className="flex gap-4">

              {/* Department Filter */}
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                <option value="all">All Departments</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

            </div>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge>{roleLabels[user.role] ?? user.role}</Badge>
                      </TableCell>
                      <TableCell>{user.department?.name ?? '-'}</TableCell>

                      <TableCell>
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleActive(user._id, user.isActive)}
                        >
                          <Power className="h-4 w-4" />
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
