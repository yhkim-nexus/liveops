---
id: "SES-GLO-006"
title: "기획 세션: 역할 기반 접근 제어 (RBAC)"
project: "Game LiveOps Service"
version: "v1.0"
status: "approved"
created: "2026-03-26"
updated: "2026-03-26"
author: "planner"
reviewers: []
related_docs:
  - "RES-GLO-002"
  - "SPEC-GLO-003"
  - "PRD-GLO-002"
tags:
  - "project:game-liveops"
  - "type:session"
  - "status:approved"
  - "phase:planning"
  - "feature:rbac"
---

# 기획 세션: 역할 기반 접근 제어 (RBAC)

> LiveOps 관리자 대시보드에 Admin/Operator/Viewer 3역할 기반 접근 제어를 도입하고, Mock 인증·Middleware 라우트 보호·관리자 관리·감사 로그 기능의 기획 산출물(UX 스펙, 다이어그램)을 생성하는 계획을 정의한다.

## 문서 정보

| 항목 | 내용 |
|------|------|
| ID | SES-GLO-006 |
| 버전 | v1.0 |
| 상태 | approved |
| 작성일 | 2026-03-26 |
| 작성자 | planner |

---

## 1. 프로젝트 개요

### 1.1 목적

관리자 권한을 역할별로 분리하여 LiveOps 대시보드의 기능 접근을 제어한다. Admin(전체 권한), Operator(운영 기능), Viewer(읽기 전용) 3개 역할 계층을 정의하고, 관리자 액션을 감사 로그로 기록한다.

### 1.2 배경

- RES-GLO-002 경쟁사 분석에서 "역할 기반 접근 제어(RBAC)"는 Must-Have #8로 분류 — 5/7 경쟁 플랫폼이 RBAC 지원
- SSO 연동(3/7), 감사 로그(4/7) 순으로 지원 확인
- PRD-GLO-002(라이브 이벤트)에서 `event_approver` 역할이 승인 워크플로우(F-011, REQ-011-03)에 이미 정의되어 통합 RBAC 시스템 필요
- 벤치마킹: Metaplay의 커스텀 역할 + 세분화 권한 모델, Hive Console의 운영자 친화적 UI

### 1.3 아키텍처

Next.js Middleware 기반 라우트 보호 — Middleware에서 JWT 세션 검증과 역할 기반 라우트 접근 검사를 수행한다. 3역할 계층(Admin/Operator/Viewer)으로 구성하며 상위 역할은 하위 역할의 모든 권한을 자동 포함한다.

### 1.4 기술 스택

| 영역 | 기술 | 용도 |
|------|------|------|
| 인증 미들웨어 | Next.js 16 Middleware | 세션 검증 + 라우트 보호 |
| JWT | jose | 세션 토큰 서명/검증 |
| 폼 검증 | Zod + React Hook Form | 로그인, 초대 폼 |
| UI 컴포넌트 | Shadcn UI (Table, Badge, Select, Input, Button) | 관리자 목록, 감사 로그, 로그인 |
| 데이터 패칭 | React Query | API 호출, 캐싱 |

---

## 2. 문서 ID 및 파일 체계

| 산출물 | 문서 ID | 파일명 |
|--------|---------|--------|
| UX 스펙 | UX-GLO-005 | `docs/05-ux/2026-03-26_UX_GLO_rbac_v1.0.md` |
| 다이어그램 | DIA-GLO-005 | `docs/06-diagrams/2026-03-26_DIA_GLO_rbac_v1.0.md` |

### 2.1 ID 체계 (신규)

| 항목 | ID 범위 | 비고 |
|------|---------|------|
| 기능 (Feature) | F-028 ~ F-033 | F-001~027 기존 기능 |
| 화면 (Screen) | SCR-020 ~ SCR-025 | SCR-001~019 기존 화면 |
| 다이어그램 | DIA-022 ~ DIA-024 | DIA-001~021 기존 다이어그램 |
| 결정사항 | D-028 ~ D-032 | D-001~027 기존 결정사항 |
| 액션아이템 | A-025 ~ A-028 | A-001~024 기존 액션아이템 |
| 미결사항 | Q-020 ~ Q-023 | Q-001~019 기존 미결사항 |

