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
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),

  age: z.coerce.number().min(1, "Age is required"),

  gender: z.string().min(1, "Gender is required"),

  phone: z.string().min(10, "Must be 10 digits"),

  address: z.string().min(1, "Address is required"),

  caseDescription: z.string().min(5, "Case description is mandatory"),

  caseType: z.string().min(1, "Case type is required"),

  assignedDepartment: z.string().min(1, "Department is required"),

  /* Optional fields — untouched */
  email: z.string().email().optional(),
  referredDoctor: z.string().optional(),

  govtIdType: z.string().optional(),
  govtIdNumber: z.string().optional(),
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

  setLoading(true);

  try {
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      age: data.age,
      gender: data.gender,
      address: data.address,

      contact: {
        phone: data.phone,
        email: data.email || null,
      },

      caseDescription: data.caseDescription,
      caseType: data.caseType,
      referredDoctor: data.referredDoctor || null,

      assignedDepartment: data.assignedDepartment.trim().toLowerCase(),

      // Govt ID optional (only included if any value exists)
      govtId:
        data.govtIdType || data.govtIdNumber || fileUrl
          ? {
              idType: data.govtIdType || null,
              idNumber: data.govtIdNumber || null,
              fileUrl: fileUrl || null,
            }
          : null,
    };

    await patientsService.create(payload);

    toast({
      title: "Success",
      description: "Patient registered successfully",
    });

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
<DialogContent
  className="
    w-full max-w-3xl 
    max-h-[92vh]
    overflow-y-scroll scrollbar-hide
    rounded-2xl bg-white shadow-xl
    p-3
  "
>
<DialogHeader className="text-center flex flex-col items-center gap-1 mb-1">
  <DialogTitle className="text-xl font-bold text-center">
    Register Patient
  </DialogTitle>

  <DialogDescription className="text-xs text-center">
    Enter patient details below
  </DialogDescription>
</DialogHeader>



<form 
  onSubmit={handleSubmit(submit)} 
  className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm"
>



      {/* FIRST + LAST NAME */}
      <div className="grid grid-cols-2 gap-4">
        <InputField label="First Name*" {...register("firstName")} error={errors.firstName?.message} />
        <InputField label="Last Name*" {...register("lastName")} error={errors.lastName?.message} />
      </div>

      {/* AGE + GENDER */}
      <div className="grid grid-cols-2 gap-4">
        <InputField label="Age*" type="number" {...register("age")} error={errors.age?.message} />
        <SelectField
          label="Gender*"
          items={["male", "female", "other"]}
          onChange={(v) => setValue("gender", v)}
          error={errors.gender?.message}
        />
      </div>

      {/* PHONE + EMAIL */}
      <div className="grid grid-cols-2 gap-4">
        <InputField label="Phone*" {...register("phone")} error={errors.phone?.message} />
        <InputField label="Email" {...register("email")} error={errors.email?.message} />
      </div>

      {/* ADDRESS */}
      <TextAreaField
        label="Address*"
        className="h-[60px]"
        {...register("address")}
        error={errors.address?.message}
      />

      {/* CASE DESCRIPTION */}
      <TextAreaField
        label="Case Description*"
        className="h-[60px]"
        {...register("caseDescription")}
        error={errors.caseDescription?.message}
      />

      {/* CASE TYPE + REFERRED DOCTOR */}
      <div className="grid grid-cols-2 gap-4">
        <SelectField
          label="Case Type*"
          items={["Urgent", "Emergency", "Routine", "STAT"]}
          onChange={(v) => setValue("caseType", v)}
          error={errors.caseType?.message}
        />

        <InputField
          label="Referred Doctor"
          {...register("referredDoctor")}
          error={errors.referredDoctor?.message}
        />
      </div>

      {/* DEPARTMENT */}
      <div>
        <Label>Assigned Department*</Label>
        <Select onValueChange={(v) => setValue("assignedDepartment", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select Department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dep) => (
              <SelectItem key={dep._id} value={dep.name}>
                {dep.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.assignedDepartment && (
          <p className="text-xs text-red-500">{errors.assignedDepartment.message.toString()}</p>
        )}
      </div>

      {/* Govt ID TYPE + NUMBER */}
      <div className="grid grid-cols-2 gap-4">
        <SelectField
          label="Govt ID Type*"
          items={["Aadhaar", "PAN", "VoterID", "DrivingLicense", "Passport"]}
          onChange={(v) => setValue("govtIdType", v)}
          error={errors.govtIdType?.message}
        />

        <InputField
          label="Govt ID Number*"
          {...register("govtIdNumber")}
          error={errors.govtIdNumber?.message}
        />
      </div>

      {/* GOVT FILE UPLOAD */}
      <div>
        <Label>Upload Govt ID</Label>
        <Input type="file" onChange={(e) => setGovtFile(e.target.files?.[0] || null)} />

        {govtFile && (
          <Button type="button" className="mt-2 w-full" onClick={uploadGovIdFile}>
            Upload to Cloudinary
          </Button>
        )}
        {fileUrl && <p className="text-green-600 text-sm">Uploaded</p>}
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={isLoading} className="bg-blue-600 text-white">
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
  ({ label, error, className, ...props }, ref) => (
    <div className="space-y-1">
      <Label className="text-xs font-medium">{label}</Label>

      <Input
        ref={ref}
        {...props}
        className={`
          h-8 w-full          /* compact size */
          rounded-lg
          text-sm             /* smaller font */
          px-2
          ${className}
        `}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
);


export { InputField };


const TextAreaField = forwardRef<HTMLTextAreaElement, any>(
  ({ label, error, className, ...props }, ref) => (
    <div className="space-y-1">
      <Label className="text-xs font-medium">{label}</Label>

      <Textarea
        ref={ref}
        {...props}
        className={`
          rounded-lg px-2 py-1 
          text-sm 
          h-16        /* smaller height */
          ${className}
        `}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
);



export { TextAreaField };


const SelectField = ({ label, items, onChange, error }) => (
  <div className="space-y-1">
    <Label className="text-xs font-medium">{label}</Label>

    <Select onValueChange={onChange}>
      <SelectTrigger className="h-8 rounded-lg px-2 text-sm">
        <SelectValue placeholder="Select" />
      </SelectTrigger>

      <SelectContent>
        {items.map((v) => (
          <SelectItem className="text-sm" key={v} value={v}>
            {v}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);
