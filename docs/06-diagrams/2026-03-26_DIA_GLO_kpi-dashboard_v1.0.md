---
id: "DIA-GLO-004"
title: "다이어그램: 핵심 지표 대시보드"
project: "GLO"
version: "v1.0"
status: "draft"
created: "2026-03-26"
updated: "2026-03-26"
author: "diagram"
reviewers: []
related_docs:
  - "PRD-GLO-004"
  - "UX-GLO-004"
  - "SPEC-GLO-002"
tags:
  - "project:game-liveops"
  - "type:diagram"
  - "topic:kpi-dashboard"
---

# 다이어그램: 핵심 지표 대시보드

> Game LiveOps Service의 핵심 지표 대시보드(KPI Dashboard)의 데이터 플로우와 컴포넌트 구조를 시각화한 다이어그램 문서. SPEC-GLO-002 디자인 스펙을 기반으로 브라우저에서 Mock API를 통해 KPI 데이터를 조회하고 차트로 렌더링하는 전체 흐름을 다룬다.

## 문서 정보

| 항목 | 내용 |
|------|------|
| 문서 ID | DIA-GLO-004 |
| 버전 | v1.0 |
| 상태 | draft |
| 작성일 | 2026-03-26 |
| 작성자 | diagram |
| 관련 PRD | PRD-GLO-004 |
| 관련 UX | UX-GLO-004 |
| 참조 스펙 | SPEC-GLO-002 |

---

## DIA-020: KPI 대시보드 데이터 플로우

### 설명

브라우저에서 React Query hooks를 통해 Next.js API Routes를 호출하고, Mock Data Generators가 응답을 생성하여 반환하는 전체 데이터 플로우를 나타낸다. 4개 API 엔드포인트(`/api/dashboard/summary`, `/api/dashboard/activity-trend`, `/api/dashboard/retention`, `/api/dashboard/revenue-trend`)가 각각 독립적으로 호출되며, React Query가 캐싱과 리페칭을 관리한다. 기간 토글(7D/30D/90D) 변경 시 `period` 파라미터가 변경되어 `activity-trend`와 `revenue-trend` 엔드포인트를 refetch한다.

```mermaid
flowchart TB
    subgraph Browser["Browser (React 19)"]
        Page["DashboardPage"]

        subgraph Hooks["React Query Hooks"]
            H1["useSummary()"]
            H2["useActivityTrend(period)"]
            H3["useRetention()"]
            H4["useRevenueTrend(period)"]
        end

        subgraph Components["UI Components"]
            C1["KpiSummaryCards"]
            C2["ActivityTrendChart"]
            C3["RetentionCurveChart"]
            C4["RevenueTrendChart"]
        end

        Toggle["PeriodToggle\n(7D / 30D / 90D)"]
    end

    subgraph Server["Next.js API Routes"]
        API1["GET /api/dashboard/summary\n?date=YYYY-MM-DD"]
        API2["GET /api/dashboard/activity-trend\n?period=7d|30d|90d"]
        API3["GET /api/dashboard/retention\n?cohort_date=YYYY-MM-DD"]
        API4["GET /api/dashboard/revenue-trend\n?period=7d|30d|90d"]
    end

    subgraph Mock["Mock Data Generators"]
        M1["generateSummary()"]
        M2["generateActivityTrend()"]
        M3["generateRetention()"]
        M4["generateRevenueTrend()"]
    end

    Page --> H1 & H2 & H3 & H4
    H1 --> C1
    H2 --> C2
    H3 --> C3
    H4 --> C4

    Toggle -->|"period 변경"| H2
    Toggle -->|"period 변경"| H4

    H1 -->|"fetch"| API1
    H2 -->|"fetch"| API2
    H3 -->|"fetch"| API3
    H4 -->|"fetch"| API4

    API1 --> M1
    API2 --> M2
    API3 --> M3
    API4 --> M4

    M1 -->|"ApiResponse<DashboardSummary>"| API1
    M2 -->|"ApiResponse<ActivityTrendPoint[]>"| API2
    M3 -->|"ApiResponse<RetentionResponse>"| API3
    M4 -->|"ApiResponse<RevenueTrendPoint[]>"| API4
```

> **참고**
> - 모든 API는 공통 응답 래퍼 `ApiResponse<T>` 사용 (`success`, `data`, `meta` 필드)
> - `meta.generatedAt`: ISO 8601 형식 타임스탬프
> - React Query `staleTime`: 1분 (Mock 데이터이므로 긴 캐싱 적용)
> - 기간 토글 변경 시 `queryKey`에 `period` 포함 → 자동 refetch
> - TypeScript 타입 정의는 SPEC-GLO-002 Section 4.3 참조

