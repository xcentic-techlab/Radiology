import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
import { useToast } from '@/hooks/use-toast';
import { StatusBadge } from '@/components/ui/status-badge';
import { paymentMethodLabels } from '@/utils/statusConfig';
import { format } from 'date-fns';
import { useSearchParams } from "react-router-dom";
import type { Payment } from "@/api/payments.service";
import { paymentsService } from "@/api/payments.service";

const Payments = () => {
  const { toast } = useToast();
  
const [searchParams] = useSearchParams();


  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState('');

  const [filterMethod, setFilterMethod] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("all");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);


  useEffect(() => {
  const statusFromURL = searchParams.get("status");
  if (statusFromURL) setFilterStatus(statusFromURL);
}, [searchParams]);


  useEffect(() => {
    applyFilters();
  }, [search, payments, filterMethod, filterStatus, filterDate]);

  const fetchPayments = async () => {
    try {
      const data = await paymentsService.getAll();
      setPayments(data);
      setFilteredPayments(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load payments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...payments];

    if (search.trim() !== "") {
      filtered = filtered.filter((p) =>
        p.report.caseNumber.toLowerCase().includes(search.toLowerCase()) ||
        p.transactionId?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filterMethod !== "all") {
      filtered = filtered.filter((p) => p.method === filterMethod);
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((p) => p.status === filterStatus);
    }

    if (filterDate !== "all") {
      const now = new Date();

      filtered = filtered.filter((p) => {
        const paymentDate = new Date(p.createdAt);

        if (filterDate === "today") {
          return paymentDate.toDateString() === now.toDateString();
        }

        if (filterDate === "week") {
          return now.getTime() - paymentDate.getTime() <= 7 * 24 * 60 * 60 * 1000;
        }

        if (filterDate === "month") {
          return now.getTime() - paymentDate.getTime() <= 30 * 24 * 60 * 60 * 1000;
        }

        return true;
      });
    }

    setFilteredPayments(filtered);
  };

  return (
    <>
      <div className="space-y-6">
        
        {/* PAGE TITLE */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">Track all payment transactions</p>
        </div>

        {/* GLASS FILTER CARD */}
        <Card className="backdrop-blur-lg bg-white/60 rounded-2xl border border-white/40 shadow-xl">
          <CardHeader>

            {/* SEARCH */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by case number or transaction ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 glass-input"
              />
            </div>

            {/* FILTERS */}
            <div className="grid grid-cols-3 gap-4">

              {/* METHOD */}
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="border rounded-md px-3 py-2 bg-white/50 backdrop-blur"
              >
                <option value="all">All Methods</option>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="razorpay">Razorpay</option>
              </select>

              {/* STATUS */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border rounded-md px-3 py-2 bg-white/50 backdrop-blur"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>

              {/* DATE */}
              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="border rounded-md px-3 py-2 bg-white/50 backdrop-blur"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>

            </div>

          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader className="bg-white/50 backdrop-blur rounded-xl">
                <TableRow>
                  <TableHead>Case #</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Made By</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>

                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No payments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow
                      key={payment._id}
                      className="hover:bg-white/40 backdrop-blur transition"
                    >
                      <TableCell className="font-medium">
                        {payment.report.caseNumber}
                      </TableCell>

                      <TableCell>₹{payment.amount.toLocaleString()}</TableCell>

                      <TableCell>
                        <Badge className="bg-gray-100 text-gray-700 border border-gray-300">
                          {paymentMethodLabels[payment.method]}
                        </Badge>
                      </TableCell>

                      <TableCell className="font-mono text-sm">
                        {payment.transactionId || '-'}
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={payment.status} />
                      </TableCell>

                      <TableCell>{payment.madeBy.name}</TableCell>

                      <TableCell>
                        {format(new Date(payment.createdAt), 'MMM dd, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))
                )}

              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Payments;
