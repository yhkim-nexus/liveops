---
id: "REV-GLO-003"
title: "검토 리포트: 플레이어 세그멘테이션 기획 문서"
project: "GLO"
version: "v1.0"
status: "draft"
created: "2026-03-26"
updated: "2026-03-26"
author: "reviewer"
reviewers: []
related_docs:
  - "SES-GLO-004"
  - "PRD-GLO-001"
  - "DIA-GLO-001"
tags:
  - "project:game-liveops"
  - "type:review"
  - "topic:player-segmentation"
---

# 검토 리포트: 플레이어 세그멘테이션 기획 문서

## 문서 정보

| 항목 | 내용 |
|------|------|
| 리포트 ID | REV-GLO-003 |
| 검토일 | 2026-03-26 |
| 검토 유형 | 통합 (개별 + 교차) |
| 검토 대상 | SES-GLO-004, PRD-GLO-001, DIA-GLO-001 |
| 검토 기준 | shared/review-checklist.md, shared/terminology.md, shared/conventions.md, shared/style-guide.md |

---

## 1. 검토 요약

### 1.1 전체 평가

| 문서 | 버전 | 완결성 | 일관성 | 품질 | 결과 |
|------|------|--------|--------|------|------|
| SES-GLO-004 | v1.0 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ Pass |
| PRD-GLO-001 | v1.0 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⚠️ Conditional |
| DIA-GLO-001 | v1.0 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⚠️ Conditional |

**전체 판정**: ⚠️ Conditional (Major 이슈 해결 필요)

### 1.2 이슈 요약

| 심각도 | 개수 | 상태 |
|--------|------|------|
| 🔴 Critical | 0 | - |
| 🟡 Major | 3 | 수정 필요 |
| 🟢 Minor | 6 | 권장 |

---

## 2. 개별 문서 검토

---

### 2.1 Planning Session (SES-GLO-004)

**버전**: v1.0
**결과**: ✅ Pass

#### 체크리스트 결과

**공통 체크리스트**

| 항목 | 상태 | 비고 |
|------|------|------|
| YAML front matter 존재 | ✅ | |
| 필수 필드 완전 (id, title, version, status, created, author) | ✅ | |
| 버전 형식 올바름 (v1.0) | ✅ | |
| 상태값 유효 (approved) | ✅ | |
| 관련 문서 참조 정확 | ✅ | SES-GLO-001, RES-GLO-001~003, MTG-GLO-002 참조 |
| 변경 이력 존재 | ✅ | 섹션 8 하단 변경 이력 테이블 |
| 제목 레벨 구조 올바름 | ✅ | |

**기획 세션 체크리스트**

| 항목 | 상태 | 비고 |
|------|------|------|
| 프로젝트 개요 완결성 | ✅ | 목적/배경/아키텍처/기술 스택 명시 |
| 문서 ID 체계 정의 | ✅ | 섹션 2.1, 기능/화면/다이어그램/결정/액션/미결 ID 범위 정의 |
| 실행 계획 명확성 | ✅ | Task 1~5 순서 및 병렬 실행 구조 명시 |
| 결정 사항 (D-xxx) 근거 포함 | ✅ | D-007~D-010 모두 근거 명시 |
| 액션 아이템 (A-xxx) 상태 포함 | ✅ | A-008~A-012 담당자/상태 명시 |
| 미결 사항 (Q-xxx) 정의 | ✅ | Q-006~Q-009 open 상태 |

#### 잘된 점

- 8개 기능(F-001~F-008)의 우선순위, 범위, 담당 에이전트를 명확하게 정의하여 이후 산출물 작성의 명확한 가이드가 됨
- Task별 에이전트, 산출물 경로, YAML 검증 기준을 상세히 기술해 재현 가능성이 높음
- A-008~A-010이 `completed`로, A-011~A-012가 `pending`으로 구분 관리되어 진행 상황이 명확함
- 섹션 8 검증 기준이 구체적이고 측정 가능한 항목으로 구성됨

#### 개선 필요

| ID | 심각도 | 위치 | 이슈 | 제안 |
|----|--------|------|------|------|
| ISS-001 | 🟢 Minor | 섹션 2 문서 ID 체계 | SES 문서 자체(SES-GLO-004)가 문서 ID 체계 표에 포함되지 않음. 산출물 목록에 회의록/PRD/UX/다이어그램만 있고 기획 세션 문서는 자기 참조 항목이 없어 ID 체계 추적성이 불완전 | 문서 ID 체계 표 또는 참조 문서 섹션에 SES-GLO-004 자체를 명시적으로 기재 권장 |
| ISS-002 | 🟢 Minor | 섹션 6 액션 아이템 | A-011(이벤트 택소노미 정의)과 A-012(MVP 초기 세그먼트 목록 확정)이 `pending` 상태이나 마감일이 미정. 이 두 항목은 PRD F-007(이벤트 택소노미)과 F-002(사전 정의 오디언스 8개)에 직접 영향을 미치는 의존 관계임 | A-011, A-012에 마감일 또는 의존 문서(PRD-GLO-001)와의 관계를 명시. PRD에 이미 이벤트 택소노미와 사전 정의 오디언스가 정의된 경우 해당 액션 아이템을 `completed`로 갱신 |

