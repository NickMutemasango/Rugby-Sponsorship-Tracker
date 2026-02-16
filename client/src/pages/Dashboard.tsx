import { AppLayout } from "@/components/layout/AppLayout";
import { useReportsMetrics, useReportsTiers, useReportsFunding, useReportsSectors } from "@/hooks/use-reports";
import { StatCard } from "@/components/ui/StatCard";
import { TierCard } from "@/components/ui/TierCard";
import { Card } from "@/components/ui/card";
import { DollarSign, FileText, AlertTriangle, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

const PIE_COLORS = ["#16a34a", "#eab308", "#2563eb", "#9333ea", "#db2777", "#f97316"];

export default function Dashboard() {
  const { data: metrics, isLoading: loadingMetrics } = useReportsMetrics();
  const { data: tiers, isLoading: loadingTiers } = useReportsTiers();
  const { data: funding, isLoading: loadingFunding } = useReportsFunding();
  const { data: sectors, isLoading: loadingSectors } = useReportsSectors();

  const activeSectors =
    sectors
      ?.filter((s) => s.potentialValue > 0 || s.activeCount > 0 || s.prospectCount > 0)
      .sort((a, b) => b.potentialValue - a.potentialValue)
      .slice(0, 6) ?? [];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* ── Header ── */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of sponsorship pipeline and tier status
          </p>
        </div>

        {/* ── Metric Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loadingMetrics
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[130px] rounded-md" />
              ))
            : (
              <>
                <StatCard
                  title="Total Prospect Value"
                  value={`$${(metrics?.totalProspectValue ?? 0).toLocaleString()}`}
                  icon={TrendingUp}
                  description="Across open opportunities"
                />
                <StatCard
                  title="Committed Value"
                  value={`$${(metrics?.committedValue ?? 0).toLocaleString()}`}
                  icon={DollarSign}
                  description="Signed deals"
                />
                <StatCard
                  title="Open Proposals"
                  value={metrics?.openProposals ?? 0}
                  icon={FileText}
                  description="Awaiting response"
                />
                <StatCard
                  title="Pending Decisions"
                  value={metrics?.pendingDecisions ?? 0}
                  icon={AlertTriangle}
                  description="In negotiation"
                />
              </>
            )}
        </div>

        {/* ── Tier Status ── */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Sponsorship Tiers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {loadingTiers
              ? Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-[140px] rounded-md" />
                ))
              : tiers?.map((tier) => (
                  <TierCard
                    key={tier.tier}
                    name={tier.tier}
                    value={tier.value}
                    count={tier.count}
                    capacity={tier.capacity}
                    status={tier.status as any}
                  />
                ))}
          </div>
        </section>

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Sector Pie */}
          <Card className="lg:col-span-2 p-5">
            <h3 className="text-sm font-semibold mb-4">Pipeline by Sector</h3>

            {loadingSectors ? (
              <Skeleton className="h-[220px] rounded-md" />
            ) : activeSectors.length === 0 ? (
              <p className="text-sm text-muted-foreground py-12 text-center">
                No sector data yet
              </p>
            ) : (
              <>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={activeSectors}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="potentialValue"
                        nameKey="sector"
                      >
                        {activeSectors.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(v: number) => [`$${v.toLocaleString()}`, "Value"]}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid hsl(var(--border))",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-3 space-y-2">
                  {activeSectors.map((s, i) => (
                    <div key={s.sector} className="flex items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                        />
                        <span className="truncate text-muted-foreground">{s.sector}</span>
                      </div>
                      <span className="font-medium tabular-nums shrink-0">
                        ${s.potentialValue.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>

          {/* Funding Progress */}
          <Card className="lg:col-span-3 p-5">
            <h3 className="text-sm font-semibold mb-4">Programme Funding Progress</h3>

            {loadingFunding ? (
              <Skeleton className="h-[300px] rounded-md" />
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={funding}
                    margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="category"
                      width={160}
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                    />
                    <RechartsTooltip
                      cursor={{ fill: "hsl(var(--muted) / .3)" }}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid hsl(var(--border))",
                        fontSize: "12px",
                      }}
                      formatter={(v: number, name: string) => [
                        `$${v.toLocaleString()}`,
                        name === "raised" ? "Raised" : "Target",
                      ]}
                    />
                    <Bar dataKey="target" name="Target" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} barSize={16} />
                    <Bar dataKey="raised" name="Raised" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
