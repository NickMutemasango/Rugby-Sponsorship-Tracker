import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  BarChart3, 
  Settings, 
  LogOut,
  Trophy
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Partners', href: '/partners', icon: Users },
  { name: 'Deals', href: '/deals', icon: Briefcase },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  // { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();
  const { logout, user } = useAuth();

  return (
    <div className="flex h-screen w-64 flex-col bg-card border-r border-border fixed left-0 top-0 z-50">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-border/50">
        <Link href="/" className="flex items-center gap-2 font-display font-bold text-2xl text-primary cursor-pointer hover:opacity-80 transition-opacity">
          <Trophy className="h-8 w-8 text-secondary" />
          <span>ZRU<span className="text-foreground text-lg ml-1 font-normal">Sponsorship</span></span>
        </Link>
      </div>
      
      <div className="flex flex-1 flex-col gap-y-7 px-4 py-8 overflow-y-auto">
        <nav className="flex flex-1 flex-col gap-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href || (item.href !== '/' && location.startsWith(item.href));
            return (
              <Link key={item.name} href={item.href}>
                <div className={cn(
                  "group flex items-center gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}>
                  <item.icon className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )} aria-hidden="true" />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-border pt-6">
          <div className="flex items-center gap-x-4 px-2 py-3 rounded-xl bg-muted/50 mb-4">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
              {user?.firstName?.[0] || 'U'}
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-semibold text-foreground truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-x-3 rounded-xl p-3 text-sm font-semibold leading-6 text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
