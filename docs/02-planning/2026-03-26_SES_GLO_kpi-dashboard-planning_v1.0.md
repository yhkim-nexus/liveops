---
id: "SES-GLO-005"
title: "기획 세션: 핵심 지표 대시보드 (KPI Dashboard)"
project: "Game LiveOps Service"
version: "v1.0"
status: "approved"
created: "2026-03-26"
updated: "2026-03-26"
author: "planner"
reviewers: []
related_docs:
  - "RES-GLO-002"
  - "SPEC-GLO-002"
tags:
  - "project:game-liveops"
  - "type:session"
  - "status:approved"
  - "phase:planning"
  - "feature:kpi-dashboard"
---

# 기획 세션: 핵심 지표 대시보드 (KPI Dashboard)

> 경쟁사 분석(RES-GLO-002)에서 Must-Have #6으로 분류된 핵심 지표 대시보드의 기획 산출물(UX 스펙, 다이어그램)을 생성하는 계획을 정의한다. LiveOps 운영팀이 DAU, 리텐션, 수익 핵심 지표를 한 화면에서 일간 기준으로 모니터링할 수 있는 스냅샷 대시보드를 설계한다.

## 문서 정보

| 항목 | 내용 |
|------|------|
| ID | SES-GLO-005 |
| 버전 | v1.0 |
| 상태 | approved |
| 작성일 | 2026-03-26 |
| 작성자 | planner |

---

## 1. 프로젝트 개요

### 1.1 목적

LiveOps 운영팀(비기술 직군)이 DAU, 리텐션, 수익 핵심 지표를 한 화면에서 일간 기준으로 모니터링할 수 있는 스냅샷 대시보드를 구축한다. KPI Summary 카드 4개와 3개 영역(회원 활동, 리텐션, 수익) 트렌드 차트를 단일 대시보드 화면에 배치하여 운영 의사결정을 지원한다.

### 1.2 배경

- RES-GLO-002 경쟁사 분석에서 "핵심 지표 대시보드 (DAU, 리텐션, 수익)"는 Must-Have #6으로 분류
- 7개 경쟁 플랫폼 모두 실시간 플레이어 지표를 제공하며, 커스텀 대시보드(5/7), 퍼널 분석(4/7), 코호트 분석(3/7) 순으로 지원
- 리서치 권고사항 #2: "관리자 대시보드는 기술자 전용이 아닌 운영자(LiveOps팀) 중심의 인터페이스로 설계할 것"
- SPEC-GLO-002에서 스냅샷 대시보드 디자인 스펙 정의 완료
- GameAnalytics의 사전 구축 대시보드와 Heroic Labs Satori의 커스텀 위젯 대시보드 모델을 참고

### 1.3 아키텍처

SPEC-GLO-002 디자인 스펙을 기반으로 Next.js 16 + Recharts + React Query 아키텍처로 스냅샷 대시보드를 구현한다. Mock API 엔드포인트 4개를 정의하여 프론트엔드 독립 개발이 가능하도록 설계한다.

### 1.4 기술 스택

| 영역 | 기술 | 용도 |
|------|------|------|
| 프레임워크 | Next.js 16, React 19 | 페이지 라우팅, 컴포넌트 |
| 언어 | TypeScript | 타입 안전성 |
| UI | Shadcn UI, Radix UI | 카드, 버튼, 레이아웃 컴포넌트 |
| 스타일 | Tailwind CSS 4 | 반응형 레이아웃, 색상 시스템 |
| 차트 | Recharts | LineChart, ComposedChart, BarChart |
| 데이터 패칭 | React Query | API 호출, 캐싱, 리페칭 |

---

## 2. 문서 ID 및 파일 체계

| 산출물 | 문서 ID | 파일명 |
|--------|---------|--------|
| UX 스펙 | UX-GLO-004 | `docs/05-ux/2026-03-26_UX_GLO_kpi-dashboard_v1.0.md` |
| 다이어그램 | DIA-GLO-004 | `docs/06-diagrams/2026-03-26_DIA_GLO_kpi-dashboard_v1.0.md` |

### 2.1 ID 체계 (신규)

