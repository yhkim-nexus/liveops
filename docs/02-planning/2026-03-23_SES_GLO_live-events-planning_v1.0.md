---
id: "SES-GLO-003"
title: "라이브 이벤트 생성 및 스케줄링 기획 문서 산출물 생성 계획"
project: "Game LiveOps Service"
version: "v1.0"
status: "approved"
created: "2026-03-23"
updated: "2026-03-25"
author: "planner"
reviewers: []
related_docs:
  - "SES-GLO-001"
  - "PRD-GLO-001"
  - "RES-GLO-002"
  - "UX-GLO-001"
  - "DIA-GLO-001"
tags:
  - "project:game-liveops"
  - "type:session"
  - "status:approved"
  - "phase:planning"
  - "feature:live-events"
---

# 기획 세션: 라이브 이벤트 생성 및 스케줄링 기획 문서 산출물 생성 계획

> Phase 1 세그멘테이션 기반 위에 라이브 이벤트 생성·스케줄링·승인·모니터링 기능의 기획 산출물(회의록, PRD, UX 스펙, 다이어그램, 리뷰 리포트)을 생성하는 계획을 정의한다.

## 문서 정보

| 항목 | 내용 |
|------|------|
| ID | SES-GLO-003 |
| 버전 | v1.0 |
| 상태 | approved |
| 작성일 | 2026-03-23 |
| 작성자 | planner |

---

## 1. 프로젝트 개요

### 1.1 목적

CLAUDE.md 표준 워크플로우에 따라 meeting-note → PRD → (UX-Spec, Diagram) 병렬 → Reviewer 순서로 에이전트를 실행하여 라이브 이벤트 기능의 기획 산출물을 생성한다.

### 1.2 배경

- RES-GLO-002 경쟁사 분석에서 라이브 이벤트 관리는 7개 플랫폼 중 6개가 지원하는 Must-Have #3 기능으로 확인
- Phase 1 세그멘테이션(PRD-GLO-001)에서 구축한 AUDIENCE 테이블과 오디언스 타겟팅 인프라(F-006)를 직접 활용
- 이벤트 오배포·실수로 인한 운영 사고를 방지하기 위해 승인 워크플로우로 운영 안전성 확보 필요
- 벤치마킹: Satori의 이벤트 캘린더(1/2/4주 뷰), AccelByte의 시즌 패스 구조, Metaplay의 상태 기반 이벤트 관리

### 1.3 아키텍처

각 에이전트는 Phase 1 기존 문서(PRD-GLO-001, UX-GLO-001, DIA-GLO-001)의 패턴과 구조를 따른다. 특히 세그멘테이션 아키텍처(Identity-Properties-Audience 3계층)를 라이브 이벤트에 재적용한다.

### 1.4 기술 스택

Markdown + YAML front matter, Mermaid (다이어그램)

---

## 2. 문서 ID 및 파일 체계

| 산출물 | 문서 ID | 파일명 |
|--------|---------|--------|
| 회의록 | MTG-GLO-004 | `docs/08-meeting-note/2026-03-23_MTG_GLO_live-events_v1.0.md` |
| PRD | PRD-GLO-002 | `docs/03-prd/2026-03-23_PRD_GLO_live-events_v1.0.md` |
| UX 스펙 | UX-GLO-002 | `docs/05-ux/2026-03-23_UX_GLO_live-events_v1.0.md` |
| 다이어그램 | DIA-GLO-002 | `docs/06-diagrams/2026-03-23_DIA_GLO_live-events_v1.0.md` |
| 리뷰 리포트 | REV-GLO-001 | `docs/07-reviews/2026-03-23_REV_GLO_live-events-review_v1.0.md` |

### 2.1 ID 체계 (신규)