---

### 2.2 PRD (PRD-GLO-001)

**버전**: v1.0
**결과**: ⚠️ Conditional

#### 체크리스트 결과

**공통 체크리스트**

| 항목 | 상태 | 비고 |
|------|------|------|
| YAML front matter 존재 | ✅ | |
| 필수 필드 완전 (id, title, version, status, created, author) | ✅ | |
| 버전 형식 올바름 (v1.0) | ✅ | |
| 상태값 유효 (draft) | ✅ | |
| 관련 문서 참조 정확 | ✅ | RES-GLO-001~003, MTG-GLO-003 |
| 변경 이력 존재 | ❌ | Appendix 포함 전체 문서에 변경 이력 섹션 없음 |
| 제목 레벨 구조 올바름 | ✅ | |

**PRD 체크리스트**

| 항목 | 상태 | 비고 |
|------|------|------|
| Overview 섹션 존재 | ✅ | 섹션 1, 비전/배경/성공 지표 포함 |
| Target Users 정의 | ✅ | 섹션 2, Primary/Secondary 페르소나 + 사용자 시나리오 3종 |
| Features & Requirements 존재 | ✅ | 섹션 3, F-001~F-008 |
| Non-Functional Requirements 존재 | ✅ | 섹션 4, 성능/보안/확장성/가용성/사용성 |
| Dependencies & Constraints 명시 | ✅ | 섹션 5 |
| Release Plan 존재 | ✅ | 섹션 6 |
| 모든 기능에 고유 ID | ✅ | F-001~F-008 |
| 우선순위 명시 (P0/P1/P2) | ✅ | P0: F-001~F-004, F-006~F-007, P1: F-005, P2: F-008 |
| 사용자 스토리 형식 사용 | ✅ | US-001~US-018, As a/I want to/So that 형식 |
| Acceptance Criteria 존재 (Given-When-Then) | ✅ | AC-{기능}-{nn} 체계로 기능별 Gherkin 시나리오 |
| 모호한 표현 없음 | ✅ | 구체적 수치 명시 (10분, 30초, 100개 등) |
| 측정 가능한 성공 지표 | ✅ | 섹션 1.3, 5개 지표 수치 명시 |
| 예외 상황 정의 | ✅ | 기능별 예외 처리 테이블 (ERR-{기능}-{nn}) |
| 리서치 결과 반영 | ✅ | RES-GLO-002~003 기반 3계층 속성 구조 반영 |

#### 잘된 점

- F-001~F-007 각 기능이 개요→사용자 스토리→요구사항→수용 조건→비즈니스 규칙→예외 처리→UI/UX 요구사항 구조로 일관되게 작성됨
- 사전 정의 오디언스 8개의 필터 표현식이 실제 DSL 문법으로 구체적으로 명세됨 (섹션 3.3)
- DSL 지원 함수 명세 테이블이 분류/함수/설명/예시로 체계적으로 정리됨 (섹션 3.4)
- 비기능 요구사항이 성능/보안/확장성/가용성/사용성 5개 축으로 수치 기반으로 명시됨
- 리스크 섹션(섹션 8)이 5개 항목의 영향도/발생 확률/대응 방안을 포함하여 완결됨

#### 개선 필요