---

## DIA-021: 대시보드 컴포넌트 구조

### 설명

KPI 대시보드의 React 컴포넌트 계층 구조를 나타낸다. `DashboardPage`가 최상위 컴포넌트로 전체 레이아웃을 관리하며, `KpiSummaryCards`가 4개의 `KpiMetricCard`를 렌더링한다. `PeriodToggle`은 기간 상태를 관리하여 `ActivityTrendChart`와 `RevenueTrendChart`에 `period` prop을 전달한다. 각 차트 컴포넌트는 Recharts의 `ResponsiveContainer`를 사용하여 반응형으로 동작한다.

```mermaid
graph TB
    DashboardPage["DashboardPage\n(layout: flex-col)"]

    subgraph SummarySection["KPI Summary Cards (상단, 4열 균등)"]
        KpiSummaryCards["KpiSummaryCards"]
        KpiMetricCard1["KpiMetricCard\nDAU\n(E-018-01)"]
        KpiMetricCard2["KpiMetricCard\nMAU\n(E-018-02)"]
        KpiMetricCard3["KpiMetricCard\nD1 리텐션\n(E-018-03)"]
        KpiMetricCard4["KpiMetricCard\n일 매출\n(E-018-04)"]
    end

    subgraph TrendSection["회원 활동 트렌드 (중단, 100%)"]
        ActivityTrendChart["ActivityTrendChart\nLineChart + ResponsiveContainer\n(E-018-05)"]
    end

    PeriodToggle["PeriodToggle\n[7D] [30D] [90D]\nstate: period"]

    subgraph BottomSection["하단 2열 (50% / 50%)"]
        RetentionCurveChart["RetentionCurveChart\nLineChart + ResponsiveContainer\n(E-018-06)"]
        RevenueTrendChart["RevenueTrendChart\nComposedChart + ResponsiveContainer\n(E-018-07)"]
    end

    subgraph SharedComponents["공통 컴포넌트"]
        CustomTooltip["CustomTooltip\n(커스텀 Recharts 툴팁)"]
        SkeletonCard["SkeletonCard\n(로딩 스켈레톤)"]
        ErrorFallback["ErrorFallback\n(에러 상태 UI)"]
    end

    DashboardPage --> KpiSummaryCards
    KpiSummaryCards --> KpiMetricCard1
    KpiSummaryCards --> KpiMetricCard2
    KpiSummaryCards --> KpiMetricCard3
    KpiSummaryCards --> KpiMetricCard4

    DashboardPage --> PeriodToggle
    DashboardPage --> ActivityTrendChart
    DashboardPage --> RetentionCurveChart
    DashboardPage --> RevenueTrendChart

    PeriodToggle -->|"period prop"| ActivityTrendChart
    PeriodToggle -->|"period prop"| RevenueTrendChart

    ActivityTrendChart --> CustomTooltip
    RetentionCurveChart --> CustomTooltip
    RevenueTrendChart --> CustomTooltip

    KpiMetricCard1 --> SkeletonCard
    ActivityTrendChart --> SkeletonCard
    RetentionCurveChart --> SkeletonCard
    RevenueTrendChart --> SkeletonCard

    ActivityTrendChart --> ErrorFallback
    RetentionCurveChart --> ErrorFallback
    RevenueTrendChart --> ErrorFallback
```

> **참고**
> - `DashboardPage` 레이아웃: `flex flex-col gap-6`
> - KPI Summary Cards: `grid grid-cols-4 gap-4` (4열 균등 배치)
> - 하단 영역: `grid grid-cols-2 gap-6` (리텐션 좌측, 수익 우측)
> - `PeriodToggle`: 회원 활동 트렌드 차트 섹션 우측 상단에 배치
> - 각 차트 높이 — 회원 활동 트렌드: 300px, 리텐션 커브: 350px, 수익 트렌드: 350px
> - `KpiMetricCard` props: `title`, `value`, `unit`, `changeRate`, `comparisonValue`
> - 차트 색상 체계는 SPEC-GLO-002 Section 3 참조
> - 컴포넌트 위치: `apps/admin/src/components/dashboard/`

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| v1.0 | 2026-03-26 | KPI 대시보드 다이어그램 최초 작성 | diagram |
