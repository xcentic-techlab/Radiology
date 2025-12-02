import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { usersService } from "@/api/users.service";
import { departmentsService } from "@/api/departments.service";
import { useToast } from "@/hooks/use-toast";
import { getRangeForKey } from "@/utils/dateRange";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

// 🎨 ROLE COLORS
const roleColors = {
  admin: "bg-blue-100 text-blue-700",
  reception: "bg-purple-100 text-purple-700",
  department_user: "bg-orange-100 text-orange-700",
  patient: "bg-gray-200 text-gray-700",
};

// 🎨 DEPARTMENT COLORS (Auto Rotate)
const departmentColors = [
  "bg-red-100 text-red-700",
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-yellow-100 text-yellow-700",
  "bg-purple-100 text-purple-700",
  "bg-pink-100 text-pink-700",
  "bg-indigo-100 text-indigo-700",
];

export default function UsersFilter() {
  const { toast } = useToast();

  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [departments, setDepartments] = useState([]);

  // filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  // date filters
  const [rangeKey, setRangeKey] = useState("all");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const [loading, setLoading] = useState(false);

  // Load data on mount
  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, search, statusFilter, departmentFilter, rangeKey, customFrom, customTo]);

  async function fetchAll() {
    setLoading(true);
    try {
      const [allUsers, allDepartments] = await Promise.all([
        usersService.getAll(),
        departmentsService.getAll(),
      ]);
      setUsers(allUsers);
      setDepartments(allDepartments);
      setFiltered(allUsers);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let data = [...users];

    // 🔍 Search
    if (search.trim()) {
      data = data.filter(
        (u) =>
          (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
          (u.email || "").toLowerCase().includes(search.toLowerCase())
      );
    }

    // Status Filter
    if (statusFilter !== "all") {
      data = data.filter((u) =>
        statusFilter === "active" ? u.isActive === true : u.isActive === false
      );
    }

    // Department Filter
    if (departmentFilter !== "all") {
      data = data.filter((u) => u.department?._id === departmentFilter);
    }

    // Date Filter
    if (rangeKey !== "all") {
      let fromTo = getRangeForKey(rangeKey, customFrom, customTo);
      if (!fromTo) fromTo = getRangeForKey("24h", "", "");

      const { from, to } = fromTo;

      data = data.filter((u) => {
        if (!u.createdAt) return false;
        const created = new Date(u.createdAt).getTime();
        return created >= from.getTime() && created <= to.getTime();
      });
    }

    setFiltered(data);
  }

  return (
    <>
      <div className="space-y-6">

        {/* PAGE HEADER */}
        <div className="text-center space-y-1">
          <h1 className="text-4xl font-bold">Employee Directory</h1>
          <p className="text-muted-foreground">
            Filter and explore all system employee
          </p>
        </div>

        {/* FILTER BAR */}
        <div className="backdrop-blur-lg bg-white/60 rounded-2xl border border-white/40 shadow-xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* SEARCH */}
          <Input
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input"
          />

          {/* STATUS FILTER */}
          <select
            className="border px-3 py-2 rounded-lg bg-white/50 backdrop-blur"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* DEPARTMENT FILTER */}
          <select
            className="border px-3 py-2 rounded-lg bg-white/50 backdrop-blur"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* DATE FILTER */}
          <select
            className="border px-3 py-2 rounded-lg bg-white/50 backdrop-blur"
            value={rangeKey}
            onChange={(e) => setRangeKey(e.target.value)}
          >
            <option value="all">All Dates</option>
            <option value="24h">Last 24 Hours</option>
            <option value="yesterday">Yesterday</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="1y">Last 1 Year</option>
            <option value="custom">Custom</option>
          </select>

          {/* CUSTOM DATE PICKER */}
          {rangeKey === "custom" && (
            <div className="flex gap-4 col-span-full">
              <Input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="glass-input"
              />

              <Input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="glass-input"
              />

              <Button
                className="rounded-xl bg-blue-600 text-white shadow"
                onClick={applyFilters}
              >
                Apply
              </Button>
            </div>
          )}
        </div>

        {/* TABLE */}
        <div className="backdrop-blur-lg bg-white/60 rounded-2xl border border-white/40 shadow-xl p-4 overflow-auto">

          <Table>
            <TableHeader className="bg-white/50 backdrop-blur rounded-xl">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Department</TableHead>
                <TableHead className="w-40">Created At</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map((u) => (
                <TableRow
                  key={u._id}
                  className="hover:bg-white/40 backdrop-blur transition"
                >
                  <TableCell className="font-medium">
                    {u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim()}
                  </TableCell>

                  <TableCell>{u.email}</TableCell>

                  {/* ROLE BADGE */}
                  <TableCell>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium 
                        ${roleColors[u.role] || "bg-gray-200 text-gray-700"}`}
                    >
                      {u.role.replace("_", " ")}
                    </span>
                  </TableCell>

                  {/* STATUS */}
                  <TableCell>
                    {u.isActive ? (
                      <span className="text-green-600 font-semibold">Active</span>
                    ) : (
                      <span className="text-red-500 font-semibold">Inactive</span>
                    )}
                  </TableCell>

                  {/* DEPARTMENT BADGE */}
                  <TableCell>
                    {u.department?.name ? (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium 
                          ${
                            departmentColors[
                              u.department?._id?.charCodeAt(0) %
                                departmentColors.length
                            ]
                          }`}
                      >
                        {u.department.name}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>

                  {/* CREATED AT */}
                  <TableCell>
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleString()
                      : "-"}
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>

        </div>
      </div>
    </>
  );
}