| ID | 심각도 | 위치 | 이슈 | 제안 |
|----|--------|------|------|------|
| ISS-003 | 🟡 Major | Appendix C 핸드오프 / 전체 UI/UX 요구사항 | PRD 각 기능의 UI/UX 요구사항 및 Appendix C 핸드오프에서 참조하는 화면 ID 체계가 UX 스펙(UX-GLO-001)의 실제 화면 ID와 불일치. PRD는 SCR-001(속성 관리), SCR-002(오디언스 목록), SCR-003(오디언스 생성/편집), SCR-004(오디언스 분석), SCR-005(Live Event 타겟팅), SCR-006(이벤트 택소노미)으로 기재하나, UX-GLO-001은 SCR-001(오디언스 목록), SCR-002(오디언스 생성/편집), SCR-003(오디언스 상세), SCR-004(속성 관리), SCR-005(이벤트 택소노미)로 정의되어 번호와 화면 매핑이 전면 불일치함 | PRD의 UI/UX 요구사항 참조 화면 ID를 UX-GLO-001 실제 화면 ID에 맞게 전면 수정. F-001 관련 화면: SCR-004, F-002 관련 화면: SCR-001/SCR-002/SCR-003, F-003/F-004 관련 화면: SCR-002/SCR-003, F-005 관련 화면: SCR-001/SCR-003, F-006 관련 화면: 상위 기능 화면(범위 외), F-007 관련 화면: SCR-005 |
| ISS-004 | 🟡 Major | 전체 문서 | 변경 이력 섹션 누락. style-guide.md 1.3항 "변경 이력 작성됨" 필수 조건 미충족. 다이어그램(DIA-GLO-001)에는 변경 이력 테이블이 있으나 PRD에만 없음 | 문서 하단(Appendix 이전 또는 내)에 변경 이력 섹션 추가: "v1.0 / 2026-03-10 / 초안 작성 / prd" |
| ISS-005 | 🟢 Minor | 섹션 3.4, F-003, UI/UX 요구사항 | F-003 UI/UX 요구사항에서 "관련 화면: SCR-003 (오디언스 생성/편집 화면)"으로 기재되어 있으나 PRD 자체 체계에서도 SCR-002가 오디언스 생성/편집 화면임. ISS-003 수정 시 연동하여 정정 필요 | ISS-003 수정과 함께 처리 |
| ISS-006 | 🟢 Minor | 섹션 3.5, F-004, UI/UX 요구사항 | F-004 UI/UX 요구사항에서 "관련 화면: SCR-003 (오디언스 상세)"로 기재되어 있으나 PRD 자체 체계에서 SCR-003은 오디언스 생성/편집이고 오디언스 상세 화면은 별도로 명시되지 않음. UX-GLO-001에서 SCR-003이 오디언스 상세 화면임 | ISS-003 수정과 함께 처리 |
| ISS-007 | 🟢 Minor | 섹션 7 Open Questions | Q-006~Q-009는 SES-GLO-004에서 정의된 미결 사항과 동일 ID이나 Q-010이 추가됨. 그런데 SES-GLO-004의 Q-007, Q-008, Q-009에 대해 PRD에서 이미 결정이 반영된 사항이 있음 (예: Q-009는 Phase 2로 결정, Q-007은 쿼리 모드 병행 제공으로 기술). 미결 vs 결정 상태가 불명확 | PRD에서 이미 방향이 정해진 Q-007, Q-009는 "결정됨 (본 PRD 반영)"으로 표기하고, 실제 미결인 Q-006, Q-008, Q-010만 open으로 유지 |

---

### 2.3 Diagram (DIA-GLO-001)

**버전**: v1.0
**결과**: ⚠️ Conditional

#### 체크리스트 결과

**공통 체크리스트**

| 항목 | 상태 | 비고 |
|------|------|------|
| YAML front matter 존재 | ✅ | |
| 필수 필드 완전 (id, title, version, status, created, author) | ✅ | |
| 버전 형식 올바름 (v1.0) | ✅ | |
| 상태값 유효 (draft) | ✅ | |
| 관련 문서 참조 정확 | ✅ | PRD-GLO-001, UX-GLO-001, RES-GLO-003, MTG-GLO-003 |
| 변경 이력 존재 | ✅ | 문서 하단 변경 이력 테이블 |
| 제목 레벨 구조 올바름 | ✅ | |

**다이어그램 체크리스트**

| 항목 | 상태 | 비고 |
|------|------|------|
| Mermaid 문법 올바름 | ✅ | flowchart, erDiagram, sequenceDiagram, stateDiagram-v2 표준 문법 |
| 시작/종료 명확 | ✅ | stateDiagram: [*] → draft, archived → [*]. sequenceDiagram: autonumber 사용 |
| 분기 조건 명시 | ✅ | DIA-005에서 즉시/배치 재계산 분기, DIA-007에서 입력 방식/유효성 분기 |
| 모든 경로 도달 가능 | ✅ | Audience 상태 및 멤버십 상태 모두 도달 가능 경로 존재 |
| 예외 흐름 포함 | ✅ | DIA-007 문법 오류/유효성 오류 경로, DIA-005 즉시 재계산 조건 분기 |
| PRD 로직과 일치 | ⚠️ | ERD 일부 엔티티/필드 불일치. 상세 교차 검증 섹션 3 참조 |
| 화면정의서와 일치 | ✅ | 주요 흐름 일치 확인 |

#### 잘된 점

- 7종 다이어그램(시스템 아키텍처, 데이터 흐름, ERD, 오디언스 생성 시퀀스, 멤버십 갱신 시퀀스, 상태 다이어그램, 필터 처리 흐름)이 플레이어 세그멘테이션의 전체 시스템 구조를 완전히 커버
- DIA-001 시스템 아키텍처가 External/Ingestion/Core/LiveOps/Admin 5계층으로 명확히 계층 구분되어 있으며 Satori 분석(RES-GLO-003)의 구조를 충실히 반영
- DIA-006 상태 다이어그램에서 Audience 상태(draft/active/paused/archived)와 플레이어 멤버십 상태(not_member/member/sticky_member/excluded)를 분리하여 표현한 설계가 명확함
- DIA-007 필터 처리 흐름에서 폼 빌더 UI와 쿼리 직접 입력 두 경로를 모두 시각화하고 에러 경로까지 완결하게 표현

