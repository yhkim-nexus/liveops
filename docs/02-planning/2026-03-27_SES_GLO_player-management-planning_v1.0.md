---
id: "SES-GLO-007"
title: "기획 세션: 플레이어 상태 조회 및 계정 조치"
project: "Game LiveOps Service"
version: "v1.1"
status: "approved"
created: "2026-03-27"
updated: "2026-03-27"
author: "planner"

reviewers: []
related_docs:
  - "RES-GLO-002"
  - "SPEC-GLO-003"
tags:
  - "project:game-liveops"
  - "type:session"
  - "status:approved"
  - "phase:planning"
  - "feature:player-management"
---

# 기획 세션: 플레이어 상태 조회 및 계정 조치

> LiveOps 관리자 대시보드에서 개별 플레이어를 검색·조회하고, 계정 차단/해제/닉네임 변경 등 운영 조치를 수행하는 기능의 기획 산출물(PRD, UX 스펙, 다이어그램)을 생성하는 계획을 정의한다.

## 문서 정보

| 항목 | 내용 |
|------|------|
| ID | SES-GLO-007 |
| 버전 | v1.0 |
| 상태 | approved |
| 작성일 | 2026-03-27 |
| 작성자 | planner |

---

## 1. 프로젝트 개요

### 1.1 목적

운영팀이 개별 플레이어의 상태를 검색·조회하고, 계정 차단/해제/닉네임 변경 등 운영 조치를 수행할 수 있는 플레이어 관리 기능을 정의한다. Must-Have #7 "플레이어 상태 조회" 및 "계정 조치" 요구사항을 충족한다.

### 1.2 배경

- RES-GLO-002 경쟁사 분석에서 "플레이어 상태 조회"는 Must-Have #7로 분류 — 5/7 경쟁 플랫폼이 플레이어 관리 기능 지원
- "계정 조치(차단/해제)"는 Must-Have로 분류 — 4/7 경쟁 플랫폼이 계정 조치 기능 지원
- 벤치마킹: Metaplay의 플레이어 프로필 통합 뷰 + 실시간 검색, 계정 조치 이력 추적 모델
- 현재 구현체(`apps/admin/src/features/players/`)에 Mock 데이터 기반 플레이어 목록, 상세, 차단/해제/닉네임 변경이 이미 존재하며, 이를 기획 문서로 정규화한다

### 1.3 아키텍처

Next.js 기반 클라이언트 사이드 렌더링 — React Query로 Mock API를 호출하고, 300ms 디바운스 검색과 페이지네이션으로 플레이어 목록을 제공한다. 상세 페이지에서 계정 조치(차단/해제/닉네임 변경)를 수행하며, RBAC 기반 Operator 이상 권한이 필요하다.

### 1.4 기술 스택

| 영역 | 기술 | 용도 |
|------|------|------|
| 검색 UI | Shadcn UI (Input, Table, Button) | 통합 검색바, 결과 테이블 |
| 디바운스 | Custom useDebounce Hook (300ms) | 검색 입력 최적화 |
| 데이터 패칭 | React Query | 플레이어 목록/상세 API 호출, 캐싱 |
| 폼/다이얼로그 | Shadcn UI (Dialog, Textarea, Label) | 차단 사유 입력, 닉네임 변경 |
| 권한 제어 | useAuth + RBAC | Operator 이상 계정 조치 접근 |

---

## 2. 문서 ID 및 파일 체계

| 산출물 | 문서 ID | 파일명 |
|--------|---------|--------|
| PRD | PRD-GLO-006 | `docs/03-prd/2026-03-27_PRD_GLO_player-management_v1.0.md` |
| UX 스펙 | UX-GLO-006 | `docs/05-ux/2026-03-27_UX_GLO_player-management_v1.0.md` |
| 다이어그램 | DIA-GLO-006 | `docs/06-diagrams/2026-03-27_DIA_GLO_player-management_v1.0.md` |

### 2.1 ID 체계 (신규)

| 항목 | ID 범위 | 비고 |
|------|---------|------|
| 기능 (Feature) | F-034 ~ F-036 | F-001~033 기존 기능 |
| 화면 (Screen) | SCR-026 ~ SCR-027 | SCR-001~025 기존 화면 |
| 다이어그램 | DIA-025 ~ DIA-028 | DIA-001~024 기존 다이어그램 |
| 결정사항 | D-033 ~ D-035 | D-001~032 기존 결정사항 |
| 액션아이템 | A-032 ~ A-034 | A-001~031 기존 액션아이템 |

