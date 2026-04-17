export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return String(value);
}

export function formatCurrency(value: number): string {
  return `$${formatCompactNumber(value)}`;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatChangeRate(rate: number, unit: "percent" | "pp"): string {
  const suffix = unit === "pp" ? "pp" : "%";
  if (rate > 0) return `▲ +${rate.toFixed(1)}${suffix}`;
  if (rate < 0) return `▼ ${rate.toFixed(1)}${suffix}`;
  return `— 0${suffix}`;
}
