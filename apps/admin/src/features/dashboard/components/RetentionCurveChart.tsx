"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CHART_COLORS } from "../constants/chart-config";
import type { RetentionResponse, RetentionPoint } from "../types/dashboard";

interface RetentionCurveChartProps {
  data: RetentionResponse;
}

function mergeRetentionData(current: RetentionPoint[], previous: RetentionPoint[]) {
  const previousMap = new Map(previous.map((p) => [p.day, p]));
  return current.map((point) => ({
    day: `D${point.day}`,
    current: point.rate,
    previous: previousMap.get(point.day)?.rate ?? null,
    currentCount: point.count,
    previousCount: previousMap.get(point.day)?.count ?? null,
  }));
}

function findRate(points: RetentionPoint[], day: number): string {
  return points.find((p) => p.day === day)?.rate.toFixed(1) ?? "—";
}

export function RetentionCurveChart({ data }: RetentionCurveChartProps) {
  const chartData = mergeRetentionData(data.currentCohort.points, data.previousCohort.points);

  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold">리텐션 커브</h3>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="day" tick={{ fontSize: 13 }} />
          <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 13 }} />
          <Tooltip
            formatter={(value, name) => {
              const v = Number(value);
              const label = name === "current" ? "최신 코호트" : "이전 코호트";
              return [`${v.toFixed(1)}%`, label];
            }}
          />
          <Legend
            formatter={(value: string) =>
              value === "current" ? "최신 코호트" : "이전 코호트"
            }
          />
          <Line type="monotone" dataKey="current" stroke={CHART_COLORS.primary} strokeWidth={2.5} dot={{ r: 5 }} />
          <Line type="monotone" dataKey="previous" stroke={CHART_COLORS.secondary} strokeDasharray="5 5" strokeWidth={2.5} dot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-2 flex gap-6 text-sm text-muted-foreground">
        <span>D1: <strong>{findRate(data.currentCohort.points, 1)}%</strong></span>
        <span>D7: <strong>{findRate(data.currentCohort.points, 7)}%</strong></span>
        <span>D30: <strong>{findRate(data.currentCohort.points, 30)}%</strong></span>
      </div>
    </div>
  );
}