| 항목 | ID 범위 | 비고 |
|------|---------|------|
| 기능 (Feature) | F-009 ~ F-016 | F-001~008 세그멘테이션 |
| 화면 (Screen) | SCR-006 ~ SCR-012 | SCR-001~005 세그멘테이션 |
| 시나리오 | SC-004 ~ SC-006 | SC-001~003 세그멘테이션 |
| 다이어그램 | DIA-010 ~ DIA-014 | DIA-001~009 세그멘테이션 |
| 결정사항 | D-011 ~ D-018 | D-001~010 킥오프/리서치/세그멘테이션 |
| 액션아이템 | A-013 ~ A-018 | A-001~012 킥오프/리서치/세그멘테이션 |
| 미결사항 | Q-010 ~ Q-015 | Q-001~009 킥오프/리서치/세그멘테이션 |

---

## 3. 참조 문서

| 문서 | 경로 | 참조 내용 |
|------|------|----------|
| 경쟁사 분석 | `docs/01-research/2026-03-09_RES_GLO_competitor-analysis_v1.0.md` | Section 3.2 라이브 이벤트, Section 4.1 Must-Have 기능 |
| 세그멘테이션 PRD | `docs/03-prd/2026-03-10_PRD_GLO_player-segmentation_v1.0.md` | F-006 오디언스 타겟팅, AUDIENCE 테이블, Identity-Properties-Audience 3계층 |
| 세그멘테이션 UX | `docs/05-ux/2026-03-10_UX_GLO_player-segmentation_v1.0.md` | UX 패턴/네비게이션 참조 |
| 세그멘테이션 다이어그램 | `docs/06-diagrams/2026-03-10_DIA_GLO_player-segmentation_v1.0.md` | ERD 확장 참조, AUDIENCE 엔티티 |
| 스타일 가이드 | `shared/style-guide.md` | 문서 작성 표준 |
| 용어집 | `shared/terminology.md` | 용어 통일 |
| 네이밍 규칙 | `shared/conventions.md` | ID/파일명 규칙 |
| 리뷰 체크리스트 | `shared/review-checklist.md` | QA 기준 |
| meta.yml | `docs/meta.yml` | 문서 등록 |

---

## 4. 실행 계획

### 4.1 실행 순서

```
Task 1: 회의록 (meeting-note)
  ↓
Task 2: PRD (prd)
  ↓
Task 3: UX 스펙 (uiux-spec) ──┐
Task 4: 다이어그램 (diagram)  ──┤ 병렬 실행
                               ↓
Task 5: 리뷰 (reviewer)
  ↓
Task 6: meta.yml 업데이트 + 커밋
```

### 4.2 Task 1: 회의록 작성 (meeting-note 에이전트)

**에이전트:** meeting-note (Haiku)
**산출물:** `docs/08-meeting-note/2026-03-23_MTG_GLO_live-events_v1.0.md`

라이브 이벤트 기획 세션의 논의 과정을 회의록으로 정리한다. 기존 MTG-GLO-003 형식을 따른다.

**포함 내용:**
- 참석자: 사용자, planner (진행), prd (참고), uiux-spec (참고), diagram (참고)
- 안건: 라이브 이벤트 기능 기획 방향 논의
- 논의 내용:
  - 라이브 이벤트 기능의 위치와 중요도 (RES-GLO-002 기반)
  - 이벤트 데이터 모델 및 상태 머신 설계 (LIVE_EVENT 중심 6개 테이블)
  - 7단계 상태 머신 (draft → pending_approval → approved → scheduled → active → paused/ended → archived)
  - Sticky Membership 메커니즘 (active 진입 시 오디언스 스냅샷)
  - 승인 워크플로우 (기획자 요청 → 승인자 검토/승인/반려)
  - 스케줄링 (단순 + 반복 RFC 5545 rrule)
  - 긴급 제어 (Pause/Kill/Extend)
  - 캘린더/타임라인 뷰
  - 성과 대시보드
- 결정사항 (D-011~D-018)
- 액션아이템 (A-013~A-018)
- 신규 질문 (Q-010~Q-015)
- 참조: RES-GLO-002 Section 3.2, PRD-GLO-001 F-006

**검증:** `shared/style-guide.md` YAML front matter 규칙 준수 확인. 필수 필드: id(MTG-GLO-004), title, project(GLO), version(v1.0), status(draft), created, updated, author(meeting-note)

### 4.3 Task 2: PRD 작성 (prd 에이전트)

