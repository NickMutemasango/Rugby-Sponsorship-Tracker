import { cn } from "@/lib/utils";
import { Users, CheckCircle, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface TierCardProps {
  name: string;
  value: number;
  count: number;
  capacity: number | null;
  status: 'AVAILABLE' | 'FULL' | 'EXHAUSTED' | 'ACTIVE';
}

export function TierCard({ name, value, count, capacity, status }: TierCardProps) {
  const isFull = status === 'FULL' || status === 'EXHAUSTED';
  const isAvailable = status === 'AVAILABLE';
  const percentage = capacity ? Math.min((count / capacity) * 100, 100) : 100;

  // Tier specific styling
  const getTheme = () => {
    if (name.includes('Title')) return "bg-gradient-to-br from-yellow-50 to-amber-100 border-amber-200 text-amber-900";
    if (name.includes('Principal')) return "bg-gradient-to-br from-slate-50 to-slate-200 border-slate-300 text-slate-900";
    if (name.includes('Official')) return "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 text-blue-900";
    if (name.includes('Supporting')) return "bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-900";
    return "bg-card border-border";
  };

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border p-6 shadow-sm transition-all duration-300 hover:shadow-md",
      getTheme()
    )}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold font-display">{name}</h3>
          <p className="text-sm opacity-80 font-medium">
            {value === 0 ? 'Value varies' : `$${value.toLocaleString()}+`}
          </p>
        </div>
        <div className={cn(
          "px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide",
          isFull ? "bg-red-100 text-red-700" : 
          isAvailable ? "bg-green-100 text-green-700" : 
          "bg-blue-100 text-blue-700"
        )}>
          {status}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm font-medium">
          <span className="flex items-center gap-1.5 opacity-90">
            <Users className="w-4 h-4" />
            {count} Active
          </span>
          {capacity && (
            <span className="opacity-75">
              Target: {capacity}
            </span>
          )}
        </div>
        
        {capacity && (
          <Progress value={percentage} className="h-2 bg-black/5" />
        )}
      </div>

      {isFull && (
        <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-red-600 bg-red-50/50 p-2 rounded-lg border border-red-100">
          <AlertCircle className="w-4 h-4" />
          Waitlist active
        </div>
      )}
      
      {!isFull && capacity && (
        <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-green-700 bg-green-50/50 p-2 rounded-lg border border-green-100">
          <CheckCircle className="w-4 h-4" />
          {capacity - count} slots remaining
        </div>
      )}
    </div>
  );
}