#### 개선 필요

| ID | 심각도 | 위치 | 이슈 | 제안 |
|----|--------|------|------|------|
| ISS-008 | 🟡 Major | DIA-003 ERD, 엔티티 구조 | DIA-003 ERD의 엔티티 구조가 PRD 데이터 모델(SES-GLO-004 섹션 4.3 Task 2 명세)과 불일치. PRD 데이터 모델은 IDENTITY, PLAYER_PROPERTY, AUDIENCE, AUDIENCE_MEMBERSHIP, EVENT_TAXONOMY, COMPUTED_PROPERTY_RULE 6개 엔티티를 정의하나, DIA-003 ERD는 PLAYER_PROPERTY를 DEFAULT_PROPERTY / COMPUTED_PROPERTY / CUSTOM_PROPERTY 3개로 분리하고 COMPUTED_PROPERTY_RULE을 별도 엔티티로 정의하지 않으며 EVENT_TAXONOMY가 ERD에 없음. PRD F-007 이벤트 택소노미의 데이터 모델(이벤트명, Computed Properties 계산 규칙)이 ERD에 미반영 | DIA-003 ERD에 EVENT_TAXONOMY 엔티티와 COMPUTED_PROPERTY_RULE 관련 엔티티(또는 테이블) 추가. PRD F-007 요구사항(REQ-007-01~07)에서 정의하는 이벤트-속성 연결 관계를 ERD에 반영. PLAYER_PROPERTY 분리 구조 또는 통합 구조 중 PRD와 일치하는 방향으로 정렬 |
| ISS-009 | 🟢 Minor | DIA-001, DIA-002, 관리자 서브그래프 | DIA-001 시스템 아키텍처에서 Admin 서브그래프 내 화면 구성(폼 빌더, Audience 관리, Analytics)이 UX-GLO-001의 실제 화면 구조(5개 화면)와 대응 관계가 명시되지 않음. 다이어그램 설명에 SCR ID 매핑이 없어 UX 문서와의 연결성이 낮음 | DIA-001 또는 문서 내 별도 매핑 테이블에서 아키텍처 컴포넌트와 UX 화면 ID(SCR-001~005) 간 대응 관계 명시 권장 |
| ISS-010 | 🟢 Minor | DIA-005, 멤버십 갱신 시퀀스 | DIA-005에서 즉시 재계산 트리거 조건이 "즉시 재계산 트리거 조건 충족"으로만 기재되어 있고 구체적 조건이 명시되지 않음. PRD F-004 REQ-004-02에서 관리자 수동 즉시 갱신을 정의하나, 시퀀스에서는 Properties 엔진이 자동으로 즉시 재계산을 트리거하는 조건처럼 표현되어 있어 PRD와 흐름 차이가 있음 | 즉시 재계산 트리거 조건을 "관리자 수동 즉시 갱신 요청(REQ-004-02)" 또는 "이벤트 기반 자동 트리거" 중 어느 것인지 명시. PRD와 정합성 있게 조건 기재 |
| ISS-011 | 🟢 Minor | DIA-006 상태 다이어그램, 플레이어 멤버십 | DIA-006 플레이어 멤버십 상태에서 SES-GLO-004 섹션 4.5 Task 4 기술에는 active/expired/sticky 3가지 상태가 언급되나, DIA-006은 not_member/member/sticky_member/excluded 4가지 상태로 구현됨. SES 문서 기술과 다이어그램 간 상태명 불일치 | SES-GLO-004 섹션 4.5 또는 DIA-006 중 하나를 기준으로 상태 이름을 통일. DIA-006의 not_member/member/sticky_member/excluded 4상태가 PRD F-004(Sticky 멤버십)와 더 정합성이 높으므로 SES 문서를 DIA 기준으로 수정 권장 |

---

## 3. 교차 문서 검증

### 3.1 기능 추적 매트릭스: PRD 기능 → 다이어그램

