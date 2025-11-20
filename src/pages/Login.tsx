import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/api/auth.service";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const res = await authService.login(data);
      setAuth(res.token, res.user);

      toast({ title: "Success", description: `Welcome ${res.user.name}!` });

      navigate({
        super_admin: "/admin/dashboard",
        admin: "/admin/dashboard",
        reception: "/reception/dashboard",
        department_user: "/department/dashboard",
        patient: "/patient/reports",
      }[res.user.role] ?? "/");

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
    <div className="grid h-screen place-items-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Sign in to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <Label>Email</Label>
              <Input {...register("email")} />
              {errors.email && (
  <p className="text-sm text-destructive">
    {String(errors.email.message)}
  </p>
)}

            </div>

            <div>
              <Label>Password</Label>
              <Input type="password" {...register("password")} />
              {errors.password && (
  <p className="text-sm text-destructive">
    {String(errors.password.message)}
  </p>
)}

            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