**에이전트:** prd (Sonnet)
**산출물:** `docs/03-prd/2026-03-23_PRD_GLO_live-events_v1.0.md`

경쟁사 분석(RES-GLO-002)과 세그멘테이션 PRD(PRD-GLO-001)를 기반으로 라이브 이벤트 PRD를 작성한다. PRD-GLO-001 구조를 따른다.

**PRD 구조:**

1. **Overview**
   - 제품 비전: 인디~중소 게임사 운영자가 코드 없이 라이브 이벤트를 생성·스케줄링·승인·모니터링하는 통합 이벤트 관리 시스템
   - 배경 및 목적: RES-GLO-002 Section 3.2 근거, PRD-GLO-001 오디언스 재사용
   - 성공 지표: 이벤트 생성 소요 시간(10분 이내), 승인 리드 타임(평균 2시간 이내), 동시 활성 이벤트 수(50개 이상), SDK 응답 시간(p99 100ms 이하)

2. **Target Users**
   - Primary: 김지연 (게임 기획자/LiveOps 운영자) — PRD-GLO-001 페르소나 재사용
   - Secondary: 박현수 (개발자/기술 운영자) — SDK 연동, 웹훅 수신
   - Tertiary: 이수정 (팀 리드/승인 권한자) — 이벤트 승인/반려

3. **사용자 시나리오**
   - SC-004: 주말 이벤트 생성 및 승인 요청 (기획자 → 승인자 플로우)
   - SC-005: 반복 이벤트 스케줄링 (매주 금요일 출석 보상, RFC 5545 rrule)
   - SC-006: 긴급 이벤트 일시정지 및 종료 (Pause → Kill 플로우)

4. **Features & Requirements** (경쟁사 분석 기반)
   - F-009: 라이브 이벤트 CRUD (생성, 조회, 수정, 삭제, 복제) — P0
   - F-010: 이벤트 스케줄링 (단순 시작/종료 + 반복 RFC 5545 rrule, 타임존 지원) — P0
   - F-011: 승인 워크플로우 (요청 → 검토 → 승인/반려, version_snapshot 저장) — P0
   - F-012: 오디언스 타겟팅 (PRD-GLO-001 F-006 연동 + 전체 플레이어, sticky_membership) — P0
   - F-013: 이벤트 상태 관리 (7단계 상태 머신 + 긴급 제어 Pause/Kill/Extend) — P0
   - F-014: 캘린더/타임라인 뷰 (1/2/4주/월 뷰, 겹침 표시, 필터링) — P1
   - F-015: 성과 대시보드 (참여 지표 + 수익 지표, 기준선 비교) — P1
   - F-016: 웹훅/알림 (상태 변경·승인 요청·긴급 조치 알림) — P1

   각 기능에 포함할 항목:
   - 개요, 사용자 스토리 (Given-When-Then), 요구사항 (REQ-{feature}-{nn})
   - 수용 기준 (AC-{feature}-{nn}, Gherkin), 비즈니스 규칙 (BR-{feature}-{nn})
   - 에러 처리, UI/UX 요구사항

5. **Non-Functional Requirements**
   - 성능: SDK 이벤트 응답 p99 100ms 이하
   - 동시 활성 이벤트: 50개 이상 정상 지원
   - SDK 캐시 TTL: 1분 (상태 변경 반영 지연 최소화)
   - 상태 전이 처리: 1초 이내

6. **Data Model**
   - LIVE_EVENT (이벤트 기본 정보, audience_id FK → AUDIENCE)
   - EVENT_SCHEDULE (단순/반복 스케줄, rrule)
   - EVENT_PHASE (다단계 페이즈, 확장 모델)
   - EVENT_APPROVAL (승인 이력, version_snapshot)
   - EVENT_METRICS (일별 성과 지표)
   - EVENT_STATE_LOG (상태 전이 감사 로그)

7. **Dependencies** — PRD-GLO-001 (오디언스/세그멘테이션), SDK

8. **Release Plan** — Phase 1 (MVP): F-009~F-016 전체

