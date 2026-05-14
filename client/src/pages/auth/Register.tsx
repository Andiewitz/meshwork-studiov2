import { useState, useRef } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { MeshworkLogo } from "@/components/MeshworkLogo";
import { apiRequest } from "@/lib/queryClient";
import ReCAPTCHA from "react-google-recaptcha";
import { PASSWORD_POLICY, validatePasswordStrength } from "@shared/auth";
import { motion } from "framer-motion";

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    confirmPassword: false,
  });

  // Validation
  const isEmailValid = formData.email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const passwordValidation = validatePasswordStrength(formData.password);
  const isPasswordValid = passwordValidation.valid;
  const isConfirmPasswordValid = formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (!isPasswordValid) {
      toast({
        title: "Password does not meet requirements",
        description: passwordValidation.errors[0] || "Please check your password.",
        variant: "destructive",
      });
      return;
    }
    
    // In strict production, ensure captcha is solved before hitting API
    if (import.meta.env.PROD && import.meta.env.VITE_RECAPTCHA_SITE_KEY && !captchaToken) {
      toast({
        title: "Verification required",
        description: "Please complete the CAPTCHA check to register.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await apiRequest("POST", "/api/auth/register", {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        captchaToken: captchaToken || "dev_bypass_token",
      });
      const data = await res.json();

      if (res.ok) {
        toast({
          title: "Registration successful!",
          description: "You can now sign in.",
        });
        setLocation("/auth/login");
      } else {
        toast({
          title: "Registration failed",
          description: data.message || "Something went wrong",
          variant: "destructive",
        });
        if (recaptchaRef.current) recaptchaRef.current.reset();
        setCaptchaToken("");
      }
    } catch (err: any) {
      toast({
        title: "Registration failed",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
      if (recaptchaRef.current) recaptchaRef.current.reset();
      setCaptchaToken("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background font-sans">
      
      {/* LEFT COLUMN: Visual Hero (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center px-16 xl:px-24 relative overflow-hidden bg-[#0A0A0A] border-r border-white/5">
        
        {/* Dynamic Abstract Nodes Collage */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
           <motion.div 
             animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
             transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
             className="absolute top-[15%] right-[10%] w-32 h-32 rounded-3xl bg-white/[0.03] border border-white/[0.1] backdrop-blur-3xl shadow-[0_20px_40px_rgba(0,0,0,0.5)]" 
           />
           <motion.div 
             animate={{ y: [0, 30, 0], rotate: [0, -10, 0] }}
             transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
             className="absolute bottom-[20%] left-[15%] w-48 h-48 rounded-[2rem] bg-gradient-to-br from-primary/20 to-purple-500/10 border border-white/[0.1] backdrop-blur-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)]" 
           />
           <motion.div 
             animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
             transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
             className="absolute top-[40%] left-[30%] w-24 h-24 rounded-full bg-white/[0.05] border border-white/[0.2] backdrop-blur-lg flex items-center justify-center" 
           >
              <div className="w-8 h-8 rounded-full bg-primary/80 blur-[2px]" />
           </motion.div>
           
           {/* Connecting Lines */}
           <svg className="absolute inset-0 w-full h-full" stroke="rgba(255,255,255,0.05)" strokeWidth="1" fill="none">
             <path d="M 15% 80% Q 30% 40% 30% 40%" strokeDasharray="4 4" />
             <path d="M 30% 40% Q 70% 30% 90% 15%" strokeDasharray="4 4" />
           </svg>
        </div>

        <div className="relative z-10 max-w-xl">
            <Link href="/" className="inline-flex items-center gap-3 mb-16 cursor-figma-pointer group">
                <div className="w-10 h-10 flex items-center justify-center bg-white/[0.05] border border-white/10 rounded-xl group-hover:bg-white/[0.1] transition-all">
                    <MeshworkLogo />
                </div>
                <span className="font-bold tracking-tight text-white/80 group-hover:text-white transition-colors">Meshwork Studio</span>
            </Link>

            <h1 className="text-[3.5rem] xl:text-[4.5rem] leading-[1.05] font-bold text-white tracking-tight mb-6">
                Design the cloud architecture <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-300">made for you.</span>
            </h1>
            
            <p className="text-white/50 text-lg md:text-xl font-medium tracking-tight max-w-md leading-relaxed">
                Join thousands of developers mapping and deploying their infrastructure visually.
            </p>
        </div>
      </div>

      {/* RIGHT COLUMN: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
          
        {/* Subtle background glow for right side */}
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-[480px] relative z-10 bg-white/[0.02] border border-white/[0.05] p-8 sm:p-10 rounded-[2rem] shadow-2xl backdrop-blur-3xl my-auto">
          
          <div className="flex flex-col items-center mb-8 lg:hidden">
             <div className="w-12 h-12 flex items-center justify-center bg-white/[0.05] border border-white/10 rounded-xl mb-4">
                 <MeshworkLogo />
             </div>
          </div>

          <div className="text-center mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Create Account</h2>
              <p className="text-white/50 font-medium tracking-tight">Set up your workspace.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="font-bold text-xs tracking-wider text-white/70 uppercase">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="h-12 bg-black/40 border border-white/10 focus:border-primary/50 focus:bg-black/60 transition-all duration-200 rounded-xl px-4 text-white placeholder:text-white/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="font-bold text-xs tracking-wider text-white/70 uppercase">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="h-12 bg-black/40 border border-white/10 focus:border-primary/50 focus:bg-black/60 transition-all duration-200 rounded-xl px-4 text-white placeholder:text-white/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold text-xs tracking-wider text-white/70 uppercase">Email *</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                  required
                  className={`h-12 bg-black/40 border transition-all duration-200 rounded-xl px-4 ${
                    touched.email && isEmailValid
                      ? "border-green-500/50 focus:border-green-500" 
                      : touched.email && formData.email.length > 0 && !isEmailValid
                      ? "border-red-400/50 focus:border-red-400"
                      : "border-white/10 focus:border-primary/50 focus:bg-black/60"
                  } text-white placeholder:text-white/20`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-bold text-xs tracking-wider text-white/70 uppercase">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                  required
                  minLength={PASSWORD_POLICY.minLength}
                  className={`h-12 bg-black/40 border pr-10 transition-all duration-200 rounded-xl px-4 ${
                    touched.password && isPasswordValid
                      ? "border-green-500/50 focus:border-green-500" 
                      : touched.password && formData.password.length > 0 && !isPasswordValid
                      ? "border-red-400/50 focus:border-red-400"
                      : "border-white/10 focus:border-primary/50 focus:bg-black/60"
                  } text-white placeholder:text-white/20`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              <div className="mt-2 space-y-1">
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  <div className={`flex items-center text-[10px] ${formData.password.length >= PASSWORD_POLICY.minLength ? "text-green-500" : "text-white/30"}`}>
                    <div className={`w-1.5 h-1.5 rounded-full mr-2 ${formData.password.length >= PASSWORD_POLICY.minLength ? "bg-green-500" : "bg-white/10"}`} />
                    {PASSWORD_POLICY.minLength}+ chars
                  </div>
                  <div className={`flex items-center text-[10px] ${/[A-Z]/.test(formData.password) ? "text-green-500" : "text-white/30"}`}>
                    <div className={`w-1.5 h-1.5 rounded-full mr-2 ${/[A-Z]/.test(formData.password) ? "bg-green-500" : "bg-white/10"}`} />
                    Uppercase
                  </div>
                  <div className={`flex items-center text-[10px] ${/[a-z]/.test(formData.password) ? "text-green-500" : "text-white/30"}`}>
                    <div className={`w-1.5 h-1.5 rounded-full mr-2 ${/[a-z]/.test(formData.password) ? "bg-green-500" : "bg-white/10"}`} />
                    Lowercase
                  </div>
                  <div className={`flex items-center text-[10px] ${/\d/.test(formData.password) ? "text-green-500" : "text-white/30"}`}>
                    <div className={`w-1.5 h-1.5 rounded-full mr-2 ${/\d/.test(formData.password) ? "bg-green-500" : "bg-white/10"}`} />
                    Number
                  </div>
                  <div className={`flex items-center text-[10px] ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? "text-green-500" : "text-white/30"}`}>
                    <div className={`w-1.5 h-1.5 rounded-full mr-2 ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? "bg-green-500" : "bg-white/10"}`} />
                    Special Char
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="font-bold text-xs tracking-wider text-white/70 uppercase">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  onBlur={() => setTouched(prev => ({ ...prev, confirmPassword: true }))}
                  required
                  className={`h-12 bg-black/40 border pr-10 transition-all duration-200 rounded-xl px-4 ${
                    touched.confirmPassword && isConfirmPasswordValid
                      ? "border-green-500/50 focus:border-green-500" 
                      : touched.confirmPassword && formData.confirmPassword.length > 0 && !isConfirmPasswordValid
                      ? "border-red-400/50 focus:border-red-400"
                      : "border-white/10 focus:border-primary/50 focus:bg-black/60"
                  } text-white placeholder:text-white/20`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {import.meta.env.VITE_RECAPTCHA_SITE_KEY && (
              <div className="flex justify-center py-2 w-full overflow-hidden">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                  onChange={(token) => setCaptchaToken(token || "")}
                  onExpired={() => setCaptchaToken("")}
                  theme="dark"
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 mt-2 bg-white text-black hover:bg-white/90 font-bold tracking-tight rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              disabled={isLoading || (import.meta.env.PROD && !!import.meta.env.VITE_RECAPTCHA_SITE_KEY && !captchaToken)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm font-medium tracking-tight text-white/50">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-white hover:text-primary transition-colors underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
