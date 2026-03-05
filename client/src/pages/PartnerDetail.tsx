import { AppLayout } from "@/components/layout/AppLayout";
import { usePartner } from "@/hooks/use-partners";
import { useDeals } from "@/hooks/use-deals";
import { useRoute, Link } from "wouter";
import { Loader2, ArrowLeft, Building2, MapPin, Mail, Phone, Globe, Linkedin, ExternalLink, Calendar, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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

const statusVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  Prospect: "secondary",
  "In Conversation": "outline",
  "Proposal Sent": "outline",
  Negotiating: "default",
  Closed: "default",
  Stalled: "destructive",
};

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm" data-testid={`text-partner-${label.toLowerCase().replace(/\s+/g, "-")}`}>{value}</span>
    </div>
  );
}

function ArrayField({ label, items }: { label: string; items: string[] | null | undefined }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <Badge key={item} variant="secondary" className="text-xs">{item}</Badge>
        ))}
      </div>
    </div>
  );
}

export default function PartnerDetail() {
  const [, params] = useRoute("/partners/:id");
  const partnerId = Number(params?.id);
  const { data: partner, isLoading: partnerLoading } = usePartner(partnerId);
  const { data: deals, isLoading: dealsLoading } = useDeals({ partnerId });

  if (partnerLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!partner) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <Building2 className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-muted-foreground mb-4">Partner not found</p>
          <Link href="/partners">
            <Button variant="outline" data-testid="button-back-partners">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Partners
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
            <Link href="/partners">
              <Button variant="ghost" size="icon" className="shrink-0" data-testid="button-back">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight" data-testid="text-partner-name">
                {partner.organizationName}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">{partner.partnershipNature}</Badge>
                {partner.organizationTypes?.map((type: string) => (
                  <Badge key={type} variant="secondary" className="text-xs">{type}</Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-5" data-testid="card-contact-info">
              <h2 className="text-sm font-semibold mb-4">Primary Contact</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoRow label="Name" value={partner.primaryContactName} />
                <InfoRow label="Job Title" value={partner.primaryContactJobTitle} />
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <a href={`mailto:${partner.primaryContactEmail}`} className="text-foreground underline-offset-4 hover:underline truncate" data-testid="link-email">
                    {partner.primaryContactEmail}
                  </a>
                </div>
                {partner.primaryContactPhone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span data-testid="text-phone">{partner.primaryContactPhone}</span>
                  </div>
                )}
                {partner.primaryContactLinkedin && (
                  <div className="flex items-center gap-2 text-sm">
                    <Linkedin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <a href={partner.primaryContactLinkedin} target="_blank" rel="noreferrer" className="text-foreground underline-offset-4 hover:underline truncate" data-testid="link-linkedin">
                      LinkedIn
                    </a>
                  </div>
                )}
              </div>

              {(partner.secondaryContactName || partner.secondaryContactEmail) && (
                <>
                  <Separator className="my-4" />
                  <h2 className="text-sm font-semibold mb-4">Secondary Contact</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoRow label="Name" value={partner.secondaryContactName} />
                    <InfoRow label="Job Title" value={partner.secondaryContactJobTitle} />
                    {partner.secondaryContactEmail && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span data-testid="text-secondary-email">{partner.secondaryContactEmail}</span>
                      </div>
                    )}
                    {partner.secondaryContactPhone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span data-testid="text-secondary-phone">{partner.secondaryContactPhone}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </Card>

            <Card className="p-5" data-testid="card-interest-alignment">
              <h2 className="text-sm font-semibold mb-4">Interest & Alignment</h2>
              <div className="space-y-4">
                <ArrayField label="Teams Interested" items={partner.teamsInterested} />
                <ArrayField label="Strategic Objectives" items={partner.strategicObjectives} />
                <ArrayField label="Geographic Markets" items={partner.geographicMarkets} />
                <InfoRow label="Sports Sponsorship Experience" value={partner.sportsSponsorshipExperience} />
                <InfoRow label="Success KPIs" value={partner.successKpis} />
              </div>
            </Card>

            {(partner.activationRequirements?.length || partner.developmentSupportCapacity?.length || partner.africanOrgExperience) && (
              <Card className="p-5" data-testid="card-activation-ops">
                <h2 className="text-sm font-semibold mb-4">Activation & Operations</h2>
                <div className="space-y-4">
                  <ArrayField label="Activation Requirements" items={partner.activationRequirements} />
                  <InfoRow label="Athlete Representation" value={partner.athleteRepresentationNeeded ? "Yes" : "No"} />
                  <InfoRow label="Athlete Representation Services" value={partner.athleteRepresentationServices} />
                  <InfoRow label="African Organisation Experience" value={partner.africanOrgExperience} />
                  <ArrayField label="Development Support Capacity" items={partner.developmentSupportCapacity} />
                  <InfoRow label="Development Support Description" value={partner.developmentSupportDescription} />
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="p-5" data-testid="card-org-details">
              <h2 className="text-sm font-semibold mb-4">Organisation Details</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span data-testid="text-country">{partner.countryOfRegistration}</span>
                </div>
                {partner.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <a href={partner.website} target="_blank" rel="noreferrer" className="text-foreground underline-offset-4 hover:underline truncate" data-testid="link-website">
                      {partner.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}
                {partner.primarySocialMedia && (
                  <div className="flex items-center gap-2 text-sm">
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <a href={partner.primarySocialMedia} target="_blank" rel="noreferrer" className="text-foreground underline-offset-4 hover:underline truncate" data-testid="link-social-media">
                      Social Media
                    </a>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <h3 className="text-sm font-semibold mb-3">Governance</h3>
              <div className="space-y-3">
                <ArrayField label="Restricted Categories" items={partner.restrictedCategories} />
                <InfoRow label="Code of Conduct Reviewed" value={partner.codeOfConductReviewed ? "Yes" : "No"} />
              </div>

              <Separator className="my-4" />

              <h3 className="text-sm font-semibold mb-3">Communication</h3>
              <div className="space-y-3">
                <InfoRow label="Preferred Method" value={partner.preferredContactMethod} />
                <InfoRow label="Decision Timeline" value={partner.decisionTimeline} />
                <InfoRow label="Other Unions in Discussion" value={partner.inDiscussionsWithOtherUnions ? (partner.otherUnions || "Yes") : "No"} />
                <InfoRow label="How Heard About ZRU" value={partner.howHeardAbout} />
              </div>
            </Card>

            <Card className="p-5" data-testid="card-deals">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold">Deals</h2>
                <Badge variant="outline" className="text-xs">{deals?.length ?? 0}</Badge>
              </div>

              {dealsLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : deals && deals.length > 0 ? (
                <div className="space-y-3">
                  {deals.map((deal) => (
                    <div
                      key={deal.id}
                      className="flex flex-col gap-1.5 p-3 rounded-md border bg-muted/30"
                      data-testid={`card-deal-${deal.id}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium truncate" data-testid={`text-deal-name-${deal.id}`}>{deal.dealName}</span>
                        <Badge variant={statusVariant[deal.status] || "secondary"} className="text-[10px] shrink-0" data-testid={`status-deal-${deal.id}`}>
                          {deal.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {deal.sponsorshipTier && (
                          <span className="flex items-center gap-1">
                            <Badge variant="secondary" className="text-[10px] px-1.5">{deal.sponsorshipTier}</Badge>
                          </span>
                        )}
                        {deal.annualValue && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {formatCurrency(deal.annualValue)}
                          </span>
                        )}
                        {deal.decisionDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(deal.decisionDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No deals yet</p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
