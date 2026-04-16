---
id: "SES-GLO-004"
title: "플레이어 세그멘테이션 기획 문서 산출물 생성 계획"
project: "Game LiveOps Service"
version: "v1.1"
status: "approved"
created: "2026-03-10"
updated: "2026-03-26"
author: "planner"
reviewers: []
related_docs:
  - "SES-GLO-001"
  - "RES-GLO-001"
  - "RES-GLO-002"
  - "RES-GLO-003"
  - "MTG-GLO-002"
tags:
  - "project:game-liveops"
  - "type:session"
  - "status:approved"
  - "phase:planning"
  - "feature:player-segmentation"
---

# 기획 세션: 플레이어 세그멘테이션 기획 문서 산출물 생성 계획

> Heroic Labs Satori 심층 분석(RES-GLO-003)과 경쟁사 분석(RES-GLO-002)을 기반으로 플레이어 세그멘테이션 기능의 기획 산출물(회의록, PRD, UX 스펙, 다이어그램)을 생성하는 계획을 정의한다.

## 문서 정보

| 항목 | 내용 |
|------|------|
| ID | SES-GLO-004 |
| 버전 | v1.0 |
| 상태 | approved |
| 작성일 | 2026-03-10 |
| 작성자 | planner |

---

## 1. 프로젝트 개요

### 1.1 목적

CLAUDE.md 표준 워크플로우에 따라 meeting-note → PRD → (UX-Spec, Diagram) 병렬 순서로 에이전트를 실행하여 플레이어 세그멘테이션 기능의 기획 산출물을 생성한다. 세그멘테이션은 GLO 서비스의 모든 LiveOps 기능(Live Events, Experiments, Feature Flags, Messages)의 기반 축으로, 가장 먼저 기획되어야 하는 핵심 기능(P0)이다.

### 1.2 배경

- RES-GLO-002 경쟁사 분석에서 플레이어 세그멘테이션은 7/7 플랫폼이 지원하는 유일한 필수 공통 기능(100%)으로 확인
- Heroic Labs Satori 공식 문서 심층 분석(RES-GLO-003, 16페이지) 완료 — Identity-Properties-Audience 3계층 구조, 필터 DSL, 폼 빌더 UI 패턴 확보
- 세그멘테이션 없이 이벤트/A/B 테스트/피처 플래그를 운영하면 전체 플레이어에게 동일 경험을 제공하게 되어 LTV 개선 효과 제한
- 인디~중소 게임사 운영자의 비기술 친화적 도구 요청이 높음

### 1.3 아키텍처

각 에이전트는 Satori 심층 분석 결과(RES-GLO-003)와 경쟁사 분석(RES-GLO-002)의 패턴을 따른다. GLO 서비스 최초의 기능 기획이므로 이후 모든 기능(라이브 이벤트, A/B 테스트 등)의 기반 구조를 확립한다.

### 1.4 기술 스택

Markdown + YAML front matter, Mermaid (다이어그램)

---

## 2. 문서 ID 및 파일 체계

| 산출물 | 문서 ID | 파일명 |
|--------|---------|--------|
| 회의록 | MTG-GLO-003 | `docs/08-meeting-note/2026-03-10_MTG_GLO_player-segmentation-kickoff_v1.0.md` |
| PRD | PRD-GLO-001 | `docs/03-prd/2026-03-10_PRD_GLO_player-segmentation_v1.0.md` |
| UX 스펙 | UX-GLO-001 | `docs/05-ux/2026-03-10_UX_GLO_player-segmentation_v1.0.md` |
| 다이어그램 | DIA-GLO-001 | `docs/06-diagrams/2026-03-10_DIA_GLO_player-segmentation_v1.0.md` |
| 기획 세션 | SES-GLO-004 | `docs/02-planning/2026-03-10_SES_GLO_player-segmentation-planning_v1.0.md` |

### 2.1 ID 체계 (신규)

| 항목 | ID 범위 | 비고 |
|------|---------|------|
| 기능 (Feature) | F-001 ~ F-008 | GLO 서비스 최초 기능 체계 |
| 화면 (Screen) | SCR-001 ~ SCR-005 | GLO 서비스 최초 화면 체계 |
| 시나리오 | SC-001 ~ SC-003 | GLO 서비스 최초 시나리오 체계 |
| 다이어그램 | DIA-001 ~ DIA-009 | 시스템 아키텍처, ERD, 시퀀스, 플로우차트 등 |
| 결정사항 | D-007 ~ D-010 | D-001~006 킥오프/리서치 |
| 액션아이템 | A-008 ~ A-012 | A-001~007 킥오프/리서치 |
| 미결사항 | Q-006 ~ Q-009 | Q-001~005 킥오프/리서치 |