---

## 3. 참조 문서

| 문서 | 경로 | 참조 내용 |
|------|------|----------|
| 경쟁사 분석 | `docs/01-research/2026-03-09_RES_GLO_competitor-analysis_v1.0.md` | Section 3.7 플레이어 관리, Must-Have #7 |
| RBAC PRD | `docs/03-prd/2026-03-26_PRD_GLO_rbac_v1.0.md` | Operator 역할 권한, 감사 로그 |
| Player 타입 정의 | `apps/admin/src/features/players/types/player.ts` | Player 인터페이스, PlayerStatus, Platform |
| Mock 데이터 | `apps/admin/src/features/players/lib/mock-players.ts` | Mock 플레이어 데이터 구조 |
| 스타일 가이드 | `shared/style-guide.md` | 문서 작성 표준 |
| 용어집 | `shared/terminology.md` | 용어 통일 |
| 네이밍 규칙 | `shared/conventions.md` | ID/파일명 규칙 |
| 리뷰 체크리스트 | `shared/review-checklist.md` | QA 기준 |

---

## 4. 실행 계획

### 4.1 실행 순서

```
Task 1: PRD 작성 (prd)           ──┐
Task 2: UX 스펙 (uiux-spec)      ──┤ 병렬 실행
Task 3: 다이어그램 (diagram)      ──┤
                                   ↓
meta.yml 업데이트 + 커밋
```

### 4.2 Task 1: PRD 작성 (prd 에이전트)

**에이전트:** prd (Sonnet)
**산출물:** `docs/03-prd/2026-03-27_PRD_GLO_player-management_v1.0.md`

플레이어 검색, 프로필 상세, 계정 조치 3개 기능(F-034~F-036)의 요구사항을 정의한다. PRD-GLO-005(RBAC) 구조를 따른다.

**기능 범위:**
1. **F-034: 플레이어 검색** — 통합 검색(ID/닉네임/이메일), 300ms 디바운스, 결과 테이블, 페이지네이션
2. **F-035: 플레이어 프로필 상세** — 기본 정보, 소속 오디언스, 계정 상태, 활동 이력
3. **F-036: 계정 조치** — 차단(사유 10자 이상), 해제, 닉네임 변경, RBAC(Operator 이상)

**검증:** 기존 구현체(`apps/admin/src/features/players/`)와 데이터 모델 정합성, RBAC 권한 모델과의 일관성

### 4.3 Task 2: UX 스펙 작성 (uiux-spec 에이전트) — Task 1과 병렬

**에이전트:** uiux-spec (Sonnet)
**산출물:** `docs/05-ux/2026-03-27_UX_GLO_player-management_v1.0.md`

플레이어 관리 화면 정의서를 작성한다. UX-GLO-005(RBAC) 구조를 따른다.

**화면 정의서 구조:**
1. **SCR-026: 플레이어 목록** (`/players`) — 검색바, 결과 테이블, 페이지네이션, 상태 뱃지
2. **SCR-027: 플레이어 상세** (`/players/[id]`) — 기본 정보 카드, 소속 오디언스, 계정 조치 다이얼로그

**검증:** 모든 화면에 Default/Empty/Loading/Error 상태 정의, 인터랙션 ID 연속성

### 4.4 Task 3: 다이어그램 작성 (diagram 에이전트) — Task 1, 2와 병렬

**에이전트:** diagram (Sonnet)
**산출물:** `docs/06-diagrams/2026-03-27_DIA_GLO_player-management_v1.0.md`

플레이어 관리 다이어그램을 Mermaid로 작성한다. DIA-GLO-005(RBAC) 구조를 따른다.

**다이어그램 목록:**
- DIA-025: 플레이어 데이터 모델 (ERD) — Player 엔티티, PlayerStatus, Platform, ActionLog 관계
- DIA-026: 계정 조치 시퀀스 (시퀀스 다이어그램) — 관리자 → 조치 요청 → 권한 검증 → 조치 실행 → 감사 로그 기록
- DIA-027: 플레이어 상태 전이 (상태 다이어그램) — active/banned/suspended 간 전이
- DIA-028: 플레이어 검색 플로우 (플로우차트) — 검색어 입력 → 디바운스 → API 호출 → 결과 표시 → 상세 이동

