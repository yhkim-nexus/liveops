---

## id: "REV-GLO-004"
title: "검토 리포트: 플레이어 상태 조회 및 계정 조치 기획 문서"
project: "GLO"
version: "v1.0"
status: "completed"
created: "2026-03-27"
updated: "2026-03-27"
author: "reviewer"
reviewers: []
related_docs:
  - "SES-GLO-007"
  - "PRD-GLO-006"
  - "UX-GLO-006"
  - "DIA-GLO-006"
tags:
  - "project:game-liveops"
  - "type:review"
  - "topic:player-management"

# 검토 리포트: 플레이어 상태 조회 및 계정 조치 기획 문서

## 문서 정보


| 항목     | 내용                                                                                              |
| ------ | ----------------------------------------------------------------------------------------------- |
| 리포트 ID | REV-GLO-004                                                                                     |
| 검토일    | 2026-03-27                                                                                      |
| 검토 유형  | 통합 (개별 + 교차)                                                                                    |
| 검토 대상  | SES-GLO-007, PRD-GLO-006, UX-GLO-006, DIA-GLO-006                                               |
| 검토 기준  | shared/review-checklist.md, shared/terminology.md, shared/conventions.md, shared/style-guide.md |


---

## 1. 검토 요약

### 1.1 전체 평가


| 문서          | 버전   | 완결성   | 일관성   | 품질    | 결과             |
| ----------- | ---- | ----- | ----- | ----- | -------------- |
| SES-GLO-007 | v1.0 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐  | ⭐⭐⭐⭐⭐ | ⚠️ Conditional |
| PRD-GLO-006 | v1.0 | ⭐⭐⭐⭐  | ⭐⭐⭐⭐  | ⭐⭐⭐⭐  | ⚠️ Conditional |
| UX-GLO-006  | v1.0 | ⭐⭐⭐⭐  | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐  | ⚠️ Conditional |
| DIA-GLO-006 | v1.0 | ⭐⭐⭐   | ⭐⭐⭐⭐  | ⭐⭐⭐⭐  | ⚠️ Conditional |


**전체 판정**: ⚠️ Conditional (Major 이슈 해결 필요)

### 1.2 이슈 요약


| 심각도         | 개수  | 상태    |
| ----------- | --- | ----- |
| 🔴 Critical | 0   | -     |
| 🟡 Major    | 5   | 수정 필요 |
| 🟢 Minor    | 8   | 권장    |


---

## 2. 개별 문서 검토

---

### 2.1 SES-GLO-007 (기획 세션)

**버전**: v1.0
**결과**: ⚠️ Conditional

#### 체크리스트 결과


| 항목                   | 상태  |
| -------------------- | --- |
| YAML front matter 완전 | ✅   |
| 프로젝트 개요 및 목적         | ✅   |
| 문서 ID 체계 정의          | ✅   |
| 실행 계획 (Task 정의)      | ✅   |
| 결정 사항 (D-xxx)        | ✅   |
| 액션 아이템 (A-xxx)       | ✅   |
| 미결 사항 (Q-xxx)        | ✅   |
| 기능 목록 포함             | ✅   |
| 변경 이력 작성             | ✅   |
| 액션 아이템 상태 최신화        | ⚠️  |


#### 잘된 점

- 프로젝트 배경, 벤치마킹 근거, 기존 구현체 참조까지 충실히 기술
- D-033~D-035 결정 사항에 근거가 명확히 작성됨
- Q-024~Q-026 미결 사항을 세 가지로 정리하여 후속 논의 항목을 명시적으로 관리

#### 개선 필요


| ID      | 심각도      | 위치                        | 이슈                                                                                               | 제안                                                                                     |
| ------- | -------- | ------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| ISS-001 | 🟢 Minor | Section 4.1 (다이어그램 ID 계획) | SES에서 DIA-025를 "플레이어 검색 플로우 (플로우차트)"로 명시했으나, 실제 DIA-GLO-006에서 DIA-025는 ERD로 작성되었음. 계획과 산출물 간 불일치 | SES 문서의 DIA-025 설명을 "플레이어 데이터 모델 (ERD)"로 수정하거나, DIA-GLO-006에 검색 플로우 다이어그램을 DIA-028로 추가 |
| ISS-002 | 🟢 Minor | Section 6 (액션 아이템)        | A-032~A-034 상태가 모두 in_progress/pending으로 남아 있음. 산출물 작성 완료 후 completed로 갱신이 누락됨                   | 산출물 작성 완료 시점에 A-032~A-034 상태를 completed로 업데이트                                          |


