---
id: "REV-GLO-002"
title: "리뷰 리포트: A/B 테스트(실험) 기획 산출물"
project: "GLO"
version: "v1.0"
status: "draft"
created: "2026-03-24"
updated: "2026-03-24"
author: "reviewer"
reviewers: []
related_docs:
  - "PRD-GLO-003"
  - "UX-GLO-003"
  - "DIA-GLO-003"
  - "SPEC-GLO-001"
tags:
  - "project:game-liveops"
  - "type:review"
  - "topic:ab-testing"
---

# 리뷰 리포트: A/B 테스트(실험) 기획 산출물

## 문서 정보

| 항목 | 내용 |
|------|------|
| 리포트 ID | REV-GLO-002 |
| 검토일 | 2026-03-24 |
| 검토 유형 | 통합 (개별 + 교차) |
| 검토 대상 | PRD-GLO-003, UX-GLO-003, DIA-GLO-003 |
| 기준 문서 | SPEC-GLO-001 |
| 정합성 참조 | PRD-GLO-001 (F-006, F-007), PRD-GLO-002 (승인 워크플로우), DIA-GLO-001 (ERD) |
| 검토 기준 | shared/review-checklist.md, shared/terminology.md, shared/conventions.md, shared/style-guide.md |

---

## 1. 검토 요약

### 1.1 전체 평가

| 문서 | 버전 | 완결성 | 일관성 | 품질 | 결과 |
|------|------|--------|--------|------|------|
| PRD-GLO-003 | v1.0 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⚠️ Conditional |
| UX-GLO-003 | v1.0 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⚠️ Conditional |
| DIA-GLO-003 | v1.0 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⚠️ Conditional |

**전체 판정**: ⚠️ Conditional (Major 이슈 해결 필요)

### 1.2 이슈 요약

| 심각도 | 개수 | 상태 |
|--------|------|------|
| 🔴 Critical | 0 | - |
| 🟡 Major | 2 | 수정 필요 |
| 🟢 Minor | 5 | 권장 |

---

## 2. 개별 문서 검토

---

### 2.1 PRD (PRD-GLO-003)

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
| 관련 문서 참조 정확 | ✅ | PRD-GLO-001, PRD-GLO-002, RES-GLO-002, SPEC-GLO-001, UX-GLO-003, DIA-GLO-003 |
| 변경 이력 존재 | ✅ | 섹션 말미 변경 이력 테이블 작성됨 |
| 제목 레벨 구조 올바름 | ✅ | |

**PRD 체크리스트**

| 항목 | 상태 | 비고 |
|------|------|------|
| Overview 섹션 존재 | ✅ | 섹션 1, 비전/배경/목적/성공지표 포함 |
| Target Users 정의 | ✅ | 섹션 2, Primary/Secondary/Tertiary 페르소나 3인 + 사용자 시나리오 SC-007~SC-009 |
| Features & Requirements 존재 | ✅ | 섹션 3, F-017~F-023 (7개 기능) |
| Non-Functional Requirements 존재 | ✅ | 섹션 4, 성능/보안/데이터보존/확장성/가용성 |
| Dependencies & Constraints 명시 | ✅ | 섹션 6, 의존성/제약사항/가정사항 |
| Release Plan 존재 | ✅ | 섹션 7, MVP/Phase 2 마일스톤 |
| 모든 기능에 고유 ID | ✅ | F-017~F-023 (7개), PRD-GLO-001의 F-001~F-016 연번 이어받아 연속성 유지 |
| 우선순위 명시 (P0/P1/P2) | ✅ | F-017~F-023 전체 P0 |
| 사용자 스토리 형식 사용 | ✅ | US-031~US-047, As a / I want to / So that 형식 |
| Acceptance Criteria 존재 (Given-When-Then) | ✅ | Gherkin Scenario 형식, 기능별 AC-017-01 ~ AC-023-03 |
| 모호한 표현 없음 | ✅ | 구체적 수치 및 조건 명시 (p99 50ms, 1시간 집계 주기 등) |
| 측정 가능한 성공 지표 | ✅ | 섹션 1.3, 5개 지표 수치 명시 |
| 예외 상황 정의 | ✅ | 기능별 예외 처리 테이블 (ERR-EXP-XXX 코드 체계) |
| 리서치 결과 반영 | ✅ | RES-GLO-002 참조 명시 |

