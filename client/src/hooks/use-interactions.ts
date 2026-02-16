import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertInteraction } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useInteractions(params?: { dealId?: number; staffId?: number }) {
  const queryParams = new URLSearchParams();
  if (params?.dealId) queryParams.append("dealId", params.dealId.toString());
  if (params?.staffId) queryParams.append("staffId", params.staffId.toString());
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

  return useQuery({
    queryKey: [api.interactions.list.path, params],
    queryFn: async () => {
      const res = await fetch(api.interactions.list.path + queryString, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch interactions");
      return api.interactions.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateInteraction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertInteraction) => {
      const res = await fetch(api.interactions.create.path, {
        method: api.interactions.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to create interaction");
      return api.interactions.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.interactions.list.path] });
      toast({ title: "Success", description: "Interaction logged" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}
