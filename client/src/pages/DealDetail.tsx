import { AppLayout } from "@/components/layout/AppLayout";
import { useDeal, useUpdateDeal } from "@/hooks/use-deals";
import { usePartner } from "@/hooks/use-partners";
import { useInteractions } from "@/hooks/use-interactions";
import { useRoute, Link } from "wouter";
import { Loader2, ArrowLeft, Briefcase, Calendar, DollarSign, Building2, Tag, Clock, FileText, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dealStatuses } from "@shared/schema";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  Prospect: "outline",
  "In Conversation": "secondary",
  "Proposal Sent": "secondary",
  Negotiating: "default",
  Closed: "default",
  Stalled: "destructive",
};

function formatCurrency(value: string | number | null | undefined) {
  if (!value) return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(num);
}

function formatDate(value: string | Date | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function InfoRow({ label, value, testId }: { label: string; value: string | null | undefined; testId?: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm" data-testid={testId || `text-deal-${label.toLowerCase().replace(/\s+/g, "-")}`}>{value}</span>
    </div>
  );
}

export default function DealDetail() {
  const [, params] = useRoute("/deals/:id");
  const dealId = Number(params?.id);
  const { data: deal, isLoading: dealLoading } = useDeal(dealId);
  const updateDeal = useUpdateDeal();

  const partnerId = deal?.partnerId ?? 0;
  const { data: partner } = usePartner(partnerId);
  const { data: interactions, isLoading: interactionsLoading } = useInteractions({ dealId });

  const handleStatusChange = (newStatus: string) => {
    if (deal && newStatus !== deal.status) {
      updateDeal.mutate({ id: deal.id, status: newStatus as typeof deal.status });
    }
  };

  if (dealLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!deal) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-muted-foreground mb-4">Deal not found</p>
          <Link href="/deals">
            <Button variant="outline" data-testid="button-back-deals">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Deals
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/deals">
              <Button variant="ghost" size="icon" className="shrink-0" data-testid="button-back">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight" data-testid="text-deal-name">
                {deal.dealName}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                {deal.sponsorshipTier && (
                  <Badge variant="secondary" className="text-xs" data-testid="badge-tier">{deal.sponsorshipTier}</Badge>
                )}
                {deal.programmeCategory && (
                  <Badge variant="outline" className="text-xs" data-testid="badge-programme">{deal.programmeCategory}</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-5" data-testid="card-status">
              <h2 className="text-sm font-semibold mb-4">Status</h2>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1.5 block">Current Status</label>
                  <Select value={deal.status} onValueChange={handleStatusChange} disabled={updateDeal.isPending}>
                    <SelectTrigger className="w-full sm:w-[220px]" data-testid="select-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dealStatuses.map((status) => (
                        <SelectItem key={status} value={status} data-testid={`option-status-${status.toLowerCase().replace(/\s+/g, "-")}`}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {deal.closeProbability !== null && deal.closeProbability !== undefined && (
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1.5 block">Close Probability</label>
                    <div className="flex items-center gap-3">
                      <Progress value={deal.closeProbability} className="h-2 flex-1" />
                      <span className="text-sm font-medium tabular-nums" data-testid="text-probability">{deal.closeProbability}%</span>
                    </div>
                  </div>
                )}
                {updateDeal.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
            </Card>

            <Card className="p-5" data-testid="card-financials">
              <h2 className="text-sm font-semibold mb-4">Financials</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">Annual Value</span>
                  <span className="text-lg font-semibold tabular-nums" data-testid="text-annual-value">
                    {formatCurrency(deal.annualValue)}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground">Monthly Value</span>
                  <span className="text-lg font-semibold tabular-nums" data-testid="text-monthly-value">
                    {formatCurrency(deal.monthlyValue)}
                  </span>
                </div>
                <InfoRow label="Commitment Amount" value={deal.commitmentAmount} />
                <InfoRow label="Payment Terms" value={deal.paymentTerms} />
                <InfoRow label="Currency" value={deal.currency} />
              </div>

              {(deal.inKindValueDescription || deal.inKindProductsServices) && (
                <>
                  <Separator className="my-4" />
                  <h3 className="text-sm font-semibold mb-3">In-Kind Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoRow label="Value Description" value={deal.inKindValueDescription} />
                    <InfoRow label="Products/Services" value={deal.inKindProductsServices} />
                  </div>
                </>
              )}
            </Card>

            <Card className="p-5" data-testid="card-dates">
              <h2 className="text-sm font-semibold mb-4">Key Dates</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-2.5">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs text-muted-foreground block">Decision Date</span>
                    <span className="text-sm" data-testid="text-decision-date">{formatDate(deal.decisionDate)}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs text-muted-foreground block">Contract Start</span>
                    <span className="text-sm" data-testid="text-contract-start">{formatDate(deal.contractStartDate)}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs text-muted-foreground block">Contract End</span>
                    <span className="text-sm" data-testid="text-contract-end">{formatDate(deal.contractEndDate)}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs text-muted-foreground block">Renewal Date</span>
                    <span className="text-sm" data-testid="text-renewal-date">{formatDate(deal.contractRenewalDate)}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <InfoRow label="Proposed Duration" value={deal.proposedDuration} />
                <InfoRow label="Proposed Start Date" value={formatDate(deal.proposedStartDate)} testId="text-proposed-start" />
              </div>
            </Card>

            {(deal.description || deal.nextSteps) && (
              <Card className="p-5" data-testid="card-notes">
                <h2 className="text-sm font-semibold mb-4">Notes</h2>
                <div className="space-y-4">
                  {deal.description && (
                    <div>
                      <span className="text-xs text-muted-foreground block mb-1">Description</span>
                      <p className="text-sm whitespace-pre-wrap" data-testid="text-description">{deal.description}</p>
                    </div>
                  )}
                  {deal.nextSteps && (
                    <div>
                      <span className="text-xs text-muted-foreground block mb-1">Next Steps</span>
                      <p className="text-sm whitespace-pre-wrap" data-testid="text-next-steps">{deal.nextSteps}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {partner && (
              <Card className="p-5" data-testid="card-partner">
                <h2 className="text-sm font-semibold mb-4">Partner</h2>
                <Link href={`/partners/${partner.id}`}>
                  <div className="flex items-center gap-3 p-3 rounded-md border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer" data-testid="link-partner">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate" data-testid="text-partner-name">{partner.organizationName}</p>
                      <p className="text-xs text-muted-foreground truncate">{partner.primaryContactEmail}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                </Link>
              </Card>
            )}

            <Card className="p-5" data-testid="card-overview">
              <h2 className="text-sm font-semibold mb-4">Overview</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={STATUS_VARIANT[deal.status] || "secondary"} className="text-[10px]" data-testid="badge-status">
                    {deal.status}
                  </Badge>
                </div>
                {deal.sponsorshipTier && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tier</span>
                    <span className="flex items-center gap-1.5">
                      <Tag className="h-3 w-3" />
                      {deal.sponsorshipTier}
                    </span>
                  </div>
                )}
                {deal.annualValue && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Annual Value</span>
                    <span className="font-medium tabular-nums">{formatCurrency(deal.annualValue)}</span>
                  </div>
                )}
                {deal.initiatedContactDate && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Initiated</span>
                    <span>{formatDate(deal.initiatedContactDate)}</span>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-5" data-testid="card-interactions">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold">Interactions</h2>
                <Badge variant="outline" className="text-xs">{interactions?.length ?? 0}</Badge>
              </div>

              {interactionsLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : interactions && interactions.length > 0 ? (
                <div className="space-y-3">
                  {interactions.map((interaction) => (
                    <div
                      key={interaction.id}
                      className="flex flex-col gap-1 p-3 rounded-md border bg-muted/30"
                      data-testid={`card-interaction-${interaction.id}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Badge variant="secondary" className="text-[10px]">{interaction.interactionType}</Badge>
                        <span className="text-[10px] text-muted-foreground">{formatDate(interaction.interactionDate)}</span>
                      </div>
                      {interaction.notes && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{interaction.notes}</p>
                      )}
                      {interaction.nextAction && (
                        <div className="flex items-center gap-1.5 text-xs mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="truncate">{interaction.nextAction}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No interactions logged</p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
