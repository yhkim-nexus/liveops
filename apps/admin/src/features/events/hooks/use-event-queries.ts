import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  LiveEvent,
  ApiResponse,
  CreateEventRequest,
  UpdateEventRequest,
  EventStateLogEntry,
  TransitionAction,
} from "../types/event";

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

export function useEvents(filters?: Record<string, string>) {
  const params = new URLSearchParams();
  if (filters) {
    for (const [k, v] of Object.entries(filters)) {
      if (v) params.set(k, v);
    }
  }
  const qs = params.toString();
  return useQuery({
    queryKey: ["events", qs],
    queryFn: () => fetchJson<LiveEvent[]>(`/api/events${qs ? `?${qs}` : ""}`),
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ["events", id],
    queryFn: () => fetchJson<LiveEvent>(`/api/events/${id}`),
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventRequest) =>
      mutateJson<LiveEvent>("/api/events", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventRequest }) =>
      mutateJson<LiveEvent>(`/api/events/${id}`, "PUT", data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({
        queryKey: ["events", variables.id],
      });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      mutateJson<{ deleted: boolean }>(`/api/events/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useDuplicateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      mutateJson<LiveEvent>(`/api/events/${id}/duplicate`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useTransitionEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      action,
      reason,
      newEndAt,
    }: {
      id: string;
      action: TransitionAction;
      reason?: string;
      newEndAt?: string;
    }) =>
      mutateJson<{ event: LiveEvent; log: EventStateLogEntry }>(
        `/api/events/${id}/transition`,
        "POST",
        { action, reason, newEndAt },
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({
        queryKey: ["events", variables.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["eventStateLog", variables.id],
      });
    },
  });
}

export function useEventStateLog(eventId: string) {
  return useQuery({
    queryKey: ["eventStateLog", eventId],
    queryFn: () =>
      fetchJson<EventStateLogEntry[]>(`/api/events/${eventId}/transition`),
    enabled: !!eventId,
  });
}
