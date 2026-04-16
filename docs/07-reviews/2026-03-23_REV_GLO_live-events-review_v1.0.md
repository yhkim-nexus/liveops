---
id: "REV-GLO-001"
title: "검토 리포트: 라이브 이벤트 기획 문서"
project: "GLO"
version: "v1.0"
status: "draft"
created: "2026-03-23"
updated: "2026-03-23"
author: "reviewer"
reviewers: []
related_docs:
  - "PRD-GLO-002"
  - "UX-GLO-002"
  - "DIA-GLO-002"
tags:
  - "project:game-liveops"
  - "type:review"
  - "topic:live-events"
---

# 검토 리포트: 라이브 이벤트 기획 문서

## 문서 정보

| 항목 | 내용 |
|------|------|
| 리포트 ID | REV-GLO-001 |
| 검토일 | 2026-03-23 |
| 검토 유형 | 통합 (개별 + 교차) |
| 검토 대상 | PRD-GLO-002, UX-GLO-002, DIA-GLO-002 |
| 검토 기준 | shared/review-checklist.md, shared/terminology.md, shared/conventions.md, shared/style-guide.md |

---

## 1. 검토 요약

### 1.1 전체 평가

| 문서 | 버전 | 완결성 | 일관성 | 품질 | 결과 |
|------|------|--------|--------|------|------|
| PRD-GLO-002 | v1.0 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⚠️ Conditional |
| UX-GLO-002 | v1.0 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⚠️ Conditional |
| DIA-GLO-002 | v1.0 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ Pass |

**전체 판정**: ⚠️ Conditional (Major 이슈 해결 필요)

### 1.2 이슈 요약

| 심각도 | 개수 | 상태 |
|--------|------|------|
| 🔴 Critical | 0 | - |
| 🟡 Major | 3 | 수정 필요 |
| 🟢 Minor | 5 | 권장 |

---

## 2. 개별 문서 검토

---

### 2.1 PRD (PRD-GLO-002)

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
| 관련 문서 참조 정확 | ✅ | PRD-GLO-001, RES-GLO-002, UX-GLO-002, DIA-GLO-002 |
| 변경 이력 존재 | ⚠️ | Appendix에 별도 변경이력 섹션 없음. 버전 정보는 YAML에만 기재 |
| 제목 레벨 구조 올바름 | ✅ | |

**PRD 체크리스트**

| 항목 | 상태 | 비고 |
|------|------|------|
| Overview 섹션 존재 | ✅ | 섹션 1 |
| Target Users 정의 | ✅ | 섹션 2, Primary/Secondary/Tertiary 3인 페르소나 |
| Features & Requirements 존재 | ✅ | 섹션 3, F-009~F-016 |
| Non-Functional Requirements 존재 | ✅ | 섹션 4 |
| Dependencies & Constraints 명시 | ✅ | 섹션 5 |
| Release Plan 존재 | ✅ | 섹션 6 |
| 모든 기능에 고유 ID | ✅ | F-009~F-016 (8개) |
| 우선순위 명시 (P0/P1/P2) | ✅ | P0: F-009~F-013, P1: F-014~F-016 |
| 사용자 스토리 형식 사용 | ✅ | US-017~US-037, As a/I want to/So that 형식 |
| Acceptance Criteria 존재 (Given-When-Then) | ✅ | Gherkin 시나리오 형식으로 각 기능별 작성 |
| 모호한 표현 없음 | ✅ | 구체적 수치 및 조건 명시 |
| 측정 가능한 성공 지표 | ✅ | 섹션 1.3, 6개 지표 수치 명시 |
| 예외 상황 정의 | ✅ | 각 기능별 예외 처리 테이블 |
| 리서치 결과 반영 | ✅ | RES-GLO-002 참조 명시 |

#### 잘된 점

- 기능 상세가 사용자 스토리 → 요구사항 → 수용 조건 → 비즈니스 규칙 → 데이터 요구사항 → 예외 처리 → UI/UX 요구사항의 일관된 구조로 작성되어 있어 가독성이 높음
- Appendix C의 상태 전이 매트릭스가 모든 허용/비허용 전이를 명확히 도식화함
- Open Questions(섹션 7)와 Risks(섹션 8)가 구체적으로 정리되어 추후 의사결정 기준을 제공함
- 비기능 요구사항(성능/보안/확장성/가용성/데이터보존)이 수치 기반으로 명시됨

