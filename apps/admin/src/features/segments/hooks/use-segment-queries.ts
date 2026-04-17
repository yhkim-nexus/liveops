import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Audience,
  ApiResponse,
  CreateAudienceRequest,
  UpdateAudienceRequest,
  PropertyDefinition,
  EventDefinition,
} from "../types/segment";
import type { UsageReference, SampleMember } from "../lib/mock-segments";

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

// ── Audiences ─────────────────────────────────────────────────────────

export function useAudiences(filters?: Record<string, string>) {
  const params = new URLSearchParams();
  if (filters) {
    for (const [k, v] of Object.entries(filters)) {
      if (v) params.set(k, v);
    }
  }
  const qs = params.toString();
  return useQuery({
    queryKey: ["segments", qs],
    queryFn: () =>
      fetchJson<Audience[]>(`/api/segments${qs ? `?${qs}` : ""}`),
  });
}

export function useAudience(id: string) {
  return useQuery({
    queryKey: ["segments", id],
    queryFn: () => fetchJson<Audience>(`/api/segments/${id}`),
    enabled: !!id,
  });
}

export function useCreateAudience() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAudienceRequest) =>
      mutateJson<Audience>("/api/segments", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["segments"] });
    },
  });
}

export function useUpdateAudience() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAudienceRequest }) =>
      mutateJson<Audience>(`/api/segments/${id}`, "PUT", data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["segments"] });
      queryClient.invalidateQueries({
        queryKey: ["segments", variables.id],
      });
    },
  });
}

export function useDeleteAudience() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      mutateJson<{ deleted: boolean }>(`/api/segments/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["segments"] });
    },
  });
}

export function useDuplicateAudience() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      mutateJson<Audience>(`/api/segments/${id}/duplicate`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["segments"] });
    },
  });
}

export function useRefreshAudience() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      mutateJson<Audience>(`/api/segments/${id}/refresh`, "POST"),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["segments"] });
      queryClient.invalidateQueries({ queryKey: ["segments", id] });
    },
  });
}

// ── Audience Usages & Members ─────────────────────────────────────────

export function useAudienceUsages(id: string) {
  return useQuery({
    queryKey: ["segments", id, "usages"],
    queryFn: () =>
      fetchJson<UsageReference[]>(`/api/segments/${id}/usages`),
    enabled: !!id,
  });
}

export function useAudienceSampleMembers(id: string) {
  return useQuery({
    queryKey: ["segments", id, "members"],
    queryFn: () =>
      fetchJson<SampleMember[]>(`/api/segments/${id}/members`),
    enabled: !!id,
  });
}

// ── Properties ────────────────────────────────────────────────────────

export function useProperties(category?: string) {
  const qs = category ? `?category=${category}` : "";
  return useQuery({
    queryKey: ["properties", category ?? "all"],
    queryFn: () =>
      fetchJson<PropertyDefinition[]>(`/api/segments/properties${qs}`),
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<PropertyDefinition, "category">) =>
      mutateJson<PropertyDefinition>(
        "/api/segments/properties",
        "POST",
        data,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (key: string) =>
      mutateJson<{ deleted: boolean }>(
        `/api/segments/properties/${key}`,
        "DELETE",
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
}

// ── Event Taxonomy ────────────────────────────────────────────────────

export function useEventTaxonomy() {
  return useQuery({
    queryKey: ["eventTaxonomy"],
    queryFn: () =>
      fetchJson<EventDefinition[]>("/api/segments/taxonomy"),
  });
}

export function useCreateEventDefinition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      data: Omit<EventDefinition, "createdAt" | "category">,
    ) =>
      mutateJson<EventDefinition>("/api/segments/taxonomy", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventTaxonomy"] });
    },
  });
}
