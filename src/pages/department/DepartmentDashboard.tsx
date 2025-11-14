import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileSearch, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { reportsService, Report } from '@/api/reports.service';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';

const DepartmentDashboard = () => {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    pendingCases: 0,
    completedReports: 0,
    inProgress: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const reports = await reportsService.getAll();
      // Filter reports for current department
      const departmentReports = reports.filter(
        (report) => report.department._id === user?.department
      );

      setStats({
        pendingCases: departmentReports.filter((r) => r.status === 'created').length,
        inProgress: departmentReports.filter((r) => r.status === 'in_progress').length,
        completedReports: departmentReports.filter((r) =>
          ['report_uploaded', 'reviewed', 'approved'].includes(r.status)
        ).length,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load dashboard stats',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Pending Cases',
      value: stats.pendingCases,
      icon: Clock,
      color: 'text-warning',
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      icon: FileSearch,
      color: 'text-accent',
    },
    {
      title: 'Completed',
      value: stats.completedReports,
      icon: CheckCircle,
      color: 'text-success',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Department Dashboard</h1>
          <p className="text-muted-foreground">Manage your department cases</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? '...' : stat.value}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Info */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              View all cases in the Cases section
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DepartmentDashboard;