#### 개선 필요

| ID | 심각도 | 위치 | 이슈 | 제안 |
|----|--------|------|------|------|
| ISS-001 | 🟡 Major | Appendix E, 핸드오프 화면 ID | PRD Appendix E 핸드오프 섹션의 화면 ID가 실제 UX 문서의 화면 ID와 불일치. F-009의 "SCR-007: 이벤트 목록", "SCR-008: 이벤트 생성/편집", F-011의 "SCR-008: 이벤트 상세 승인 탭", "SCR-009: 승인 검토 화면", F-013의 "SCR-010: 상태 이력 뷰", F-014의 "SCR-011: 캘린더 뷰", "SCR-012: 타임라인 뷰", F-015의 "SCR-013: 이벤트 성과 대시보드", F-016의 "SCR-014: 알림 센터", "SCR-015: 웹훅 설정"이 UX 문서의 실제 화면 ID와 다름 | UX 문서의 실제 화면 ID(SCR-006~SCR-012)에 맞게 핸드오프 섹션 수정 필요. 상세 매핑은 섹션 3.1 기능 추적 매트릭스 참조 |
| ISS-002 | 🟢 Minor | Appendix (변경 이력) | PRD 본문에 별도 변경 이력 섹션이 없음. YAML front matter의 created/updated 필드만 존재하며 변경 내역 서술 없음 | 다른 문서(UX-GLO-002, DIA-GLO-002)와 동일하게 본문 하단에 변경 이력 테이블 추가 권장 |
| ISS-003 | 🟢 Minor | 섹션 3.6, UI/UX 요구사항 | F-013의 UI/UX 요구사항에서 "SCR-008 (이벤트 상세 — 상태 제어), SCR-010 (상태 이력 뷰)" 를 관련 화면으로 명시. 실제 UX에서 이벤트 상세는 SCR-011, 상태 이력은 SCR-011 내 탭으로 구현됨 | SCR-011로 수정 |

---

### 2.2 UX (UX-GLO-002)

**버전**: v1.0
**결과**: ⚠️ Conditional

#### 체크리스트 결과

**공통 체크리스트**

| 항목 | 상태 | 비고 |
|------|------|------|
| YAML front matter 존재 | ✅ | |
| 필수 필드 완전 | ✅ | |
| 버전 형식 올바름 | ✅ | |
| 상태값 유효 (draft) | ✅ | |
| 관련 문서 참조 정확 | ✅ | PRD-GLO-002, DIA-GLO-002, UX-GLO-001 |
| 변경 이력 존재 | ✅ | Appendix B |
| 제목 레벨 구조 올바름 | ✅ | |

**UX 체크리스트**

| 항목 | 상태 | 비고 |
|------|------|------|
| Information Architecture 존재 | ✅ | 섹션 1, 사이트맵 및 네비게이션 구조 |
| 네비게이션 구조 정의 | ✅ | 좌측 사이드바 + 서브탭 |
| 화면 목록 완전 | ✅ | Appendix A, SCR-006~SCR-012 |
| 모든 화면에 고유 ID | ✅ | SCR-006~SCR-012 |
| 와이어프레임 존재 | ✅ | 모든 화면에 ASCII 와이어프레임 |
| UI 요소 명세 존재 | ✅ | 모든 화면에 E-{scr}-{n} ID 체계 |
| 상태별 화면 정의 (Default/Loading/Empty/Error) | ✅ | SCR-006~012 모두 4개 상태 정의 |
| 인터랙션 정의 | ✅ | INT-{scr}-{n} ID 체계로 상세 정의 |
| PRD 기능과 화면 매핑 | ⚠️ | 섹션 1.3에 매핑 테이블 있으나 F-015, F-016이 미매핑 (상세 참조: ISS-004) |
| 디자인 토큰 정의 | ⚠️ | 색상 값은 명시되나 별도 토큰 체계 미정의 |
| 공통 컴포넌트 정의 | ⚠️ | 각 화면 내 컴포넌트 타입만 명시, 공통 컴포넌트 가이드라인 없음 |
| 접근성 기준 명시 | ❌ | 터치 영역, 색상 대비, 스크린 리더 관련 기준 없음 |