---

### 2.2 PRD-GLO-006

**버전**: v1.0
**결과**: ⚠️ Conditional

#### 체크리스트 결과


| 항목                            | 상태  |
| ----------------------------- | --- |
| YAML front matter 완전          | ✅   |
| Overview 섹션                   | ✅   |
| Target Users 정의               | ✅   |
| Features & Requirements       | ✅   |
| 모든 기능에 고유 ID                  | ✅   |
| 우선순위 명시 (P0/P1/P2)            | ✅   |
| 유저 스토리 형식                     | ✅   |
| Acceptance Criteria 존재        | ✅   |
| Non-Functional Requirements   | ✅   |
| Dependencies & Constraints 섹션 | ❌   |
| Release Plan 섹션               | ❌   |
| 예외 상황 정의                      | ⚠️  |
| 변경 이력 작성                      | ✅   |
| YAML tags에 status/phase 태그    | ⚠️  |


#### 잘된 점

- F-034~F-036 세 기능의 유저 스토리, 요구사항, AC가 체계적으로 정의됨
- 성공 지표(Success Metrics)에 측정 방법까지 명시하여 검증 기준이 명확
- API Endpoints 섹션에 권한 수준(Viewer+, Operator+)이 명시되어 RBAC 연동 근거가 분명

#### 개선 필요


| ID      | 심각도      | 위치                       | 이슈                                                                                                                                           | 제안                                                                                                                                                                             |
| ------- | -------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ISS-003 | 🟡 Major | 전체 문서                    | Dependencies & Constraints 섹션 누락. review-checklist.md 3.1 항목 필수 요구                                                                           | "## 7. Dependencies & Constraints" 섹션 추가: PRD-GLO-005(RBAC) 선행 의존성, Mock API 제약, RBAC Operator 역할 전제 조건 등을 명시                                                                  |
| ISS-004 | 🟡 Major | 전체 문서                    | Release Plan 섹션 누락. review-checklist.md 3.1 항목 필수 요구                                                                                         | "## 8. Release Plan" 섹션 추가: Phase 1 MVP 범위(F-034~F-036), 후속 버전 항목(Bulk Action, Suspend 기능 등) 정의                                                                                |
| ISS-005 | 🟡 Major | Section 5.1 (Data Model) | PRD의 audiences 필드가 `string[]` (오디언스 이름 문자열 배열)로 정의되어 있으나, DIA-GLO-006의 ERD에서는 AUDIENCE를 별도 엔티티로 모델링하고 PLAYER와 M:N 관계로 표현함. 두 문서 간 데이터 모델 불일치 | PRD Section 5.1의 audiences 필드 설명에 "현재 Mock 구현은 이름 문자열 배열, 실제 구현 시 AUDIENCE 엔티티 참조로 전환 예정"을 명시하거나, DIA의 ERD를 PRD 데이터 모델에 맞게 단순화                                                 |
| ISS-006 | 🟢 Minor | Sections 3.1~3.3 (AC)    | Acceptance Criteria가 Given-When-Then 형식을 따르지 않음. review-checklist.md 3.2 권장 형식                                                               | AC 항목을 "Given [전제조건] / When [행동] / Then [결과]" 형식으로 재작성. 예: AC-034-01 → "Given 검색바가 활성화 상태일 때 / When 'alpha'를 입력하고 300ms가 경과하면 / Then 닉네임 또는 이메일에 'alpha'가 포함된 플레이어가 테이블에 표시된다" |
| ISS-007 | 🟢 Minor | YAML front matter tags   | tags에 `status:draft`, `phase:planning` 태그 누락. conventions.md 5절 태그 규칙 참조                                                                     | tags에 `"status:draft"`, `"phase:planning"` 추가                                                                                                                                  |


---

