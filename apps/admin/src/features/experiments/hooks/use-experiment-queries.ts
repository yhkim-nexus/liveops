import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Experiment,
  ExperimentStateLog,
  ApiResponse,
  CreateExperimentRequest,
  UpdateExperimentRequest,
  TransitionAction,
} from "../types/experiment";

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

export function useExperiments(params?: {
  status?: string;
  search?: string;
  sort?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set("status", params.status);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.sort) searchParams.set("sort", params.sort);
  const qs = searchParams.toString();
  const url = qs ? `/api/experiments?${qs}` : "/api/experiments";

  return useQuery({
    queryKey: ["experiments", params],
    queryFn: () => fetchJson<Experiment[]>(url),
  });
}

export function useExperiment(id: string) {
  return useQuery({
    queryKey: ["experiments", id],
    queryFn: () => fetchJson<Experiment>(`/api/experiments/${id}`),
    enabled: !!id,
  });
}

export function useCreateExperiment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExperimentRequest) =>
      mutateJson<Experiment>("/api/experiments", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experiments"] });
    },
  });
}

export function useUpdateExperiment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateExperimentRequest;
    }) => mutateJson<Experiment>(`/api/experiments/${id}`, "PUT", data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["experiments"] });
      queryClient.invalidateQueries({
        queryKey: ["experiments", variables.id],
      });
    },
  });
}

export function useDeleteExperiment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      mutateJson<{ deleted: boolean }>(`/api/experiments/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experiments"] });
    },
  });
}

export function useDuplicateExperiment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      mutateJson<Experiment>(`/api/experiments/${id}/duplicate`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["experiments"] });
    },
  });
}

export function useTransitionExperiment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      action,
      reason,
    }: {
      id: string;
      action: TransitionAction;
      reason?: string;
    }) =>
      mutateJson<Experiment>(`/api/experiments/${id}/transition`, "POST", {
        action,
        reason,
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["experiments"] });
      queryClient.invalidateQueries({
        queryKey: ["experiments", variables.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["experiment-state-log", variables.id],
      });
    },
  });
}

export function useExperimentStateLog(id: string) {
  return useQuery({
    queryKey: ["experiment-state-log", id],
    queryFn: () =>
      fetchJson<ExperimentStateLog[]>(`/api/experiments/${id}/transition`),
    enabled: !!id,
  });
}
