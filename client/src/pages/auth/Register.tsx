import { useState, useRef } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Box, Eye, EyeOff } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import ReCAPTCHA from "react-google-recaptcha";
import { PASSWORD_POLICY, validatePasswordStrength } from "@shared/auth";

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
        captchaToken: captchaToken || "dev_bypass_token", // Send token if available
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Orange Wavy Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg
          className="absolute w-[200%] h-[200%] -top-1/2 -left-1/2"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern id="waves" x="0" y="0" width="100" height="20" patternUnits="userSpaceOnUse">
              <path
                d="M0 10 Q 12.5 0, 25 10 T 50 10 T 75 10 T 100 10"
                fill="none"
                stroke="#FF9B47"
                strokeWidth="0.3"
                opacity="0.4"
              />
              <path
                d="M0 15 Q 12.5 5, 25 15 T 50 15 T 75 15 T 100 15"
                fill="none"
                stroke="#FF9B47"
                strokeWidth="0.2"
                opacity="0.3"
              />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100" height="100" fill="url(#waves)" transform="rotate(-15 50 50)" />
        </svg>
        
        <svg
          className="absolute w-full h-full"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
        >
          <line x1="-200" y1="1000" x2="400" y2="-100" stroke="#FF9B47" strokeWidth="1" opacity="0.15" />
          <line x1="0" y1="1100" x2="600" y2="-100" stroke="#FF9B47" strokeWidth="1" opacity="0.1" />
          <line x1="200" y1="1200" x2="800" y2="-100" stroke="#FF9B47" strokeWidth="1" opacity="0.12" />
          <line x1="400" y1="1300" x2="1000" y2="-100" stroke="#FF9B47" strokeWidth="1" opacity="0.08" />
          <line x1="600" y1="1400" x2="1200" y2="-100" stroke="#FF9B47" strokeWidth="1" opacity="0.1" />
          <line x1="800" y1="1500" x2="1400" y2="-100" stroke="#FF9B47" strokeWidth="1" opacity="0.15" />
        </svg>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <div className="w-12 h-12 border-2 border-foreground flex items-center justify-center overflow-hidden shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-full h-full">
              <rect width="32" height="32" fill="#1A1A1A"/>
              <rect x="0" y="0" width="32" height="32" fill="none" stroke="#FF3D00" strokeWidth="2.5"/>
              <line x1="8" y1="8" x2="24" y2="8" stroke="white" strokeWidth="2" strokeLinecap="square"/>
              <line x1="8" y1="8" x2="16" y2="24" stroke="white" strokeWidth="2" strokeLinecap="square"/>
              <line x1="24" y1="8" x2="16" y2="24" stroke="white" strokeWidth="2" strokeLinecap="square"/>
              <rect x="4" y="4" width="8" height="8" fill="#FF3D00"/>
              <rect x="20" y="4" width="8" height="8" fill="white"/>
              <rect x="12" y="20" width="8" height="8" fill="white"/>
            </svg>
          </div>
          <span className="ml-3 text-2xl font-black uppercase tracking-tighter">
            Meshwork Studio
          </span>
        </div>

        <div className="brutal-card bg-card p-6 border-2 border-foreground">
          <h1 className="text-2xl font-black uppercase tracking-tighter mb-6 text-center">
            Create Account
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="font-bold uppercase text-xs tracking-widest">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="border-2 border-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="font-bold uppercase text-xs tracking-widest">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="border-2 border-foreground"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold uppercase text-xs tracking-widest">
                Email *
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                  required
                  className={`border-2 transition-all duration-200 ${
                    touched.email && isEmailValid
                      ? "border-green-500 bg-green-50/30" 
                      : touched.email && formData.email.length > 0 && !isEmailValid
                      ? "border-red-400 bg-red-50/30"
                      : "border-foreground focus:border-primary"
                  }`}
                />
                {touched.email && isEmailValid && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-bold uppercase text-xs tracking-widest">
                Password *
              </Label>
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
                  className={`border-2 pr-10 transition-all duration-200 ${
                    touched.password && isPasswordValid
                      ? "border-green-500 bg-green-50/30" 
                      : touched.password && formData.password.length > 0 && !isPasswordValid
                      ? "border-red-400 bg-red-50/30"
                      : "border-foreground focus:border-primary"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              <div className="mt-2 space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Password Requirements:</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <div className={`flex items-center text-[10px] ${formData.password.length >= PASSWORD_POLICY.minLength ? "text-green-500" : "text-muted-foreground"}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${formData.password.length >= PASSWORD_POLICY.minLength ? "bg-green-500" : "bg-muted/30 border border-muted-foreground/30"}`} />
                    {PASSWORD_POLICY.minLength}+ chars
                  </div>
                  <div className={`flex items-center text-[10px] ${/[A-Z]/.test(formData.password) ? "text-green-500" : "text-muted-foreground"}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${/[A-Z]/.test(formData.password) ? "bg-green-500" : "bg-muted/30 border border-muted-foreground/30"}`} />
                    Uppercase
                  </div>
                  <div className={`flex items-center text-[10px] ${/[a-z]/.test(formData.password) ? "text-green-500" : "text-muted-foreground"}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${/[a-z]/.test(formData.password) ? "bg-green-500" : "bg-muted/30 border border-muted-foreground/30"}`} />
                    Lowercase
                  </div>
                  <div className={`flex items-center text-[10px] ${/\d/.test(formData.password) ? "text-green-500" : "text-muted-foreground"}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${/\d/.test(formData.password) ? "bg-green-500" : "bg-muted/30 border border-muted-foreground/30"}`} />
                    Number
                  </div>
                  <div className={`flex items-center text-[10px] ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? "text-green-500" : "text-muted-foreground"}`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? "bg-green-500" : "bg-muted/30 border border-muted-foreground/30"}`} />
                    Special Char
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="font-bold uppercase text-xs tracking-widest">
                Confirm Password *
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  onBlur={() => setTouched(prev => ({ ...prev, confirmPassword: true }))}
                  required
                  className={`border-2 pr-10 transition-all duration-200 ${
                    touched.confirmPassword && isConfirmPasswordValid
                      ? "border-green-500 bg-green-50/30" 
                      : touched.confirmPassword && formData.confirmPassword.length > 0 && !isConfirmPasswordValid
                      ? "border-red-400 bg-red-50/30"
                      : "border-foreground focus:border-primary"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
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
              className="w-full accent-btn"
              disabled={isLoading || (import.meta.env.PROD && import.meta.env.VITE_RECAPTCHA_SITE_KEY && !captchaToken)}
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

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-bold text-foreground hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
