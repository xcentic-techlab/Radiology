import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { usersService } from "@/api/users.service";
import { useToast } from "@/hooks/use-toast";
import { getRangeForKey } from "@/utils/dateRange";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

export default function UsersFilter() {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [rangeKey, setRangeKey] = useState("24h");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFiltered();
  }, [rangeKey, customFrom, customTo]);

async function fetchFiltered() {
  setLoading(true);
  try {
    const all = await usersService.getAll();

    // ⭐ If ALL selected → no filtering
    if (rangeKey === "all") {
      setUsers(all);
      setLoading(false);
      return;
    }

    // ⭐ For date-based filters
    let fromTo = getRangeForKey(rangeKey, customFrom, customTo);
    if (!fromTo) {
      fromTo = getRangeForKey("24h", "", ""); // default
    }

    const { from, to } = fromTo;

    const filtered = (all || []).filter((u) => {
      if (!u.createdAt) return false;
      const c = new Date(u.createdAt).getTime();
      return c >= from.getTime() && c <= to.getTime();
    });

    setUsers(filtered);

  } catch (err) {
    toast({ title: "Error", description: "Failed to load users", variant: "destructive" });
  } finally {
    setLoading(false);
  }
}


  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold mb-3">Users — Filter</h1>

      <div className="flex gap-2 items-center mb-4">
        <select className="border px-2 py-1 rounded" value={rangeKey} onChange={(e) => setRangeKey(e.target.value)}>
            <option value="all">All Users</option>
          <option value="24h">Last 24 Hours</option>
          <option value="yesterday">Yesterday</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="1y">Last 1 Year</option>
          <option value="custom">Custom</option>
        </select>

        {rangeKey === "custom" && (
          <>
            <Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
            <Input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
            <Button onClick={fetchFiltered}>Apply</Button>
          </>
        )}
      </div>

      <div className="bg-white rounded shadow overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u._id}>
                <TableCell>{u.name || `${u.firstName || ""} ${u.lastName || ""}`}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell>{u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
}
