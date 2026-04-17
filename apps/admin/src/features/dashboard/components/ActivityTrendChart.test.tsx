import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ActivityTrendChart } from "./ActivityTrendChart";
import type { ActivityTrendPoint } from "../types/dashboard";

vi.mock("recharts", async () => {
  const actual = await vi.importActual<typeof import("recharts")>("recharts");
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 800, height: 300 }}>{children}</div>
    ),
  };
});

const mockData: ActivityTrendPoint[] = [
  { date: "2026-03-24", dau: 12000, sessions: 34000, avgSessionMinutes: 18.5 },
  { date: "2026-03-25", dau: 12500, sessions: 35500, avgSessionMinutes: 19.2 },
  { date: "2026-03-26", dau: 12200, sessions: 34800, avgSessionMinutes: 17.8 },
];

describe("ActivityTrendChart", () => {
  it("renders the chart title", () => {
    render(<ActivityTrendChart data={mockData} />);
    expect(screen.getByText("회원 활동 트렌드")).toBeInTheDocument();
  });

  it("renders the chart container", () => {
    const { container } = render(<ActivityTrendChart data={mockData} />);
    expect(container.querySelector(".recharts-wrapper")).toBeInTheDocument();
  });
});
