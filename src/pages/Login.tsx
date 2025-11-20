import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/api/auth.service";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Scan } from "lucide-react";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const res = await authService.login(data);
      setAuth(res.token, res.user);

      toast({
        title: "Success",
        description: `Welcome ${res.user.name}!`,
      });

      navigate(
        {
          super_admin: "/admin/dashboard",
          admin: "/admin/dashboard",
          reception: "/reception/dashboard",
          department_user: "/department/dashboard",
          patient: "/patient/reports",
        }[res.user.role] ?? "/"
      );
    } catch (err: any) {
      toast({
        title: "Login Failed",
        description: err.response?.data?.message ?? "Invalid credentials",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <div className="relative flex h-screen items-center justify-center bg-gradient-to-br from-white via-slate-50 to-blue-50 overflow-hidden">

      {/* Light animated background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 bg-[url('/grid.svg')] bg-cover opacity-5"
      />

      {/* Floating Radiology header */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 0.7 }}
        transition={{ duration: 1 }}
        className="absolute top-10 flex items-center gap-2 text-slate-600"
      >
        <Scan className="h-6 w-6 animate-pulse text-blue-600" />
        <span className="font-medium tracking-wide">Radiology Portal</span>
      </motion.div>

      {/* Login Card */}
      <motion.div
        initial={{ y: 35, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 16 }}
      >
        <Card className="w-full max-w-md border border-slate-200 bg-white backdrop-blur-md shadow-lg shadow-blue-50 rounded-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-slate-800">Welcome Back</CardTitle>
            <CardDescription className="text-slate-500">
              Sign in to continue
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              {/* Email */}
              <div className="space-y-1.5">
                <Label className="text-slate-700">Email</Label>
                <Input
                  {...register("email")}
                  className="bg-slate-50 border-slate-300 text-slate-800"
                />
                {errors.email && (
                  <p className="text-sm text-red-500">
                    {String(errors.email.message)}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label className="text-slate-700">Password</Label>
                <Input
                  type="password"
                  {...register("password")}
                  className="bg-slate-50 border-slate-300 text-slate-800"
                />
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {String(errors.password.message)}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : (
                  "Login"
                )}
              </Button>

            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