| 항목 | ID 범위 | 비고 |
|------|---------|------|
| 기능 (Feature) | F-024 ~ F-027 | F-001~008 세그멘테이션, F-009~016 라이브 이벤트, F-017~023 A/B 테스트 |
| 화면 (Screen) | SCR-018 ~ SCR-019 | SCR-001~005 세그멘테이션, SCR-006~012 라이브 이벤트, SCR-013~017 A/B 테스트 |
| 다이어그램 | DIA-020 ~ DIA-021 | DIA-001~009 세그멘테이션, DIA-010~014 라이브 이벤트, DIA-015~019 A/B 테스트 |
| 결정사항 | D-024 ~ D-027 | D-001~010 킥오프/리서치/세그멘테이션, D-011~018 라이브 이벤트, D-019~023 A/B 테스트 |
| 액션아이템 | A-024 ~ A-027 | A-001~012 킥오프/리서치/세그멘테이션, A-013~018 라이브 이벤트, A-019~023 A/B 테스트 |
| 미결사항 | Q-024 ~ Q-027 | Q-001~009 킥오프/리서치/세그멘테이션, Q-010~015 라이브 이벤트, Q-016~023 A/B 테스트 |

---

## 3. 참조 문서

| 문서 | 경로 | 참조 내용 |
|------|------|----------|
| 경쟁사 분석 | `docs/01-research/2026-03-09_RES_GLO_competitor-analysis_v1.0.md` | Section 3.6 핵심 지표 대시보드, Must-Have #6 |
| KPI 대시보드 디자인 스펙 | `docs/superpowers/specs/2026-03-26-kpi-dashboard-design.md` | 레이아웃, 컴포넌트 상세, API 스펙, TypeScript 타입 |
| 스타일 가이드 | `shared/style-guide.md` | 문서 작성 표준 |
| 용어집 | `shared/terminology.md` | 용어 통일 |
| 네이밍 규칙 | `shared/conventions.md` | ID/파일명 규칙 |
| 리뷰 체크리스트 | `shared/review-checklist.md` | QA 기준 |
| meta.yml | `docs/meta.yml` | 문서 등록 |

---

## 4. 실행 계획

### 4.1 실행 순서

```
Task 1: UX 스펙 (uiux-spec) ──┐
Task 2: 다이어그램 (diagram)  ──┤ 병렬 실행
                               ↓
Task 3: meta.yml 업데이트 + 커밋
```

### 4.2 Task 1: UX 스펙 작성 (uiux-spec 에이전트)

**에이전트:** uiux-spec (Sonnet)
**산출물:** `docs/05-ux/2026-03-26_UX_GLO_kpi-dashboard_v1.0.md`

SPEC-GLO-002 디자인 스펙을 기반으로 KPI 대시보드 화면 정의서를 작성한다. UX-GLO-002(라이브 이벤트) 구조를 따른다.

**화면 정의서 구조:**

1. **Information Architecture**
   - 사이트맵: 좌측 사이드바 "개요(Overview)" 메뉴 하위 KPI 대시보드
   - 네비게이션: 대시보드 메인 화면, 기간 토글

2. **화면별 상세 정의**
   - SCR-018: KPI 대시보드 메인 — KPI Summary 카드 4개 + 회원 활동 트렌드 차트 + 리텐션 커브 차트 + 수익 트렌드 차트
   - SCR-019: 기간 토글 + 차트 인터랙션 상세 — 7D/30D/90D 전환, 툴팁

**포함 내용:**
- 기능별 UI 요소 (E-018-01 ~ E-018-07)
- 인터랙션 정의 (INT-018-01 ~ INT-018-04)
- Default / Loading / Error 상태 정의
- SPEC-GLO-002 Section 2 레이아웃 ASCII 아트 반영
- SPEC-GLO-002 Section 3 컴포넌트 상세 (색상, 스타일) 반영

**검증:** YAML front matter 필수 필드 확인 (id: UX-GLO-004), 화면 ID 연속성 (SCR-018~019), SPEC-GLO-002 컴포넌트와 화면 매핑 누락 확인

### 4.3 Task 2: 다이어그램 작성 (diagram 에이전트) — Task 1과 병렬

**에이전트:** diagram (Sonnet)
**산출물:** `docs/06-diagrams/2026-03-26_DIA_GLO_kpi-dashboard_v1.0.md`