| PRD 기능 | 기능명 | DIA 반영 여부 | 해당 다이어그램 |
|----------|--------|--------------|---------------|
| F-001 | 플레이어 속성 관리 | ✅ | DIA-003 (ERD: DEFAULT/COMPUTED/CUSTOM_PROPERTY), DIA-002 (데이터 흐름: Properties 3종 갱신 경로), DIA-005 (멤버십 갱신 시 Properties 엔진 흐름) |
| F-002 | 오디언스 생성 및 관리 | ✅ | DIA-003 (ERD: AUDIENCE), DIA-004 (오디언스 생성 시퀀스), DIA-007 (필터 처리 흐름) |
| F-003 | 필터 표현식 시스템 | ✅ | DIA-007 (필터 표현식 처리 흐름 — 폼 빌더/쿼리 모드 분기), DIA-003 (ERD: AUDIENCE_FILTER) |
| F-004 | 오디언스 실시간 갱신 및 멤버십 관리 | ✅ | DIA-005 (멤버십 갱신 시퀀스 — 10분 배치/즉시 분기), DIA-006 (멤버십 상태 전이), DIA-003 (ERD: AUDIENCE_MEMBERSHIP) |
| F-005 | 오디언스 대시보드 및 분석 | - | 별도 다이어그램 없음. UI 기능으로 다이어그램 불필요 수준이나 데이터 조회 흐름 시퀀스 보완 가능 |
| F-006 | 오디언스 타겟팅 연동 | ✅ | DIA-001 (시스템 아키텍처: LiveOps 모듈 연결), DIA-002 (데이터 흐름: Audience 멤버십 → LiveOps), DIA-003 (ERD: LIVE_EVENT/EXPERIMENT/FEATURE_FLAG/MESSAGE 참조) |
| F-007 | 이벤트 택소노미 관리 | ⚠️ | DIA-002 (데이터 흐름: Computed Properties 이벤트 기반 갱신), DIA-005 (멤버십 갱신 중 Properties 엔진). 그러나 ERD에 EVENT_TAXONOMY 엔티티 누락 (ISS-008) |
| F-008 | 오디언스 임포트/익스포트 | ✅ | DIA-001 (Managed Audience 임포터 컴포넌트), DIA-002 (BI → Managed Audience → AM 경로) |

**참고**: F-005(오디언스 대시보드)는 데이터 조회/집계 UI 기능으로 별도 아키텍처 다이어그램이 필수는 아니므로 누락으로 간주하지 않음.

### 3.2 기능 추적 매트릭스: PRD 기능 → SES 계획

| PRD 기능 | SES 계획 반영 | 우선순위 일치 | 비고 |
|----------|-------------|-------------|------|
| F-001 | ✅ SES 섹션 4.3 명시 | ✅ P0 일치 | |
| F-002 | ✅ SES 섹션 4.3 명시 | ✅ P0 일치 | |
| F-003 | ✅ SES 섹션 4.3 명시 | ✅ P0 일치 | |
| F-004 | ✅ SES 섹션 4.3 명시 | ✅ P0 일치 | |
| F-005 | ✅ SES 섹션 4.3 명시 | ✅ P1 일치 | |
| F-006 | ✅ SES 섹션 4.3 명시 | ✅ P0 일치 | |
| F-007 | ✅ SES 섹션 4.3 명시 | ✅ P0 일치 | |
| F-008 | ✅ SES 섹션 4.3 명시 | ✅ P2 일치 | |

**결론**: SES 계획의 기능 목록(F-001~F-008)과 우선순위(P0/P1/P2)가 PRD와 완전히 일치.

### 3.3 데이터 모델 일관성: PRD 명세 vs DIA-003 ERD

| 항목 | PRD/SES 명세 | DIA-003 ERD | 일치 여부 |
|------|------------|-------------|---------|
| 플레이어 기본 엔티티 | IDENTITY | IDENTITY | ✅ 일치 |
| 속성 구조 | PLAYER_PROPERTY (단일 엔티티, 3계층) | DEFAULT_PROPERTY / COMPUTED_PROPERTY / CUSTOM_PROPERTY (3개 분리 엔티티) | ⚠️ 명명 불일치. 논리 구조는 동일하나 테이블 분리 여부가 다름 |
| 오디언스 엔티티 | AUDIENCE | AUDIENCE | ✅ 일치 |
| 오디언스-플레이어 멤버십 | AUDIENCE_MEMBERSHIP | AUDIENCE_MEMBERSHIP | ✅ 일치 |
| 필터 표현식 엔티티 | AUDIENCE 내 포함으로 명세 | AUDIENCE_FILTER (별도 엔티티) | ⚠️ PRD는 별도 정의 없으나 DIA는 분리. DIA가 더 상세한 구조 |
| 오버라이드 | 미명세 | AUDIENCE_OVERRIDE | ⚠️ PRD에 미언급. DIA가 추가 정의 |
| 이벤트 택소노미 | EVENT_TAXONOMY | ERD에 없음 | ❌ 누락 (ISS-008) |
| Computed Property 규칙 | COMPUTED_PROPERTY_RULE | ERD에 없음 | ❌ 누락 (ISS-008) |
| LiveOps 연동 엔티티 | LIVE_EVENT (참조 표현) | LIVE_EVENT / EXPERIMENT / FEATURE_FLAG / MESSAGE | ✅ 일치 (DIA가 더 상세) |

### 3.4 상태 다이어그램 일관성: PRD F-002/F-004 vs DIA-006

