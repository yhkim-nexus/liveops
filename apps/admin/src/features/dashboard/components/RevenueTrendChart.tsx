"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CHART_COLORS } from "../constants/chart-config";
import type { RevenueTrendPoint } from "../types/dashboard";
import { formatCurrency, formatCompactNumber } from "../lib/format";

interface RevenueTrendChartProps {
  data: RevenueTrendPoint[];
}

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  const latestConversion = data.length > 0 ? data[data.length - 1].conversionRate : 0;

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="text-lg font-semibold">수익 트렌드</h3>
        <span className="text-sm text-muted-foreground">
          결제 전환율: <strong>{latestConversion.toFixed(2)}%</strong>
        </span>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 13 }} tickFormatter={(v: string) => v.slice(5)} />
          <YAxis yAxisId="left" tick={{ fontSize: 13 }} tickFormatter={(v: number) => formatCompactNumber(v)} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 13 }} unit="$" />
          <Tooltip
            labelFormatter={(label) => `날짜: ${label}`}
            formatter={(value, name) => {
              const v = Number(value);
              const labels: Record<string, string> = {
                revenue: "일 매출",
                arpu: "ARPU",
                arppu: "ARPPU",
              };
              const n = String(name);
              if (n === "revenue") return [formatCurrency(v), labels[n]];
              return [`$${v.toFixed(2)}`, labels[n] ?? n];
            }}
          />
          <Legend
            formatter={(value: string) => {
              const labels: Record<string, string> = { revenue: "일 매출", arpu: "ARPU", arppu: "ARPPU" };
              return labels[value] ?? value;
            }}
          />
          <Bar yAxisId="left" dataKey="revenue" fill={CHART_COLORS.primary} opacity={0.35} radius={[4, 4, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="arpu" stroke={CHART_COLORS.accent} strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 5 }} />
          <Line yAxisId="right" type="monotone" dataKey="arppu" stroke={CHART_COLORS.success} strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 5 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
