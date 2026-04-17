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
import type { ActivityTrendPoint } from "../types/dashboard";
import { formatCompactNumber } from "../lib/format";

interface ActivityTrendChartProps {
  data: ActivityTrendPoint[];
}

export function ActivityTrendChart({ data }: ActivityTrendChartProps) {
  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold">회원 활동 트렌드</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
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
            unit="분"
          />
          <Tooltip
            labelFormatter={(label) => `날짜: ${label}`}
            formatter={(value, name) => {
              const v = Number(value);
              if (name === "avgSessionMinutes")
                return [`${v.toFixed(1)}분`, "평균 세션 시간"];
              if (name === "sessions")
                return [formatCompactNumber(v), "세션 수"];
              if (name === "nru")
                return [formatCompactNumber(v), "NRU"];
              return [formatCompactNumber(v), "DAU"];
            }}
          />
          <Legend
            formatter={(value: string) => {
              const labels: Record<string, string> = {
                nru: "NRU (신규 가입)",
                dau: "DAU",
                sessions: "세션 수",
                avgSessionMinutes: "평균 세션 시간(분)",
              };
              return labels[value] ?? value;
            }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="nru"
            stroke={CHART_COLORS.success}
            strokeWidth={2.5}
            dot={{ r: 0 }}
            activeDot={{ r: 5 }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="dau"
            stroke={CHART_COLORS.primary}
            strokeWidth={2.5}
            dot={{ r: 0 }}
            activeDot={{ r: 5 }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="sessions"
            stroke={CHART_COLORS.secondary}
            strokeDasharray="5 5"
            dot={{ r: 0 }}
            activeDot={{ r: 5 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="avgSessionMinutes"
            stroke={CHART_COLORS.accent}
            strokeDasharray="3 3"
            dot={{ r: 0 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