### 2.3 UX-GLO-006

**버전**: v1.0
**결과**: ⚠️ Conditional

#### 체크리스트 결과


| 항목                                      | 상태  |
| --------------------------------------- | --- |
| YAML front matter 완전                    | ✅   |
| Information Architecture                | ✅   |
| 네비게이션 구조 정의                             | ✅   |
| 화면 목록 완전                                | ✅   |
| 모든 화면에 고유 ID                            | ✅   |
| 와이어프레임 존재                               | ✅   |
| UI 요소 명세                                | ✅   |
| 상태별 화면 정의 (Default/Loading/Empty/Error) | ✅   |
| 인터랙션 정의                                 | ✅   |
| PRD 기능과 화면 매핑                           | ✅   |
| 접근성 기준 섹션                               | ❌   |
| 디자인 토큰/공통 컴포넌트 정의                       | ⚠️  |
| 변경 이력 작성                                | ✅   |


#### 잘된 점

- Default, Loading, Empty, Error 상태를 와이어프레임 포함하여 모두 정의
- Banned/Suspended 상태별 계정 관리 카드 렌더링 차이를 명확히 정의
- INT-xxx 인터랙션 명세에 트리거, 액션, 결과가 일관된 형식으로 작성됨

#### 개선 필요


| ID      | 심각도      | 위치                              | 이슈                                                                                                                                                      | 제안                                                                                        |
| ------- | -------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| ISS-008 | 🟡 Major | 전체 문서                           | 접근성 기준 섹션 누락. review-checklist.md 5.4 항목(터치 영역, 색상 대비, 스크린 리더) 필수                                                                                       | 문서 말미에 "## 접근성 기준" 섹션 추가: 최소 터치 영역 44x44px, WCAG AA 색상 대비 비율, 스크린 리더 대응(aria-label) 기준 명시 |
| ISS-009 | 🟢 Minor | Section 1.1 (사이트맵)              | 사이트맵에서 플레이어 섹션 접근 권한이 "editor 이상"으로 표기됨. PRD-GLO-006 및 RBAC(PRD-GLO-005)에는 "Viewer 이상" 조회, "Operator 이상" 조치로 구분되어 있음. "editor" 역할은 RBAC 정의에 존재하지 않을 가능성 | RBAC PRD-GLO-005에 정의된 역할 명칭과 일치시킬 것. "viewer 이상"(조회), "operator 이상"(조치)으로 분리 표기           |
| ISS-010 | 🟢 Minor | SCR-026 와이어프레임 (검색 결과 예시)       | 소속 오디언스 예시 텍스트로 "고래 유저"가 사용됨. terminology.md에서 "유저"는 금지 표현이며 "회원"을 표준 용어로 지정                                                                            | "고래 유저" → "고래 회원"으로 수정                                                                    |
| ISS-011 | 🟢 Minor | Section 2.2 (SCR-027, UI 요소 명세) | E-027-07 계정 관리 카드가 `operator 이상에게만 표시`로 명시되어 있으나, SCR-026 사이트맵 접근 권한이 "editor 이상"으로 달리 표기되어 권한 계층 불명확. Suspended 상태에서 닉네임 변경 버튼의 권한 요건도 명시 필요           | E-027-07~E-027-11 요소 설명에 각 요소별 RBAC 조건(`can("operator")` 등)을 명시적으로 기재                     |


---

### 2.4 DIA-GLO-006

**버전**: v1.0
**결과**: ⚠️ Conditional

#### 체크리스트 결과


| 항목                   | 상태  |
| -------------------- | --- |
| YAML front matter 완전 | ✅   |
| Mermaid 문법 올바름       | ✅   |
| 시작/종료 명확             | ✅   |
| 분기 조건 명시             | ✅   |
| PRD 로직과 일치           | ⚠️  |
| 화면정의서와 일치            | ✅   |
| 예외 흐름 포함             | ⚠️  |
| 계획된 다이어그램 목록 완전      | ❌   |
| 변경 이력 작성             | ✅   |


#### 잘된 점

