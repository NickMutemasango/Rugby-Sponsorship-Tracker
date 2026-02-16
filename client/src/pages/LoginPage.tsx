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
      {/* Left Panel - Brand */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-[#0c2a14] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-white/10 -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-white/10 translate-y-1/3 -translate-x-1/4" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-yellow-500 text-yellow-950">
            <Trophy className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold">ZRU Sponsorship</span>
        </div>

        <div className="relative z-10 max-w-md space-y-4">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Manage the Future of Zimbabwean Rugby
          </h1>
          <p className="text-base text-white/70 leading-relaxed">
            Track sponsorships, manage partner relationships, and drive growth
            for the Sables, Cheetahs, and Junior programmes.
          </p>
        </div>

        <p className="relative z-10 text-xs text-white/40">
          &copy; {new Date().getFullYear()} Zimbabwe Rugby Union
        </p>
      </div>

      {/* Right Panel - Login */}
      <div className="flex flex-col items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Trophy className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold">ZRU Sponsorship</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in to access your dashboard
            </p>
          </div>

          <Button
            className="w-full"
            onClick={() => (window.location.href = "/api/login")}
            data-testid="button-login"
          >
            Sign in with Replit Auth
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>

          <p className="text-[11px] text-center text-muted-foreground">
            Authorized personnel only. By signing in you agree to our Terms of
            Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
