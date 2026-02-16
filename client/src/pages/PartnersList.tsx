import { AppLayout } from "@/components/layout/AppLayout";
import { usePartners } from "@/hooks/use-partners";
import { Link } from "wouter";
import { Plus, Search, Building2, Globe, MapPin, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function PartnersList() {
  const [search, setSearch] = useState("");
  const { data: partners, isLoading } = usePartners({ search });

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Partners</h1>
          <p className="text-muted-foreground mt-1">Manage partner organizations and their details.</p>
        </div>
        <Link href="/partners/new">
          <Button className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
            <Plus className="w-4 h-4" />
            Add Partner
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search partners..." 
            className="pl-9 bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)
        ) : (
          partners?.map((partner) => (
            <Link key={partner.id} href={`/partners/${partner.id}`}>
              <div className="group bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer h-full flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-muted rounded-xl group-hover:bg-primary/5 transition-colors">
                    <Building2 className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold max-w-[120px] truncate">
                    {partner.organizationTypes[0]}
                  </div>
                </div>

                <h3 className="text-lg font-bold font-display text-foreground mb-1 group-hover:text-primary transition-colors">
                  {partner.organizationName}
                </h3>
                
                <div className="space-y-2 mt-4 text-sm text-muted-foreground flex-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground/70" />
                    {partner.countryOfRegistration}
                  </div>
                  {partner.website && (
                    <div className="flex items-center gap-2 truncate">
                      <Globe className="w-4 h-4 text-muted-foreground/70" />
                      <span className="truncate">{partner.website.replace(/^https?:\/\//, '')}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground/70" />
                    <span className="truncate">{partner.primaryContactEmail}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>Contact: {partner.primaryContactName.split(' ')[0]}</span>
                  <span className="group-hover:translate-x-1 transition-transform">View Details →</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </AppLayout>
  );
}
