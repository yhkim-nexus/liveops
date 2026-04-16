# KPI Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a KPI snapshot dashboard page in the admin app where LiveOps operators can monitor DAU, retention, and revenue metrics at a glance with 30-day trend charts.

**Architecture:** Next.js 16 App Router page at `/dashboard` with 4 KPI summary cards and 3 Recharts-based trend charts. Data comes from 4 mock API route handlers that return realistic game analytics data. React Query manages fetching/caching. All UI built with Shadcn UI + Tailwind CSS 4.

**Tech Stack:** Next.js 16, React 19, TypeScript, Shadcn UI, Radix UI, Tailwind CSS 4, Recharts, TanStack React Query, Vitest + React Testing Library, MSW

**Spec:** `docs/superpowers/specs/2026-03-26-kpi-dashboard-design.md` (SPEC-GLO-002)

---

## File Structure

```
apps/admin/
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── vitest.config.ts
├── src/
│   ├── app/
│   │   ├── layout.tsx                          # Root layout with QueryProvider
│   │   ├── dashboard/
│   │   │   └── page.tsx                        # KPI Dashboard page (SCR-KPI-001)
│   │   └── api/dashboard/
│   │       ├── summary/route.ts                # GET /api/dashboard/summary
│   │       ├── activity-trend/route.ts         # GET /api/dashboard/activity-trend
│   │       ├── retention/route.ts              # GET /api/dashboard/retention
│   │       └── revenue-trend/route.ts          # GET /api/dashboard/revenue-trend
│   ├── components/
│   │   └── ui/                                 # Shadcn UI components (Card, Button, etc.)
│   ├── features/
│   │   └── dashboard/
│   │       ├── components/
│   │       │   ├── KpiMetricCard.tsx            # E-KPI-01~04 single metric card
│   │       │   ├── KpiMetricCard.test.tsx
│   │       │   ├── KpiSummaryCards.tsx          # 4-card grid container
│   │       │   ├── KpiSummaryCards.test.tsx
│   │       │   ├── ActivityTrendChart.tsx       # E-KPI-05 line chart
│   │       │   ├── ActivityTrendChart.test.tsx
│   │       │   ├── RetentionCurveChart.tsx      # E-KPI-06 retention line chart
│   │       │   ├── RetentionCurveChart.test.tsx
│   │       │   ├── RevenueTrendChart.tsx        # E-KPI-07 composed chart
│   │       │   ├── RevenueTrendChart.test.tsx
│   │       │   └── PeriodToggle.tsx             # INT-KPI-01 shared period selector
│   │       ├── hooks/
│   │       │   └── use-dashboard-queries.ts     # React Query hooks for all 4 endpoints
│   │       ├── types/
│   │       │   └── dashboard.ts                 # All TypeScript interfaces from spec
│   │       ├── lib/
│   │       │   ├── mock-data.ts                 # Mock data generators
│   │       │   └── format.ts                    # Number/currency/percent formatters
│   │       └── constants/
│   │           └── chart-config.ts              # Colors, styles, period options
│   ├── lib/
│   │   └── query-client.ts                     # QueryClient + QueryProvider
│   └── test/
│       └── setup.ts                            # Vitest global setup
```

---

## Task 1: Next.js 프로젝트 초기화

**Files:**
- Create: `apps/admin/package.json`
- Create: `apps/admin/tsconfig.json`
- Create: `apps/admin/next.config.ts`
- Create: `apps/admin/tailwind.config.ts`
- Create: `apps/admin/postcss.config.mjs`

- [ ] **Step 1: Create apps/admin directory and initialize Next.js project**

```bash
cd /Users/david/Downloads/Projects/LiveOps
mkdir -p apps/admin
cd apps/admin
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-import-alias --turbopack
```

Accept defaults. This creates Next.js 16 with App Router, TypeScript, Tailwind CSS, ESLint, src/ directory.

- [ ] **Step 2: Install project dependencies**

```bash
cd /Users/david/Downloads/Projects/LiveOps/apps/admin
npm install recharts @tanstack/react-query
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event msw
```

- [ ] **Step 3: Initialize Shadcn UI**

```bash
cd /Users/david/Downloads/Projects/LiveOps/apps/admin
npx shadcn@latest init -d
npx shadcn@latest add card button
```

- [ ] **Step 4: Create Vitest config**

Create `apps/admin/vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    css: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

Create `apps/admin/src/test/setup.ts`:

```typescript
import "@testing-library/jest-dom/vitest";
```

Add to `package.json` scripts:

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

- [ ] **Step 5: Verify setup**

```bash
cd /Users/david/Downloads/Projects/LiveOps/apps/admin
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 6: Commit**