| 상태 전이 | PRD 정의 | DIA-006 표현 | 일치 여부 |
|----------|---------|-------------|---------|
| draft → active | REQ-002-01, 오디언스 저장 시 활성화 | 활성화 전이 명시 | ✅ 일치 |
| active → paused | F-002 관리 기능 | 일시 정지 전이 명시 | ✅ 일치 |
| paused → active | F-002 관리 기능 | 재개 전이 명시 | ✅ 일치 |
| active/paused → archived | F-002 관리 기능 | 보관 처리 전이 명시 | ✅ 일치 |
| draft → archived | F-002 관리 기능 | 삭제 없이 보관 전이 명시 | ✅ 일치 |
| not_member → member | F-004 REQ-004-01, 필터 조건 충족 시 | 필터 조건 충족(재계산 시) | ✅ 일치 |
| member → sticky_member | F-004 REQ-004-05, 수동 Include | 관리자 수동 Include | ✅ 일치 |
| any → excluded | F-004 내 수동 Exclude 언급 부재 | 관리자 수동 Exclude 전이 명시 | ⚠️ PRD에 excluded 상태 미명세. DIA가 추가 정의 (PRD 보완 권장) |

**결론**: Audience 상태 전이 5개 전체 일치. 멤버십 상태 전이는 DIA-006이 PRD에 미명세된 excluded 상태를 추가 정의하고 있어 PRD가 보완 필요함.

### 3.5 시퀀스 다이어그램 일관성: PRD 시나리오 vs DIA-004/DIA-005

| 시나리오 | PRD 정의 | DIA 표현 | 일치 여부 |
|---------|---------|---------|---------|
| SC-002: 오디언스 신규 생성 | 폼 빌더 → 미리보기 → 저장 | DIA-004: 폼 빌더 → Preview API → 저장 → 초기 멤버십 계산 | ✅ 일치 |
| SC-003: 쿼리 모드 오디언스 생성 | 쿼리 모드 입력 → 유효성 검사 → 저장 | DIA-007: 쿼리 입력 → 파서 → 문법 검증 → DSL → 저장 | ✅ 일치 |
| 10분 주기 갱신 | REQ-004-01 | DIA-005: 배치 스케줄러 10분 루프 | ✅ 일치 |
| 즉시 갱신 30초 이내 | REQ-004-02 | DIA-005: 즉시 재계산 트리거 경로 존재하나 트리거 조건 불명확 | ⚠️ 부분 불일치 (ISS-010) |
| Computed Properties 갱신 | F-001 REQ-004, AC-001-02 | DIA-005: Properties 엔진 갱신 흐름 | ✅ 일치 |

### 3.6 용어 일관성 검증

| 용어 항목 | SES 표현 | PRD 표현 | DIA 표현 | 표준 (terminology.md) | 상태 |
|---------|---------|---------|---------|---------------------|------|
| 서비스 운영자 | "게임 기획자/운영자" | "관리자", "게임 기획자(관리자)" | "관리자", "Admin" | "관리자" (administrator 금지) | ✅ 허용 (게임 도메인 특수 표현) |
| 최종 사용자 | "플레이어" | "플레이어" | "플레이어" | terminology.md에 "회원/비회원" 기준이나 게임 도메인 특수 용어로 "플레이어" 허용 | ✅ 일치 |
| 속성 그룹 명칭 | "Default/Computed/Custom 3계층" | "Default/Computed/Custom 3계층" | "DEFAULT_PROPERTY / COMPUTED_PROPERTY / CUSTOM_PROPERTY" | 비고: DIA는 영문 대문자 엔티티명 사용 | ✅ 개념 일치 (엔티티명 표기 차이는 허용) |
| 멤버십 상태 | "active/expired/sticky" (섹션 4.5) | "not_member/member/sticky" 혼용 | "not_member/member/sticky_member/excluded" | - | ⚠️ SES와 DIA/PRD 간 상태명 불일치 (ISS-011) |
| 오디언스 갱신 지연 | "10분 주기 자동 갱신 + API 즉시 갱신" | "10분 주기/즉시 갱신 30초 이내" | "10분 배치/즉시 트리거" | - | ✅ 일치 |

### 3.7 ID 참조 유효성

| 참조 | 출처 | 대상 문서 | 존재 여부 |
|------|------|---------|---------|
| PRD-GLO-001 | DIA-GLO-001 | docs/03-prd/ | ✅ 존재 |
| UX-GLO-001 | DIA-GLO-001 | docs/05-ux/ | ✅ 존재 (검토 범위 외) |
| RES-GLO-003 | DIA-GLO-001, PRD-GLO-001 | docs/01-research/ | ✅ 존재 (검토 범위 외) |
| MTG-GLO-003 | DIA-GLO-001, PRD-GLO-001 | docs/08-meeting-note/ | ✅ 존재 (검토 범위 외) |
| SES-GLO-001 | SES-GLO-004 | docs/02-planning/ | ✅ 존재 (검토 범위 외) |
| F-001~F-008 | SES-GLO-004 내부 참조 | PRD-GLO-001 | ✅ 모두 존재 |
| D-007~D-010 | SES-GLO-004 내부 참조 | SES-GLO-004 | ✅ 모두 존재 |
| A-008~A-012 | SES-GLO-004 내부 참조 | SES-GLO-004 | ✅ 모두 존재 |
| Q-006~Q-009 | SES-GLO-004 내부 참조 | SES-GLO-004 | ✅ 모두 존재 |
| Q-010 | PRD-GLO-001 섹션 7 | SES-GLO-004 | ⚠️ SES-GLO-004에 미등록. PRD에서 신규 추가된 미결 사항으로 SES 문서 미반영 |
| SCR-001~SCR-005 | PRD-GLO-001 UI/UX 요구사항 | UX-GLO-001 | ⚠️ 화면 ID 번호 체계 불일치 (ISS-003) |
| DIA-001~DIA-007 | DIA-GLO-001 내부 참조 | DIA-GLO-001 | ✅ 모두 존재 |

