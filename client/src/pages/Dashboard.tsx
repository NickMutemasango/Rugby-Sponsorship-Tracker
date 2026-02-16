import { AppLayout } from "@/components/layout/AppLayout";
import { useReportsMetrics, useReportsTiers, useReportsFunding, useReportsSectors } from "@/hooks/use-reports";
import { StatCard } from "@/components/ui/StatCard";
import { TierCard } from "@/components/ui/TierCard";
import { DollarSign, FileText, CheckCircle2, TrendingUp, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const COLORS = ['#16a34a', '#eab308', '#2563eb', '#9333ea', '#db2777', '#dc2626'];

export default function Dashboard() {
  const { data: metrics, isLoading: loadingMetrics } = useReportsMetrics();
  const { data: tiers, isLoading: loadingTiers } = useReportsTiers();
  const { data: funding, isLoading: loadingFunding } = useReportsFunding();
  const { data: sectors, isLoading: loadingSectors } = useReportsSectors();

  // Sort sectors by potential value for better viz
  const sortedSectors = sectors?.sort((a, b) => b.potentialValue - a.potentialValue).slice(0, 6) || [];

  return (
    <AppLayout>
      <div className="space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Overview of sponsorship pipeline and tier status.</p>
          </div>
          <div className="flex gap-2">
            <div className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-semibold">
              FY 2024-2025
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loadingMetrics ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)
          ) : (
            <>
              <StatCard 
                title="Total Prospect Value" 
                value={`$${(metrics?.totalProspectValue || 0).toLocaleString()}`} 
                icon={TrendingUp}
                description="Across all open opportunities"
                trend={{ value: 12, label: "vs last month", positive: true }}
              />
              <StatCard 
                title="Committed Value" 
                value={`$${(metrics?.committedValue || 0).toLocaleString()}`} 
                icon={DollarSign}
                description="Signed and secured deals"
                className="bg-primary/5 border-primary/20"
              />
              <StatCard 
                title="Open Proposals" 
                value={metrics?.openProposals || 0} 
                icon={FileText}
                description="Awaiting response"
              />
              <StatCard 
                title="Pending Decisions" 
                value={metrics?.pendingDecisions || 0} 
                icon={AlertTriangle}
                description="Due within 30 days"
                className="border-amber-200 bg-amber-50/50"
              />
            </>
          )}
        </div>

        {/* Tier Status */}
        <div>
          <h2 className="text-xl font-bold font-display mb-4 flex items-center gap-2">
            Sponsorship Tiers
            <div className="h-px flex-1 bg-border ml-2"></div>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {loadingTiers ? (
              Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)
            ) : (
              tiers?.map((tier) => (
                <TierCard 
                  key={tier.tier}
                  name={tier.tier}
                  value={tier.value}
                  count={tier.count}
                  capacity={tier.capacity}
                  status={tier.status as any}
                />
              ))
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sector Chart */}
          <div className="lg:col-span-1 bg-card rounded-2xl p-6 border border-border shadow-sm">
            <h3 className="text-lg font-bold font-display mb-6">Pipeline by Sector</h3>
            <div className="h-[300px] w-full">
              {loadingSectors ? (
                <Skeleton className="h-full w-full rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sortedSectors}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="potentialValue"
                    >
                      {sortedSectors.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-4 space-y-2">
              {sortedSectors.slice(0, 4).map((sector, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-muted-foreground truncate max-w-[150px]">{sector.sector}</span>
                  </div>
                  <span className="font-semibold">${sector.potentialValue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Funding Progress Chart */}
          <div className="lg:col-span-2 bg-card rounded-2xl p-6 border border-border shadow-sm">
            <h3 className="text-lg font-bold font-display mb-6">Programme Funding Progress</h3>
            <div className="h-[350px] w-full">
              {loadingFunding ? (
                <Skeleton className="h-full w-full rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={funding}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                    <XAxis type="number" hide />
                    <YAxis 
                      type="category" 
                      dataKey="category" 
                      width={150} 
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      interval={0}
                    />
                    <RechartsTooltip 
                      cursor={{ fill: '#F1F5F9' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name === 'raised' ? 'Raised' : 'Target']}
                    />
                    <Bar dataKey="raised" name="Raised" fill="#16a34a" radius={[0, 4, 4, 0]} barSize={20} />
                    <Bar dataKey="target" name="Target" fill="#e2e8f0" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
