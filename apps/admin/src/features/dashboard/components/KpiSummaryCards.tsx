import type { DashboardSummary } from "../types/dashboard";
import { KpiMetricCard } from "./KpiMetricCard";

interface KpiSummaryCardsProps {
  data: DashboardSummary;
}

const ROW1 = [
  { key: "nru" as const, title: "NRU" },
  { key: "dau" as const, title: "DAU" },
  { key: "mcu" as const, title: "MCU" },
  { key: "pu" as const, title: "PU" },
];

const ROW2 = [
  { key: "pur" as const, title: "PUR" },
  { key: "revenue" as const, title: "Revenue" },
  { key: "arppu" as const, title: "ARPPU" },
];

export function KpiSummaryCards({ data }: KpiSummaryCardsProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-3">
        {ROW1.map(({ key, title }) => (
          <KpiMetricCard key={key} title={title} metric={data[key]} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {ROW2.map(({ key, title }) => (
          <KpiMetricCard key={key} title={title} metric={data[key]} />
        ))}
      </div>
    </div>
  );
}
