import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UserCircle, FileText, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { patientsService } from '@/api/patients.service';
import { reportsService } from '@/api/reports.service';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const ReceptionDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalReports: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [patients, reports] = await Promise.all([
        patientsService.getAll(),
        reportsService.getAll(),
      ]);

      setStats({
        totalPatients: patients.length,
        totalReports: reports.length,
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
      title: 'Total Patients',
      value: stats.totalPatients,
      icon: UserCircle,
      color: 'text-primary',
    },
    {
      title: 'Total Reports',
      value: stats.totalReports,
      icon: FileText,
      color: 'text-success',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reception Dashboard</h1>
          <p className="text-muted-foreground">Manage patient registrations and reports</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              className="h-24 text-lg"
              onClick={() => navigate('/reception/patients')}
            >
              <UserCircle className="mr-2 h-6 w-6" />
              Register New Patient
            </Button>
            <Button
              className="h-24 text-lg"
              variant="secondary"
              onClick={() => navigate('/reception/create-report')}
            >
              <FileText className="mr-2 h-6 w-6" />
              Create Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ReceptionDashboard;
