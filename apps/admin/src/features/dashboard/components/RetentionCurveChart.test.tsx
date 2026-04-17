import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RetentionCurveChart } from "./RetentionCurveChart";
import type { RetentionResponse } from "../types/dashboard";

vi.mock("recharts", async () => {
  const actual = await vi.importActual<typeof import("recharts")>("recharts");
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 400, height: 350 }}>{children}</div>
    ),
  };
});

const mockData: RetentionResponse = {
  currentCohort: {
    cohortDate: "2026-03-19",
    cohortSize: 2000,
    points: [
      { day: 0, rate: 100, count: 2000 },
      { day: 1, rate: 42.3, count: 846 },
      { day: 3, rate: 35.0, count: 700 },
      { day: 7, rate: 28.1, count: 562 },
      { day: 14, rate: 21.5, count: 430 },
      { day: 30, rate: 15.2, count: 304 },
    ],
  },
  previousCohort: {
    cohortDate: "2026-03-12",
    cohortSize: 1800,
    points: [
      { day: 0, rate: 100, count: 1800 },
      { day: 1, rate: 40.1, count: 722 },
      { day: 3, rate: 33.2, count: 598 },
      { day: 7, rate: 26.5, count: 477 },
      { day: 14, rate: 19.8, count: 356 },
      { day: 30, rate: 14.0, count: 252 },
    ],
  },
};

describe("RetentionCurveChart", () => {
  it("renders the chart title", () => {
    render(<RetentionCurveChart data={mockData} />);
    expect(screen.getByText("리텐션 커브")).toBeInTheDocument();
  });

  it("displays D1, D7, D30 summary values", () => {
    render(<RetentionCurveChart data={mockData} />);
    expect(screen.getByText(/D1/)).toBeInTheDocument();
    expect(screen.getByText(/D7/)).toBeInTheDocument();
    expect(screen.getByText(/D30/)).toBeInTheDocument();
  });
});
