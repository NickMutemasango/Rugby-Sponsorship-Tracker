import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";

interface TierCardProps {
  name: string;
  value: number;
  count: number;
  capacity: number | null;
  status: "AVAILABLE" | "FULL" | "EXHAUSTED" | "ACTIVE";
}

export function TierCard({ name, value, count, capacity, status }: TierCardProps) {
  const isFull = status === "FULL" || status === "EXHAUSTED";
  const percentage = capacity ? Math.min((count / capacity) * 100, 100) : 0;

  const statusVariant = isFull
    ? "destructive"
    : status === "ACTIVE"
    ? "secondary"
    : "default";

  const statusLabel =
    status === "EXHAUSTED"
      ? `${count}/${capacity} Full`
      : status === "FULL"
      ? `${count}/${capacity} Full`
      : capacity
      ? `${capacity - count}/${capacity} Open`
      : `${count} Active`;

  return (
    <Card className="p-4 flex flex-col gap-3" data-testid={`tier-${name.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold leading-tight">{name}</h3>
        <Badge variant={statusVariant} className="shrink-0 text-[10px]">
          {isFull ? "FULL" : status}
        </Badge>
      </div>

      <p className="text-lg font-bold tabular-nums">
        {value > 0 ? `$${value.toLocaleString()}` : "Varies"}
      </p>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {statusLabel}
          </span>
        </div>
        {capacity && (
          <Progress
            value={percentage}
            className={cn(
              "h-1.5",
              isFull ? "[&>div]:bg-destructive" : "[&>div]:bg-primary"
            )}
          />
        )}
      </div>
    </Card>
  );
}