**검증:** YAML front matter 필수 필드 확인 (id: PRD-GLO-002), 기능 ID 연속성 (F-009~F-016), PRD-GLO-001 F-006 참조 정합성, 용어 통일 (`shared/terminology.md`)

### 4.4 Task 3: UX 스펙 작성 (uiux-spec 에이전트) — Task 2 완료 후

**에이전트:** uiux-spec (Sonnet)
**산출물:** `docs/05-ux/2026-03-23_UX_GLO_live-events_v1.0.md`

PRD-GLO-002를 기반으로 라이브 이벤트 화면 정의서를 작성한다. UX-GLO-001(세그멘테이션) 구조를 따른다.

**화면 정의서 구조:**

1. **Information Architecture**
   - 사이트맵: 좌측 사이드바 "라이브 이벤트(Live Events)" 메뉴 하위
   - 네비게이션: 이벤트 목록, 승인 대기, 캘린더, 타임라인 서브 탭
   - 경로: `/live-events`, `/live-events/new`, `/live-events/:id`, `/live-events/approvals`, `/live-events/calendar`, `/live-events/timeline`

2. **화면별 상세 정의**
   - SCR-006: 이벤트 목록 — 검색바, 상태 필터, 테이블, 페이지네이션, "새 이벤트" CTA
   - SCR-007: 이벤트 생성/편집 — 4단계 폼 (기본 정보, 스케줄링, 오디언스 타겟팅, 메타데이터/확인), 각 단계별 UI 요소
   - SCR-008: 승인 대기 — 승인 대기 목록, 이벤트 검토 상세 패널, 승인/반려 버튼 + 사유 입력
   - SCR-009: 캘린더 뷰 — 1/2/4주/월 뷰 전환, 이벤트 블록 드래그, 겹침 표시, 필터링
   - SCR-010: 타임라인 뷰 (Part 2) — 간트 차트 스타일 타임라인
   - SCR-011: 이벤트 상세 (Part 2) — 개요 탭, 승인 이력 탭, 상태 이력 탭
   - SCR-012: 성과 대시보드 — 참여율, 수익 영향, 기준선 비교 차트

3. **공통 컴포넌트**
   - 이벤트 상태 배지 (7개 상태 색상 정의)
   - 타임존 선택기
   - rrule 반복 규칙 빌더
   - 오디언스 선택 드롭다운 (PRD-GLO-001 연동)

4. **Design Tokens** — UX-GLO-001과 동일 토큰 재사용

**검증:** PRD F-009~F-016 → SCR-006~012 매핑 누락 확인, 모든 화면에 Default/Empty/Loading/Error 상태 정의, 인터랙션 ID 연속성

### 4.5 Task 4: 다이어그램 작성 (diagram 에이전트) — Task 2 완료 후, Task 3과 병렬

**에이전트:** diagram (Sonnet)
**산출물:** `docs/06-diagrams/2026-03-23_DIA_GLO_live-events_v1.0.md`

PRD-GLO-002를 기반으로 라이브 이벤트 다이어그램을 Mermaid로 작성한다. DIA-GLO-001 구조를 확장한다.

**다이어그램 목록:**
- DIA-010: ERD — LIVE_EVENT 중심으로 EVENT_SCHEDULE, EVENT_PHASE, EVENT_APPROVAL, EVENT_METRICS, EVENT_STATE_LOG 연결, AUDIENCE(DIA-GLO-001) 참조
- DIA-011: 이벤트 상태 머신 — 7단계 상태, 자동/수동 전이 조건, 역할별 전이 권한
- DIA-012: 이벤트 생성·승인 시퀀스 다이어그램 — 기획자 → 시스템 → 승인자 흐름, version_snapshot 저장 시점
- DIA-013: 이벤트 스케줄링 플로우차트 — 스케줄 타입 분기(단순/반복), 타임존 변환, 자동 상태 전이
- DIA-014: SDK 이벤트 조회 플로우차트 — SDK 요청 → 캐시 확인 → 활성 이벤트 필터 → 오디언스 멤버십 확인 → 이벤트 목록 반환

**검증:** Mermaid 문법 렌더링 확인, PRD 데이터 모델과 ERD 정합성, 상태 머신이 PRD Section 상태 정의와 일치

