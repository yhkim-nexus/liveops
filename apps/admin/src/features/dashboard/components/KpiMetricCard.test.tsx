import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KpiMetricCard } from "./KpiMetricCard";

describe("KpiMetricCard", () => {
  it("renders value and title", () => {
    render(
      <KpiMetricCard
        title="DAU"
        metric={{ value: 12400, unit: "count", changeRate: 5.2, comparisonValue: 11800 }}
      />
    );
    expect(screen.getByText("DAU")).toBeInTheDocument();
    expect(screen.getByText("12.4K")).toBeInTheDocument();
  });

  it("shows positive change in green with triangle up", () => {
    render(
      <KpiMetricCard
        title="DAU"
        metric={{ value: 12400, unit: "count", changeRate: 5.2, comparisonValue: 11800 }}
      />
    );
    const change = screen.getByText(/▲/);
    expect(change).toBeInTheDocument();
    expect(change.className).toContain("green");
  });

  it("shows negative change in red with triangle down", () => {
    render(
      <KpiMetricCard
        title="D1 리텐션"
        metric={{ value: 42.3, unit: "percent", changeRate: -1.2, comparisonValue: 43.5 }}
      />
    );
    const change = screen.getByText(/▼/);
    expect(change).toBeInTheDocument();
    expect(change.className).toContain("red");
  });

  it("formats currency values with $ prefix", () => {
    render(
      <KpiMetricCard
        title="일 매출"
        metric={{ value: 24500, unit: "currency", changeRate: 8.3, comparisonValue: 22600 }}
      />
    );
    expect(screen.getByText("$24.5K")).toBeInTheDocument();
  });

  it("formats percent values", () => {
    render(
      <KpiMetricCard
        title="D1 리텐션"
        metric={{ value: 42.3, unit: "percent", changeRate: -1.2, comparisonValue: 43.5 }}
      />
    );
    expect(screen.getByText("42.3%")).toBeInTheDocument();
  });
});
