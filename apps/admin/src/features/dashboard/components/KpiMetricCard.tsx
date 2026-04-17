import { Card, CardContent } from "@/components/ui/card";
import type { KpiMetric } from "../types/dashboard";
import { formatCompactNumber, formatCurrency, formatPercent } from "../lib/format";

interface KpiMetricCardProps {
  title: string;
  metric: KpiMetric;
}

function formatValue(value: number, unit: KpiMetric["unit"]): string {
  switch (unit) {
    case "currency":
      return formatCurrency(value);
    case "percent":
      return formatPercent(value);
    case "count":
    default:
      return formatCompactNumber(value);
  }
}

function ChangeIndicator({ rate, unit }: { rate: number; unit: KpiMetric["unit"] }) {
  const suffix = unit === "percent" ? "pp" : "%";

  if (rate === 0) {
    return <span className="text-sm text-gray-500">— 0{suffix}</span>;
  }

  const isPositive = rate > 0;
  const colorClass = isPositive ? "text-green-600" : "text-red-600";
  const arrow = isPositive ? "▲" : "▼";
  const sign = isPositive ? "+" : "";

  return (
    <span className={`text-sm font-medium ${colorClass}`}>
      {arrow} {sign}{rate.toFixed(1)}{suffix}
    </span>
  );
}

export function KpiMetricCard({ title, metric }: KpiMetricCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight">
            {formatValue(metric.value, metric.unit)}
          </span>
          {metric.subLabel && (
            <span className="text-sm text-muted-foreground">{metric.subLabel}</span>
          )}
        </div>
        <div className="mt-1">
          <ChangeIndicator rate={metric.changeRate} unit={metric.unit} />
        </div>
      </CardContent>
    </Card>
  );
}