---

## 3. 참조 문서

| 문서 | 경로 | 참조 내용 |
|------|------|----------|
| 경쟁사 분석 | `docs/01-research/2026-03-09_RES_GLO_competitor-analysis_v1.0.md` | Section 3.8 RBAC, Must-Have #8 |
| RBAC 디자인 스펙 | `docs/superpowers/specs/2026-03-26-rbac-design.md` | 전체 설계 (역할 모델, 인증, API, UI) |
| 라이브 이벤트 PRD | `docs/03-prd/2026-03-23_PRD_GLO_live-events_v1.0.md` | F-011 승인 워크플로우, event_approver |
| 스타일 가이드 | `shared/style-guide.md` | 문서 작성 표준 |
| 용어집 | `shared/terminology.md` | 용어 통일 |
| 네이밍 규칙 | `shared/conventions.md` | ID/파일명 규칙 |
| 리뷰 체크리스트 | `shared/review-checklist.md` | QA 기준 |

---

## 4. 실행 계획

### 4.1 실행 순서

```
Task 1: UX 스펙 (uiux-spec)  ──┐
Task 2: 다이어그램 (diagram)   ──┤ 병렬 실행
                                ↓
meta.yml 업데이트 + 커밋
```

### 4.2 Task 1: UX 스펙 작성 (uiux-spec 에이전트)

**에이전트:** uiux-spec (Sonnet)
**산출물:** `docs/05-ux/2026-03-26_UX_GLO_rbac_v1.0.md`

SPEC-GLO-003을 기반으로 RBAC 화면 정의서를 작성한다. UX-GLO-002(라이브 이벤트) 구조를 따른다.

**화면 정의서 구조:**

1. **Information Architecture** — 사이트맵, 역할별 네비게이션 필터링
2. **화면별 상세 정의**
   - SCR-020: 로그인 페이지 (`/login`)
   - SCR-021: GNB (역할별 메뉴 필터링)
   - SCR-022: 관리자 목록 (`/settings/admins`)
   - SCR-023: 관리자 초대 (`/settings/admins/invite`)
   - SCR-024: 감사 로그 (`/settings/audit-log`)
   - SCR-025: 403 페이지

**검증:** SPEC-GLO-003 Section 6 → SCR-020~025 매핑 완전성, 모든 화면에 Default/Empty/Loading/Error 상태 정의, 인터랙션 ID 연속성

### 4.3 Task 2: 다이어그램 작성 (diagram 에이전트) — Task 1과 병렬

**에이전트:** diagram (Sonnet)
**산출물:** `docs/06-diagrams/2026-03-26_DIA_GLO_rbac_v1.0.md`

SPEC-GLO-003을 기반으로 RBAC 다이어그램을 Mermaid로 작성한다. DIA-GLO-002 구조를 따른다.

**다이어그램 목록:**
- DIA-022: 인증 플로우 (시퀀스 다이어그램) — 로그인 → JWT 발급 → 쿠키 설정 → 리다이렉트
- DIA-023: Middleware 라우트 보호 플로우 (플로우차트) — 공개 경로 판단 → 쿠키 확인 → JWT 검증 → 역할 검사
- DIA-024: 역할 계층 + 라우트 매핑 (ERD-style 그래프) — Admin/Operator/Viewer 계층과 라우트 접근 매핑

**검증:** Mermaid 문법 렌더링 확인, SPEC-GLO-003 라우트 규칙과 정합성

---

## 5. 결정 사항