SPEC-GLO-002를 기반으로 KPI 대시보드 다이어그램을 Mermaid로 작성한다. DIA-GLO-002 구조를 따른다.

**다이어그램 목록:**
- DIA-020: KPI 대시보드 데이터 플로우 — Browser → React Query hooks → API Routes → Mock Data Generators → Response, 4개 API 엔드포인트 포함
- DIA-021: 대시보드 컴포넌트 구조 — DashboardPage → KpiSummaryCards → KpiMetricCard(x4), ActivityTrendChart, RetentionCurveChart, RevenueTrendChart, PeriodToggle

**검증:** Mermaid 문법 렌더링 확인, SPEC-GLO-002 API 스펙과 데이터 플로우 정합성, 컴포넌트 계층 구조와 UX 화면 매핑

---

## 5. 결정 사항

| ID | 결정 내용 | 근거 |
|----|----------|------|
| D-024 | 스냅샷 대시보드 레이아웃: 상단 KPI 카드 4열 + 중단 회원 활동 트렌드(100%) + 하단 리텐션(50%)/수익(50%) 2열 구성 | SPEC-GLO-002 Section 2 레이아웃 확정, GameAnalytics 사전 구축 대시보드 패턴 참고 |
| D-025 | 3영역 균형 뷰: 회원 활동(DAU/세션), 리텐션(코호트 비교), 수익(매출/ARPU/ARPPU)을 한 화면에 배치 | 경쟁사 7/7 핵심 지표 제공, 운영자 의사결정에 3영역 동시 확인 필요 |
| D-026 | Mock 데이터 기반 개발: 4개 API 엔드포인트를 Mock으로 정의하여 프론트엔드 독립 개발 | 백엔드 의존성 없이 UI 우선 개발, API 스펙은 SPEC-GLO-002 Section 4에 정의 |
| D-027 | Recharts 라이브러리 채택: LineChart, ComposedChart, ResponsiveContainer 활용 | CLAUDE.md 기술 스택 정의, 반응형 차트 + 커스텀 툴팁 지원, 번들 크기 최적화 |

---

## 6. 액션 아이템

| ID | 내용 | 담당 | 상태 |
|----|------|------|------|
| A-024 | UX-GLO-004 작성: KPI 대시보드 화면 정의서 (SCR-018, SCR-019) | uiux-spec | in_progress |
| A-025 | DIA-GLO-004 작성: 데이터 플로우 다이어그램 (DIA-020), 컴포넌트 구조 다이어그램 (DIA-021) | diagram | in_progress |
| A-026 | PRD-GLO-004 작성: KPI 대시보드 PRD (F-024~F-027 기능 상세) | prd | pending |
| A-027 | meta.yml 업데이트: UX-GLO-004, DIA-GLO-004 문서 등록 | planner | pending |

---

## 7. 미결 사항

| ID | 질문 | 상태 |
|----|------|------|
| Q-024 | 세그먼트별 필터링(오디언스별 지표 분리)의 구현 시점을 v1.1 vs v2.0 중 어디로 할 것인가? | open |
| Q-025 | DAU 급락 등 임계값 기반 시각적 경고의 임계값 기준을 어떻게 설정할 것인가? | open |
| Q-026 | 데이터 Export(CSV/PDF) 기능을 KPI 대시보드 v1.0에 포함할 것인가, 후속 버전으로 미룰 것인가? | open |
| Q-027 | 실시간 스트리밍 데이터 지원 시 WebSocket vs SSE 중 어떤 방식을 채택할 것인가? | open |

---

## 8. 검증 기준

- 모든 문서가 `shared/style-guide.md` YAML front matter 규칙을 따르는지 확인
- 기능 ID(F-024~F-027), 화면 ID(SCR-018~019), 다이어그램 ID(DIA-020~021)가 기존 체계와 연속적인지 확인
- SPEC-GLO-002 컴포넌트 상세(Section 3)와 UX 화면 요소의 매핑이 완전한지 확인
- SPEC-GLO-002 API 스펙(Section 4)과 데이터 플로우 다이어그램의 정합성이 보장되는지 확인
- `docs/meta.yml`에 모든 신규 문서가 등록되었는지 확인

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| v1.0 | 2026-03-26 | KPI 대시보드 기획 계획 문서 최초 작성 | planner |
