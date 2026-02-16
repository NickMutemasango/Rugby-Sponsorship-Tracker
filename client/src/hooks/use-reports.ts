import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useReportsTiers() {
  return useQuery({
    queryKey: [api.reports.tiers.path],
    queryFn: async () => {
      const res = await fetch(api.reports.tiers.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch tier report");
      return api.reports.tiers.responses[200].parse(await res.json());
    },
  });
}

export function useReportsSectors() {
  return useQuery({
    queryKey: [api.reports.sectors.path],
    queryFn: async () => {
      const res = await fetch(api.reports.sectors.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch sector report");
      return api.reports.sectors.responses[200].parse(await res.json());
    },
  });
}

export function useReportsFunding() {
  return useQuery({
    queryKey: [api.reports.funding.path],
    queryFn: async () => {
      const res = await fetch(api.reports.funding.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch funding report");
      return api.reports.funding.responses[200].parse(await res.json());
    },
  });
}

export function useReportsMetrics() {
  return useQuery({
    queryKey: [api.reports.metrics.path],
    queryFn: async () => {
      const res = await fetch(api.reports.metrics.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch metrics report");
      return api.reports.metrics.responses[200].parse(await res.json());
    },
  });
}