#### 잘된 점

- F-017~F-023 모든 기능에 사용자 스토리, 상세 요구사항(REQ), Acceptance Criteria(Gherkin), 비즈니스 규칙(BR), 데이터 요구사항, 예외 처리, UI/UX 요구사항이 구조적으로 완결됨
- SPEC-GLO-001 기반으로 작성되어 디자인 스펙과의 일관성이 높음
- PRD-GLO-001(F-006, F-007), PRD-GLO-002(승인 패턴) 연동 포인트를 명확히 명세하고 재사용 의도를 문서화함
- Open Questions(Q-016~Q-018)와 Risks(R-007~R-010) 섹션으로 미결 사항을 투명하게 관리함
- 에러 코드 체계(ERR-EXP-XXX)가 기능별로 일관되게 부여됨

#### 개선 필요

| ID | 심각도 | 위치 | 이슈 | 제안 |
|----|--------|------|------|------|
| ISS-001 | 🟡 Major | 섹션 3.2 (F-017) UI/UX 요구사항 | 상태 배지 색상 정의가 UX-GLO-003 섹션 2와 불일치. PRD에서 `testing=보라`, `analyzing=파랑`으로 표기하나 UX 스펙은 `testing=파랑(#3B82F6)`, `analyzing=보라(#8B5CF6)`로 정의하여 두 색상이 서로 뒤바뀜 | PRD 섹션 3.2 UI/UX 요구사항에서 `testing=파랑`, `analyzing=보라`로 수정하거나, UX 스펙에서 최종 기준을 확정 후 PRD에 단순 "UX-GLO-003 참조"로 일원화 |
| ISS-002 | 🟢 Minor | 섹션 7.1 Release Plan | MVP 일정이 "TBD (원격 설정 시스템 확정 후)"로 표기되어 일정 추적 불가 | Q-016 해결 후 구체적 일정 또는 상대 기간(예: "원격 설정 확정 후 N주") 추가 권장 |

---

### 2.2 UX (UX-GLO-003)

**버전**: v1.0
**결과**: ⚠️ Conditional

#### 체크리스트 결과

**공통 체크리스트**

| 항목 | 상태 | 비고 |
|------|------|------|
| YAML front matter 존재 | ✅ | |
| 필수 필드 완전 | ✅ | |
| 버전 형식 올바름 | ✅ | |
| 상태값 유효 | ✅ | |
| 관련 문서 참조 정확 | ✅ | PRD-GLO-003, DIA-GLO-003, UX-GLO-001, UX-GLO-002 |
| 변경 이력 존재 | ✅ | 섹션 9 |
| 제목 레벨 구조 올바름 | ✅ | |

**UX 체크리스트**

| 항목 | 상태 | 비고 |
|------|------|------|
| Information Architecture 존재 | ✅ | 섹션 1, 사이트맵 + 네비게이션 구조 + 화면-기능 매핑 |
| 네비게이션 구조 정의 | ✅ | Primary Navigation (사이드바) + Secondary Navigation (서브 탭) |
| 화면 목록 완전 | ✅ | SCR-013~SCR-017 (5개), SPEC-GLO-001의 SCR-EXP-001~005와 1:1 대응 |
| 모든 화면에 고유 ID (SCR-XXX) | ✅ | SCR-013~017. UX-GLO-001(SCR-001~005), UX-GLO-002(SCR-006~012) 연번 이어받음 |
| 와이어프레임 존재 | ✅ | 각 화면별 ASCII 와이어프레임 포함 |
| UI 요소 명세 존재 | ✅ | E-013-XX ~ E-017-XX 체계로 각 화면 요소 명세 |
| 상태별 화면 정의 (Default, Loading, Empty, Error) | ✅ | SCR-013~016에 상태 변형 정의 |
| 인터랙션 정의 | ✅ | INT-013-XX ~ INT-017-XX 체계로 인터랙션 명세 |
| PRD 기능과 화면 매핑 | ✅ | 섹션 8 PRD → Screen 매핑 YAML 포함 |
| 디자인 토큰 정의 | ⚠️ | 상태 배지 색상 HEX값은 정의되어 있으나 Tailwind 클래스나 공통 토큰 참조 없음 |
| 공통 컴포넌트 정의 | ✅ | 섹션 7, ExperimentStatusBadge/TrafficSlider/StatResultCard/KeyValueEditor 4종 |
| 터치 영역 기준 명시 | ⚠️ | 웹 전용이므로 필수 아니나 최소 클릭 영역 명시 없음 |
| 색상 대비 기준 명시 | ⚠️ | WCAG AA 등 대비 기준 언급 없음 |
| 스크린 리더 고려 | ⚠️ | UX-GLO-001/002 공통 접근성 가이드 참조 필요 |