**검증:** Mermaid 문법 렌더링 확인, Player 타입 정의와 정합성

---

## 5. 결정 사항

| ID | 결정 내용 | 근거 |
|----|----------|------|
| D-033 | 통합 검색 방식 채택 — 단일 검색바에서 플레이어 ID, 닉네임, 이메일을 동시에 검색 | 운영 효율성 우선, 별도 필터 조합보다 단일 검색이 CS 업무 패턴에 적합 |
| D-034 | 계정 조치는 Operator 이상 권한 필요 (RBAC 연동) | PRD-GLO-005 역할 모델과 통합, Viewer는 조회만 가능 |
| D-035 | 3가지 계정 조치 범위: 차단(ban), 해제(unban), 닉네임 변경(nickname change) | MVP 범위 최소화, 정지(suspend)와 데이터 삭제는 후속 버전에서 추가 |

---

## 6. 액션 아이템

| ID | 내용 | 담당 | 상태 |
|----|------|------|------|
| A-032 | PRD-GLO-006 플레이어 관리 PRD 작성: 검색, 프로필 상세, 계정 조치 3개 기능 정의 | prd | completed (→ PRD-GLO-006 v1.1) |
| A-033 | UX-GLO-006 플레이어 관리 화면 정의서 작성: 플레이어 목록, 플레이어 상세 2개 화면 | uiux-spec | completed (→ UX-GLO-006 v1.1) |
| A-034 | DIA-GLO-006 플레이어 관리 다이어그램 작성: 검색 플로우, 계정 조치 시퀀스, 데이터 모델 ERD | diagram | completed (→ DIA-GLO-006 v1.1) |

---

## 7. 미결 사항

| ID | 질문 | 상태 |
|----|------|------|
| Q-024 | 플레이어 검색 결과의 최대 표시 건수 제한은? 대량 데이터 시 서버 사이드 페이지네이션 전환 시점은? | open |
| Q-025 | 계정 조치 이력(감사 로그)을 플레이어 상세 페이지 내에 인라인으로 표시할 것인가, 별도 탭으로 분리할 것인가? | open |
| Q-026 | 일괄 계정 조치(Bulk Action) 기능의 우선순위와 구현 시점은? | open |

---

## 8. 검증 기준

- 모든 문서가 `shared/style-guide.md` YAML front matter 규칙을 따르는지 확인
- 기능 ID(F-034~F-036), 화면 ID(SCR-026~027), 다이어그램 ID(DIA-025~027)가 기존 체계와 연속적인지 확인
- Player 타입 정의(`apps/admin/src/features/players/types/player.ts`)와 PRD 데이터 모델의 정합성 보장
- PRD-GLO-005(RBAC)의 Operator 역할 권한과 계정 조치 접근 제어의 일관성 확인
- 기존 구현체(`apps/admin/src/app/players/`)의 UI 패턴과 UX 스펙의 정합성 보장

---

## 기능 목록

| ID | 기능명 | 설명 | 우선순위 |
|----|--------|------|---------|
| F-034 | 플레이어 검색 | 통합 검색바(ID/닉네임/이메일), 300ms 디바운스, 결과 테이블(상태 뱃지, 레벨, 플랫폼, 누적 결제), 페이지네이션(10건/페이지) | P0 |
| F-035 | 플레이어 프로필 상세 | 기본 정보(닉네임, 이메일, 레벨, 플랫폼, 국가, 누적 결제), 소속 오디언스 목록, 계정 상태(활성/차단/정지), 가입일/최근 로그인 | P0 |
| F-036 | 계정 조치 | 차단(사유 10자 이상 필수), 해제, 닉네임 변경, Operator 이상 권한 필요, 조치 시 감사 로그 기록 | P0 |

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| v1.0 | 2026-03-27 | 플레이어 관리 기획 세션 문서 최초 작성 | planner |
| v1.1 | 2026-03-27 | REV-GLO-004 리뷰 반영: DIA-025 설명 수정, 액션아이템 상태 갱신 | planner |
