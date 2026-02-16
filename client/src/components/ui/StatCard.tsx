import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, icon: Icon, description, trend, className }: StatCardProps) {
  return (
    <div className={cn(
      "bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-all duration-300",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
            trend.positive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}>
            <span>{trend.positive ? '+' : ''}{trend.value}%</span>
            <span className="opacity-70">{trend.label}</span>
          </div>
        )}
      </div>
      
      <div className="mt-5">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h3 className="text-2xl font-bold font-display mt-1 text-foreground">{value}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1 opacity-80">{description}</p>
        )}
      </div>
    </div>
  );
}