---

## 3. 참조 문서

| 문서 | 경로 | 참조 내용 |
|------|------|----------|
| 시장 분석 | `docs/01-research/2026-03-05_RES_GLO_market-analysis_v1.0.md` | 시장 현황, 14개 서비스 분석 |
| 경쟁사 분석 | `docs/01-research/2026-03-09_RES_GLO_competitor-analysis_v1.0.md` | 7개 플랫폼 심층 기능 비교, 8개 핵심 기능 카테고리 |
| Satori 심층 분석 | `docs/01-research/2026-03-10_RES_GLO_satori-segmentation_v1.0.md` | Identity-Properties-Audience 3계층, 필터 DSL, 폼 빌더 UI, Computed Properties |
| 경쟁사 분석 회의록 | `docs/08-meeting-note/2026-03-09_MTG_GLO_competitor-deep-analysis_v1.0.md` | 필수/권장/선택 우선순위, 8개 기능 카테고리 확정 |
| 스타일 가이드 | `shared/style-guide.md` | 문서 작성 표준 |
| 용어집 | `shared/terminology.md` | 용어 통일 |
| 네이밍 규칙 | `shared/conventions.md` | ID/파일명 규칙 |
| 리뷰 체크리스트 | `shared/review-checklist.md` | QA 기준 |
| meta.yml | `docs/meta.yml` | 문서 등록 |

---

## 4. 실행 계획

### 4.1 실행 순서

```
Task 1: 회의록 (meeting-note) — Satori 분석 기반 기획 킥오프
  ↓
Task 2: PRD (prd)
  ↓
Task 3: UX 스펙 (uiux-spec) ──┐
Task 4: 다이어그램 (diagram)  ──┤ 병렬 실행
                               ↓
Task 5: meta.yml 업데이트 + 커밋
```

### 4.2 Task 1: 회의록 작성 (meeting-note 에이전트)

**에이전트:** meeting-note (Haiku)
**산출물:** `docs/08-meeting-note/2026-03-10_MTG_GLO_player-segmentation-kickoff_v1.0.md`

Satori 심층 분석 결과를 기반으로 플레이어 세그멘테이션 기획 킥오프 회의 내용을 정리한다.

**포함 내용:**
- 참석자: 사용자, planner (진행), researcher (참고)
- 세션 유형: 구체화 (Feature Planning)
- 논의 내용:
  - 플레이어 세그멘테이션의 중요성 및 시장 현황 (7/7 플랫폼 필수 기능)
  - Satori 세그멘테이션 구조 분석 (Identity-Properties-Audience 3계층)
    - Default Properties: SDK 자동 수집 (countryCode, platform, createTime, updateTime)
    - Computed Properties: 이벤트 기반 자동 계산 (Count, SeenLast, ValueSum, ValueHigh/Low)
    - Custom Properties: 게임사 직접 정의 (VIP 등급, 길드명, 레벨)
  - 필터 표현식 DSL (시간 함수, 버전 매칭, 정규표현식)
  - 폼 빌더 UI (Satori 2.0+ 패턴, 비기술 운영자용)
  - Audience를 모든 LiveOps 기능의 공통 타겟팅 단위로 설계
  - 실시간 갱신 메커니즘 (10분 주기 자동 갱신 + API 즉시 갱신)
- 결정사항 (D-007~D-010)
- 액션아이템 (A-008~A-012)
- 신규 질문 (Q-006~Q-009)
- 참조: RES-GLO-003, RES-GLO-002, RES-GLO-001, MTG-GLO-002

**검증:** `shared/style-guide.md` YAML front matter 규칙 준수 확인. 필수 필드: id(MTG-GLO-003), title, project(GLO), version(v1.0), status(draft), created, updated, author(meeting-note)

### 4.3 Task 2: PRD 작성 (prd 에이전트)

**에이전트:** prd (Sonnet)
**산출물:** `docs/03-prd/2026-03-10_PRD_GLO_player-segmentation_v1.0.md`

Satori 분석(RES-GLO-003)과 경쟁사 분석(RES-GLO-002)을 기반으로 플레이어 세그멘테이션 PRD를 작성한다. GLO 서비스 최초 PRD로서 이후 모든 기능의 참조 기준이 된다.

**PRD 구조:**