```bash
cd /Users/david/Downloads/Projects/LiveOps
git add apps/admin/
git commit -m "feat: initialize Next.js admin app with Shadcn UI, Recharts, React Query, Vitest"
```

---

## Task 2: TypeScript 타입 정의 + 포맷 유틸리티

**Files:**
- Create: `apps/admin/src/features/dashboard/types/dashboard.ts`
- Create: `apps/admin/src/features/dashboard/lib/format.ts`
- Create: `apps/admin/src/features/dashboard/lib/format.test.ts`
- Create: `apps/admin/src/features/dashboard/constants/chart-config.ts`

- [ ] **Step 1: Write type definitions**

Create `apps/admin/src/features/dashboard/types/dashboard.ts`:

```typescript
// API 공통 응답 래퍼
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: {
    generatedAt: string;
    period?: string;
  };
}

// KPI Summary (GET /api/dashboard/summary)
export interface DashboardSummary {
  dau: KpiMetric;
  mau: KpiMetric;
  d1Retention: KpiMetric;
  dailyRevenue: KpiMetric;
}

export interface KpiMetric {
  value: number;
  unit: "count" | "percent" | "currency";
  changeRate: number;
  comparisonValue: number;
}

// Activity Trend (GET /api/dashboard/activity-trend)
export type ActivityTrendResponse = ActivityTrendPoint[];

export interface ActivityTrendPoint {
  date: string;
  dau: number;
  sessions: number;
  avgSessionMinutes: number;
}

// Retention (GET /api/dashboard/retention)
export interface RetentionResponse {
  currentCohort: RetentionData;
  previousCohort: RetentionData;
}

export interface RetentionData {
  cohortDate: string;
  cohortSize: number;
  points: RetentionPoint[];
}

export interface RetentionPoint {
  day: number;
  rate: number;
  count: number;
}

// Revenue Trend (GET /api/dashboard/revenue-trend)
export type RevenueTrendResponse = RevenueTrendPoint[];

export interface RevenueTrendPoint {
  date: string;
  revenue: number;
  payments: number;
  payers: number;
  arpu: number;
  arppu: number;
  conversionRate: number;
}

// UI types
export type Period = "7d" | "30d" | "90d";
```

- [ ] **Step 2: Write failing test for formatters**

Create `apps/admin/src/features/dashboard/lib/format.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { formatCompactNumber, formatCurrency, formatPercent, formatChangeRate } from "./format";

describe("formatCompactNumber", () => {
  it("formats thousands as K", () => {
    expect(formatCompactNumber(12400)).toBe("12.4K");
  });
  it("formats millions as M", () => {
    expect(formatCompactNumber(1500000)).toBe("1.5M");
  });
  it("formats small numbers as-is", () => {
    expect(formatCompactNumber(999)).toBe("999");
  });
});

describe("formatCurrency", () => {
  it("formats with dollar sign and compact notation", () => {
    expect(formatCurrency(24500)).toBe("$24.5K");
  });
  it("formats small amounts without compact", () => {
    expect(formatCurrency(500)).toBe("$500");
  });
});

describe("formatPercent", () => {
  it("formats percentage with one decimal", () => {
    expect(formatPercent(42.35)).toBe("42.4%");
  });
});

describe("formatChangeRate", () => {
  it("formats positive change with ▲", () => {
    expect(formatChangeRate(5.2, "percent")).toBe("▲ +5.2%");
  });
  it("formats negative change with ▼", () => {
    expect(formatChangeRate(-1.2, "pp")).toBe("▼ -1.2pp");
  });
  it("formats zero change with —", () => {
    expect(formatChangeRate(0, "percent")).toBe("— 0%");
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
cd /Users/david/Downloads/Projects/LiveOps/apps/admin
npx vitest run src/features/dashboard/lib/format.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 4: Implement formatters**

Create `apps/admin/src/features/dashboard/lib/format.ts`:

```typescript
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

export function formatChangeRate(
  rate: number,
  unit: "percent" | "pp"
): string {
  const suffix = unit === "pp" ? "pp" : "%";
  if (rate > 0) return `▲ +${rate.toFixed(1)}${suffix}`;
  if (rate < 0) return `▼ ${rate.toFixed(1)}${suffix}`;
  return `— 0${suffix}`;
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
cd /Users/david/Downloads/Projects/LiveOps/apps/admin
npx vitest run src/features/dashboard/lib/format.test.ts
```

Expected: All 8 tests PASS.

- [ ] **Step 6: Create chart config constants**

Create `apps/admin/src/features/dashboard/constants/chart-config.ts`:

```typescript
import type { Period } from "../types/dashboard";

export const CHART_COLORS = {
  primary: "#3B82F6",   // blue-500
  secondary: "#9CA3AF", // gray-400
  accent: "#F97316",    // orange-500
  success: "#22C55E",   // green-500
} as const;

export const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
];

