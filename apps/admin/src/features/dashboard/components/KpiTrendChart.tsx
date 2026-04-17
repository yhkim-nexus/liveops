"use client";

import {
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { KpiTrendPoint } from "../types/dashboard";
import { formatCompactNumber, formatCurrency } from "../lib/format";

interface KpiTrendChartProps {
  data: KpiTrendPoint[];
}

export function KpiTrendChart({ data }: KpiTrendChartProps) {
  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold">종합 KPI 트렌드</h3>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 13 }}
            tickFormatter={(v: string) => v.slice(5)}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 13 }}
            tickFormatter={formatCompactNumber}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 13 }}
            tickFormatter={(v: number) => `$${formatCompactNumber(v)}`}
          />
          <Tooltip
            labelFormatter={(label) => `날짜: ${label}`}
            formatter={(value, name) => {
              const v = Number(value);
              const labels: Record<string, string> = {
                dau: "DAU",
                nru: "NRU",
                mcu: "MCU",
                pu: "PU",
                pur: "PUR",
                revenue: "Revenue",
                arppu: "ARPPU",
              };
              const n = String(name);
              if (n === "revenue") return [formatCurrency(v), labels[n]];
              if (n === "pur") return [`${v.toFixed(2)}%`, labels[n]];
              if (n === "arppu") return [`$${v.toFixed(2)}`, labels[n]];
              return [formatCompactNumber(v), labels[n] ?? n];
            }}
          />
          <Legend
            verticalAlign="top"
            formatter={(value: string) => {
              const labels: Record<string, string> = {
                dau: "DAU",
                nru: "NRU",
                mcu: "MCU",
                pu: "PU",
                revenue: "Revenue",
              };
              return labels[value] ?? value;
            }}
          />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="dau"
            stroke="#3B82F6"
            fill="#3B82F6"
            fillOpacity={0.15}
            strokeWidth={2.5}
            dot={{ r: 0 }}
            activeDot={{ r: 5 }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="nru"
            stroke="#22C55E"
            strokeWidth={2}
            dot={{ r: 0 }}
            activeDot={{ r: 5 }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="mcu"
            stroke="#F97316"
            strokeWidth={2}
            dot={{ r: 0 }}
            activeDot={{ r: 5 }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="pu"
            stroke="#A855F7"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 0 }}
            activeDot={{ r: 5 }}
          />
          <Bar
            yAxisId="right"
            dataKey="revenue"
            fill="#93C5FD"
            opacity={0.6}
            radius={[4, 4, 0, 0]}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
