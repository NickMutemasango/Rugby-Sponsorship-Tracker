import { AppLayout } from "@/components/layout/AppLayout";
import { useDeals } from "@/hooks/use-deals";
import { Link } from "wouter";
import { Plus, Filter, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const STATUS_COLORS = {
  "Prospect": "bg-slate-100 text-slate-700",
  "In Conversation": "bg-blue-100 text-blue-700",
  "Proposal Sent": "bg-purple-100 text-purple-700",
  "Negotiating": "bg-amber-100 text-amber-700",
  "Closed": "bg-green-100 text-green-700",
  "Stalled": "bg-red-100 text-red-700",
};

export default function DealsList() {
  const { data: deals, isLoading } = useDeals();

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Deals Pipeline</h1>
          <p className="text-muted-foreground mt-1">Track and manage sponsorship opportunities.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" /> Filter
          </Button>
          <Button className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30">
            <Plus className="w-4 h-4" /> New Deal
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-4 font-semibold text-foreground">Deal Name</th>
                <th className="px-6 py-4 font-semibold text-foreground">Status</th>
                <th className="px-6 py-4 font-semibold text-foreground">Tier</th>
                <th className="px-6 py-4 font-semibold text-foreground text-right">Value</th>
                <th className="px-6 py-4 font-semibold text-foreground">Close Probability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-16 ml-auto" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                  </tr>
                ))
              ) : deals?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No deals found. Start by creating a partner!
                  </td>
                </tr>
              ) : (
                deals?.map((deal) => (
                  <tr key={deal.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/deals/${deal.id}`} className="font-medium text-foreground hover:text-primary transition-colors">
                        {deal.dealName}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("px-2.5 py-1 rounded-full text-xs font-semibold", STATUS_COLORS[deal.status as keyof typeof STATUS_COLORS])}>
                        {deal.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Tag className="w-3 h-3" />
                        {deal.sponsorshipTier || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-medium">
                      {deal.annualValue ? `$${Number(deal.annualValue).toLocaleString()}` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-500" 
                            style={{ width: `${deal.closeProbability || 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{deal.closeProbability || 0}%</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