- DIA-026 시퀀스 다이어그램에서 권한 확인, API 호출, Store 업데이트, 감사 로그 기록, UI 갱신 순서가 상세히 표현됨
- DIA-027 상태 다이어그램에서 active/banned/suspended 상태 내부 설명(nested state)을 포함하여 비즈니스 의미를 명확히 전달
- ERD(DIA-025)에서 PLAYER_ACTION_LOG를 별도 엔티티로 모델링하여 감사 로그 요구사항(REQ-036-07)을 구조화

#### 개선 필요


| ID      | 심각도      | 위치                              | 이슈                                                                                                                                                                                                  | 제안                                                                                                                                    |
| ------- | -------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| ISS-012 | 🟡 Major | DIA-025 (ERD) vs SES-GLO-007 계획 | SES-GLO-007 Section 4.4에서 DIA-025를 "플레이어 검색 플로우 (플로우차트)"로 계획했으나, 실제로는 ERD가 DIA-025로 작성됨. F-034 플레이어 검색 기능을 커버하는 플로우차트가 누락되어 있음                                                                      | F-034 검색 플로우(검색어 입력 → 300ms 디바운스 → API 호출 → 결과 렌더링 → 상세 이동)를 커버하는 플로우차트를 DIA-028로 추가. SES 문서의 DIA-025 계획 설명도 ERD로 일치시켜 수정             |
| ISS-013 | 🟡 Major | DIA-025 (ERD)                   | ERD에서 AUDIENCE 엔티티를 별도로 모델링하고 PLAYER와 M:N 관계를 정의했으나, PRD-GLO-006 Section 5.1 데이터 모델의 `audiences: string[]`(이름 문자열 배열)과 불일치. 구현체 기준(`apps/admin/src/features/players/types/player.ts`)도 string[] 배열임 | ERD의 AUDIENCE 엔티티 표현을 현재 구현 기준으로 단순화하거나, PRD 데이터 모델에 "향후 정규화 예정"임을 명시하여 두 문서가 동일한 현재 상태를 반영하도록 정렬                                     |
| ISS-014 | 🟢 Minor | DIA-026 (시퀀스 다이어그램)             | 계획(SES Section 4.4)에 "계정 조치 시퀀스 — 관리자 → 조치 요청 → 권한 검증 → 조치 실행 → 감사 로그 기록"으로 명시되어 있으나, 닉네임 변경(nickname_change) 시퀀스가 누락됨. 차단/해제만 포함                                                                   | 닉네임 변경 플로우(닉네임 변경 버튼 클릭 → 모달 → PATCH /api/players/[id]/nickname → Store 업데이트 → Log 기록 → UI 갱신)를 DIA-026에 추가하거나 별도 DIA-028/DIA-029로 분리 |
| ISS-015 | 🟢 Minor | DIA-027 (상태 다이어그램)              | `suspended --> active` 전이의 레이블이 "관리자 해제 (unban)"으로 표기됨. 이는 banned → active 전이의 레이블과 동일하여 suspended 해제가 같은 unban API를 사용하는지, 별도 API가 필요한지 불분명                                                        | PRD 또는 API 엔드포인트 정의와 연계하여 suspended 해제 방법(별도 API vs unban 재사용)을 명확히 결정하고, 레이블을 "관리자 정지 해제" 등으로 구분하거나 동일 API 사용임을 주석으로 명시              |


---

## 3. 교차 문서 검토

### 3.1 기능 추적 매트릭스


| PRD 기능                   | 화면 (UX)                                | 다이어그램 (DIA)                            | 상태           |
| ------------------------ | -------------------------------------- | -------------------------------------- | ------------ |
| F-034: 플레이어 검색           | SCR-026 (INT-026-01~05)                | ❌ 플로우차트 누락 (ERD만 존재)                   | ⚠️ 다이어그램 미커버 |
| F-035: 플레이어 프로필 상세       | SCR-027 (E-027-04~06)                  | DIA-025 ERD (데이터 모델), DIA-027 상태 다이어그램 | ✅            |
| F-036: 계정 조치 (ban/unban) | SCR-027 (E-027-08~~11, INT-027-01~~03) | DIA-026 (ban/unban 시퀀스), DIA-027       | ✅            |
| F-036: 계정 조치 (닉네임 변경)    | SCR-027 (E-027-09, INT-027-04~05)      | ❌ 닉네임 변경 시퀀스 누락                        | ⚠️ 다이어그램 미커버 |


