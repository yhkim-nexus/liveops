import { useQuery } from "@tanstack/react-query";
import type {
  ApiResponse,
  DashboardSummary,
  ActivityTrendResponse,
  RetentionResponse,
  RevenueTrendResponse,
  KpiTrendResponse,
  Period,
} from "../types/dashboard";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const json: ApiResponse<T> = await res.json();
  return json.data;
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: () => fetchJson<DashboardSummary>("/api/dashboard/summary"),
  });
}

export function useActivityTrend(period: Period) {
  return useQuery({
    queryKey: ["dashboard", "activity-trend", period],
    queryFn: () =>
      fetchJson<ActivityTrendResponse>(
        `/api/dashboard/activity-trend?period=${period}`
      ),
  });
}

export function useRetention() {
  return useQuery({
    queryKey: ["dashboard", "retention"],
    queryFn: () =>
      fetchJson<RetentionResponse>("/api/dashboard/retention"),
  });
}

export function useRevenueTrend(period: Period) {
  return useQuery({
    queryKey: ["dashboard", "revenue-trend", period],
    queryFn: () =>
      fetchJson<RevenueTrendResponse>(
        `/api/dashboard/revenue-trend?period=${period}`
      ),
  });
}

export function useKpiTrend(period: Period) {
  return useQuery({
    queryKey: ["dashboard", "kpi-trend", period],
    queryFn: () => fetchJson<KpiTrendResponse>(`/api/dashboard/kpi-trend?period=${period}`),
  });
}
