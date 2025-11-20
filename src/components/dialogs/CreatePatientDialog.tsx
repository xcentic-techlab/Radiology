import { useForm } from "react-hook-form";
import { useEffect } from "react";
import {departmentsService} from "../../api/departments.service"
import { zodResolver } from "@hookform/resolvers/zod";
import { forwardRef } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { patientsService } from "@/api/patients.service";
import { uploadService } from "@/api/upload.service";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

/* --------------------------------------------------- */
/* 🛑 ZOD VALIDATION                                   */
/* --------------------------------------------------- */
const schema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  age: z.coerce.number().min(1),
  gender: z.string().min(1),
  phone: z.string().min(10, "Must be 10 digits"),
  email: z.string().optional(),
  address: z.string().optional(),
  caseDescription: z.string().min(5),
  caseType: z.string().min(1),
  assignedDepartment: z.string().min(1),
  referredDoctor: z.string().optional(),
  govtIdType: z.string().min(2),
  govtIdNumber: z.string().min(4),
});



/* --------------------------------------------------- */
/*  MAIN COMPONENT                                     */
/* --------------------------------------------------- */
export default function CreatePatientDialog({ open, onClose, onSuccess }) {
  const { toast } = useToast();
  const [isLoading, setLoading] = useState(false);
  const [govtFile, setGovtFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [departments, setDepartments] = useState([]);

  
  useEffect(() => {
  const loadDeps = async () => {
    const res = await departmentsService.getAll();
    setDepartments(res);
  };
  loadDeps();
}, []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  /* --------------------------------------------------- */
  /*  UPLOAD GOVT FILE TO CLOUDINARY                    */
  /* --------------------------------------------------- */
  const uploadGovIdFile = async () => {
    if (!govtFile) return;
    const url = await uploadService.uploadGovId(govtFile);
    setFileUrl(url);
    toast({
      title: "Uploaded ☁",
      description: "Govt ID uploaded successfully",
    });
  };



  /* --------------------------------------------------- */
  /*  FORM SUBMIT                                       */
  /* --------------------------------------------------- */
  const submit = async (data: any) => {
    console.log("🔥 FORM DATA RECEIVED:", data);
    if (!fileUrl) {
      toast({ title: "Upload Govt ID", variant: "destructive" });
      return;
    }

    console.log("SUBMITTED DATA:", data);

    setLoading(true);
    try {
      const payload = {
  firstName: data.firstName,
  lastName: data.lastName,
  age: data.age,
  gender: data.gender,
  address: data.address,

  contact: { phone: data.phone, email: data.email },

  caseDescription: data.caseDescription,
  caseType: data.caseType,
  referredDoctor: data.referredDoctor,

  // 🔥 FIX: normalize department
  assignedDepartment: data.assignedDepartment.trim().toLowerCase(),

  govtId: {
    idType: data.govtIdType,
    idNumber: data.govtIdNumber,
    fileUrl,
  },
};


      await patientsService.create(payload);
      toast({ title: "Success", description: "Patient registered successfully" });
      onSuccess();
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to register patient",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // console.log("FORM DATA =>", data);


  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-auto rounded-2xl backdrop-blur-xl bg-white shadow-2xl border border-white/30">
  <DialogHeader className="text-center">
    <DialogTitle className="text-2xl font-bold">Register Patient</DialogTitle>
    <DialogDescription className="text-sm">
      Reception form — enter all required details
    </DialogDescription>
  </DialogHeader>

  {/* FORM */}
  <form onSubmit={handleSubmit(submit)} className="space-y-6">

    {/* ------------------------------------- */}
    {/* BASIC DETAILS */}
    {/* ------------------------------------- */}
    <div className="p-4 rounded-xl bg-white/50 shadow-md space-y-4 border border-white/40">
      <h2 className="font-semibold text-lg">Basic Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField className="glass-input" label="First Name" {...register("firstName")} error={errors.firstName?.message} />
        <InputField className="glass-input" label="Last Name" {...register("lastName")} error={errors.lastName?.message} />

        <InputField
          label="Age"
          type="number"
          className="glass-input"
          {...register("age", { valueAsNumber: true })}
          error={errors.age?.message}
        />

        <SelectField
          label="Gender"
          items={["male", "female", "other"]}
          onChange={(v) => setValue("gender", v, { shouldValidate: true })}
          error={errors.gender?.message}
        />
      </div>
    </div>


    {/* ------------------------------------- */}
    {/* CONTACT */}
    {/* ------------------------------------- */}
    <div className="p-4 rounded-xl bg-white/50 shadow-md space-y-4 border border-white/40">
      <h2 className="font-semibold text-lg">Contact Details</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField className="glass-input" label="Phone" {...register("phone")} error={errors.phone?.message} />
        <InputField className="glass-input" label="Email" {...register("email")} error={errors.email?.message} />
      </div>

      <TextAreaField
        label="Address"
        className="glass-input"
        {...register("address")}
        error={errors.address?.message}
      />
    </div>


    {/* ------------------------------------- */}
    {/* CASE DETAILS */}
    {/* ------------------------------------- */}
    <div className="p-4 rounded-xl bg-white/50 shadow-md space-y-4 border border-white/40">
      <h2 className="font-semibold text-lg">Case Details</h2>

      <TextAreaField
        label="Case Description"
        className="glass-input"
        {...register("caseDescription")}
        error={errors.caseDescription?.message}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          label="Case Type"
          items={["Urgent", "Emergency", "Routine", "STAT"]}
          onChange={(v) => setValue("caseType", v, { shouldValidate: true })}
          error={errors.caseType?.message}
        />

        <InputField
          label="Referred Doctor"
          className="glass-input"
          {...register("referredDoctor")}
          error={errors.referredDoctor?.message}
        />
      </div>

      {/* DEPARTMENT */}
      <div>
        <Label>Assigned Department</Label>
        <Select
          onValueChange={(v) =>
            setValue("assignedDepartment", v, { shouldValidate: true })
          }
        >
          <SelectTrigger className="glass-select rounded-xl">
            <SelectValue placeholder="Select Department" />
          </SelectTrigger>

          <SelectContent>
            {departments.map((dep) => (
              <SelectItem key={dep._id} value={dep.name}>
                {dep.name.replace(/\b\w/g, (c) => c.toUpperCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {errors.assignedDepartment && (
          <p className="text-xs text-red-500">
            {errors.assignedDepartment.message.toString()}
          </p>
        )}
      </div>
    </div>


    {/* ------------------------------------- */}
    {/* GOVT ID */}
    {/* ------------------------------------- */}
    <div className="p-4 rounded-xl bg-white/50 shadow-md space-y-4 border border-white/40">
      <h2 className="font-semibold text-lg">Government ID</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          label="Govt ID Type"
          items={["Aadhaar", "PAN", "VoterID", "DrivingLicense", "Passport"]}
          onChange={(v) => setValue("govtIdType", v)}
          error={errors.govtIdType?.message}
        />

        <InputField
          label="Govt ID Number"
          className="glass-input"
          {...register("govtIdNumber")}
          error={errors.govtIdNumber?.message}
        />
      </div>

      {/* Upload File */}
      <div>
        <Label>Upload Govt ID*</Label>
        <Input
          type="file"
          accept="image/*"
          className="glass-input"
          onChange={(e) => setGovtFile(e.target.files?.[0] || null)}
        />

        {govtFile && (
          <Button
            type="button"
            className="mt-3 rounded-lg bg-blue-600 text-white shadow-md hover:bg-blue-700"
            onClick={uploadGovIdFile}
          >
            Upload to Cloudinary ☁
          </Button>
        )}

        {fileUrl && <p className="text-green-600 text-sm mt-1">Uploaded ✔</p>}
      </div>
    </div>


    {/* ------------------------------------- */}
    {/* ACTION BUTTONS */}
    {/* ------------------------------------- */}
    <div className="flex justify-end gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        className="rounded-xl"
      >
        Cancel
      </Button>

      <Button
        disabled={!fileUrl || isLoading}
        type="submit"
        className="rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20"
      >
        Register
      </Button>
    </div>
  </form>
</DialogContent>

    </Dialog>
  );
}



/* --------------------------------------------------- */
/*  FIELD COMPONENTS                                   */
/* --------------------------------------------------- */

const InputField = forwardRef<HTMLInputElement, any>(
  ({ label, error, ...props }, ref) => (
    <div>
      <Label>{label}</Label>
      <Input ref={ref} {...props} />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
);

export { InputField };


const TextAreaField = forwardRef<HTMLTextAreaElement, any>(
  ({ label, error, ...props }, ref) => (
    <div>
      <Label>{label}</Label>
      <Textarea ref={ref} {...props} />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
);

export { TextAreaField };


const SelectField = ({ label, items, onChange, error }) => (
  <div>
    <Label>{label}</Label>
    <Select onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent>
        {items.map((v) => (
          <SelectItem key={v} value={v}>
            {v}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);
