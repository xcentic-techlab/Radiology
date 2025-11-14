import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { patientsService, Patient } from '@/api/patients.service';
import { departmentsService, Department } from '@/api/departments.service';
import { usersService, User } from '@/api/users.service';
import { reportsService, CreateReportDto } from '@/api/reports.service';
import { useToast } from '@/hooks/use-toast';

const reportSchema = z.object({
  patient: z.string().min(1, 'Patient is required'),
  department: z.string().min(1, 'Department is required'),
  assignedTo: z.string().optional(),
  procedure: z.string().min(5, 'Procedure must be at least 5 characters'),
  scheduledAt: z.string().min(1, 'Schedule date/time is required'),
});

type ReportForm = z.infer<typeof reportSchema>;

const CreateReport = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ReportForm>({
    resolver: zodResolver(reportSchema),
  });

  const selectedDepartment = watch('department');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      const departmentUsers = users.filter(
        (user) =>
          user.role === 'department_user' &&
          user.department?._id === selectedDepartment
      );
      setFilteredUsers(departmentUsers);
    }
  }, [selectedDepartment, users]);

  const fetchData = async () => {
    try {
      const [patientsData, departmentsData, usersData] = await Promise.all([
        patientsService.getAll(),
        departmentsService.getAll(),
        usersService.getAll(),
      ]);
      setPatients(patientsData);
      setDepartments(departmentsData.filter((d) => d.isActive));
      setUsers(usersData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ReportForm) => {
    setIsSubmitting(true);
    try {
      const payload: CreateReportDto = {
        patient: data.patient,
        department: data.department,
        assignedTo: data.assignedTo || undefined,
        procedure: data.procedure,
        scheduledAt: new Date(data.scheduledAt).toISOString(),
      };

      await reportsService.create(payload);
      toast({
        title: 'Success',
        description: 'Report created successfully',
      });
      navigate('/reception/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create report',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Create Report</h1>
          <p className="text-muted-foreground">Schedule a new diagnostic report</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Report Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Patient *</Label>
                <Select
                  onValueChange={(value) => setValue('patient', value)}
                  disabled={loading || isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {patients.map((patient) => (
                      <SelectItem key={patient._id} value={patient._id}>
                        {patient.firstName} {patient.lastName} - {patient.contact.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.patient && (
                  <p className="text-sm text-destructive">{errors.patient.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Department *</Label>
                <Select
                  onValueChange={(value) => setValue('department', value)}
                  disabled={loading || isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {departments.map((dept) => (
                      <SelectItem key={dept._id} value={dept._id}>
                        {dept.name} ({dept.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.department && (
                  <p className="text-sm text-destructive">{errors.department.message}</p>
                )}
              </div>

              {selectedDepartment && filteredUsers.length > 0 && (
                <div className="space-y-2">
                  <Label>Assign To</Label>
                  <Select
                    onValueChange={(value) => setValue('assignedTo', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department user (optional)" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {filteredUsers.map((user) => (
                        <SelectItem key={user._id} value={user._id}>
                          {user.name} - {user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="procedure">Procedure *</Label>
                <Textarea
                  id="procedure"
                  placeholder="Describe the procedure..."
                  {...register('procedure')}
                  disabled={isSubmitting}
                />
                {errors.procedure && (
                  <p className="text-sm text-destructive">{errors.procedure.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduledAt">Scheduled Date & Time *</Label>
                <Input
                  id="scheduledAt"
                  type="datetime-local"
                  {...register('scheduledAt')}
                  disabled={isSubmitting}
                />
                {errors.scheduledAt && (
                  <p className="text-sm text-destructive">{errors.scheduledAt.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/reception/dashboard')}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || loading}>
                  Create Report
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateReport;
