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
import { Textarea } from '@/components/ui/textarea';
import { DepartmentPayload, departmentsService } from '@/api/departments.service';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const departmentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  code: z.string().min(2, 'Code must be at least 2 characters').max(10, 'Code must be max 10 characters'),
  description: z.string().optional(),
  deptid: z.string().min(1, "Department ID is required"),
});

type DepartmentForm = z.infer<typeof departmentSchema>;

interface CreateDepartmentDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateDepartmentDialog = ({ open, onClose, onSuccess }: CreateDepartmentDialogProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DepartmentForm>({
    resolver: zodResolver(departmentSchema),
  });

  const onSubmit = async (data: DepartmentForm) => {
    setIsLoading(true);
    try {
      await departmentsService.create(data as DepartmentPayload);
      toast({
        title: 'Success',
        description: 'Department created successfully',
      });
      reset();
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create department',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
  <DialogContent
    className="
      sm:max-w-md
      rounded-2xl 
      backdrop-blur-xl 
      bg-white 
      shadow-2xl 
      border border-white/40
    "
  >
    <DialogHeader className="text-center">
      <DialogTitle className="text-2xl font-bold">Create New Department</DialogTitle>
      <DialogDescription className="text-sm text-gray-600">
        Add a new department to the hospital
      </DialogDescription>
    </DialogHeader>

    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="p-4 rounded-xl bg-white/50 shadow-md space-y-4 border border-white/40">
        <h2 className="font-semibold text-lg">Department Details</h2>
        <div className="space-y-1">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            placeholder="e.g., Radiology"
            {...register("name")}
            disabled={isLoading}
            className="glass-input"
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>

        <div className="space-y-1">
  <Label htmlFor="deptid">Department ID *</Label>
  <Input
    id="deptid"
    placeholder="e.g., DPT-001"
    {...register("deptid")}
    disabled={isLoading}
    className="glass-input"
  />
  {errors.deptid && <p className="text-sm text-red-500">{errors.deptid.message}</p>}
</div>

        <div className="space-y-1">
          <Label htmlFor="code">Code *</Label>
          <Input
            id="code"
            placeholder="e.g., RAD"
            {...register("code")}
            disabled={isLoading}
            className="glass-input"
          />
          {errors.code && <p className="text-sm text-red-500">{errors.code.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Brief description..."
            {...register("description")}
            disabled={isLoading}
            className="glass-input"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
          className="rounded-xl border-gray-300 hover:bg-gray-100"
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={isLoading}
          className="rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 text-white"
        >
          Create Department
        </Button>
      </div>
    </form>
  </DialogContent>
</Dialog>

  );
};

export default CreateDepartmentDialog;