1. **Overview**
   - 제품 비전: 인디~중소 게임사 기획자/운영자가 코드 없이 플레이어 행동 데이터 기반 정밀 세그먼트를 정의하고, 모든 LiveOps 기능에서 일관 재사용하는 통합 타겟팅 플랫폼
   - 배경 및 목적: 7/7 플랫폼 필수 기능, LTV 개선 효과, 비개발자 친화적 도구 필요
   - 성공 지표: 오디언스 생성 소요 시간(5분 이내), 갱신 지연(10분/30초), 초기 세그먼트 8개, 4종 LiveOps 연동률 100%

2. **Target Users**
   - Primary: 김지연 (게임 기획자/LiveOps 운영자) — 비개발자, 폼 빌더 중심
   - Secondary: 박현수 (개발자/기술 운영자) — 쿼리 모드, 외부 BI 연동

3. **사용자 시나리오**
   - SC-001: 신규 이벤트에 기존 오디언스 타겟팅 적용
   - SC-002: 이탈 결제자 복귀 캠페인 오디언스 신규 생성 (폼 빌더)
   - SC-003: 개발자가 쿼리 모드로 복잡한 오디언스 생성

4. **Features & Requirements**
   - F-001: 플레이어 속성 관리 (Default/Computed/Custom 3계층) — P0
   - F-002: 오디언스 생성 및 관리 (필터 표현식 기반 CRUD) — P0
   - F-003: 필터 표현식 시스템 (폼 빌더 UI + 쿼리 직접 입력 모드) — P0
   - F-004: 오디언스 실시간 갱신 및 멤버십 관리 (10분 주기/즉시 갱신, Sticky 멤버십) — P0
   - F-005: 오디언스 대시보드 및 분석 (멤버 수 추이, 오버랩 분석) — P1
   - F-006: 오디언스 타겟팅 연동 (Live Events, Experiments, Feature Flags, Messages 4종) — P0
   - F-007: 이벤트 택소노미 관리 (추적 이벤트 정의, Computed Properties 계산 규칙) — P0
   - F-008: 오디언스 임포트/익스포트 (CSV/API 기반 Managed Audience) — P2

   각 기능에 포함할 항목:
   - 개요, 사용자 스토리 (Given-When-Then), 요구사항 (REQ-{feature}-{nn})
   - 수용 기준 (AC-{feature}-{nn}, Gherkin), 비즈니스 규칙 (BR-{feature}-{nn})
   - 에러 처리, UI/UX 요구사항

5. **Non-Functional Requirements**
   - 오디언스 갱신 주기: 기본 10분, 즉시 갱신 30초 이내
   - 필터 표현식 유효성 검증: 실시간 문법 오류 감지율 100%
   - Custom Properties: 프로젝트당 최대 100개
   - 동시 오디언스 수: 제한 없음 (무제한 생성, 중첩 허용)

6. **Data Model**
   - IDENTITY (플레이어 기본 정보)
   - PLAYER_PROPERTY (Default/Computed/Custom 속성)
   - AUDIENCE (오디언스 정의, 필터 표현식)
   - AUDIENCE_MEMBERSHIP (오디언스-플레이어 멤버십)
   - EVENT_TAXONOMY (추적 이벤트 정의)
   - COMPUTED_PROPERTY_RULE (Computed Properties 계산 규칙)

7. **Dependencies** — SDK (이벤트 수집, 속성 자동 수집)

8. **Release Plan** — Phase 1 (MVP): F-001~F-007, Phase 2: F-008

**검증:** YAML front matter 필수 필드 확인 (id: PRD-GLO-001), 기능 ID 연속성 (F-001~F-008), 용어 통일 (`shared/terminology.md`)

### 4.4 Task 3: UX 스펙 작성 (uiux-spec 에이전트) — Task 2 완료 후

**에이전트:** uiux-spec (Sonnet)
**산출물:** `docs/05-ux/2026-03-10_UX_GLO_player-segmentation_v1.0.md`

PRD-GLO-001을 기반으로 세그멘테이션 화면 정의서를 작성한다. GLO 서비스 최초 화면 정의서로서 전체 관리자 대시보드의 네비게이션 구조를 확립한다.

**화면 정의서 구조:**

1. **Information Architecture**
   - 사이트맵: 좌측 사이드바 "세그멘테이션(Segmentation)" 메뉴 하위
   - 네비게이션: 오디언스, 속성 관리, 이벤트 택소노미 서브 탭
   - 경로: `/segmentation/audiences`, `/segmentation/audiences/new`, `/segmentation/audiences/:id`, `/segmentation/properties`, `/segmentation/taxonomy`
   - 전체 관리자 대시보드 좌측 사이드바 구조 정의 (Overview, Segmentation, Live Events, Experiments, Feature Flags, Messages)

