import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Trophy, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  if (isLoading) return null;

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left Panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-[#0a2e18] text-white overflow-hidden">
        {/* Abstract Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 0 L100 100 L100 0 Z" fill="currentColor" />
            <path d="M0 100 L100 0 L0 0 Z" fill="rgba(255,255,255,0.1)" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 text-2xl font-bold font-display">
            <Trophy className="w-8 h-8 text-yellow-400" />
            ZRU Sponsorship
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-5xl font-display font-bold mb-6 leading-tight">
            Manage the Future of Zimbabwean Rugby
          </h1>
          <p className="text-lg opacity-80 leading-relaxed">
            The all-in-one platform for tracking sponsorships, managing partner relationships, and driving growth for the Sables, Cheetahs, and Junior programs.
          </p>
        </div>

        <div className="relative z-10 text-sm opacity-60">
          © 2024 Zimbabwe Rugby Union. Authorized personnel only.
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex flex-col items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-display font-bold text-foreground">Welcome back</h2>
            <p className="mt-2 text-muted-foreground">Sign in to access your dashboard</p>
          </div>

          <div className="space-y-4">
            <Button 
              className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
              onClick={() => window.location.href = "/api/login"}
            >
              Sign in with Replit Auth
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            
            <p className="text-xs text-center text-muted-foreground px-8">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