| ID | 결정 내용 | 근거 |
|----|----------|------|
| D-028 | 3역할 Admin/Operator/Viewer 계층적 모델 채택 | RES-GLO-002 경쟁사 5/7 RBAC 지원, 단순 계층 모델이 MVP에 적합 |
| D-029 | Mock 인증 방식 (이메일/비밀번호 + JWT 세션) 채택, 실제 SSO는 후속 버전 | MVP 개발 속도 우선, SSO는 v1.1에서 NextAuth.js 통합 |
| D-030 | Next.js Middleware 기반 라우트 보호 | 서버 사이드에서 매 요청마다 세션 + 역할 검증, 클라이언트 우회 방지 |
| D-031 | Operator 역할에 event_approver 권한 포함 | PRD-GLO-002 F-011 승인 워크플로우와 통합, 별도 권한 분리 불필요 |
| D-032 | 기본 감사 로그 MVP 포함 (로그인/로그아웃/역할변경/계정생성) | RES-GLO-002에서 4/7 경쟁사 감사 로그 지원, 운영 투명성 확보 |

---

## 6. 액션 아이템

| ID | 내용 | 담당 | 상태 |
|----|------|------|------|
| A-025 | UX-GLO-005 RBAC 화면 정의서 작성: 로그인, GNB, 관리자 관리, 감사 로그, 403 페이지 | uiux-spec | in_progress |
| A-026 | DIA-GLO-005 RBAC 다이어그램 작성: 인증 플로우, Middleware 플로우, 역할 계층 | diagram | in_progress |
| A-027 | SPEC-GLO-003 기반 프론트엔드 구현 착수 (Mock 인증 + Middleware + 관리자 UI) | senior-frontend-developer | pending |
| A-028 | 기존 라이브 이벤트 UI(SCR-006~012)에 RoleGate 컴포넌트 적용 | senior-frontend-developer | pending |

---

## 7. 미결 사항

| ID | 질문 | 상태 |
|----|------|------|
| Q-020 | SSO 연동(Google, GitHub) 도입 시점을 v1.1 vs v1.2 중 어디로 확정할 것인가? | open |
| Q-021 | 커스텀 역할 생성 기능의 우선순위와 구현 시점은? | open |
| Q-022 | Safety Lock 기능(위험 작업 2차 확인, Metaplay 패턴)의 MVP 포함 여부는? | open |
| Q-023 | 프로젝트(게임)별 접근 분리 모델의 데이터 구조는 어떻게 설계할 것인가? | open |

---

## 8. 검증 기준

- 모든 문서가 `shared/style-guide.md` YAML front matter 규칙을 따르는지 확인
- 기능 ID(F-028~F-033), 화면 ID(SCR-020~025), 다이어그램 ID(DIA-022~024)가 기존 체계와 연속적인지 확인
- SPEC-GLO-003의 역할 모델(Section 2), 라우트 보호(Section 4), UI 화면(Section 6)과 UX/DIA 문서의 정합성 보장
- PRD-GLO-002 F-011(event_approver)과 Operator 역할 매핑의 일관성 확인
- 역할별 네비게이션 필터링(SPEC-GLO-003 Section 6.2)이 UX 스펙에 정확히 반영되었는지 확인

---

## 기능 목록

| ID | 기능명 | 설명 | 우선순위 |
|----|--------|------|---------|
| F-028 | Mock 인증 | 이메일/비밀번호 로그인, JWT 세션 발급, 로그아웃, 세션 관리 (24시간 만료) | P0 |
| F-029 | 역할 모델 | Admin(level 3)/Operator(level 2)/Viewer(level 1) 계층적 역할 정의 및 권한 매핑 | P0 |
| F-030 | Middleware 라우트 보호 | Next.js Middleware에서 매 요청마다 세션 검증 + 역할 기반 라우트 접근 제어 | P0 |
| F-031 | 관리자 관리 | 관리자 목록 조회, 초대(생성), 역할 변경, 계정 정지/활성화 (Admin 전용) | P0 |
| F-032 | 감사 로그 | 로그인/로그아웃/역할변경/계정생성 등 관리자 액션 기록 및 조회 (Admin 전용) | P1 |
| F-033 | GNB 역할 기반 네비게이션 | 관리자 역할에 따라 GNB 메뉴 항목 필터링 (Viewer: 1개, Operator: 4개, Admin: 5개) | P0 |

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| v1.0 | 2026-03-26 | RBAC 기획 세션 문서 최초 작성 | planner |