2. **화면별 상세 정의**
   - SCR-001: 오디언스 목록 — 검색바, 상태 필터, 테이블(이름, 멤버 수, 최근 갱신, 참조 기능 수), "새 오디언스" CTA
   - SCR-002: 오디언스 생성/편집 — 폼 빌더 UI (드롭다운 기반 조건 추가, AND/OR 그룹핑), 쿼리 모드 전환 토글, 미리보기 패널(현재 멤버 수), 유효성 검증
   - SCR-003: 오디언스 상세 — 멤버 수 추이 차트, 멤버 목록 테이블, 참조 기능 목록, 필터 조건 요약
   - SCR-004: 속성 관리 — Default/Computed/Custom 3탭, Custom Properties CRUD, 참조 오디언스 표시
   - SCR-005: 이벤트 택소노미 — 이벤트 목록, 이벤트 등록/편집, 스키마 검증기

3. **공통 컴포넌트**
   - 폼 빌더 조건 행 (속성 선택 → 연산자 → 값 입력)
   - 오디언스 미리보기 카드 (예상 멤버 수)
   - 속성 타입 배지 (Default/Computed/Custom 색상 구분)

4. **Design Tokens** — GLO 서비스 기본 디자인 토큰 정의 (이후 모든 화면에서 재사용)

**검증:** PRD F-001~F-008 → SCR-001~005 매핑 누락 확인, 모든 화면에 Default/Empty/Loading/Error 상태 정의, 인터랙션 ID 연속성

### 4.5 Task 4: 다이어그램 작성 (diagram 에이전트) — Task 2 완료 후, Task 3과 병렬

**에이전트:** diagram (Sonnet)
**산출물:** `docs/06-diagrams/2026-03-10_DIA_GLO_player-segmentation_v1.0.md`

PRD-GLO-001과 Satori 분석(RES-GLO-003)을 기반으로 세그멘테이션 다이어그램을 Mermaid로 작성한다. GLO 서비스 최초 다이어그램으로서 핵심 시스템 아키텍처를 확립한다.

**다이어그램 목록:**
- DIA-001: 시스템 아키텍처 — 전체 컴포넌트 구성 (외부 시스템, 이벤트 수집, 핵심 엔진, LiveOps 모듈, 관리자 대시보드)
- DIA-002: ERD — IDENTITY 중심으로 PLAYER_PROPERTY, AUDIENCE, AUDIENCE_MEMBERSHIP, EVENT_TAXONOMY, COMPUTED_PROPERTY_RULE, LIVE_EVENT 연결
- DIA-003: Identity 프로필 갱신 시퀀스 — SDK → 이벤트 수집기 → Identity 엔진 → Properties 엔진 → Audience 엔진
- DIA-004: 오디언스 생성 시퀀스 — 관리자 → 폼 빌더 → 필터 평가 → 멤버십 계산 → 저장
- DIA-005: 오디언스 갱신 플로우차트 — 10분 주기 자동 갱신 vs API 즉시 갱신 분기
- DIA-006: 필터 표현식 평가 플로우차트 — 파싱 → 속성 조회 → 조건 평가 → 결과 반환
- DIA-007: LiveOps 타겟팅 통합 플로우차트 — 오디언스 참조 → 멤버십 확인 → 기능별 적용
- DIA-008: Computed Properties 계산 플로우차트 — 이벤트 수신 → 택소노미 매칭 → Count/SeenLast/ValueSum/ValueHigh/ValueLow 갱신
- DIA-009: 오디언스 멤버십 상태 다이어그램 — active/expired/sticky 상태 전이

**검증:** Mermaid 문법 렌더링 확인, PRD 데이터 모델과 ERD 정합성, 시스템 아키텍처가 Satori 분석 결과와 일치

### 4.6 Task 5: meta.yml 업데이트 및 커밋

**대상 파일:** `docs/meta.yml`

**documents 섹션 추가:**
- MTG-GLO-003 (회의록)
- PRD-GLO-001 (PRD)
- UX-GLO-001 (UX 스펙)
- DIA-GLO-001 (다이어그램)

**decisions 섹션 추가:**
- D-007: 플레이어 세그멘테이션을 GLO 서비스의 핵심 기능(P0)으로 확정
- D-008: Identity-Properties-Audience 3계층 속성 구조를 설계 기준으로 채택
- D-009: Audience를 모든 LiveOps 기능의 유일한 공통 타겟팅 단위로 설계
- D-010: 필터 표현식 DSL + 비기술 운영자용 폼 빌더 UI 병행

