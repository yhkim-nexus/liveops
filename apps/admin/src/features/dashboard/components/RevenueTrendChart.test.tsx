import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RevenueTrendChart } from "./RevenueTrendChart";
import type { RevenueTrendPoint } from "../types/dashboard";

vi.mock("recharts", async () => {
  const actual = await vi.importActual<typeof import("recharts")>("recharts");
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 400, height: 350 }}>{children}</div>
    ),
  };
});

const mockData: RevenueTrendPoint[] = [
  { date: "2026-03-24", revenue: 23000, payments: 580, payers: 490, arpu: 1.92, arppu: 46.94, conversionRate: 4.1 },
  { date: "2026-03-25", revenue: 25000, payments: 620, payers: 510, arpu: 2.08, arppu: 49.02, conversionRate: 4.3 },
  { date: "2026-03-26", revenue: 24500, payments: 600, payers: 500, arpu: 2.04, arppu: 49.00, conversionRate: 4.2 },
];

describe("RevenueTrendChart", () => {
  it("renders the chart title", () => {
    render(<RevenueTrendChart data={mockData} />);
    expect(screen.getByText("수익 트렌드")).toBeInTheDocument();
  });

  it("displays conversion rate", () => {
    render(<RevenueTrendChart data={mockData} />);
    expect(screen.getByText(/전환율/)).toBeInTheDocument();
  });
});
