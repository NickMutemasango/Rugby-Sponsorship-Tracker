import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertPartner } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function usePartners(params?: { search?: string; sector?: string }) {
  const queryString = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
  return useQuery({
    queryKey: [api.partners.list.path, params],
    queryFn: async () => {
      const res = await fetch(api.partners.list.path + queryString, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch partners");
      return api.partners.list.responses[200].parse(await res.json());
    },
  });
}

export function usePartner(id: number) {
  return useQuery({
    queryKey: [api.partners.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.partners.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch partner");
      return api.partners.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreatePartner() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertPartner) => {
      const res = await fetch(api.partners.create.path, {
        method: api.partners.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
           const error = api.partners.create.responses[400].parse(await res.json());
           throw new Error(error.message);
        }
        throw new Error("Failed to create partner");
      }
      return api.partners.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.partners.list.path] });
      toast({ title: "Success", description: "Partner created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}

export function useUpdatePartner() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertPartner>) => {
      const url = buildUrl(api.partners.update.path, { id });
      const res = await fetch(url, {
        method: api.partners.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update partner");
      return api.partners.update.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.partners.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.partners.get.path, variables.id] });
      toast({ title: "Success", description: "Partner updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}
