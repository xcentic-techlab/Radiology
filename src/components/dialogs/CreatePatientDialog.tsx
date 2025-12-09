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
import axiosAPI from "@/api/axios";

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

    selectedTest: z.string({
  required_error: "Please select a test",
}),
  email: z.string().email().optional(),
  referredDoctor: z.string().optional(),

  govtIdType: z.string().optional(),
  govtIdNumber: z.string().optional(),
});

export default function CreatePatientDialog({ open, onClose, onSuccess }) {
  const { toast } = useToast();
  const [isLoading, setLoading] = useState(false);
  const [govtFile, setGovtFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [departments, setDepartments] = useState([]);
  const [tests, setTests] = useState([]);

  
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
  const uploadGovIdFile = async () => {
    if (!govtFile) return;
    const url = await uploadService.uploadGovId(govtFile);
    setFileUrl(url);
    toast({
      title: "Uploaded ☁",
      description: "Govt ID uploaded successfully",
    });
  };

  const loadTests = async (deptName) => {
//  const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/tests/by-dept-name/${deptName.toLowerCase()}`);
const res = await axiosAPI.get(`/tests/by-dept-name/${deptName.toLowerCase()}`);


  setTests(res.data);
};
const submit = async (data) => {
  setLoading(true);

  try {
    let payload:any = {
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

      govtId:
        data.govtIdType || data.govtIdNumber || fileUrl
          ? {
              idType: data.govtIdType || null,
              idNumber: data.govtIdNumber || null,
              fileUrl: fileUrl || null,
            }
          : null,
    };

    const selectedTestParsed = data.selectedTest
      ? JSON.parse(data.selectedTest)
      : null;

    payload.selectedTests = [
      {
        testId: selectedTestParsed.itemid,
        name: selectedTestParsed.name,
        mrp: selectedTestParsed.price,
        offerRate: selectedTestParsed.offerRate,
        code: selectedTestParsed.code,
        deptid: selectedTestParsed.deptid, 
      },
    ];
payload.departmentAssignedTo = departments.find(
  d => d.name.trim().toLowerCase() === data.assignedDepartment.trim().toLowerCase()
)?._id || null;


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


  return (
<Dialog open={open} onOpenChange={onClose}>
<DialogContent
  className="
    w-full max-w-3xl 
    max-h-[92vh]
    overflow-y-scroll scrollbar-hide
    rounded-2xl bg-white shadow-xl
    pt-2 px-6 pb-6     
  "
>


<DialogHeader className="text-center flex flex-col items-center gap-1 mt-0 mb-1">
  <DialogTitle className="text-xl font-bold text-center leading-tight">
    Register Patient
  </DialogTitle>
</DialogHeader>



<form 
  onSubmit={handleSubmit(submit)} 
  className="
    grid grid-cols-1 md:grid-cols-2
    gap-2
    text-sm
    w-full
  "
>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <InputField label="First Name*" {...register("firstName")} error={errors.firstName?.message} />
    <InputField label="Last Name*" {...register("lastName")} error={errors.lastName?.message} />
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <InputField label="Age*" type="number" {...register("age")} error={errors.age?.message} />
    <SelectField
      label="Gender*"
      items={["male", "female", "other"]}
      onChange={(v) => setValue("gender", v)}
      error={errors.gender?.message}
    />
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <InputField label="Phone*" {...register("phone")} error={errors.phone?.message} />
    <InputField label="Email" {...register("email")} error={errors.email?.message} />
  </div>

  <TextAreaField
    label="Address*"
    className="h-[60px]"
    {...register("address")}
    error={errors.address?.message}
  />

  <TextAreaField
    label="Case Description*"
    className="h-[60px]"
    {...register("caseDescription")}
    error={errors.caseDescription?.message}
  />

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
  <div className="col-span-1 space-y-1">
    <Label>Assigned Department*</Label>

    <Select
      onValueChange={(v) => {
        setValue("assignedDepartment", v);
        loadTests(v);
      }}
    >
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
      <p className="text-xs text-red-500">
        {errors.assignedDepartment.message.toString()}
      </p>
    )}
  </div>
  {Array.isArray(tests) && tests.length > 0 && (
    <div className="col-span-1 space-y-1">
      <Label>Select Test*</Label>

      <Select
        {...register("selectedTest")}
        onValueChange={(v) =>
          setValue("selectedTest", v, { shouldValidate: true })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Test" />
        </SelectTrigger>

        <SelectContent>
          {tests.map((t) => (
            <SelectItem key={t._id} value={JSON.stringify(t)}>
              {t.itemid} — {t.name} — ₹{t.offerRate}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {errors.selectedTest && (
        <p className="text-xs text-red-500">
          {errors.selectedTest.message.toString()}
        </p>
      )}
    </div>
  )}

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

  {/* BUTTONS */}
  <div className="flex flex-col sm:flex-row justify-between gap-2 col-span-2 pt-2">
    <Button type="button" variant="outline" onClick={onClose} className="px-6 w-full sm:w-auto">
      Cancel
    </Button>
    <Button type="submit" disabled={isLoading} className="bg-blue-600 text-white px-6 w-full sm:w-auto">
      Register
    </Button>
  </div>
</form>

  </DialogContent>
</Dialog>

  );
}

const InputField = forwardRef<HTMLInputElement, any>(
  ({ label, error, className, ...props }, ref) => (
    <div className="space-y-1">
      <Label className="text-xs font-medium">{label}</Label>

      <Input
        ref={ref}
        {...props}
        className={`
          h-8 w-full
          rounded-lg
          text-sm             
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