### 4.6 Task 5: 교차 검증 및 리뷰 (reviewer 에이전트) — Task 3, 4 완료 후

**에이전트:** reviewer (Sonnet)
**산출물:** `docs/07-reviews/2026-03-23_REV_GLO_live-events-review_v1.0.md`

PRD-GLO-002, UX-GLO-002, DIA-GLO-002를 `shared/review-checklist.md` 기준으로 교차 검증한다.

**검토 범위:**

- **개별 문서 검토:** review-checklist.md 체크리스트 적용 (PRD, UX, DIA 각각)
- **교차 문서 검토:**
  - 기능 추적: PRD F-009~F-016 → UX SCR-006~012 매핑 완전성
  - PRD F-009~F-016 → DIA-010~014 커버리지
  - 용어 일관성: `shared/terminology.md` 기준
  - ID 참조 유효성: 깨진 참조, 순환 참조 없음
- **이전 문서와의 정합성:**
  - PRD-GLO-001 F-006 (오디언스 타겟팅) 연동 정합성
  - DIA-GLO-001 AUDIENCE 엔티티 확장 정합성
  - UX-GLO-001 네비게이션 구조 일관성

**평가 기준:**
- Pass: Critical 0, Major 0, Minor ≤ 5
- Conditional: Critical 0, Major 1-3 → 피드백 전달 → 수정 → 재리뷰
- Fail: Critical ≥ 1 또는 Major ≥ 4 → 피드백 전달 → 수정 → 재리뷰

### 4.7 Task 6: meta.yml 업데이트 및 커밋

**대상 파일:** `docs/meta.yml`

**documents 섹션 추가:**
- MTG-GLO-004 (회의록)
- PRD-GLO-002 (PRD)
- UX-GLO-002 (UX 스펙)
- DIA-GLO-002 (다이어그램)
- REV-GLO-001 (리뷰 리포트)

**decisions 섹션 추가:**
- D-011: 라이브 이벤트 관리를 GLO 서비스 제2 우선순위 기능(P1)으로 확정
- D-012: 이벤트 상태 머신을 7단계로 정의
- D-013: Sticky Membership 메커니즘 도입 (active 진입 시 오디언스 스냅샷, 30일 후 자동 삭제)
- D-014: 2단계 승인 워크플로우 구현 (기획자 요청 → 승인자 검토/승인/반려)
- D-015: 단순 스케줄 + 반복 스케줄(RFC 5545 rrule) 모두 MVP 포함
- D-016: 3가지 긴급 제어 기능(Pause/Kill/Extend) MVP 포함
- D-017: 성과 대시보드는 Phase 2에서 상세 설계, MVP는 참여율만 실시간 제공
- D-018: PRD-GLO-002, UX-GLO-002, DIA-GLO-002 교차 검증 완료

**action_items 섹션 추가:**
- A-013: PRD-GLO-002 상세 수정 (승인 체크리스트 UI, 기준선 계산 방식)
- A-014: UX-GLO-002 Part 2 작성 (성과 대시보드, 타임라인 뷰)
- A-015: DIA-GLO-002 추가 다이어그램 (상태 머신 시각화, 승인 워크플로우 시퀀스)
- A-016: 라이브 이벤트 성과 지표 정의 확정
- A-017: 긴급 제어 시 권한 레벨 정의 및 감사 로그 스키마 설계
- A-018: SDK 이벤트 응답 캐싱 정책 수립

**open_issues 섹션 추가:**
- Q-010: 성과 대시보드의 기준선 계산 방식
- Q-011: 다단계 페이즈 구현 시점
- Q-012: Draft 상태 편집 횟수 제한 여부
- Q-013: Sticky Membership 스냅샷 저장소 확장성 (100만+ 멤버)
- Q-014: 이벤트 오디언스 삭제 시 처리 방식
- Q-015: 웹훅/알림 기능 MVP 포함 여부

---

## 5. 결정 사항

