import { AppLayout } from "@/components/layout/AppLayout";
import { usePartners } from "@/hooks/use-partners";
import { Link } from "wouter";
import { Plus, Search, Building2, MapPin, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PartnersList() {
  const [search, setSearch] = useState("");
  const { data: partners, isLoading } = usePartners({ search });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Partners</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage partner organizations and details
            </p>
          </div>
          <Link href="/partners/new">
            <Button className="gap-2" data-testid="button-add-partner">
              <Plus className="h-4 w-4" />
              Add Partner
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search partners..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="input-search-partners"
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-[180px] rounded-md" />
              ))
            : partners?.map((partner) => (
                <Link key={partner.id} href={`/partners/${partner.id}`}>
                  <Card
                    className="p-5 hover-elevate cursor-pointer h-full flex flex-col"
                    data-testid={`card-partner-${partner.id}`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate" data-testid={`text-partner-name-${partner.id}`}>
                            {partner.organizationName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {partner.partnershipNature}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="shrink-0 text-[10px]">
                        {partner.organizationTypes?.[0] ?? "Other"}
                      </Badge>
                    </div>

                    <div className="space-y-1.5 text-xs text-muted-foreground mt-auto">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{partner.countryOfRegistration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate">{partner.primaryContactEmail}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                      <span>Contact: {partner.primaryContactName}</span>
                      <span>View &rarr;</span>
                    </div>
                  </Card>
                </Link>
              ))}
        </div>

        {!isLoading && partners?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Building2 className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No partners found</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