### 3.2 용어 일관성


| 위치                            | 사용된 표현           | 표준 용어 (terminology.md)           | 상태                 |
| ----------------------------- | ---------------- | -------------------------------- | ------------------ |
| UX-GLO-006, SCR-026 와이어프레임 예시 | "고래 유저"          | "고래 회원"                          | ⚠️ 수정 필요 (ISS-010) |
| PRD-GLO-006 전체                | "플레이어" (Player)  | terminology.md에 게임 도메인 특화 용어 미정의 | ℹ️ 도메인 용어로 허용 가능   |
| DIA-GLO-006 전체                | "관리자"            | "관리자" (terminology.md 표준)        | ✅                  |
| PRD-GLO-006, UX-GLO-006       | "운영자" (Operator) | RBAC 역할 명칭으로 별도 도메인 용어           | ✅                  |


### 3.3 ID 참조 검증


| 참조 ID            | 참조 위치                                        | 실제 존재 여부                        |
| ---------------- | -------------------------------------------- | ------------------------------- |
| PRD-GLO-001~005  | PRD-GLO-006 related_docs                     | ✅                               |
| RES-GLO-002      | PRD-GLO-006, SES-GLO-007                     | ✅                               |
| PRD-GLO-006      | UX-GLO-006, DIA-GLO-006 related_docs         | ✅                               |
| UX-GLO-006       | PRD-GLO-006, DIA-GLO-006 related_docs        | ✅                               |
| DIA-GLO-006      | PRD-GLO-006, UX-GLO-006 related_docs         | ✅                               |
| SCR-026, SCR-027 | UX-GLO-006, DIA-GLO-026 참고                   | ✅                               |
| F-034~F-036      | PRD-GLO-006, SES-GLO-007                     | ✅                               |
| DIA-025          | SES-GLO-007 계획(플로우차트) vs DIA-GLO-006 실제(ERD) | ⚠️ 계획-실행 불일치 (ISS-001, ISS-012) |
| SPEC-GLO-003     | SES-GLO-007 related_docs                     | ⚠️ 해당 문서의 실제 존재 여부 확인 필요        |


### 3.4 데이터 모델 정합성


| 항목                | PRD-GLO-006                | DIA-GLO-006 (ERD)       | 구현체 (player.ts)         | 상태                        |
| ----------------- | -------------------------- | ----------------------- | ----------------------- | ------------------------- |
| id 타입             | string                     | string PK               | string                  | ✅                         |
| status 값          | active/banned/suspended    | active/banned/suspended | active/banned/suspended | ✅                         |
| platform 값        | iOS/Android/PC             | iOS/Android/PC          | iOS/Android/PC          | ✅                         |
| audiences         | string[] (이름 배열)           | AUDIENCE 엔티티 M:N        | string[]                | ⚠️ 불일치 (ISS-005, ISS-013) |
| banReason         | optional string            | nullable string         | optional string         | ✅                         |
| bannedAt          | optional string (ISO 8601) | nullable datetime       | optional string         | ✅                         |
| PLAYER_ACTION_LOG | API 응답에 미포함                | 별도 엔티티 정의               | 미구현 (Mock)              | ℹ️ 향후 구현 항목               |


---

## 4. 종합 피드백

### 4.1 즉시 조치 (Critical)

없음

### 4.2 승인 전 조치 (Major)


| 담당        | 문서          | 이슈 ID   | 조치 내용                                                               |
| --------- | ----------- | ------- | ------------------------------------------------------------------- |
| prd       | PRD-GLO-006 | ISS-003 | Dependencies & Constraints 섹션 추가 (PRD-GLO-005 선행 의존, Mock API 제약 등) |
| prd       | PRD-GLO-006 | ISS-004 | Release Plan 섹션 추가 (Phase 1 MVP 범위, 후속 버전 항목)                       |
| prd       | PRD-GLO-006 | ISS-005 | audiences 필드 설명에 현재(string[]) vs 향후(엔티티 정규화) 구분 명시                  |
| uiux-spec | UX-GLO-006  | ISS-008 | 접근성 기준 섹션 추가 (터치 영역, 색상 대비, 스크린 리더)                                 |
| diagram   | DIA-GLO-006 | ISS-012 | F-034 검색 플로우차트 추가 (DIA-028) 또는 SES 계획과 정합성 확보                       |
| diagram   | DIA-GLO-006 | ISS-013 | ERD의 audiences 모델을 PRD/구현체와 일치시키거나 불일치 이유 명시                        |


