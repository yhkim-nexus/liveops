import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Player } from "../types/player";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: { generatedAt: string };
}

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

export function usePlayerSearch(query: string) {
  return useQuery({
    queryKey: ["players", "search", query],
    queryFn: () =>
      fetchJson<Player[]>(`/api/players${query ? `?q=${encodeURIComponent(query)}` : ""}`),
  });
}

export function usePlayer(id: string) {
  return useQuery({
    queryKey: ["players", id],
    queryFn: () => fetchJson<Player>(`/api/players/${id}`),
    enabled: !!id,
  });
}

export function useBanPlayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      mutateJson<Player>(`/api/players/${id}/ban`, "POST", { reason }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["players", variables.id] });
    },
  });
}

export function useUnbanPlayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      mutateJson<Player>(`/api/players/${id}/unban`, "POST"),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["players", id] });
    },
  });
}

export function useSuspendPlayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason, durationDays }: { id: string; reason: string; durationDays: number }) => {
      const res = await fetch(`/api/players/${id}/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, durationDays }),
      });
      if (!res.ok) throw new Error("Suspend failed");
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["players", variables.id] });
    },
  });
}

export function useUnsuspendPlayer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/players/${id}/unsuspend`, { method: "POST" });
      if (!res.ok) throw new Error("Unsuspend failed");
      return res.json();
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["players", id] });
    },
  });
}

export function useChangeNickname() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, nickname }: { id: string; nickname: string }) =>
      mutateJson<Player>(`/api/players/${id}/nickname`, "PATCH", { nickname }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["players", variables.id] });
    },
  });
}
