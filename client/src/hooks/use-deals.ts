import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertDeal } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useDeals(params?: { status?: string; tier?: string; partnerId?: number }) {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append("status", params.status);
  if (params?.tier) queryParams.append("tier", params.tier);
  if (params?.partnerId) queryParams.append("partnerId", params.partnerId.toString());

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

  return useQuery({
    queryKey: [api.deals.list.path, params],
    queryFn: async () => {
      const res = await fetch(api.deals.list.path + queryString, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch deals");
      return api.deals.list.responses[200].parse(await res.json());
    },
  });
}

export function useDeal(id: number) {
  return useQuery({
    queryKey: [api.deals.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.deals.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch deal");
      return api.deals.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertDeal) => {
      const res = await fetch(api.deals.create.path, {
        method: api.deals.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to create deal");
      return api.deals.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.deals.list.path] });
      toast({ title: "Success", description: "Deal created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}

export function useUpdateDeal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertDeal>) => {
      const url = buildUrl(api.deals.update.path, { id });
      const res = await fetch(url, {
        method: api.deals.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update deal");
      return api.deals.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.deals.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.deals.get.path, variables.id] });
      toast({ title: "Success", description: "Deal updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}