export const DEFAULT_PERIOD: Period = "30d";

export const RETENTION_DAYS = [0, 1, 3, 7, 14, 30] as const;
```

- [ ] **Step 7: Commit**

```bash
cd /Users/david/Downloads/Projects/LiveOps
git add apps/admin/src/features/dashboard/
git commit -m "feat: add dashboard types, format utilities, and chart config"
```

---

## Task 3: Mock 데이터 생성기 + API Route Handlers

**Files:**
- Create: `apps/admin/src/features/dashboard/lib/mock-data.ts`
- Create: `apps/admin/src/app/api/dashboard/summary/route.ts`
- Create: `apps/admin/src/app/api/dashboard/activity-trend/route.ts`
- Create: `apps/admin/src/app/api/dashboard/retention/route.ts`
- Create: `apps/admin/src/app/api/dashboard/revenue-trend/route.ts`

- [ ] **Step 1: Create mock data generators**

Create `apps/admin/src/features/dashboard/lib/mock-data.ts`:

```typescript
import type {
  DashboardSummary,
  ActivityTrendPoint,
  RetentionResponse,
  RevenueTrendPoint,
  Period,
} from "../types/dashboard";
import { RETENTION_DAYS } from "../constants/chart-config";

function daysForPeriod(period: Period): number {
  return period === "7d" ? 7 : period === "30d" ? 30 : 90;
}

function dateString(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function jitter(base: number, pct: number): number {
  return Math.round(base * (1 + (Math.random() - 0.5) * 2 * pct));
}

export function generateSummary(): DashboardSummary {
  const dauToday = jitter(12400, 0.1);
  const dauYesterday = jitter(12400, 0.1);
  const mauThis = jitter(89000, 0.05);
  const mauLast = jitter(87000, 0.05);
  const retToday = 40 + Math.random() * 5;
  const retYesterday = 40 + Math.random() * 5;
  const revToday = jitter(24500, 0.15);
  const revYesterday = jitter(24500, 0.15);

  return {
    dau: {
      value: dauToday,
      unit: "count",
      changeRate: +((dauToday / dauYesterday - 1) * 100).toFixed(1),
      comparisonValue: dauYesterday,
    },
    mau: {
      value: mauThis,
      unit: "count",
      changeRate: +((mauThis / mauLast - 1) * 100).toFixed(1),
      comparisonValue: mauLast,
    },
    d1Retention: {
      value: +retToday.toFixed(1),
      unit: "percent",
      changeRate: +(retToday - retYesterday).toFixed(1),
      comparisonValue: +retYesterday.toFixed(1),
    },
    dailyRevenue: {
      value: revToday,
      unit: "currency",
      changeRate: +((revToday / revYesterday - 1) * 100).toFixed(1),
      comparisonValue: revYesterday,
    },
  };
}

export function generateActivityTrend(period: Period): ActivityTrendPoint[] {
  const days = daysForPeriod(period);
  return Array.from({ length: days }, (_, i) => ({
    date: dateString(days - 1 - i),
    dau: jitter(12000, 0.15),
    sessions: jitter(35000, 0.15),
    avgSessionMinutes: +(15 + Math.random() * 10).toFixed(1),
  }));
}

export function generateRetention(): RetentionResponse {
  const makePoints = (base: number) =>
    RETENTION_DAYS.map((day) => {
      const rate = day === 0 ? 100 : Math.max(5, base * Math.exp(-0.05 * day) + (Math.random() - 0.5) * 5);
      return {
        day,
        rate: +rate.toFixed(1),
        count: Math.round((rate / 100) * 2000),
      };
    });

  return {
    currentCohort: {
      cohortDate: dateString(7),
      cohortSize: jitter(2000, 0.1),
      points: makePoints(45),
    },
    previousCohort: {
      cohortDate: dateString(14),
      cohortSize: jitter(1800, 0.1),
      points: makePoints(42),
    },
  };
}

export function generateRevenueTrend(period: Period): RevenueTrendPoint[] {
  const days = daysForPeriod(period);
  return Array.from({ length: days }, (_, i) => {
    const rev = jitter(24000, 0.2);
    const payers = jitter(500, 0.15);
    const dau = jitter(12000, 0.1);
    return {
      date: dateString(days - 1 - i),
      revenue: rev,
      payments: jitter(600, 0.15),
      payers,
      arpu: +(rev / dau).toFixed(2),
      arppu: +(rev / payers).toFixed(2),
      conversionRate: +((payers / dau) * 100).toFixed(1),
    };
  });
}
```

- [ ] **Step 2: Create API route handlers**

Create `apps/admin/src/app/api/dashboard/summary/route.ts`:

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { generateSummary } from "@/features/dashboard/lib/mock-data";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
  return NextResponse.json({
    success: true,
    data: generateSummary(),
    meta: { generatedAt: new Date().toISOString(), date },
  });
}
```

> Note: `date` 파라미터를 수신하고 meta에 포함하지만, Mock 데이터는 항상 현재 기준으로 생성한다. 실제 백엔드 연동 시 date 기반 쿼리로 교체.

Create `apps/admin/src/app/api/dashboard/activity-trend/route.ts`:

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { generateActivityTrend } from "@/features/dashboard/lib/mock-data";
import type { Period } from "@/features/dashboard/types/dashboard";

export async function GET(request: NextRequest) {
  const period = (request.nextUrl.searchParams.get("period") ?? "30d") as Period;
  return NextResponse.json({
    success: true,
    data: generateActivityTrend(period),
    meta: { generatedAt: new Date().toISOString(), period },
  });
}
```

Create `apps/admin/src/app/api/dashboard/retention/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { generateRetention } from "@/features/dashboard/lib/mock-data";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: generateRetention(),
    meta: { generatedAt: new Date().toISOString() },
  });
}
```

Create `apps/admin/src/app/api/dashboard/revenue-trend/route.ts`:

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { generateRevenueTrend } from "@/features/dashboard/lib/mock-data";
import type { Period } from "@/features/dashboard/types/dashboard";

export async function GET(request: NextRequest) {
  const period = (request.nextUrl.searchParams.get("period") ?? "30d") as Period;
  return NextResponse.json({
    success: true,
    data: generateRevenueTrend(period),
    meta: { generatedAt: new Date().toISOString(), period },
  });
}
```