---

## 4. 이슈 목록

| ID | 심각도 | 담당 문서 | 위치 | 설명 | 제안 |
|----|--------|---------|------|------|------|
| ISS-001 | 🟢 Minor | SES-GLO-004 | 섹션 2 문서 ID 체계 | SES 문서 자체가 산출물 목록에 포함되지 않아 ID 체계 추적성 불완전 | 산출물 목록에 SES-GLO-004 자기 기재 추가 |
| ISS-002 | 🟢 Minor | SES-GLO-004 | 섹션 6 액션 아이템 | A-011, A-012가 pending이나 마감일 미정이고 PRD와 완료 여부 동기화 미완 | 마감일 추가 또는 PRD 완성에 따른 completed 상태 갱신 |
| ISS-003 | 🟡 Major | PRD-GLO-001 | Appendix C 핸드오프 / 기능별 UI/UX 요구사항 | PRD의 화면 ID 체계(SCR-001~006)가 UX-GLO-001 실제 화면 ID와 전면 불일치. PRD 기준: SCR-001=속성 관리, SCR-002=오디언스 목록, SCR-003=생성/편집, SCR-004=분석, SCR-005=Live Event 타겟팅, SCR-006=이벤트 택소노미. UX 기준: SCR-001=오디언스 목록, SCR-002=생성/편집, SCR-003=오디언스 상세, SCR-004=속성 관리, SCR-005=이벤트 택소노미 | PRD Appendix C 및 기능별 UI/UX 요구사항의 화면 ID를 UX-GLO-001 실제 ID 기준으로 전면 수정 |
| ISS-004 | 🟡 Major | PRD-GLO-001 | 전체 문서 | 변경 이력 섹션 누락. style-guide.md 1.3항 필수 요건 미충족 | 문서 하단에 변경 이력 테이블 추가 |
| ISS-005 | 🟢 Minor | PRD-GLO-001 | 섹션 3.4 F-003, 3.5 F-004 UI/UX 요구사항 | ISS-003 연관. F-003/F-004 UI/UX 요구사항의 화면 ID 참조가 잘못됨 | ISS-003 수정 시 함께 처리 |
| ISS-006 | 🟢 Minor | PRD-GLO-001 | 섹션 3.7 F-006 UI/UX 요구사항 | F-006 관련 화면으로 "SCR-005 (Live Event 생성)"을 참조하나 이는 Live Events 모듈 화면이므로 현재 UX 문서(UX-GLO-001) 범위 외. 범위 명확화 필요 | "관련 화면: Live Events 모듈 생성 화면 (UX-GLO-002 예정)" 또는 해당 UX 스펙 참조로 수정 |
| ISS-007 | 🟢 Minor | PRD-GLO-001 | 섹션 7 Open Questions | Q-007, Q-009는 PRD 본문에서 이미 결정된 내용임에도 open 상태로 남아 있음. Q-010은 SES-GLO-004에 미등록 | Q-007, Q-009를 결정됨으로 표기. Q-010을 SES-GLO-004에 등록 권장 |
| ISS-008 | 🟡 Major | DIA-GLO-001 | DIA-003 ERD | EVENT_TAXONOMY, COMPUTED_PROPERTY_RULE 엔티티가 ERD에 누락됨. PRD F-007(이벤트 택소노미)의 핵심 데이터 구조가 반영되지 않아 다이어그램과 PRD 간 데이터 모델 불완전 | ERD에 EVENT_TAXONOMY 엔티티(이벤트명, 설명)와 COMPUTED_PROPERTY_RULE 엔티티(연결 이벤트, 속성명, 계산 유형, 집계 속성) 추가. IDENTITY → EVENT → EVENT_TAXONOMY 관계 명시 |
| ISS-009 | 🟢 Minor | DIA-GLO-001 | DIA-001 시스템 아키텍처 | Admin 서브그래프 컴포넌트와 UX 화면 ID 간 명시적 매핑 없음 | 다이어그램 설명 또는 별도 매핑 테이블에 SCR ID 대응 관계 추가 권장 |
| ISS-010 | 🟢 Minor | DIA-GLO-001 | DIA-005 멤버십 갱신 시퀀스 | 즉시 재계산 트리거 조건이 모호하며 PRD F-004의 관리자 수동 즉시 갱신(REQ-004-02)과 흐름 차이 존재 | 즉시 재계산 트리거 조건을 PRD REQ-004-02 기준으로 명확화 |
| ISS-011 | 🟢 Minor | SES-GLO-004, DIA-GLO-001 | SES 섹션 4.5 Task 4 / DIA-006 상태 다이어그램 | 플레이어 멤버십 상태명이 SES(active/expired/sticky)와 DIA(not_member/member/sticky_member/excluded)간 불일치 | DIA-006 4상태 기준으로 SES-GLO-004 섹션 4.5 상태 기술 수정 |