#### 잘된 점

- 7개 화면 모두 Default/Loading/Empty/Error 4개 상태를 빠짐없이 정의함
- 와이어프레임이 ASCII 아트로 상세하게 표현되어 구현 방향성 명확
- 인터랙션 정의 테이블이 트리거/요소/액션/결과를 구조적으로 명시
- API 데이터 요구사항이 JSON 예시와 Query Parameter 목록으로 구체적으로 제시됨
- SCR-012(긴급 제어 모달)의 이벤트명 재입력 확인 단계가 실수 방지 관점에서 우수한 UX 설계

#### 개선 필요

| ID | 심각도 | 위치 | 이슈 | 제안 |
|----|--------|------|------|------|
| ISS-004 | 🟡 Major | 섹션 1.3, 화면-기능 매핑 | F-015(성과 대시보드)와 F-016(웹훅/알림)이 화면-기능 매핑 테이블(섹션 1.3)에서 누락됨. F-015는 SCR-011에 포함되어 있으나 명시적 매핑이 없고, F-016(알림 센터, 웹훅 설정)에 해당하는 화면이 Appendix A의 목록에도 없음 | 1.3 매핑 테이블에 SCR-011: F-015 추가. F-016 관련 화면(알림 센터, 웹훅 설정)이 이번 버전 범위 외라면 "Part 3 예정" 또는 "미구현" 명시 필요 |
| ISS-005 | 🟢 Minor | 섹션 1.3, 화면-기능 매핑 | SCR-011의 기능 매핑에 "F-011(이력 조회)"로만 표기되어 있으나, SCR-011은 실제로 F-015(성과 대시보드)도 포함 | 매핑 테이블 SCR-011 행에 F-015 추가 |
| ISS-006 | 🟢 Minor | 전체 문서 | 접근성 기준(WCAG, 터치 영역, 색상 대비, 스크린 리더)이 전혀 언급되지 않음. review-checklist.md 5.4항 미충족 | 별도 접근성 섹션 또는 화면별 접근성 요구사항 추가 권장 |
| ISS-007 | 🟢 Minor | SCR-006 상태 배지, SCR-011 | 상태 배지 색상 정의(SCR-006)와 SCR-011 우선순위 배지 색상 정의(E-011-05)가 분리되어 있음. medium 우선순위를 SCR-006은 파랑(#3B82F6)으로, SCR-011은 "파랑"으로 동일하게 사용하나 active 상태도 파랑(#3B82F6)으로 지정되어 색상 충돌 가능성 존재 | 우선순위 배지 색상(low/medium/high/critical)과 상태 배지 색상을 별도 색상 체계로 분리 명시 권장 |

---

### 2.3 Diagram (DIA-GLO-002)

**버전**: v1.0
**결과**: ✅ Pass

#### 체크리스트 결과

**공통 체크리스트**

| 항목 | 상태 | 비고 |
|------|------|------|
| YAML front matter 존재 | ✅ | |
| 필수 필드 완전 | ✅ | |
| 버전 형식 올바름 | ✅ | |
| 상태값 유효 (draft) | ✅ | |
| 관련 문서 참조 정확 | ✅ | PRD-GLO-002, UX-GLO-002, DIA-GLO-001 |
| 변경 이력 존재 | ✅ | 본문 하단 변경 이력 테이블 |
| 제목 레벨 구조 올바름 | ✅ | |

**다이어그램 체크리스트**

| 항목 | 상태 | 비고 |
|------|------|------|
| Mermaid 문법 올바름 | ✅ | erDiagram, stateDiagram-v2, sequenceDiagram, flowchart 모두 표준 문법 사용 |
| 시작/종료 명확 | ✅ | stateDiagram: [*] → draft, archived → [*]. sequenceDiagram: autonumber 사용 |
| 분기 조건 명시 | ✅ | 상태 머신의 전이 조건, 시퀀스의 alt/else, 런타임 필터링 조건 명시 |
| 모든 경로 도달 가능 | ✅ | 7단계 상태 모두 도달 가능 경로 존재 |
| 예외 흐름 포함 | ✅ | pending_approval → draft (반려), active/paused → ended (Kill) |
| PRD 로직과 일치 | ✅ | 상세 교차 검증 섹션 3 참조 |
| 화면정의서와 일치 | ✅ | 주요 흐름 일치 확인 |

#### 잘된 점

- 5종 다이어그램(ERD, 상태 머신, 생성~활성화 시퀀스, 런타임 타겟팅 시퀀스, 메트릭 데이터 흐름)이 라이브 이벤트 시스템의 데이터, 상태, 시퀀스, 데이터 흐름을 완전히 커버
- DIA-011 상태 머신에서 긴급 제어 흐름(Pause/Kill/Extend)을 note로 강조하고 자기 전이(draft → draft)를 명시하는 등 세부 사항까지 완결
- DIA-013 런타임 타겟팅 시퀀스에서 Redis 캐시 히트/미스 분기가 구체적으로 표현됨
- DIA-014 메트릭 데이터 흐름에서 subgraph로 계층을 구분하고 색상 스타일을 적용하여 가독성 우수

---

## 3. 교차 문서 검증

### 3.1 기능 추적 매트릭스: PRD 기능 → UX 화면

| PRD 기능 | 기능명 | UX 화면 (실제) | PRD 핸드오프 화면 (기재) | 상태 |
|----------|--------|--------------|----------------------|------|
| F-009 | 라이브 이벤트 CRUD | SCR-006 (목록/검색/필터), SCR-007 (생성/편집 폼), SCR-011 (상세 조회) | SCR-007 (이벤트 목록), SCR-008 (이벤트 생성/편집) | ⚠️ ID 불일치 |
| F-010 | 이벤트 스케줄링 | SCR-007 (스케줄 탭) | SCR-008 (스케줄 탭) | ⚠️ ID 불일치 |
| F-011 | 승인 워크플로우 | SCR-007 (승인 요청), SCR-008 (승인/반려 처리), SCR-011 (이력 조회) | SCR-008 (이벤트 상세 승인 탭), SCR-009 (승인 검토 화면) | ⚠️ ID 불일치 |
| F-012 | 오디언스 타겟팅 | SCR-007 (타겟팅 탭) | 미명시 (F-012 핸드오프 없음) | ⚠️ 핸드오프 누락 |
| F-013 | 이벤트 상태 관리 | SCR-006 (상태 배지), SCR-011 (상태 제어 버튼, 상태 이력), SCR-012 (긴급 제어 모달) | SCR-010 (상태 이력 뷰) | ⚠️ ID 불일치 |
| F-014 | 캘린더/타임라인 뷰 | SCR-009 (캘린더 뷰), SCR-010 (타임라인 뷰) | SCR-011 (캘린더 뷰), SCR-012 (타임라인 뷰) | ⚠️ ID 불일치 |
| F-015 | 성과 대시보드 | SCR-011 (이벤트 상세/성과 대시보드 통합) | SCR-013 (이벤트 성과 대시보드) | ⚠️ ID 불일치 + UX 매핑 테이블 누락 |
| F-016 | 웹훅/알림 | 미정의 (이번 버전 범위 외 추정) | SCR-014 (알림 센터), SCR-015 (웹훅 설정) | ⚠️ UX 화면 미정의 |

**요약**: PRD Appendix E 핸드오프 섹션의 화면 ID 전체가 UX 문서의 실제 화면 ID와 불일치. PRD는 SCR-007~SCR-015의 번호 체계를 사용하고 있으나, UX 문서는 SCR-006~SCR-012를 사용. 이는 이전 세그멘테이션 모듈(SCR-001~SCR-005)에 이어 Live Events를 SCR-006부터 시작한 UX 설계와, PRD 핸드오프가 SCR-007부터 시작하여 이미 1번 씩 어긋난 데서 기인.

### 3.2 기능 추적 매트릭스: PRD 기능 → 다이어그램

| PRD 기능 | 기능명 | DIA 반영 여부 | 해당 다이어그램 |
|----------|--------|--------------|---------------|
| F-009 | 라이브 이벤트 CRUD | ✅ | DIA-010 (ERD: LIVE_EVENT 엔티티), DIA-012 (이벤트 생성 시퀀스) |
| F-010 | 이벤트 스케줄링 | ✅ | DIA-010 (ERD: EVENT_SCHEDULE), DIA-012 (스케줄 등록 흐름) |
| F-011 | 승인 워크플로우 | ✅ | DIA-010 (ERD: EVENT_APPROVAL), DIA-011 (pending_approval 전이), DIA-012 (승인 시퀀스 전체) |
| F-012 | 오디언스 타겟팅 | ✅ | DIA-010 (ERD: AUDIENCE 참조), DIA-013 (런타임 타겟팅 시퀀스) |
| F-013 | 이벤트 상태 관리 | ✅ | DIA-011 (상태 머신 전체), DIA-010 (ERD: EVENT_STATE_LOG) |
| F-014 | 캘린더/타임라인 뷰 | - | 별도 다이어그램 없음 (UI 기능, 별도 다이어그램 불필요) |
| F-015 | 성과 대시보드 | ✅ | DIA-010 (ERD: EVENT_METRICS), DIA-014 (메트릭 데이터 흐름) |
| F-016 | 웹훅/알림 | - | 별도 다이어그램 없음 (웹훅 흐름 시퀀스 미작성) |

**참고**: F-014(캘린더/타임라인 뷰)는 데이터 표현 방식의 UI 기능으로 별도 다이어그램이 불필요하므로 누락으로 간주하지 않음. F-016(웹훅/알림)은 시퀀스 다이어그램이 없으나 핵심 흐름이 아니므로 Minor 권장 수준.

### 3.3 상태 머신 일관성: PRD F-013 vs DIA-011

| 상태 전이 | PRD 정의 | DIA-011 표현 | 일치 여부 |
|----------|---------|-------------|---------|
| draft → draft (편집) | F-013 상태 전이 규칙 표에 없음 (암묵적) | 명시적 자기 전이 표현 | ✅ 일치 (DIA가 더 명확하게 표현) |
| draft → pending_approval | 승인 요청, 필수 필드 완성 | 승인 요청(필수 필드 검증 통과) | ✅ 일치 |
| pending_approval → scheduled | 승인 완료, event_approver | 관리자 승인 | ✅ 일치 |
| pending_approval → draft | 반려, 사유 입력 필수 | 반려(사유 포함) | ✅ 일치 |
| scheduled → active | start_at 도달, 시스템 자동 | start_at 도달(시스템 자동) | ✅ 일치 |
| active → paused | Pause 실행, 사유 입력 필수 | 수동 일시정지(사유 입력 필수) | ✅ 일치 |
| paused → active | 재개 실행 | 재개 | ✅ 일치 |
| active → ended | end_at 도달(자동) 또는 Kill(수동, 사유 필수) | end_at 도달[자동] 또는 긴급 종료[수동, 사유 필수] | ✅ 일치 |
| paused → ended | Kill 실행, 사유 입력 필수 | 긴급 종료(사유 입력 필수) | ✅ 일치 |
| ended → archived | 보관 처리 (수동) | 보관 처리 | ✅ 일치 |
| active → active (Extend) | Extend: 상태 전이 없음, end_at 변경 | note로 "Extend: end_at 연장(상태 전이 없음)" 표현 | ✅ 일치 |
| scheduled → draft (수정) | REQ-009-11, REQ-011-06 | 미표현 (상태 머신 다이어그램에서 생략) | ⚠️ 부분 불일치 (Minor) |

**결론**: 핵심 상태 전이 10개 중 10개 일치. "scheduled → draft(수정 시 재승인)" 전이가 DIA-011에 미표현되어 있으나 이는 승인 워크플로우의 부수 효과이므로 Minor 수준.

### 3.4 ERD 일관성: PRD 데이터 모델 vs DIA-010

| 엔티티/필드 | PRD 정의 | DIA-010 ERD | 일치 여부 |
|------------|---------|-------------|---------|
| LIVE_EVENT.status 값 | 7가지: draft/pending_approval/scheduled/active/paused/ended/archived | 동일 7가지 | ✅ 일치 |
| LIVE_EVENT.priority 값 | low/medium/high/critical | 동일 4가지 | ✅ 일치 |
| LIVE_EVENT.event_type | 자유 문자열 레이블 | string 타입 | ✅ 일치 |
| EVENT_SCHEDULE 필드 | start_at, end_at, display_timezone, rrule, rrule_duration_minutes | schedule_type, start_at, end_at, timezone, rrule | ⚠️ 부분 불일치: PRD의 display_timezone, rrule_duration_minutes가 DIA-010에서 timezone, rrule만 표현 (rrule_duration_minutes 누락) |
| EVENT_PHASE 필드 | id, event_id, phase_type, start_offset_minutes, duration_minutes | id, event_id, phase_type, phase_order, start_offset, duration | ⚠️ 부분 불일치: 필드명 차이 (start_offset_minutes vs start_offset, duration_minutes vs duration) |
| APPROVAL_LOG/EVENT_APPROVAL | PRD: requester_id, approver_id, action, rejection_reason, version_snapshot | DIA: requested_by, reviewer_id, decision, rejection_reason, version_snapshot | ⚠️ 필드명 차이 (requester_id vs requested_by, approver_id vs reviewer_id, action vs decision) |
| EVENT_STATE_LOG | event_id, from_status, to_status, actor_id, reason, metadata | event_id, from_status, to_status, actor, reason | ⚠️ 부분 불일치: PRD의 actor_id(UUID)가 DIA에서 actor(string)로, PRD의 metadata 필드가 DIA에 누락 |

**결론**: 엔티티 구조는 일치하나 일부 필드명 및 타입 차이 존재. 특히 APPROVAL_LOG 테이블명(PRD: APPROVAL_LOG, DIA: EVENT_APPROVAL)이 다르며 필드명이 다수 불일치.

### 3.5 용어 일관성 검증

| 용어 항목 | PRD 표현 | UX 표현 | DIA 표현 | 표준 (terminology.md) | 상태 |
|---------|---------|---------|---------|---------------------|------|
| 서비스 사용자 | "게임 기획자", "관리자", "플레이어" | "관리자", "기획자", "운영자" | "관리자", "Admin" | "관리자" (administrator 금지) | ✅ 일치 |
| 전체 대상 플레이어 표현 | "전체 플레이어" | "전체 플레이어", "전체 유저" 혼용 | "전체 플레이어" | terminology.md에 "회원/비회원" 기준이지만 게임 도메인 특수 용어로 "플레이어" 허용 | ⚠️ UX 내 혼용 (Minor) |
| 테이블명 | APPROVAL_LOG | - | EVENT_APPROVAL | - | ⚠️ PRD-DIA 간 불일치 (Minor) |

**참고**: terminology.md의 사용자 관련 용어(회원/비회원)는 일반 서비스 용어 기준이며, 게임 LiveOps 도메인에서 "플레이어"를 사용하는 것은 도메인 특수성으로 수용 가능. 단, UX 문서 내 "전체 플레이어"와 "전체 유저"가 혼용되는 것은 통일 필요.

### 3.6 ID 참조 유효성

| 참조 | 출처 | 대상 문서 | 존재 여부 |
|------|------|---------|---------|
| PRD-GLO-001 | PRD-GLO-002 | - | ✅ 참조만 (검토 범위 외) |
| RES-GLO-002 | PRD-GLO-002 | - | ✅ 참조만 (검토 범위 외) |
| UX-GLO-001, SCR-003 | UX-GLO-002 (INT-011-06) | UX-GLO-001 | ✅ 존재 (검토 범위 외) |
| DIA-GLO-001 | DIA-GLO-002 | - | ✅ 참조만 (검토 범위 외) |
| F-006 | PRD-GLO-002 (F-012 개요) | PRD-GLO-001 | ✅ 존재 (검토 범위 외) |
| F-002 | PRD-GLO-002 (BR-012-01) | PRD-GLO-001 | ✅ 존재 (검토 범위 외) |
| ERR-002-03 | PRD-GLO-002 (REQ-012-07) | PRD-GLO-001 | ✅ 존재 (검토 범위 외) |
| SCR-001 (세그멘테이션) | UX-GLO-002 (1.2 네비게이션) | UX-GLO-001 | ✅ 존재 (검토 범위 외) |
| SCR-006~SCR-012 | UX-GLO-002 내부 참조 | UX-GLO-002 | ✅ 모두 존재 |
| DIA-010~DIA-014 | DIA-GLO-002 내부 참조 | DIA-GLO-002 | ✅ 모두 존재 |

---

## 4. 이슈 목록

| ID | 심각도 | 담당 문서 | 위치 | 설명 | 제안 |
|----|--------|---------|------|------|------|
| ISS-001 | 🟡 Major | PRD-GLO-002 | Appendix E (핸드오프 화면 ID) | PRD 핸드오프 섹션의 화면 ID가 UX 문서의 실제 화면 ID와 전체적으로 불일치. PRD는 SCR-007부터 시작하나 UX는 SCR-006부터 시작. F-009의 "SCR-007=이벤트 목록"이 실제로는 SCR-006, "SCR-008=이벤트 생성/편집"이 실제로는 SCR-007 등 1씩 어긋남. F-014는 "SCR-011=캘린더, SCR-012=타임라인"이나 실제는 SCR-009=캘린더, SCR-010=타임라인. F-015는 "SCR-013" 참조하나 실제로는 SCR-011에 통합됨 | PRD Appendix E를 UX 문서의 실제 화면 ID(SCR-006~SCR-012)에 맞게 전면 수정. 섹션 3.1 기능 추적 매트릭스를 기준으로 정정 |
| ISS-002 | 🟡 Major | UX-GLO-002 | 섹션 1.3 (화면-기능 매핑), Appendix A | F-015(성과 대시보드)가 화면-기능 매핑 테이블에서 누락됨. F-016(웹훅/알림)에 해당하는 화면(알림 센터, 웹훅 설정)이 Appendix A 화면 목록에도 없으며 이번 버전 포함 여부가 불명확 | 섹션 1.3 매핑 테이블의 SCR-011 행에 F-015 추가. F-016 관련 화면은 "Part 3 예정(미구현)" 또는 "이번 버전 범위 외" 명시. PRD에서 F-016도 MVP 범위(F-009~F-016)로 정의되어 있어 범위 명확화 필요 |
| ISS-003 | 🟡 Major | PRD-GLO-002, DIA-GLO-002 | 데이터 모델 (APPROVAL_LOG vs EVENT_APPROVAL) | PRD에서 승인 이력 테이블을 "APPROVAL_LOG"로 명명하고, DIA-010 ERD에서는 동일 엔티티를 "EVENT_APPROVAL"로 명명. 필드명도 다수 불일치: (requester_id vs requested_by), (approver_id vs reviewer_id), (action vs decision). EVENT_STATE_LOG의 actor_id(UUID)가 DIA에서 actor(string)로 다름 | PRD와 DIA 간 테이블명 및 필드명을 통일. "EVENT_APPROVAL"이 다른 엔티티 네이밍(EVENT_SCHEDULE, EVENT_PHASE, EVENT_METRICS, EVENT_STATE_LOG)과 일관성이 높으므로 PRD를 DIA 기준(EVENT_APPROVAL)으로 맞추는 것을 권장. 필드명은 PRD 기준으로 DIA를 수정하거나, DIA 기준으로 PRD를 수정하여 일치시킬 것 |
| ISS-004 | 🟢 Minor | PRD-GLO-002 | 변경 이력 | PRD 본문에 별도 변경 이력 섹션 없음. UX-GLO-002, DIA-GLO-002에는 변경 이력 테이블이 있으나 PRD만 누락 | PRD 하단에 변경 이력 섹션 추가: "v1.0 / 2026-03-23 / 초안 작성 / prd" |
| ISS-005 | 🟢 Minor | PRD-GLO-002 | 섹션 3.6 (F-013), 섹션 3.7 (F-014), UI/UX 요구사항 | F-013 UI/UX 요구사항에서 "SCR-008(이벤트 상세-상태 제어), SCR-010(상태 이력 뷰)"을 참조하나 실제 화면은 SCR-011. F-014 UI/UX 요구사항에서 "SCR-011(캘린더 뷰), SCR-012(타임라인 뷰)"를 참조하나 실제는 SCR-009, SCR-010 | ISS-001 수정 시 함께 정정 |
| ISS-006 | 🟢 Minor | UX-GLO-002 | 전체 문서 | 접근성 기준(WCAG 컴플라이언스, 최소 터치 영역 44×44px, 색상 대비 4.5:1 이상, 스크린 리더 aria-label) 미언급. review-checklist.md 5.4항 요구사항 미충족 | 별도 "접근성 가이드라인" 섹션 추가 또는 각 화면의 UI 요소 명세에 접근성 관련 속성 추가 |
| ISS-007 | 🟢 Minor | UX-GLO-002 | SCR-006 상태 배지, SCR-011 E-011-05 | UX 내 용어 혼용: SCR-010(타임라인 뷰)의 와이어프레임에서 "전체 유저" 레인명 사용, SCR-011 E-011-04에서도 "전체 유저" 사용. SCR-006 상태 배지 정의에서는 "전체 플레이어". PRD에서는 전체 "전체 플레이어"로 통일되어 있음 | UX 문서 내 "전체 유저" 표현을 "전체 플레이어"로 통일 |
| ISS-008 | 🟢 Minor | DIA-GLO-002 | DIA-011, DIA-012 | scheduled → draft 역전이(수정 시 재승인)가 DIA-011 상태 머신에 표현되지 않음. DIA-012 시퀀스는 정상 승인 경로만 다루고 있음 (의도적 생략 가능) | DIA-011에 "scheduled → draft: 이벤트 수정(재승인 요구)" 전이 추가 고려. PRD REQ-009-11, REQ-011-06 명세와의 일관성을 위해 |

---

## 5. 최종 평가

### 5.1 판정 기준 적용

| 기준 | 개수 | 판정 기준 |
|------|------|---------|
| Critical 이슈 | 0개 | Pass 가능 |
| Major 이슈 | 3개 (ISS-001, ISS-002, ISS-003) | Conditional (1~3개) |
| Minor 이슈 | 5개 (ISS-004~ISS-008) | 무관 |

### 5.2 문서별 승인 상태

| 문서 | 버전 | 결과 | 조건 |
|------|------|------|------|
| PRD-GLO-002 | v1.0 | ⚠️ 조건부 승인 | ISS-001, ISS-003 해결 후 v1.1로 재제출 |
| UX-GLO-002 | v1.0 | ⚠️ 조건부 승인 | ISS-002 해결 후 v1.1로 재제출 |
| DIA-GLO-002 | v1.0 | ✅ 승인 | - |

### 5.3 Major 이슈 수정 요청

| 담당 에이전트 | 문서 | 이슈 ID | 필수 조치 내용 |
|------------|------|---------|-------------|
| prd | PRD-GLO-002 | ISS-001 | Appendix E 핸드오프 섹션의 화면 ID를 UX 실제 ID(SCR-006~SCR-012)로 전면 수정 |
| prd, diagram | PRD-GLO-002, DIA-GLO-002 | ISS-003 | 승인 이력 테이블명(APPROVAL_LOG vs EVENT_APPROVAL) 및 필드명 통일. EVENT_STATE_LOG의 actor 필드 타입 및 metadata 필드 존재 여부 합의 후 양쪽 문서 동기화 |
| uiux-spec | UX-GLO-002 | ISS-002 | 섹션 1.3 화면-기능 매핑 테이블에 F-015 추가. F-016 관련 화면의 이번 버전 포함 여부 명확화 (포함이면 화면 정의 추가, 제외이면 "범위 외" 명시) |

### 5.4 권장 조치 (Minor)

| 담당 에이전트 | 문서 | 이슈 ID | 권장 조치 내용 |
|------------|------|---------|-------------|
| prd | PRD-GLO-002 | ISS-004 | 본문 하단에 변경 이력 섹션 추가 |
| prd | PRD-GLO-002 | ISS-005 | Major ISS-001 수정 시 섹션 3.6, 3.7 UI/UX 요구사항의 화면 ID도 함께 정정 |
| uiux-spec | UX-GLO-002 | ISS-006 | 접근성 가이드라인 섹션 추가 (다음 버전) |
| uiux-spec | UX-GLO-002 | ISS-007 | "전체 유저" 표현을 "전체 플레이어"로 전체 통일 |
| diagram | DIA-GLO-002 | ISS-008 | DIA-011에 scheduled → draft 역전이 추가 고려 |

**전체 판정**: ⚠️ Conditional — Major 이슈 3건(ISS-001, ISS-002, ISS-003) 해결 후 PRD-GLO-002 v1.1, UX-GLO-002 v1.1 재제출 요청. DIA-GLO-002는 현재 버전 승인.

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
| v1.0 | 2026-03-23 | 초안 작성 — PRD-GLO-002, UX-GLO-002, DIA-GLO-002 3종 교차 검증 리뷰 | reviewer |