- [ ] **Step 3: Verify API routes work**

```bash
cd /Users/david/Downloads/Projects/LiveOps/apps/admin
npm run dev &
sleep 3
curl -s http://localhost:3000/api/dashboard/summary | head -c 200
curl -s "http://localhost:3000/api/dashboard/activity-trend?period=7d" | head -c 200
curl -s http://localhost:3000/api/dashboard/retention | head -c 200
curl -s "http://localhost:3000/api/dashboard/revenue-trend?period=30d" | head -c 200
kill %1
```

Expected: Each endpoint returns JSON with `{ success: true, data: {...} }`.

- [ ] **Step 4: Commit**

```bash
cd /Users/david/Downloads/Projects/LiveOps
git add apps/admin/src/features/dashboard/lib/mock-data.ts apps/admin/src/app/api/
git commit -m "feat: add mock data generators and dashboard API route handlers"
```

---

## Task 4: React Query 설정 + Dashboard Hooks

**Files:**
- Create: `apps/admin/src/lib/query-client.ts`
- Modify: `apps/admin/src/app/layout.tsx`
- Create: `apps/admin/src/features/dashboard/hooks/use-dashboard-queries.ts`

- [ ] **Step 1: Create QueryClient provider**

Create `apps/admin/src/lib/query-client.ts`:

```typescript
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

- [ ] **Step 2: Update root layout to include QueryProvider**

Modify `apps/admin/src/app/layout.tsx` — wrap `{children}` with `<QueryProvider>`:

```tsx
import type { Metadata } from "next";
import { QueryProvider } from "@/lib/query-client";
import "./globals.css";