---

## 5. 최종 평가

### 5.1 판정 기준 적용

| 기준 | 개수 | 판정 기준 |
|------|------|---------|
| Critical 이슈 | 0개 | Pass 가능 |
| Major 이슈 | 3개 (ISS-003, ISS-004, ISS-008) | Conditional (1~3개) |
| Minor 이슈 | 6개 (ISS-001, ISS-002, ISS-005, ISS-006, ISS-007, ISS-009, ISS-010, ISS-011 중 6개 주요) | 무관 |

### 5.2 문서별 승인 상태

| 문서 | 버전 | 결과 | 조건 |
|------|------|------|------|
| SES-GLO-004 | v1.0 | ✅ 승인 | - |
| PRD-GLO-001 | v1.0 | ⚠️ 조건부 승인 | ISS-003, ISS-004 해결 후 v1.1로 재제출 |
| DIA-GLO-001 | v1.0 | ⚠️ 조건부 승인 | ISS-008 해결 후 v1.1로 재제출 |

### 5.3 Major 이슈 수정 요청

| 담당 에이전트 | 문서 | 이슈 ID | 필수 조치 내용 |
|------------|------|---------|-------------|
| prd | PRD-GLO-001 | ISS-003 | 기능별 UI/UX 요구사항 및 Appendix C 핸드오프의 화면 ID를 UX-GLO-001 실제 화면 ID(SCR-001=오디언스 목록, SCR-002=생성/편집, SCR-003=오디언스 상세, SCR-004=속성 관리, SCR-005=이벤트 택소노미)로 전면 수정 |
| prd | PRD-GLO-001 | ISS-004 | 문서 하단에 변경 이력 섹션 추가 ("v1.0 / 2026-03-10 / 초안 작성 / prd") |
| diagram | DIA-GLO-001 | ISS-008 | DIA-003 ERD에 EVENT_TAXONOMY 및 COMPUTED_PROPERTY_RULE 엔티티 추가. PRD F-007 데이터 구조 반영 |

### 5.4 권장 조치 (Minor)

| 담당 에이전트 | 문서 | 이슈 ID | 권장 조치 내용 |
|------------|------|---------|-------------|
| planner | SES-GLO-004 | ISS-001 | 산출물 목록에 SES-GLO-004 자체 기재 추가 |
| planner | SES-GLO-004 | ISS-002 | A-011, A-012 액션 아이템 상태 갱신 (PRD 완성에 따라 completed 처리) |
| prd | PRD-GLO-001 | ISS-005 | ISS-003 수정 시 F-003/F-004 UI/UX 요구사항 화면 ID 함께 정정 |
| prd | PRD-GLO-001 | ISS-006 | F-006 관련 화면 참조를 "UX-GLO-002 (Live Events 모듈, 예정)"으로 수정 |
| prd | PRD-GLO-001 | ISS-007 | Q-007, Q-009 상태를 결정됨으로 표기. Q-010을 SES-GLO-004 open_issues에 등록 |
| diagram | DIA-GLO-001 | ISS-009 | DIA-001 설명에 Admin 서브그래프 ↔ SCR ID 매핑 추가 |
| diagram | DIA-GLO-001 | ISS-010 | DIA-005 즉시 재계산 트리거 조건을 PRD REQ-004-02 기준으로 명확화 |
| planner, diagram | SES-GLO-004, DIA-GLO-001 | ISS-011 | 플레이어 멤버십 상태명을 DIA-006 기준(not_member/member/sticky_member/excluded)으로 통일. SES 섹션 4.5 수정 |

**전체 판정**: ⚠️ Conditional — Major 이슈 3건(ISS-003, ISS-004, ISS-008) 해결 후 PRD-GLO-001 v1.1, DIA-GLO-001 v1.1 재제출 요청. SES-GLO-004는 현재 버전 승인.

---

## Appendix

### A. 검토 기준 참조

- `shared/review-checklist.md` — 체크리스트 기준
- `shared/terminology.md` — 용어 기준
- `shared/conventions.md` — 컨벤션 기준
- `shared/style-guide.md` — 스타일 가이드

### B. 변경 이력

| 버전 | 일자 | 변경 내용 | 작성자 |
|------|------|-----------|--------|
| v1.0 | 2026-03-26 | 초안 작성 — SES-GLO-004, PRD-GLO-001, DIA-GLO-001 3종 통합 검토 리포트 | reviewer |
