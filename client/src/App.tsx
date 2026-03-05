import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";

// Pages
import Dashboard from "@/pages/Dashboard";
import PartnersList from "@/pages/PartnersList";
import PartnerWizard from "@/pages/PartnerWizard";
import DealsList from "@/pages/DealsList";
import DealDetail from "@/pages/DealDetail";
import PartnerDetail from "@/pages/PartnerDetail";
import LoginPage from "@/pages/LoginPage";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect handled by useAuth or the page logic usually, 
    // but we return the Login page component here to be safe and avoid flash
    return <LoginPage />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/api/login" component={() => null} />
      <Route path="/api/logout" component={() => null} />
      
      <Route path="/login" component={LoginPage} />
      
      <Route path="/">
        <ProtectedRoute component={Dashboard} />
      </Route>
      
      <Route path="/partners">
        <ProtectedRoute component={PartnersList} />
      </Route>
      
      <Route path="/partners/new">
        <ProtectedRoute component={PartnerWizard} />
      </Route>

      <Route path="/partners/:id">
        <ProtectedRoute component={PartnerDetail} />
      </Route>

      <Route path="/deals">
        <ProtectedRoute component={DealsList} />
      </Route>

      <Route path="/deals/:id">
        <ProtectedRoute component={DealDetail} />
      </Route>

      <Route path="/reports">
        {/* Re-use Dashboard for reports for now as requested by scope */}
        <ProtectedRoute component={Dashboard} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