export const metadata: Metadata = {
  title: "LiveOps Admin",
  description: "Game LiveOps 관리자 대시보드",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Create dashboard query hooks**

Create `apps/admin/src/features/dashboard/hooks/use-dashboard-queries.ts`:

```typescript
import { useQuery } from "@tanstack/react-query";
import type {
  ApiResponse,
  DashboardSummary,
  ActivityTrendResponse,
  RetentionResponse,
  RevenueTrendResponse,
  Period,
} from "../types/dashboard";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const json: ApiResponse<T> = await res.json();
  return json.data;
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: () => fetchJson<DashboardSummary>("/api/dashboard/summary"),
  });
}

export function useActivityTrend(period: Period) {
  return useQuery({
    queryKey: ["dashboard", "activity-trend", period],
    queryFn: () =>
      fetchJson<ActivityTrendResponse>(
        `/api/dashboard/activity-trend?period=${period}`
      ),
  });
}

export function useRetention() {
  return useQuery({
    queryKey: ["dashboard", "retention"],
    queryFn: () =>
      fetchJson<RetentionResponse>("/api/dashboard/retention"),
  });
}

export function useRevenueTrend(period: Period) {
  return useQuery({
    queryKey: ["dashboard", "revenue-trend", period],
    queryFn: () =>
      fetchJson<RevenueTrendResponse>(
        `/api/dashboard/revenue-trend?period=${period}`
      ),
  });
}
```

- [ ] **Step 4: Commit**

```bash
cd /Users/david/Downloads/Projects/LiveOps
git add apps/admin/src/lib/ apps/admin/src/app/layout.tsx apps/admin/src/features/dashboard/hooks/
git commit -m "feat: add React Query provider and dashboard data hooks"
```

---

## Task 5: KpiMetricCard 컴포넌트

**Files:**
- Create: `apps/admin/src/features/dashboard/components/KpiMetricCard.tsx`
- Create: `apps/admin/src/features/dashboard/components/KpiMetricCard.test.tsx`
- Create: `apps/admin/src/features/dashboard/components/KpiSummaryCards.tsx`
- Create: `apps/admin/src/features/dashboard/components/KpiSummaryCards.test.tsx`

- [ ] **Step 1: Write failing test for KpiMetricCard**

Create `apps/admin/src/features/dashboard/components/KpiMetricCard.test.tsx`:

```tsx
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

  it("shows positive change in green with ▲", () => {
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

  it("shows negative change in red with ▼", () => {
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/david/Downloads/Projects/LiveOps/apps/admin
npx vitest run src/features/dashboard/components/KpiMetricCard.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement KpiMetricCard**

Create `apps/admin/src/features/dashboard/components/KpiMetricCard.tsx`:

```tsx
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
        <p className="mt-1 text-3xl font-bold tracking-tight">
          {formatValue(metric.value, metric.unit)}
        </p>
        <div className="mt-1">
          <ChangeIndicator rate={metric.changeRate} unit={metric.unit} />
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd /Users/david/Downloads/Projects/LiveOps/apps/admin
npx vitest run src/features/dashboard/components/KpiMetricCard.test.tsx
```

Expected: All 5 tests PASS.

- [ ] **Step 5: Write failing test for KpiSummaryCards**

Create `apps/admin/src/features/dashboard/components/KpiSummaryCards.test.tsx`:

```tsx
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
```

- [ ] **Step 6: Run test to verify it fails**

```bash
cd /Users/david/Downloads/Projects/LiveOps/apps/admin
npx vitest run src/features/dashboard/components/KpiSummaryCards.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 7: Implement KpiSummaryCards**

Create `apps/admin/src/features/dashboard/components/KpiSummaryCards.tsx`:

```tsx
import type { DashboardSummary } from "../types/dashboard";
import { KpiMetricCard } from "./KpiMetricCard";

interface KpiSummaryCardsProps {
  data: DashboardSummary;
}

const CARD_CONFIG = [
  { key: "dau" as const, title: "일간 활성 회원 (DAU)" },
  { key: "mau" as const, title: "월간 활성 회원 (MAU)" },
  { key: "d1Retention" as const, title: "D1 리텐션" },
  { key: "dailyRevenue" as const, title: "일 매출" },
];

export function KpiSummaryCards({ data }: KpiSummaryCardsProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {CARD_CONFIG.map(({ key, title }) => (
        <KpiMetricCard key={key} title={title} metric={data[key]} />
      ))}
    </div>
  );
}
```

- [ ] **Step 8: Run test to verify it passes**

```bash
cd /Users/david/Downloads/Projects/LiveOps/apps/admin
npx vitest run src/features/dashboard/components/KpiSummaryCards.test.tsx
```

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
cd /Users/david/Downloads/Projects/LiveOps
git add apps/admin/src/features/dashboard/components/KpiMetricCard* apps/admin/src/features/dashboard/components/KpiSummaryCards*
git commit -m "feat: add KpiMetricCard and KpiSummaryCards components with tests"
```

---

## Task 6: PeriodToggle + ActivityTrendChart 컴포넌트

**Files:**
- Create: `apps/admin/src/features/dashboard/components/PeriodToggle.tsx`
- Create: `apps/admin/src/features/dashboard/components/PeriodToggle.test.tsx`
- Create: `apps/admin/src/features/dashboard/components/ActivityTrendChart.tsx`
- Create: `apps/admin/src/features/dashboard/components/ActivityTrendChart.test.tsx`

- [ ] **Step 1: Create PeriodToggle**

Create `apps/admin/src/features/dashboard/components/PeriodToggle.tsx`:

```tsx
import { Button } from "@/components/ui/button";
import { PERIOD_OPTIONS } from "../constants/chart-config";
import type { Period } from "../types/dashboard";

interface PeriodToggleProps {
  value: Period;
  onChange: (period: Period) => void;
}

export function PeriodToggle({ value, onChange }: PeriodToggleProps) {
  return (
    <div className="flex gap-1">
      {PERIOD_OPTIONS.map((option) => (
        <Button
          key={option.value}
          variant={value === option.value ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Write and run PeriodToggle test**

Create `apps/admin/src/features/dashboard/components/PeriodToggle.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PeriodToggle } from "./PeriodToggle";

describe("PeriodToggle", () => {
  it("renders all 3 period options", () => {
    render(<PeriodToggle value="30d" onChange={() => {}} />);
    expect(screen.getByText("7D")).toBeInTheDocument();
    expect(screen.getByText("30D")).toBeInTheDocument();
    expect(screen.getByText("90D")).toBeInTheDocument();
  });

  it("calls onChange with the clicked period", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<PeriodToggle value="30d" onChange={onChange} />);

    await user.click(screen.getByText("7D"));
    expect(onChange).toHaveBeenCalledWith("7d");

    await user.click(screen.getByText("90D"));
    expect(onChange).toHaveBeenCalledWith("90d");
  });
});
```

```bash
cd /Users/david/Downloads/Projects/LiveOps/apps/admin
npx vitest run src/features/dashboard/components/PeriodToggle.test.tsx
```

Expected: PASS (PeriodToggle was already created in Step 1).

- [ ] **Step 3: Write failing test for ActivityTrendChart**

> Note: 아래부터 Step 번호는 Task 6 내에서 순차적으로 진행

Create `apps/admin/src/features/dashboard/components/ActivityTrendChart.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ActivityTrendChart } from "./ActivityTrendChart";
import type { ActivityTrendPoint } from "../types/dashboard";

// Recharts uses SVG, mock ResponsiveContainer for test env
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
```

- [ ] **Step 3: Run test to verify it fails**

```bash
cd /Users/david/Downloads/Projects/LiveOps/apps/admin
npx vitest run src/features/dashboard/components/ActivityTrendChart.test.tsx
```

Expected: FAIL — module not found.

- [ ] **Step 4: Implement ActivityTrendChart**

Create `apps/admin/src/features/dashboard/components/ActivityTrendChart.tsx`:

```tsx
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
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickFormatter={(v: string) => v.slice(5)} // MM-DD
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12 }}
            tickFormatter={formatCompactNumber}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12 }}
            unit="분"
          />
          <Tooltip
            labelFormatter={(label: string) => `날짜: ${label}`}
            formatter={(value: number, name: string) => {
              if (name === "avgSessionMinutes") return [`${value.toFixed(1)}분`, "평균 세션 시간"];
              if (name === "sessions") return [formatCompactNumber(value), "세션 수"];
              return [formatCompactNumber(value), "DAU"];
            }}
          />
          <Legend
            formatter={(value: string) => {
              const labels: Record<string, string> = {
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
            dataKey="dau"
            stroke={CHART_COLORS.primary}
            strokeWidth={2}
            dot={false}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="sessions"
            stroke={CHART_COLORS.secondary}
            strokeDasharray="5 5"
            dot={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="avgSessionMinutes"
            stroke={CHART_COLORS.accent}
            strokeDasharray="3 3"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
cd /Users/david/Downloads/Projects/LiveOps/apps/admin
npx vitest run src/features/dashboard/components/ActivityTrendChart.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
cd /Users/david/Downloads/Projects/LiveOps
git add apps/admin/src/features/dashboard/components/PeriodToggle.tsx apps/admin/src/features/dashboard/components/ActivityTrendChart*
git commit -m "feat: add PeriodToggle and ActivityTrendChart components"
```

---

## Task 7: RetentionCurveChart 컴포넌트

**Files:**
- Create: `apps/admin/src/features/dashboard/components/RetentionCurveChart.tsx`
- Create: `apps/admin/src/features/dashboard/components/RetentionCurveChart.test.tsx`

- [ ] **Step 1: Write failing test**

Create `apps/admin/src/features/dashboard/components/RetentionCurveChart.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/david/Downloads/Projects/LiveOps/apps/admin
npx vitest run src/features/dashboard/components/RetentionCurveChart.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement RetentionCurveChart**

Create `apps/admin/src/features/dashboard/components/RetentionCurveChart.tsx`:

```tsx
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
import type { RetentionResponse, RetentionPoint } from "../types/dashboard";

interface RetentionCurveChartProps {
  data: RetentionResponse;
}

function mergeRetentionData(current: RetentionPoint[], previous: RetentionPoint[]) {
  const previousMap = new Map(previous.map((p) => [p.day, p]));
  return current.map((point) => ({
    day: `D${point.day}`,
    current: point.rate,
    previous: previousMap.get(point.day)?.rate ?? null,
    currentCount: point.count,
    previousCount: previousMap.get(point.day)?.count ?? null,
  }));
}

function findRate(points: RetentionPoint[], day: number): string {
  return points.find((p) => p.day === day)?.rate.toFixed(1) ?? "—";
}

export function RetentionCurveChart({ data }: RetentionCurveChartProps) {
  const chartData = mergeRetentionData(data.currentCohort.points, data.previousCohort.points);

  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold">리텐션 커브</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value: number, name: string) => {
              const label = name === "current" ? "최신 코호트" : "이전 코호트";
              return [`${value.toFixed(1)}%`, label];
            }}
          />
          <Legend
            formatter={(value: string) =>
              value === "current" ? "최신 코호트" : "이전 코호트"
            }
          />
          <Line
            type="monotone"
            dataKey="current"
            stroke={CHART_COLORS.primary}
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="previous"
            stroke={CHART_COLORS.secondary}
            strokeDasharray="5 5"
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-2 flex gap-6 text-sm text-muted-foreground">
        <span>D1: <strong>{findRate(data.currentCohort.points, 1)}%</strong></span>
        <span>D7: <strong>{findRate(data.currentCohort.points, 7)}%</strong></span>
        <span>D30: <strong>{findRate(data.currentCohort.points, 30)}%</strong></span>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd /Users/david/Downloads/Projects/LiveOps/apps/admin
npx vitest run src/features/dashboard/components/RetentionCurveChart.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd /Users/david/Downloads/Projects/LiveOps
git add apps/admin/src/features/dashboard/components/RetentionCurveChart*
git commit -m "feat: add RetentionCurveChart component with cohort comparison"
```

---

## Task 8: RevenueTrendChart 컴포넌트

**Files:**
- Create: `apps/admin/src/features/dashboard/components/RevenueTrendChart.tsx`
- Create: `apps/admin/src/features/dashboard/components/RevenueTrendChart.test.tsx`

- [ ] **Step 1: Write failing test**

Create `apps/admin/src/features/dashboard/components/RevenueTrendChart.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/david/Downloads/Projects/LiveOps/apps/admin
npx vitest run src/features/dashboard/components/RevenueTrendChart.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement RevenueTrendChart**

Create `apps/admin/src/features/dashboard/components/RevenueTrendChart.tsx`:

```tsx
"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CHART_COLORS } from "../constants/chart-config";
import type { RevenueTrendPoint } from "../types/dashboard";
import { formatCurrency, formatCompactNumber } from "../lib/format";

interface RevenueTrendChartProps {
  data: RevenueTrendPoint[];
}

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  const latestConversion = data.length > 0 ? data[data.length - 1].conversionRate : 0;

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="text-lg font-semibold">수익 트렌드</h3>
        <span className="text-sm text-muted-foreground">
          결제 전환율: <strong>{latestConversion.toFixed(1)}%</strong>
        </span>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickFormatter={(v: string) => v.slice(5)}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12 }}
            tickFormatter={(v: number) => formatCompactNumber(v)}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12 }}
            unit="$"
          />
          <Tooltip
            labelFormatter={(label: string) => `날짜: ${label}`}
            formatter={(value: number, name: string) => {
              const labels: Record<string, string> = {
                revenue: "일 매출",
                arpu: "ARPU",
                arppu: "ARPPU",
              };
              if (name === "revenue") return [formatCurrency(value), labels[name]];
              return [`$${value.toFixed(2)}`, labels[name] ?? name];
            }}
          />
          <Legend
            formatter={(value: string) => {
              const labels: Record<string, string> = {
                revenue: "일 매출",
                arpu: "ARPU",
                arppu: "ARPPU",
              };
              return labels[value] ?? value;
            }}
          />
          <Bar
            yAxisId="left"
            dataKey="revenue"
            fill={CHART_COLORS.primary}
            opacity={0.8}
            radius={[2, 2, 0, 0]}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="arpu"
            stroke={CHART_COLORS.accent}
            strokeWidth={2}
            dot={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="arppu"
            stroke={CHART_COLORS.success}
            strokeDasharray="3 3"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd /Users/david/Downloads/Projects/LiveOps/apps/admin
npx vitest run src/features/dashboard/components/RevenueTrendChart.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd /Users/david/Downloads/Projects/LiveOps
git add apps/admin/src/features/dashboard/components/RevenueTrendChart*
git commit -m "feat: add RevenueTrendChart composed chart component"
```

---

## Task 9: Dashboard 페이지 조립 + E2E 확인

**Files:**
- Create: `apps/admin/src/app/dashboard/page.tsx`
- Modify: `apps/admin/src/app/page.tsx` (redirect to /dashboard)

- [ ] **Step 1: Create dashboard page**

Create `apps/admin/src/app/dashboard/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { KpiSummaryCards } from "@/features/dashboard/components/KpiSummaryCards";
import { ActivityTrendChart } from "@/features/dashboard/components/ActivityTrendChart";
import { RetentionCurveChart } from "@/features/dashboard/components/RetentionCurveChart";
import { RevenueTrendChart } from "@/features/dashboard/components/RevenueTrendChart";
import { PeriodToggle } from "@/features/dashboard/components/PeriodToggle";
import {
  useDashboardSummary,
  useActivityTrend,
  useRetention,
  useRevenueTrend,
} from "@/features/dashboard/hooks/use-dashboard-queries";
import type { Period } from "@/features/dashboard/types/dashboard";
import { DEFAULT_PERIOD } from "@/features/dashboard/constants/chart-config";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>(DEFAULT_PERIOD);

  const summary = useDashboardSummary();
  const activityTrend = useActivityTrend(period);
  const retention = useRetention();
  const revenueTrend = useRevenueTrend(period);

  const isLoading =
    summary.isLoading || activityTrend.isLoading || retention.isLoading || revenueTrend.isLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">대시보드 로딩 중...</p>
      </div>
    );
  }

  const hasError =
    summary.isError || activityTrend.isError || retention.isError || revenueTrend.isError;

  if (hasError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-600">데이터를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">KPI 대시보드</h1>
        <PeriodToggle value={period} onChange={setPeriod} />
      </div>

      {summary.data && <KpiSummaryCards data={summary.data} />}

      {activityTrend.data && (
        <Card>
          <CardContent className="pt-6">
            <ActivityTrendChart data={activityTrend.data} />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4">
        {retention.data && (
          <Card>
            <CardContent className="pt-6">
              <RetentionCurveChart data={retention.data} />
            </CardContent>
          </Card>
        )}

        {revenueTrend.data && (
          <Card>
            <CardContent className="pt-6">
              <RevenueTrendChart data={revenueTrend.data} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add redirect from root to dashboard**

Replace `apps/admin/src/app/page.tsx` content:

```tsx
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard");
}
```

- [ ] **Step 3: Run dev server and verify visually**

```bash
cd /Users/david/Downloads/Projects/LiveOps/apps/admin
npm run dev
```

Open `http://localhost:3000` in browser. Verify:
- [ ] Redirects to `/dashboard`
- [ ] 4 KPI cards visible at top with values and change indicators
- [ ] Activity trend line chart with 3 lines (DAU, sessions, avg session time)
- [ ] Retention curve with 2 lines (current + previous cohort) and D1/D7/D30 text
- [ ] Revenue trend with bars + ARPU/ARPPU lines and conversion rate text
- [ ] Period toggle (7D/30D/90D) changes activity and revenue charts

- [ ] **Step 4: Run all tests**

```bash
cd /Users/david/Downloads/Projects/LiveOps/apps/admin
npx vitest run
```

Expected: All tests PASS.

- [ ] **Step 5: Build check**

```bash
cd /Users/david/Downloads/Projects/LiveOps/apps/admin
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 6: Commit**

```bash
cd /Users/david/Downloads/Projects/LiveOps
git add apps/admin/src/app/dashboard/ apps/admin/src/app/page.tsx
git commit -m "feat: assemble KPI dashboard page with all chart components"
```

---

## Verification Checklist

After completing all tasks, verify end-to-end:

- [ ] `npm run build` succeeds in `apps/admin/`
- [ ] `npx vitest run` — all tests pass
- [ ] `npm run dev` — dashboard loads at `localhost:3000/dashboard`
- [ ] KPI cards show 4 metrics with color-coded change indicators
- [ ] Activity trend shows 30-day line chart by default
- [ ] Period toggle switches between 7D/30D/90D
- [ ] Retention curve shows 2 cohort lines with D1/D7/D30 summary
- [ ] Revenue chart shows bars + ARPU/ARPPU lines with conversion rate
- [ ] All charts have tooltips on hover
- [ ] Layout matches spec wireframe (cards → full-width chart → 2-col bottom)