### 4.3 권장 조치 (Minor)


| 담당        | 문서          | 이슈 ID   | 조치 내용                                                      |
| --------- | ----------- | ------- | ---------------------------------------------------------- |
| planner   | SES-GLO-007 | ISS-001 | DIA-025 계획 설명을 실제 산출물(ERD)에 맞게 수정                          |
| planner   | SES-GLO-007 | ISS-002 | A-032~A-034 액션 아이템 상태를 completed로 갱신                       |
| prd       | PRD-GLO-006 | ISS-006 | AC를 Given-When-Then 형식으로 재작성                               |
| prd       | PRD-GLO-006 | ISS-007 | YAML tags에 `status:draft`, `phase:planning` 태그 추가          |
| uiux-spec | UX-GLO-006  | ISS-009 | 사이트맵 접근 권한을 RBAC 역할 명칭과 일치시킴 (editor → viewer/operator 구분) |
| uiux-spec | UX-GLO-006  | ISS-010 | 와이어프레임 예시 텍스트 "고래 유저" → "고래 회원" 수정                         |
| uiux-spec | UX-GLO-006  | ISS-011 | UI 요소 명세에 요소별 RBAC 조건 명시                                   |
| diagram   | DIA-GLO-006 | ISS-014 | 닉네임 변경 시퀀스를 DIA-026에 추가하거나 별도 다이어그램으로 분리                   |
| diagram   | DIA-GLO-006 | ISS-015 | DIA-027에서 suspended → active 전이 레이블을 ban 해제와 구분하여 명확히 표기   |


---

## 5. 승인 상태


| 문서          | 버전   | 결과     | 조건                                 |
| ----------- | ---- | ------ | ---------------------------------- |
| SES-GLO-007 | v1.0 | ⚠️ 조건부 | ISS-001, ISS-002 반영 권장 (Minor)     |
| PRD-GLO-006 | v1.0 | ⚠️ 조건부 | ISS-003, ISS-004, ISS-005 해결 후 재검토 |
| UX-GLO-006  | v1.0 | ⚠️ 조건부 | ISS-008 해결 후 재검토                   |
| DIA-GLO-006 | v1.0 | ⚠️ 조건부 | ISS-012, ISS-013 해결 후 재검토          |


**다음 단계**: Major 이슈(ISS-003, ISS-004, ISS-005, ISS-008, ISS-012, ISS-013) 수정 후 버전 v1.1로 업데이트하여 재검토 요청

---

## Appendix

### A. 검토 기준 참조

- `shared/review-checklist.md` — 공통 및 문서 유형별 체크리스트
- `shared/style-guide.md` — YAML front matter 및 문서 형식 기준
- `shared/terminology.md` — 표준 용어 정의
- `shared/conventions.md` — 파일명, ID 체계, 태그 규칙

### B. 주요 강점 요약

전체적으로 네 문서는 높은 완성도를 보인다. 특히:

- 기존 구현체(`apps/admin/src/features/players/`)와의 정합성을 명시적으로 참조하여 기획 문서와 코드 간 괴리를 최소화한 점
- RBAC(PRD-GLO-005) 연동을 일관되게 고려하여 권한 설계가 문서 전체에 반영된 점
- 상태별 와이어프레임(Default/Loading/Empty/Error/Banned/Suspended)이 빠짐없이 정의된 점
은 이전 GLO 기획 문서 대비 명확한 개선이다.

### C. 변경 이력


| 버전   | 날짜         | 변경 내용                      | 작성자      |
| ---- | ---------- | -------------------------- | -------- |
| v1.0 | 2026-03-27 | 플레이어 관리 기획 문서 검토 리포트 최초 작성 | reviewer |


