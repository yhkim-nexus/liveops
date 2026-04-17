import type { Period } from "../types/dashboard";

export const CHART_COLORS = {
  primary: "#3B82F6",
  secondary: "#9CA3AF",
  accent: "#F97316",
  success: "#22C55E",
} as const;

export const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
];

export const DEFAULT_PERIOD: Period = "30d";

export const RETENTION_DAYS = [0, 1, 3, 7, 14, 30] as const;
