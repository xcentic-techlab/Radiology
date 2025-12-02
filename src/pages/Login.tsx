import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";

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

import { Eye, EyeOff, Loader2 } from "lucide-react";

import { useAuthStore } from "@/store/authStore";
import { authService } from "@/api/auth.service";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const slides = [
  {
    title: "Experts on the go!",
    subtitle: "Around The World.",
    text: "Access to global specialists and comprehensive healthcare resources.",
    bg: "from-blue-500 to-blue-700",
    mainImg: "/images/doctor1.jpg",
    circles: ["/images/doctor2.jpg", "/images/doctor3.jpg"],
  },
  {
    title: "Multiple Laboratories",
    subtitle: "Precision & Accuracy",
    text: "State-of-the-art lab equipment and experienced technicians for reliable results.",
    bg: "from-teal-500 to-emerald-600",
    mainImg: "/images/doctor2.jpg",
    circles: ["/images/doctor1.jpg", "/images/doctor3.jpg"],
  },
  {
    title: "Expert Medical Care",
    subtitle: "Professional Excellence",
    text: "Dedicated healthcare professionals committed to your wellbeing.",
    bg: "from-violet-500 to-purple-700",
    mainImg: "/images/doctor3.jpg",
    circles: ["/images/doctor1.jpg", "/images/doctor2.jpg"],
  },
];

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setAuth } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [current, setCurrent] = useState(0);

  // Auto Slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

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
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-screen">

      {/* LEFT SIDE FULL SLIDER */}
{/* LEFT SIDE FULL SLIDER */}
<div className="hidden md:block relative overflow-hidden">

  <AnimatePresence mode="wait">
    <motion.div
      key={current}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className={`absolute inset-0 p-10 bg-gradient-to-br ${slides[current].bg} text-white rounded-none`}
    >

      {/* NEW DECORATION PACK (Premium UI) */}
      <div className="absolute inset-0 overflow-hidden">

        {/* Soft Glowing Gradient Blobs */}
        <div className="absolute top-10 left-10 w-52 h-52 bg-white/10 blur-3xl rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-white/5 blur-3xl rounded-full animate-[pulse_6s_ease-in-out_infinite]"></div>

        {/* Glow Rings (rotating rings for modern look) */}
        <div className="absolute top-[45%] left-[20%] w-80 h-80 rounded-full border border-white/20 blur-[2px] animate-spin-slow"></div>
        <div className="absolute bottom-[10%] right-[15%] w-56 h-56 rounded-full border border-white/10 blur-[1px] animate-spin-slower"></div>

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white/40 rounded-full blur-sm"
            style={{
              width: `${Math.random() * 6 + 3}px`,
              height: `${Math.random() * 6 + 3}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `floatUp ${4 + Math.random() * 4}s linear infinite`,
            }}
          ></div>
        ))}

        {/* Light Grid Pattern (premium SaaS look) */}
        <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:42px_42px]"></div>

      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold mb-10 relative z-10">Star-Radiology</h1>

      {/* Slide Texts */}
      <div className="max-w-xl relative z-10">
        <h2 className="text-5xl font-bold leading-tight">
          {slides[current].title}
        </h2>
        <h3 className="text-2xl mt-2 font-semibold">{slides[current].subtitle}</h3>
        <p className="mt-6 text-lg text-white/90">{slides[current].text}</p>
      </div>

      {/* Main doctor image with glow */}
      <img
  src={slides[current].mainImg}
  className="absolute right-10 bottom-10 w-64 h-64 object-cover rounded-full shadow-2xl border-4 border-white ring-8 ring-white/20"
/>


      {/* Small floating circle images */}
      <img
        src={slides[current].circles[0]}
        className="absolute right-10 top-24 w-24 rounded-full border-4 border-white shadow-lg ring-4 ring-white/30"
      />
      <img
        src={slides[current].circles[1]}
        className="absolute left-10 bottom-20 w-24 rounded-full border-4 border-white shadow-lg ring-4 ring-white/30"
      />

      {/* Bullets */}
      <div className="absolute left-10 bottom-10 flex gap-3 items-center z-10">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`h-3 rounded-full transition-all ${
              current === i ? "w-10 bg-white" : "w-3 bg-white/40"
            }`}
          ></div>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={() => setCurrent((current + 1) % slides.length)}
        className="absolute right-10 bottom-10 bg-white/40 hover:bg-white/70 p-4 rounded-full text-xl backdrop-blur-md shadow-md z-10"
      >
        ➜
      </button>

    </motion.div>
  </AnimatePresence>

</div>


      {/* RIGHT SIDE FORM */}
      <div className="flex items-center justify-center px-6 md:px-16 bg-gradient-to-br from-white via-slate-50 to-blue-50">

        <Card className="w-full max-w-md shadow-xl rounded-2xl bg-white/80 backdrop-blur-md">
          <CardHeader className="text-center space-y-1">
            <img src="/images/starradiology_logo-1.png" className="h-14 mx-auto" />
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>Sign in to your medical dashboard</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              <div>
                <Label>Email Address</Label>
                <Input
                  {...register("email")}
                  className="mt-1 bg-slate-100"
                />
                {/* {errors.email && <p className="text-red-500 text-sm">{String(errors.email.message)}</p>} */}
              </div>

              <div>
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    type={showPass ? "text" : "password"}
                    {...register("password")}
                    className="mt-1 bg-slate-100 pr-12"
                  />
                  <span
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                    onClick={() => setShowPass(!showPass)}
                  >
                    {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                  </span>
                </div>
                {errors.password && <p className="text-red-500 text-sm">{String(errors.password.message)}</p>}
              </div>

              <div className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="scale-125" /> Remember me
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In to Dashboard"}
              </Button>

            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
