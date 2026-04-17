import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  RemoteConfigEntry,
  RemoteConfigChangeLog,
  ApiResponse,
  CreateRemoteConfigRequest,
  UpdateRemoteConfigRequest,
  ConfigTransitionAction,
} from "../types/remote-config";

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

export function useRemoteConfigs(params?: {
  search?: string;
  target?: string;
  valueType?: string;
  tag?: string;
  sort?: string;
  status?: string;
  page?: number;
  size?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set("search", params.search);
  if (params?.target) searchParams.set("target", params.target);
  if (params?.valueType) searchParams.set("valueType", params.valueType);
  if (params?.tag) searchParams.set("tag", params.tag);
  if (params?.sort) searchParams.set("sort", params.sort);
  if (params?.status) searchParams.set("status", params.status);
  if (params?.page != null) searchParams.set("page", String(params.page));
  if (params?.size != null) searchParams.set("size", String(params.size));
  const qs = searchParams.toString();
  const url = qs ? `/api/remote-config?${qs}` : "/api/remote-config";

  return useQuery({
    queryKey: ["remote-configs", params],
    queryFn: () => fetchJson<RemoteConfigEntry[]>(url),
  });
}

export function useRemoteConfig(id: string) {
  return useQuery({
    queryKey: ["remote-configs", id],
    queryFn: () =>
      fetchJson<{ config: RemoteConfigEntry; changeLog: RemoteConfigChangeLog[] }>(
        `/api/remote-config/${id}`,
      ),
    enabled: !!id,
  });
}

export function useCreateRemoteConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRemoteConfigRequest) =>
      mutateJson<RemoteConfigEntry>("/api/remote-config", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["remote-configs"] });
    },
  });
}

export function useUpdateRemoteConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateRemoteConfigRequest;
    }) =>
      mutateJson<RemoteConfigEntry>(`/api/remote-config/${id}`, "PUT", data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["remote-configs"] });
      queryClient.invalidateQueries({
        queryKey: ["remote-configs", variables.id],
      });
    },
  });
}

export function useDeleteRemoteConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      mutateJson<{ deleted: boolean }>(`/api/remote-config/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["remote-configs"] });
    },
  });
}

export function useTransitionRemoteConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      action,
      reason,
    }: {
      id: string;
      action: ConfigTransitionAction;
      reason?: string;
    }) =>
      mutateJson<RemoteConfigEntry>(
        `/api/remote-config/${id}/transition`,
        "POST",
        { action, reason },
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["remote-configs"] });
      queryClient.invalidateQueries({
        queryKey: ["remote-configs", variables.id],
      });
    },
  });
}
