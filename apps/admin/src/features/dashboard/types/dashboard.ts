export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: {
    generatedAt: string;
    period?: string;
  };
}

export interface DashboardSummary {
  nru: KpiMetric;
  dau: KpiMetric;
  mcu: KpiMetric;
  pu: KpiMetric;
  pur: KpiMetric;
  revenue: KpiMetric;
  arppu: KpiMetric;
}

export interface KpiMetric {
  value: number;
  unit: "count" | "percent" | "currency";
  changeRate: number;
  comparisonValue: number;
  subLabel?: string; // e.g., MCU의 "/DAU 31.3%"
}

export type ActivityTrendResponse = ActivityTrendPoint[];

export interface ActivityTrendPoint {
  date: string;
  nru: number;
  dau: number;
  sessions: number;
  avgSessionMinutes: number;
}

export interface RetentionResponse {
  currentCohort: RetentionData;
  previousCohort: RetentionData;
}

export interface RetentionData {
  cohortDate: string;
  cohortSize: number;
  points: RetentionPoint[];
}

export interface RetentionPoint {
  day: number;
  rate: number;
  count: number;
}

export type RevenueTrendResponse = RevenueTrendPoint[];

export interface RevenueTrendPoint {
  date: string;
  revenue: number;
  payments: number;
  payers: number;
  arpu: number;
  arppu: number;
  conversionRate: number;
}

export interface KpiTrendPoint {
  date: string;
  nru: number;
  dau: number;
  mcu: number;
  pu: number;
  pur: number;      // percentage
  revenue: number;
  arppu: number;
}

export type KpiTrendResponse = KpiTrendPoint[];

export type Period = "7d" | "30d" | "90d";
