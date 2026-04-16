---
id: "SPEC-GLO-002"
title: "핵심 지표 대시보드 (KPI Dashboard) 디자인 스펙"
project: "GLO"
version: "v1.0"
status: "draft"
created: "2026-03-26"
updated: "2026-03-26"
author: "planner"
reviewers: []
related_docs:
  - "RES-GLO-002"
  - "PRD-GLO-001"
  - "PRD-GLO-002"
  - "PRD-GLO-003"
tags:
  - "project:game-liveops"
  - "type:spec"
  - "topic:kpi-dashboard"
  - "status:draft"
---

# SPEC: 핵심 지표 대시보드 (KPI Dashboard) 디자인 스펙

> LiveOps 운영팀이 DAU, 리텐션, 수익 핵심 지표를 한 화면에서 일간 기준으로 모니터링할 수 있는 스냅샷 대시보드

## 문서 정보

| 항목 | 내용 |
|------|------|
| 문서 ID | SPEC-GLO-002 |
| 버전 | v1.0 |
| 상태 | draft |
| 작성일 | 2026-03-26 |
| 작성자 | planner |
| 관련 문서 | RES-GLO-002, PRD-GLO-001, PRD-GLO-002, PRD-GLO-003 |

---

## 1. 개요

### 배경

경쟁사 분석(RES-GLO-002, Section 3.6)에서 "핵심 지표 대시보드 (DAU, 리텐션, 수익)"는 Must-Have #6으로 분류되었다. 7개 경쟁 플랫폼 모두 실시간 플레이어 지표를 제공하며, 커스텀 대시보드(5/7), 퍼널 분석(4/7), 코호트 분석(3/7) 순으로 지원한다.

리서치 권고사항 #2: "관리자 대시보드는 기술자 전용이 아닌 운영자(LiveOps팀) 중심의 인터페이스로 설계할 것"

### 설계 방향

**스냅샷 대시보드** — 한 화면에 KPI 요약 카드 + 3개 영역(회원 활동, 리텐션, 수익) 트렌드 차트를 배치한다. GameAnalytics의 사전 구축 대시보드와 Heroic Labs Satori의 커스텀 위젯 대시보드 모델을 참고한다.

> **용어 참고**: DAU(Daily Active Users), MAU(Monthly Active Users)는 업계 표준 영문 약어를 그대로 사용한다. 한국어 레이블에서는 "회원"을 사용한다 (예: "일간 활성 회원(DAU)").

### 핵심 결정 사항

| 항목 | 결정 |
|------|------|
| 주요 사용자 | LiveOps 운영팀 (비기술) |
| 핵심 지표 영역 | DAU + 리텐션 + 수익 균형 종합 뷰 |
| 기간 단위 | 일간 중심 (오늘 vs 어제, 7D/30D/90D 트렌드) |
| 필터링 | 전체 플레이어 지표만 (세그먼트 필터는 후속 버전) |
| 알림 | 없음 (시각적 트렌드만 제공, 후속 버전에서 추가) |
| 데이터 소스 | Mock 데이터 기반, API 스펙 정의 |

### 범위

**포함**:
- KPI Summary 카드 4개 (DAU, MAU, D1 리텐션, 일 매출)
- 회원 활동 트렌드 차트 (DAU, 세션 수, 평균 세션 시간)
- 리텐션 커브 차트 (D0~D30, 코호트 비교)
- 수익 트렌드 차트 (일 매출, ARPU, ARPPU)
- Mock API 엔드포인트 4개
- TypeScript 데이터 타입 정의

**미포함 (후속 버전)**:
- 세그먼트별 필터링 (오디언스별 지표 분리)
- 임계값 알림 (DAU 급락 경고 등)
- 외부 알림 연동 (Slack, 이메일)
- 실시간 스트리밍 데이터
- 데이터 Export/다운로드
- 커스텀 대시보드 위젯 편집

---

## 2. 레이아웃

```
┌──────────────────────────────────────────────────────┐
│  KPI Summary Cards                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │   DAU    │ │   MAU    │ │ D1 리텐션 │ │  일 매출  ││
│  │  12.4K   │ │   89K    │ │  42.3%   │ │  $24.5K  ││
│  │  ▲+5.2%  │ │  ▲+2.1%  │ │ ▼-1.2pp  │ │  ▲+8.3%  ││
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘│
├──────────────────────────────────────────────────────┤
│  회원 활동 트렌드                    [7D] [30D] [90D]│
│  ┌──────────────────────────────────────────────────┐│
│  │  (멀티라인 LineChart)                             ││
│  │  — DAU (파란 실선)                                ││
│  │  --- 세션 수 (회색 점선)                           ││
│  │  --- 평균 세션 시간 (주황 점선, 우측 Y축)           ││
│  └──────────────────────────────────────────────────┘│
├────────────────────────┬─────────────────────────────┤
│  리텐션 커브            │  수익 트렌드                  │
│  ┌────────────────────┐│  ┌───────────────────────┐  │
│  │  (LineChart)       ││  │  (ComposedChart)      │  │
│  │  — 최신 코호트      ││  │  ■ 일 매출 (바)       │  │
│  │  --- 이전 코호트    ││  │  — ARPU (라인)        │  │
│  │                    ││  │  --- ARPPU (점선)     │  │
│  │  D1: 42% D7: 28%  ││  │                       │  │
│  │  D30: 15%         ││  │  전환율: 4.2%         │  │
│  └────────────────────┘│  └───────────────────────┘  │
└────────────────────────┴─────────────────────────────┘
```

