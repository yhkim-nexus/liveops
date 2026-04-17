import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KpiSummaryCards } from "./KpiSummaryCards";
import type { DashboardSummary } from "../types/dashboard";

const mockData: DashboardSummary = {
  dau: { value: 12400, unit: "count", changeRate: 5.2, comparisonValue: 11800 },
  mau: { value: 89000, unit: "count", changeRate: 2.1, comparisonValue: 87200 },
  d1Retention: { value: 42.3, unit: "percent", changeRate: -1.2, comparisonValue: 43.5 },
  dailyRevenue: { value: 24500, unit: "currency", changeRate: 8.3, comparisonValue: 22600 },
};

describe("KpiSummaryCards", () => {
  it("renders all 4 metric cards", () => {
    render(<KpiSummaryCards data={mockData} />);
    expect(screen.getByText("일간 활성 회원 (DAU)")).toBeInTheDocument();
    expect(screen.getByText("월간 활성 회원 (MAU)")).toBeInTheDocument();
    expect(screen.getByText("D1 리텐션")).toBeInTheDocument();
    expect(screen.getByText("일 매출")).toBeInTheDocument();
  });
});
