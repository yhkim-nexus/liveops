import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  PushCampaign,
  CreateCampaignRequest,
  UpdateCampaignRequest,
  PushSettings,
  ApiResponse,
} from "../types/push";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const json: ApiResponse<T> = await res.json();
  return json.data;
}

async function mutateJson<T>(
  url: string,
  method: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const json: ApiResponse<T> = await res.json();
  return json.data;
}

export function useCampaigns(filters?: Record<string, string>) {
  const params = new URLSearchParams();
  if (filters) {
    for (const [k, v] of Object.entries(filters)) {
      if (v) params.set(k, v);
    }
  }
  const qs = params.toString();
  return useQuery({
    queryKey: ["push-campaigns", qs],
    queryFn: () =>
      fetchJson<PushCampaign[]>(`/api/push/campaigns${qs ? `?${qs}` : ""}`),
  });
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: ["push-campaigns", id],
    queryFn: () => fetchJson<PushCampaign>(`/api/push/campaigns/${id}`),
    enabled: !!id,
  });
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCampaignRequest) =>
      mutateJson<PushCampaign>("/api/push/campaigns", "POST", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["push-campaigns"] });
    },
  });
}

export function useUpdateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCampaignRequest }) =>
      mutateJson<PushCampaign>(`/api/push/campaigns/${id}`, "PATCH", data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["push-campaigns"] });
      qc.invalidateQueries({ queryKey: ["push-campaigns", variables.id] });
    },
  });
}

export function useDeleteCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      mutateJson<{ deleted: boolean }>(`/api/push/campaigns/${id}`, "DELETE"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["push-campaigns"] });
    },
  });
}

export function useDuplicateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      mutateJson<PushCampaign>(`/api/push/campaigns/${id}/duplicate`, "POST"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["push-campaigns"] });
    },
  });
}

export function useSubmitCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      mutateJson<PushCampaign>(`/api/push/campaigns/${id}/submit`, "POST"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["push-campaigns"] });
    },
  });
}

export function useApproveCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      mutateJson<PushCampaign>(`/api/push/campaigns/${id}/approve`, "POST"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["push-campaigns"] });
    },
  });
}

export function useRejectCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      mutateJson<PushCampaign>(`/api/push/campaigns/${id}/reject`, "POST", {
        reason,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["push-campaigns"] });
    },
  });
}

export function useCancelCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      mutateJson<PushCampaign>(`/api/push/campaigns/${id}/cancel`, "POST"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["push-campaigns"] });
    },
  });
}

export function useEstimateReach() {
  return useMutation({
    mutationFn: (data: {
      audienceType: string;
      audienceIds?: string[];
      platformFilter: string;
    }) =>
      mutateJson<{ estimatedReach: number }>(
        "/api/push/campaigns/estimate-reach",
        "POST",
        data,
      ),
  });
}

export function usePushSettings() {
  return useQuery({
    queryKey: ["push-settings"],
    queryFn: () => fetchJson<PushSettings>("/api/push/settings"),
  });
}

export function useUpdatePushSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<PushSettings>) =>
      mutateJson<PushSettings>("/api/push/settings", "PATCH", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["push-settings"] });
    },
  });
}