**action_items 섹션 추가:**
- A-008: 플레이어 세그멘테이션 PRD 작성
- A-009: 세그멘테이션 관리 화면 정의서 작성
- A-010: 세그멘테이션 데이터 흐름 다이어그램 작성
- A-011: 이벤트 택소노미 정의 (핵심 행동 이벤트 목록, Computed Properties 계산 규칙)
- A-012: MVP 초기 세그먼트 목록 확정 (기본 8개 세그먼트)

**open_issues 섹션 추가:**
- Q-006: 이벤트 택소노미 범위 (핵심 행동만 vs 상세 행동 포함)
- Q-007: MVP 출시 시 폼 빌더 UI만 제공할 것인가, 쿼리 모드도 함께 제공할 것인가
- Q-008: 10분 주기 갱신 지연이 수용 가능한 수준인가 (실시간 개입 필요 여부)
- Q-009: 외부 BI 시스템(Managed Audience) 연동을 Phase 1에 포함할 것인가

---

## 5. 결정 사항

| ID | 결정 내용 | 근거 |
|----|----------|------|
| D-007 | 플레이어 세그멘테이션을 GLO 서비스의 핵심 기능(P0)으로 확정 | 경쟁사 7/7 플랫폼 필수 기능, 모든 LiveOps 기능의 기반 축 |
| D-008 | Identity-Properties-Audience 3계층 속성 구조 채택 | Default(자동수집)/Computed(이벤트 기반)/Custom(사용자정의) 체계로 확장성과 자동화 동시 확보 |
| D-009 | Audience를 모든 LiveOps 기능의 유일한 공통 타겟팅 단위로 설계 | 단일 오디언스 정의 재사용으로 로직 중복 제거, 운영 일관성 확보 |
| D-010 | 필터 표현식 DSL + 비기술 운영자용 폼 빌더 UI 병행 | 폼 빌더로 코드 없이 세그먼트 생성, 쿼리 모드는 고급 조건용 옵션 (Satori 2.0+ 패턴) |

---

## 6. 액션 아이템

| ID | 내용 | 담당 | 상태 | 비고 |
|----|------|------|------|------|
| A-008 | 플레이어 세그멘테이션 PRD 작성 (기능 명세, 속성 체계, 필터 언어 스펙) | prd | completed | - |
| A-009 | 세그멘테이션 관리 화면 정의서 작성 (폼 빌더 UI, Audience 관리, 속성 관리) | uiux-spec | completed | - |
| A-010 | 세그멘테이션 데이터 흐름 다이어그램 작성 (Identity → Properties → Audience → LiveOps) | diagram | completed | - |
| A-011 | 이벤트 택소노미 정의 (핵심 행동 이벤트 목록, Computed Properties 계산 규칙) | planner | completed | PRD-GLO-001 F-007에서 정의됨 |
| A-012 | MVP 초기 세그먼트 목록 확정 (신규/활성/휴면/이탈/결제자 등 기본 8개) | planner | completed | PRD-GLO-001 F-002에서 8개 사전 정의 오디언스 확정 |

---

## 7. 미결 사항

| ID | 질문 | 상태 |
|----|------|------|
| Q-006 | 이벤트 택소노미의 범위를 어떻게 설정할 것인가? (핵심 행동만 vs 상세 행동 포함) | open |
| Q-007 | MVP 출시 시 폼 빌더 UI만 제공할 것인가, 쿼리 모드도 함께 제공할 것인가? | open |
| Q-008 | 10분 주기 갱신으로 인한 지연이 수용 가능한 수준인가? (실시간 개입 필요 여부) | open |
| Q-009 | 외부 BI 시스템(Managed Audience) 연동을 Phase 1에 포함할 것인가, Phase 2 이후로 미룰 것인가? | open |

---

## 8. 검증 기준

- 모든 문서가 `shared/style-guide.md` YAML front matter 규칙을 따르는지 확인
- 기능 ID(F-001~F-008), 화면 ID(SCR-001~005), 다이어그램 ID(DIA-001~009)가 GLO 서비스 최초 체계로서 올바르게 정의되었는지 확인
- Satori 분석(RES-GLO-003)의 핵심 패턴(3계층 속성, 필터 DSL, 폼 빌더)이 PRD에 반영되었는지 확인
- Audience 타겟팅 연동(F-006)이 Live Events, Experiments, Feature Flags, Messages 4종 모두를 커버하는지 확인
- `docs/meta.yml`에 모든 신규 문서가 등록되었는지 확인

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| v1.0 | 2026-03-10 | 플레이어 세그멘테이션 기획 계획 문서 최초 작성 | planner |
| v1.1 | 2026-03-26 | REV-GLO-003 리뷰 반영: 문서 ID 자기참조 추가, A-011/A-012 상태 갱신 | planner |