### 레이아웃 구조

| 영역 | 위치 | 너비 | 높이(추정) |
|------|------|------|-----------|
| KPI Summary Cards | 상단 | 100% (4열 균등) | 120px |
| 회원 활동 트렌드 | 중단 | 100% | 300px |
| 리텐션 커브 | 좌측 하단 | 50% | 350px |
| 수익 트렌드 | 우측 하단 | 50% | 350px |

---

## 3. 컴포넌트 상세

**화면 ID**: `SCR-KPI-001` (KPI 대시보드 메인 화면)

### 3.1 KPI Summary 카드

**요소 ID**: `E-KPI-01`(DAU), `E-KPI-02`(MAU), `E-KPI-03`(D1 리텐션), `E-KPI-04`(일 매출)

각 카드는 동일한 `KpiMetricCard` UI 컴포넌트로 렌더링한다.

| 카드 | 지표명 | 값 포맷 | 비교 대상 | 변화 표시 |
|------|--------|---------|----------|----------|
| DAU | 일간 활성 회원(DAU) | 숫자 (K/M 축약) | 전일 | 변화율 (%) |
| MAU | 월간 활성 회원(MAU) | 숫자 (K/M 축약) | 전월 | 변화율 (%) |
| D1 리텐션 | 어제 가입자 오늘 복귀율 | 백분율 (%) | 전일 | 변화 (pp) |
| 일 매출 | 오늘 총 매출 | 통화 ($, K/M 축약) | 전일 | 변화율 (%) |

**시각적 규칙**:
- 양수 변화: 초록색 (text-green-600), ▲ 아이콘
- 음수 변화: 빨간색 (text-red-600), ▼ 아이콘
- 변화 없음: 회색 (text-gray-500), — 표시
- D1 리텐션의 변화는 퍼센트 포인트(pp) 단위

### 3.2 회원 활동 트렌드 차트

**요소 ID**: `E-KPI-05`
**인터랙션 ID**: `INT-KPI-01` (기간 토글), `INT-KPI-02` (툴팁 호버)

**Recharts 컴포넌트**: `LineChart` with `ResponsiveContainer`

| 라인 | 색상 | 스타일 | Y축 |
|------|------|--------|-----|
| DAU | #3B82F6 (blue-500) | 실선, strokeWidth: 2 | 좌측 |
| 세션 수 | #9CA3AF (gray-400) | 점선, strokeDasharray: "5 5" | 좌측 |
| 평균 세션 시간(분) | #F97316 (orange-500) | 점선, strokeDasharray: "3 3" | 우측 |

**기간 토글**: 7D / 30D / 90D 버튼 그룹 (기본값: 30D)
- 차트 우측 상단에 배치
- 선택된 기간에 따라 X축 날짜 범위 변경

**툴팁**: 날짜 호버 시 해당일의 DAU, 세션 수, 평균 세션 시간 표시

### 3.3 리텐션 커브 차트

**요소 ID**: `E-KPI-06`
**인터랙션 ID**: `INT-KPI-03` (툴팁 호버)

**Recharts 컴포넌트**: `LineChart`

| 라인 | 색상 | 스타일 | 설명 |
|------|------|--------|------|
| 최신 코호트 | #3B82F6 (blue-500) | 실선, strokeWidth: 2 | 이번 주 가입자 |
| 이전 코호트 | #9CA3AF (gray-400) | 점선, strokeDasharray: "5 5" | 지난 주 가입자 |

**X축 포인트**: D0(100%), D1, D3, D7, D14, D30
**Y축**: 리텐션율 (0~100%)

**부가 정보**:
- 차트 하단에 D1 / D7 / D30 리텐션 수치를 별도 텍스트로 표시
- 툴팁: 코호트 크기(가입자 수), 잔존자 수, 리텐션율

### 3.4 수익 트렌드 차트

**요소 ID**: `E-KPI-07`
**인터랙션 ID**: `INT-KPI-04` (툴팁 호버)

**Recharts 컴포넌트**: `ComposedChart` (Bar + Line 조합)

| 요소 | 유형 | 색상 | Y축 |
|------|------|------|-----|
| 일 매출 | Bar | #3B82F6 (blue-500) | 좌측 |
| ARPU | Line | #F97316 (orange-500), 실선 | 우측 |
| ARPPU | Line | #22C55E (green-500), 점선 | 우측 |

**기간**: 회원 활동 트렌드와 동일 기간 토글 연동
**부가 정보**: 차트 상단에 결제 전환율 텍스트 표시
**툴팁**: 일매출, 결제건수, 결제자수, ARPU, ARPPU