#### 잘된 점

- 5개 화면(SCR-013~017) 모두 기본 정보, 목적, 와이어프레임, UI 요소 명세, 상태 변형, 인터랙션을 완결된 구조로 작성함
- 섹션 8의 PRD-Screen 매핑 YAML과 상태별 화면 커버리지가 명시되어 추적성이 우수함
- Safety Lock 모달(실험명 직접 입력 확인), 승자 롤아웃 모달에 영향 범위와 오디언스/전체 선택 라디오가 포함되어 운영 안전성을 UI 레벨에서 구체화함
- 공통 컴포넌트 4종(TrafficSlider, StatResultCard, KeyValueEditor, ExperimentStatusBadge) Props 정의가 구체적임

#### 개선 필요

| ID | 심각도 | 위치 | 이슈 | 제안 |
|----|--------|------|------|------|
| ISS-003 | 🟡 Major | 섹션 2 (SCR-013) 상태 배지 색상 정의 | `testing` 색상이 파랑(#3B82F6), `analyzing` 색상이 보라(#8B5CF6)로 정의되어 있으나 PRD-GLO-003 섹션 3.2 UI/UX 요구사항에서는 `testing=보라`, `analyzing=파랑`으로 반대로 기술되어 있음. 두 문서가 불일치하며 개발 구현 시 혼란을 유발 | UX 스펙이 최종 색상 기준이므로 UX-GLO-003 기준(testing=파랑, analyzing=보라)을 확정하고 PRD-GLO-003 섹션 3.2를 수정 또는 "UX-GLO-003 참조"로 단일화 (ISS-001과 동일 사안) |
| ISS-004 | 🟢 Minor | 섹션 5 (SCR-016) | 결과 대시보드의 `stopped` 상태 화면 정의가 없음. `stopped` 후 `completed`로 전이되기까지의 중간 구간에서 결과 대시보드 접근 시 표시 상태가 불명확 | `stopped` 상태의 결과 대시보드 표시 방식을 명세 (예: "실험이 종료되었습니다. 결과 분석 완료 후 확인 가능합니다." + Spinner 또는 진행률) |
| ISS-005 | 🟢 Minor | 섹션 7 (공통 컴포넌트) | 접근성 기준(WCAG AA 색상 대비, aria-label 등)이 명시되지 않음. UX-GLO-001/002에서 접근성 가이드가 정의된 경우 참조 명시 필요 | "접근성 기준은 UX-GLO-001 섹션 X 공통 접근성 가이드를 따른다"와 같이 참조 추가 |

---

### 2.3 다이어그램 (DIA-GLO-003)

**버전**: v1.0
**결과**: ⚠️ Conditional

#### 체크리스트 결과

**공통 체크리스트**

| 항목 | 상태 | 비고 |
|------|------|------|
| YAML front matter 존재 | ✅ | |
| 필수 필드 완전 | ✅ | |
| 버전 형식 올바름 | ✅ | |
| 상태값 유효 | ✅ | |
| 관련 문서 참조 정확 | ✅ | PRD-GLO-003, UX-GLO-003, DIA-GLO-001, DIA-GLO-002 |
| 변경 이력 존재 | ✅ | 문서 말미 |
| 제목 레벨 구조 올바름 | ✅ | |

**다이어그램 체크리스트**

| 항목 | 상태 | 비고 |
|------|------|------|
| Mermaid 문법 올바름 | ✅ | erDiagram, stateDiagram-v2, sequenceDiagram, flowchart TD 모두 문법 적합 |
| 렌더링 정상 작동 | ✅ | 각 다이어그램 코드 블록 유효 |
| 표기법 일관됨 | ✅ | 상태머신 전이 표기, 플로우차트 노드 스타일 통일 |
| 시작/종료 명확 | ✅ | 상태머신 [*], 플로우차트 Start/End 노드 명시 |
| 분기 조건 명시 | ✅ | 각 분기에 조건 라벨 표시 |
| 모든 경로 도달 가능 | ✅ | |
| 예외 흐름 포함 | ✅ | 샘플 미충족, 오디언스 미소속, 승인/반려 분기 포함 |
| PRD 로직과 일치 | ⚠️ | DIA-016 상태 머신에 `completed → archived` 전이 누락 (ISS-006 참조) |
| 화면정의서와 일치 | ✅ | 시퀀스 다이어그램에서 SCR-EXP-005 (= UX의 SCR-017) 참조 |
| 정책과 일치 | ✅ | |

#### 잘된 점

- DIA-015(ERD), DIA-016(상태 머신), DIA-017(생성~실행 시퀀스), DIA-018(트래픽 할당 플로우), DIA-019(결과 분석 플로우) 5종 다이어그램이 시스템 전체 흐름을 체계적으로 커버함
- DIA-016 상태 머신의 RBAC 역할 주석과 Safety Lock Note가 명확하여 개발 구현 시 참조 가치가 높음
- DIA-019 결과 분석 플로우에서 Chi-squared/Welch's t-test 분기, Bonferroni 보정, 샘플 미충족 분기를 모두 포함하여 통계 처리 로직을 완전하게 시각화함
- DIA-015 ERD에서 AUDIENCE 엔티티를 DIA-GLO-001 참조로 처리하여 중복 정의 없이 연동 포인트를 명확히 함

#### 개선 필요

| ID | 심각도 | 위치 | 이슈 | 제안 |
|----|--------|------|------|------|
| ISS-006 | 🟡 Major | DIA-016: 실험 상태 머신 | `completed → archived` 전이가 다이어그램에 누락됨. PRD-GLO-003 섹션 3.6 상태 전이 규칙에는 `completed → archived (experiment_operator, 보관 처리)`가 명시되어 있으나 DIA-016의 `completed` 노드는 `[*]` 종료 상태로만 연결되어 있음 | `completed --> archived : 보관 처리\n[experiment_operator]` 전이를 DIA-016에 추가. `archived --> [*]` 는 이미 정의되어 있으므로 연결만 추가하면 됨 |
| ISS-007 | 🟢 Minor | DIA-018: 트래픽 할당 플로우차트 | `CheckAudience` 노드의 분기 조건 라벨이 "미소속 또는 audience_id = NULL이 아님"으로 표기되어 논리가 모호함. NULL 조건의 방향이 직관적으로 이해하기 어려움 | 조건 라벨을 "미소속 (audience_id가 지정된 경우)"과 "소속 또는 audience_id = NULL (전체 대상)"으로 수정하여 NULL 전체 대상 케이스를 명확히 구분 |

---

## 3. 교차 문서 검토

### 3.1 기능 추적 매트릭스

| PRD 기능 | 화면 (UX) | 다이어그램 (DIA) | SPEC 기준 | 상태 |
|----------|----------|-----------------|-----------|------|
| F-017 실험 생성/관리 | SCR-013, SCR-014, SCR-015 | DIA-017 (시퀀스) | SCR-EXP-001, SCR-EXP-002, SCR-EXP-003 | ✅ |
| F-018 변형 정의 | SCR-014 Step2 | DIA-015 (ERD EXPERIMENT_VARIANT), DIA-017 | SCR-EXP-002 Step2 | ✅ |
| F-019 오디언스 타겟팅 | SCR-014 Step3 | DIA-015 (ERD AUDIENCE FK), DIA-018 (트래픽 플로우 오디언스 분기) | SCR-EXP-002 Step3 | ✅ |
| F-020 트래픽 분배 | SCR-014 Step2, SCR-015 실시간 현황 탭 | DIA-017 (MurmurHash3 할당), DIA-018 (트래픽 할당 플로우) | 트래픽 분배 섹션 | ✅ |
| F-021 상태 머신/승인 워크플로우 | SCR-015, SCR-017 | DIA-016 (상태 머신), DIA-017 (승인 시퀀스) | 상태 머신 섹션 | ⚠️ DIA-016 `completed → archived` 누락 (ISS-006) |
| F-022 목표 지표/통계 분석 | SCR-014 Step4, SCR-016 | DIA-015 (ERD EXPERIMENT_GOAL, EXPERIMENT_RESULT), DIA-019 (결과 분석 플로우) | 통계 분석 섹션 | ✅ |
| F-023 결과 대시보드/승자 롤아웃 | SCR-016 | DIA-019 (결과 분석 플로우) | SCR-EXP-004 | ✅ |

### 3.2 SPEC-GLO-001 대비 커버리지

| SPEC 섹션 | PRD | UX | DIA | 상태 |
|-----------|-----|----|-----|------|
| 상태 머신 (9개 상태, RBAC) | F-021 ✅ | SCR-015 헤더 버튼, SCR-017 ✅ | DIA-016 ✅ (단, completed→archived 누락) | ⚠️ |
| 5단계 위저드 | F-017 ✅ | SCR-014 Step1~5 ✅ | DIA-017 시퀀스 ✅ | ✅ |
| 트래픽 분배 (MurmurHash3, Sticky) | F-020 ✅ | SCR-014 TrafficSlider ✅ | DIA-018 ✅ | ✅ |
| 오디언스 연동 (F-006) | F-019 ✅ | SCR-014 Step3 ✅ | DIA-015 AUDIENCE FK ✅ | ✅ |
| 목표 지표/통계 분석 | F-022 ✅ | SCR-014 Step4, SCR-016 ✅ | DIA-019 ✅ | ✅ |
| 결과 대시보드/승자 롤아웃 | F-023 ✅ | SCR-016 ✅ | DIA-019 ✅ | ✅ |
| 승인 워크플로우 (version_snapshot) | F-021 ✅ | SCR-017 ✅ | DIA-017 시퀀스 ✅ | ✅ |
| 에러 처리 (ERR-EXP-001~005) | F-017~F-023 ✅ | 유효성 검증 섹션 ✅ | - | ✅ |
| 데이터 모델 (7개 테이블) | 섹션 5 ✅ | - | DIA-015 ERD ✅ | ✅ |

### 3.3 이전 문서와의 정합성

#### PRD-GLO-001 (F-006 오디언스 타겟팅) 연동

| 항목 | PRD-GLO-003 | UX-GLO-003 | DIA-GLO-003 | 판정 |
|------|------------|------------|------------|------|
| 오디언스 선택 연동 방식 | F-019 REQ-019-01: audience_id NULL = 전체 플레이어, 기존 오디언스 선택 | SCR-014 Step3 E-014-20: "전체 플레이어" + 기존 오디언스 드롭다운 | DIA-015 ERD: AUDIENCE FK nullable, DIA-018: audience_id NULL 분기 | ✅ 일관됨 |
| Sticky 할당 (이탈 플레이어 처리) | F-019 BR-019-03, F-020 REQ-020-05 | 명시적 화면 정의 없음 (백엔드 로직) | DIA-018: `CheckAssignment` → 기존 할당 있으면 반환 | ✅ 충분 |
| 오디언스 비활성화 시 처리 | F-019 REQ-019-05: paused 자동 전환 + 알림 | UX에 알림 표시 화면 미정의 (별도 알림 시스템 전제) | SPEC-GLO-001 명시 사항, DIA에는 미표현 | ✅ 허용 범위 (알림 UI는 메시지 기능 범위) |

#### PRD-GLO-002 (승인 워크플로우) 패턴 일관성

| 항목 | PRD-GLO-002 패턴 | PRD-GLO-003 재사용 | 판정 |
|------|-----------------|------------------|------|
| 승인 이력 테이블 구조 | EVENT_APPROVAL (version_snapshot JSONB, requested_by, decision) | EXPERIMENT_APPROVAL (동일 구조) | ✅ 일관됨 |
| 자가 승인 금지 | event_approver ≠ event_creator | experiment_approver ≠ experiment_creator (created_by ≠ approved_by) | ✅ 일관됨 |
| 반려 사유 필수 | rejection_reason 필수 | REQ-021-05, AC-021-03 동일 | ✅ 일관됨 |
| Safety Lock 확인 모달 | 이벤트 긴급 종료 패턴 | running/paused → stopped Safety Lock 모달, 실험명 직접 입력 확인 추가 | ✅ 동일 패턴, 강화됨 |
| RBAC 역할 체계 | event_creator, event_approver, event_operator | experiment_creator, experiment_approver, experiment_operator | ✅ 네이밍 일관됨 |

#### DIA-GLO-001 ERD 확장 정합성

| 항목 | DIA-GLO-001 | DIA-GLO-003 | 판정 |
|------|------------|------------|------|
| AUDIENCE 엔티티 | DIA-GLO-001에서 정의 (id, name, status, environment_id FK, created_at, updated_at) | DIA-015 ERD에 AUDIENCE 엔티티 최소 필드만 표시하고 "전체 정의는 DIA-GLO-001 참조" 명기 | ✅ 올바른 참조 방식 |
| EXPERIMENT.audience_id FK | - | EXPERIMENT ||--o| AUDIENCE: targeted_by (0 또는 1, nullable) | ✅ NULL 허용 설계 일관됨 |

### 3.4 용어 일관성

| 표현 | PRD-GLO-003 | UX-GLO-003 | DIA-GLO-003 | SPEC-GLO-001 | 판정 |
|------|------------|------------|------------|-------------|------|
| 실험 (Experiment) | ✅ | ✅ | ✅ | ✅ | ✅ |
| 변형 (Variant) | ✅ | ✅ | ✅ | ✅ | ✅ |
| 컨트롤 (Control) | ✅ | ✅ | ✅ | ✅ | ✅ |
| 오디언스 (Audience) | ✅ | ✅ | ✅ | ✅ | ✅ |
| 관리자 (administrator X) | ✅ (관리자) | ✅ (관리자) | ✅ | ✅ | ✅ |
| 회원/사용자 | N/A (게임 플레이어 도메인 — "플레이어" 사용) | N/A | N/A | N/A | ✅ |
| Sticky 할당 | ✅ | ✅ | ✅ | ✅ | ✅ |
| Safety Lock | ✅ | ✅ | ✅ | ✅ | ✅ |

### 3.5 ID 참조 유효성

| 참조 ID | 출처 문서 | 존재 여부 | 판정 |
|---------|---------|----------|------|
| F-017~F-023 | PRD-GLO-003 | ✅ | 유효 |
| SCR-013~017 | UX-GLO-003 | ✅ | 유효 |
| DIA-015~019 | DIA-GLO-003 | ✅ | 유효 |
| PRD-GLO-001 F-006 | PRD-GLO-001 | ✅ | 유효 |
| PRD-GLO-001 F-007 | PRD-GLO-001 | ✅ | 유효 |
| PRD-GLO-002 (EVENT_APPROVAL 패턴) | PRD-GLO-002 | ✅ | 유효 |
| DIA-GLO-001 (AUDIENCE 엔티티) | DIA-GLO-001 | ✅ | 유효 |
| DIA-GLO-002 (승인 워크플로우 패턴) | DIA-GLO-002 | ✅ | 유효 |
| SPEC-GLO-001 | docs/superpowers/specs/ | ✅ | 유효 |
| SCR-EXP-005 (DIA-017 시퀀스 참조) | UX-GLO-003 SCR-017 | ⚠️ | 명명 불일치: DIA-017 시퀀스에서 `SCR-EXP-005`로 참조하나 UX 스펙 ID는 `SCR-017` (ISS-008) |

---

## 4. 종합 피드백

### 4.1 즉시 조치 (Critical)

없음.

### 4.2 승인 전 조치 (Major)

| 담당 | 문서 | 이슈 ID | 조치 내용 |
|------|------|---------|----------|
| prd | PRD-GLO-003 | ISS-001 | 섹션 3.2 상태 배지 색상 정의를 UX-GLO-003 기준(testing=파랑, analyzing=보라)으로 수정 또는 UX-GLO-003 참조로 일원화 |
| diagram | DIA-GLO-003 | ISS-006 | DIA-016 상태 머신에 `completed --> archived` 전이 추가 (experiment_operator 권한 명기) |

### 4.3 권장 조치 (Minor)

| 담당 | 문서 | 이슈 ID | 조치 내용 |
|------|------|---------|----------|
| prd | PRD-GLO-003 | ISS-002 | 섹션 7.1 Release Plan MVP 일정에 구체적 기간 또는 선행 조건 기반 상대 기간 추가 |
| uiux-spec | UX-GLO-003 | ISS-003 | 색상 수정 후 PRD ISS-001과 동시 해결 (동일 사안) |
| uiux-spec | UX-GLO-003 | ISS-004 | SCR-016 결과 대시보드에서 `stopped` 상태 표시 방식 정의 추가 |
| uiux-spec | UX-GLO-003 | ISS-005 | 접근성 기준 참조 문구 추가 (UX-GLO-001 공통 가이드 참조) |
| diagram | DIA-GLO-003 | ISS-007 | DIA-018 `CheckAudience` 분기 라벨 수정 (NULL 조건 방향 명확화) |
| diagram | DIA-GLO-003 | ISS-008 | DIA-017 시퀀스의 `SCR-EXP-005` 참조를 `SCR-017`로 수정 (UX ID 체계 일관성) |

> ISS-001과 ISS-003은 동일 현상(PRD-UX 간 색상 정의 불일치)으로 어느 쪽을 수정해도 동시 해결됨. 색상 최종 기준은 UX-GLO-003으로 확정 권장.

---

## 5. 승인 상태

| 문서 | 버전 | 결과 | 조건 |
|------|------|------|------|
| PRD-GLO-003 | v1.0 | ⚠️ 조건부 | ISS-001 해결 후 승인 (ISS-002는 Minor, 차기 버전 가능) |
| UX-GLO-003 | v1.0 | ⚠️ 조건부 | ISS-003 해결 후 승인 (ISS-004, ISS-005는 Minor) |
| DIA-GLO-003 | v1.0 | ⚠️ 조건부 | ISS-006 해결 후 승인 (ISS-007, ISS-008는 Minor) |

**다음 단계**: ISS-001(=ISS-003), ISS-006 수정 후 각 문서 v1.1로 업데이트하고 재검토 요청.

---

## Appendix

### A. 이슈 전체 목록

| ID | 심각도 | 대상 문서 | 위치 | 설명 |
|----|--------|---------|------|------|
| ISS-001 | 🟡 Major | PRD-GLO-003 | 섹션 3.2 UI/UX 요구사항 | testing/analyzing 상태 배지 색상이 UX 스펙과 불일치 (뒤바뀜) |
| ISS-002 | 🟢 Minor | PRD-GLO-003 | 섹션 7.1 Release Plan | MVP 일정 TBD — 추적 불가 |
| ISS-003 | 🟡 Major | UX-GLO-003 | 섹션 2 SCR-013 상태 배지 | ISS-001과 동일 불일치 현상 (동시 해결 필요) |
| ISS-004 | 🟢 Minor | UX-GLO-003 | 섹션 5 SCR-016 | stopped 상태 결과 대시보드 화면 정의 누락 |
| ISS-005 | 🟢 Minor | UX-GLO-003 | 섹션 7 공통 컴포넌트 | 접근성 기준 참조 미명시 |
| ISS-006 | 🟡 Major | DIA-GLO-003 | DIA-016 상태 머신 | completed → archived 전이 누락 |
| ISS-007 | 🟢 Minor | DIA-GLO-003 | DIA-018 플로우차트 | CheckAudience 분기 라벨 논리 모호 |
| ISS-008 | 🟢 Minor | DIA-GLO-003 | DIA-017 시퀀스 | SCR-EXP-005 참조를 UX ID인 SCR-017로 통일 필요 |

### B. 검토 기준 참조

- `shared/review-checklist.md`
- `shared/terminology.md`
- `shared/conventions.md`
- `shared/style-guide.md`

### C. 변경 이력

| 버전 | 일자 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| v1.0 | 2026-03-24 | 초안 작성 — PRD-GLO-003, UX-GLO-003, DIA-GLO-003 통합 검토. Critical 0건, Major 2건(ISS-001/ISS-006), Minor 5건(ISS-002~005, ISS-007~008) 식별. 전체 판정 Conditional | reviewer |
