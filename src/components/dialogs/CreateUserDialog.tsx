import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usersService } from '@/api/users.service';
import { departmentsService } from '@/api/departments.service';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.string(),
  department: z.string().optional(),
});

type UserForm = z.infer<typeof userSchema>;

type Department = {
  _id: string;
  name: string;
};


interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  departments: Department[];
}


const CreateUserDialog = ({ open, onClose, onSuccess, departments }: CreateUserDialogProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<UserForm>({
    resolver: zodResolver(userSchema),
  });

  const onSubmit = async (data: UserForm) => {
    setIsLoading(true);
    try {
      await usersService.create(data);
      toast({
        title: 'Success',
        description: 'User created successfully',
      });
      reset();
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create user',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const roleNeedsDepartment = ['department_user'].includes(selectedRole);

  return (
    <Dialog open={open} onOpenChange={onClose}>
  <DialogContent className="sm:max-w-md rounded-xl shadow-lg border">
    <DialogHeader>
      <DialogTitle className="text-xl font-semibold">
        Create New User
      </DialogTitle>
      <DialogDescription className="text-muted-foreground">
        Add a new user to the system
      </DialogDescription>
    </DialogHeader>

    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

      <div className="space-y-1">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          placeholder="Enter full name"
          {...register("name")}
          disabled={isLoading}
          className="rounded-md"
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>
      <div className="space-y-1">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          placeholder="example@gmail.com"
          {...register("email")}
          disabled={isLoading}
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
      </div>
      <div className="space-y-1">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          placeholder="Optional"
          {...register("phone")}
          disabled={isLoading}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="password">Password *</Label>
        <Input
          id="password"
          type="password"
          placeholder="Min 6 characters"
          {...register("password")}
          disabled={isLoading}
        />
        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
      </div>
      <div className="space-y-1">
        <Label>Role *</Label>
        <Select
          onValueChange={(value) => {
            setValue("role", value);
            setSelectedRole(value);
          }}
          disabled={isLoading}
        >
          <SelectTrigger className="rounded-md">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="reception">Reception</SelectItem>
            <SelectItem value="department_user">Department User</SelectItem>
            <SelectItem value="patient">Patient</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {roleNeedsDepartment && (
        <div className="space-y-1">
          <Label>Department *</Label>
          <Select
            onValueChange={(value) => setValue("department", value)}
            disabled={isLoading}
          >
            <SelectTrigger className="rounded-md">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>

            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept._id} value={dept._id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
          className="border-gray-300 hover:bg-gray-100"
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={isLoading}
          className="bg-primary text-white hover:bg-primary/80 shadow-sm"
        >
          Create User
        </Button>
      </div>
    </form>
  </DialogContent>
</Dialog>

  );
};

export default CreateUserDialog;