| ID | 결정 내용 | 근거 |
|----|----------|------|
| D-011 | 라이브 이벤트 관리를 GLO 서비스 제2 우선순위 기능(P1)으로 확정 | RES-GLO-002에서 6/7 경쟁 플랫폼 필수 기능 확인 |
| D-012 | 이벤트 상태 머신을 7단계로 정의 (draft→pending_approval→approved→scheduled→active→paused/ended→archived) | 이벤트 전 생명 주기 명확화, 상태별 관리자/시스템 액션 구분 |
| D-013 | Sticky Membership 메커니즘 도입 | 세그멘테이션 로직 중복 제거 + 이벤트 무결성 보장, Satori 검증 패턴 |
| D-014 | 2단계 승인 워크플로우 구현 | 이벤트 오배포 방지, 운영 안전성 확보 |
| D-015 | 단순 + 반복 스케줄(RFC 5545 rrule) 모두 MVP 포함 | 운영자 편의성, 경쟁사 표준 기능 |
| D-016 | 3가지 긴급 제어(Pause/Kill/Extend) MVP 포함 | 진행 중 이벤트 운영 이슈 즉시 대응 필수 |
| D-017 | 성과 대시보드는 Phase 2 상세 설계, MVP는 참여율만 실시간 제공 | 개발 리소스 조정, Phase 1 우선 집중 |
| D-018 | PRD/UX/DIA 3개 문서 교차 검증 완료 | 기능 ID 매핑, 화면-기능 정렬, 데이터 모델 검증 |

---

## 6. 액션 아이템

| ID | 내용 | 담당 | 상태 |
|----|------|------|------|
| A-013 | PRD-GLO-002 상세 수정: 승인 체크리스트 UI 목록화, 기준선 계산 방식 정의 | prd | in_progress |
| A-014 | UX-GLO-002 Part 2 작성: 성과 대시보드(SCR-011), 타임라인 뷰(SCR-010) | uiux-spec | pending |
| A-015 | DIA-GLO-002 추가: 상태 머신 시각화, 승인 워크플로우 시퀀스 | diagram | in_progress |
| A-016 | 라이브 이벤트 성과 지표 정의 확정 (참여율 계산, 매출 영향 산정, 기준선 비교 로직) | planner | pending |
| A-017 | 긴급 제어 시 권한 레벨 정의 및 감사 로그 스키마 설계 | prd | pending |
| A-018 | SDK 이벤트 응답 캐싱 정책 수립 (캐시 TTL 1분) | backend | pending |

---

## 7. 미결 사항

| ID | 질문 | 상태 |
|----|------|------|
| Q-010 | 성과 대시보드의 기준선 계산 방식을 어떻게 할 것인가? (인접 기간 평균 vs 작년 동기 vs 커스텀) | open |
| Q-011 | 다단계 페이즈(핸드아웃/메인/후속) 구현 시점을 Phase 2 vs Phase 3+ 중 어디로 할 것인가? | open |
| Q-012 | Draft 상태에서 몇 번까지 편집 가능할 것인가? (무제한 vs 최대 N회 vs 시간 제한) | open |
| Q-013 | Sticky Membership 스냅샷 저장소의 확장성: 100만+ 멤버 시 성능 영향은? | open |
| Q-014 | 이벤트 오디언스가 삭제되는 경우 처리 방식은? (자동 비활성화 vs 경고만 vs 전체 플레이어 전환) | open |
| Q-015 | 웹훅/알림 기능을 MVP에 포함할 것인가, Phase 2 확장으로 미룰 것인가? | open |

---

## 8. 검증 기준

- 모든 문서가 `shared/style-guide.md` YAML front matter 규칙을 따르는지 확인
- 기능 ID(F-009~F-016), 화면 ID(SCR-006~012), 다이어그램 ID(DIA-010~014)가 기존 체계와 연속적인지 확인
- reviewer 에이전트의 교차 검증 결과가 Pass인지 확인
- PRD-GLO-001 F-006(오디언스)과의 연동 정합성이 보장되는지 확인
- `docs/meta.yml`에 모든 신규 문서가 등록되었는지 확인

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| v1.0 | 2026-03-23 | 라이브 이벤트 기획 계획 문서 최초 작성 | planner |