---

## 4. API 스펙

### 4.1 엔드포인트 목록

| 엔드포인트 | 메서드 | 설명 | 쿼리 파라미터 |
|------------|--------|------|--------------|
| `/api/dashboard/summary` | GET | KPI 카드 데이터 | `date` (YYYY-MM-DD, 기본: 오늘) |
| `/api/dashboard/activity-trend` | GET | DAU/세션 트렌드 | `period` (7d\|30d\|90d, 기본: 30d) |
| `/api/dashboard/retention` | GET | 리텐션 커브 데이터 | `cohort_date` (YYYY-MM-DD, 기본: 이번 주 월요일) |
| `/api/dashboard/revenue-trend` | GET | 매출/ARPU 트렌드 | `period` (7d\|30d\|90d, 기본: 30d) |

### 4.2 응답 형식

모든 API는 아래 공통 응답 래퍼를 사용한다:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: {
    generatedAt: string;  // ISO 8601
    period?: string;
  };
}
```

### 4.3 개별 응답 타입

```typescript
// GET /api/dashboard/summary
interface DashboardSummary {
  dau: KpiMetric;
  mau: KpiMetric;
  d1Retention: KpiMetric;
  dailyRevenue: KpiMetric;
}

interface KpiMetric {
  value: number;
  unit: 'count' | 'percent' | 'currency';
  changeRate: number;       // 전일/전월 대비 변화율 (%, 양수=증가, 음수=감소)
  comparisonValue: number;  // 비교 기준값
}

// GET /api/dashboard/activity-trend
type ActivityTrendResponse = ActivityTrendPoint[];

interface ActivityTrendPoint {
  date: string;              // YYYY-MM-DD
  dau: number;
  sessions: number;
  avgSessionMinutes: number;
}

// GET /api/dashboard/retention
interface RetentionResponse {
  currentCohort: RetentionData;
  previousCohort: RetentionData;
}

interface RetentionData {
  cohortDate: string;        // YYYY-MM-DD (코호트 시작일)
  cohortSize: number;        // 코호트 크기 (가입자 수)
  points: RetentionPoint[];
}

interface RetentionPoint {
  day: number;               // 0, 1, 3, 7, 14, 30
  rate: number;              // 리텐션율 (0~100)
  count: number;             // 잔존 회원 수
}

// GET /api/dashboard/revenue-trend
type RevenueTrendResponse = RevenueTrendPoint[];

interface RevenueTrendPoint {
  date: string;              // YYYY-MM-DD
  revenue: number;           // 일 매출 ($)
  payments: number;          // 결제 건수
  payers: number;            // 결제자 수
  arpu: number;              // Average Revenue Per User
  arppu: number;             // Average Revenue Per Paying User
  conversionRate: number;    // 결제 전환율 (%)
}
```

---

## 5. 기술 스택

| 영역 | 기술 | 용도 |
|------|------|------|
| 프레임워크 | Next.js 16, React 19 | 페이지 라우팅, 컴포넌트 |
| 언어 | TypeScript | 타입 안전성 |
| UI | Shadcn UI, Radix UI | 카드, 버튼, 레이아웃 컴포넌트 |
| 스타일 | Tailwind CSS 4 | 반응형 레이아웃, 색상 시스템 |
| 차트 | Recharts | LineChart, ComposedChart, BarChart |
| 데이터 패칭 | React Query | API 호출, 캐싱, 리페칭 |

---

## 6. 후속 버전 로드맵

| 버전 | 기능 | 우선순위 | 변경 규모 |
|------|------|---------|----------|
| v1.1 | 세그먼트별 필터링 (PRD-GLO-001 오디언스 연동) | Should-Have | 소규모 — 필터 UI + API 파라미터 추가 |
| v1.2 | 임계값 기반 대시보드 내 시각적 경고 | Should-Have | 소규모 — 조건부 스타일링 추가 |
| v1.3 | 데이터 Export (CSV/PDF) | Nice-to-Have | 소규모 — 다운로드 기능 추가 |
| v1.4 | 외부 알림 (Slack/이메일) 연동 | Nice-to-Have | 소규모 — 알림 설정 UI + 백엔드 웹훅 |
| v1.5 | 실시간 스트리밍 데이터 지원 | Nice-to-Have | 소규모 — WebSocket/SSE 연동 |
| v2.0 | 커스텀 대시보드 위젯 편집 | Future | 대규모 — 위젯 시스템 아키텍처 재설계 필요 |

---

## 7. 성공 기준

| 기준 | 목표 | 측정 방법 |
|------|------|----------|
| 페이지 로드 시간 | 2초 이내 | 모든 차트 렌더링 완료 기준 |
| 기간 토글 전환 | 500ms 이내 | 차트 리렌더링 완료 기준 |
| 반응형 지원 | 1280px 이상 데스크톱 | 관리자 대시보드 최소 해상도 |
| 접근성 | 색상 외 구분 가능 | 점선/실선 스타일로 라인 구분 |
