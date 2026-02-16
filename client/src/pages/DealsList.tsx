import { AppLayout } from "@/components/layout/AppLayout";
import { useDeals } from "@/hooks/use-deals";
import { Link } from "wouter";
import { Plus, Tag, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Prospect: "outline",
  "In Conversation": "secondary",
  "Proposal Sent": "secondary",
  Negotiating: "default",
  Closed: "default",
  Stalled: "destructive",
};

export default function DealsList() {
  const { data: deals, isLoading } = useDeals();

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Deals Pipeline</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track and manage sponsorship opportunities
            </p>
          </div>
          <Button className="gap-2" data-testid="button-new-deal">
            <Plus className="h-4 w-4" />
            New Deal
          </Button>
        </div>

        {/* Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" data-testid="table-deals">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Deal Name</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Status</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Tier</th>
                  <th className="text-right font-medium text-muted-foreground px-4 py-3">Value</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Probability</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-16 ml-auto" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                      </tr>
                    ))
                  : deals?.length === 0
                  ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                          <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-40" />
                          No deals yet. Create a partner first.
                        </td>
                      </tr>
                    )
                  : deals?.map((deal) => (
                      <tr key={deal.id} className="hover:bg-muted/20 transition-colors" data-testid={`row-deal-${deal.id}`}>
                        <td className="px-4 py-3">
                          <Link
                            href={`/deals/${deal.id}`}
                            className="font-medium hover:underline"
                            data-testid={`link-deal-${deal.id}`}
                          >
                            {deal.dealName}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={STATUS_VARIANT[deal.status] ?? "outline"} className="text-[10px]">
                            {deal.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
                            <Tag className="h-3 w-3" />
                            {deal.sponsorshipTier || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium tabular-nums">
                          {deal.annualValue
                            ? `$${Number(deal.annualValue).toLocaleString()}`
                            : "-"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Progress
                              value={deal.closeProbability ?? 0}
                              className="h-1.5 w-16"
                            />
                            <span className="text-xs text-muted-foreground tabular-nums">
                              {deal.closeProbability ?? 0}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
