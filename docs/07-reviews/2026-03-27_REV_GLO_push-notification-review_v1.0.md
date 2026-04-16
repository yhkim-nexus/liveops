---

## id: "REV-GLO-005"
title: "검토 리포트: 모바일 푸시 알림 발송"
project: "GLO"
version: "v1.0"
status: "draft"
created: "2026-03-27"
updated: "2026-03-27"
author: "reviewer"
reviewers: []
related_docs:
  - "PRD-GLO-007"
  - "UX-GLO-007"
  - "DIA-GLO-007"
  - "SES-GLO-008"
tags:
  - "project:game-liveops"
  - "type:review"
  - "topic:push-notification"
  - "status:draft"
  - "phase:review"

# 검토 리포트: 모바일 푸시 알림 발송

## 문서 정보


| 항목     | 내용                                                                                              |
| ------ | ----------------------------------------------------------------------------------------------- |
| 리포트 ID | REV-GLO-005                                                                                     |
| 검토일    | 2026-03-27                                                                                      |
| 검토 유형  | 통합 (개별 + 교차)                                                                                    |
| 검토 대상  | PRD-GLO-007, UX-GLO-007, DIA-GLO-007                                                            |
| 참조 세션  | SES-GLO-008                                                                                     |
| 검토 기준  | shared/review-checklist.md, shared/terminology.md, shared/conventions.md, shared/style-guide.md |


---

## 1. 검토 요약

### 1.1 전체 평가


| 문서          | 버전   | 완결성   | 일관성  | 품질   | 결과             |
| ----------- | ---- | ----- | ---- | ---- | -------------- |
| PRD-GLO-007 | v1.0 | ⭐⭐⭐⭐  | ⭐⭐⭐  | ⭐⭐⭐⭐ | ⚠️ Conditional |
| UX-GLO-007  | v1.0 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⚠️ Conditional |
| DIA-GLO-007 | v1.0 | ⭐⭐⭐⭐  | ⭐⭐⭐  | ⭐⭐⭐⭐ | ⚠️ Conditional |


**전체 판정**: ⚠️ Conditional (Major 이슈 해결 필요)

### 1.2 이슈 요약


| 심각도         | 개수  | 상태    |
| ----------- | --- | ----- |
| 🔴 Critical | 0   | -     |
| 🟡 Major    | 3   | 수정 필요 |
| 🟢 Minor    | 5   | 권장    |


---

## 2. 개별 문서 검토

---

### 2.1 PRD-GLO-007

**버전**: v1.0
**결과**: ⚠️ Conditional

#### 체크리스트 결과


| 항목                                                                                   | 상태  |
| ------------------------------------------------------------------------------------ | --- |
| YAML front matter 완전 (id, title, project, version, status, created, updated, author) | ✅   |
| 버전 형식 올바름 (v1.0)                                                                     | ✅   |
| 상태값 유효함 (draft)                                                                      | ✅   |
| Overview 섹션 존재                                                                       | ✅   |
| Target Users 정의됨                                                                     | ✅   |
| Features & Requirements 존재 (F-037~F-043)                                             | ✅   |
| 모든 기능에 유저 스토리                                                                        | ✅   |
| 모든 기능에 Acceptance Criteria (Given-When-Then)                                         | ✅   |
| 모든 기능에 비즈니스 규칙                                                                       | ✅   |
| 모든 기능에 예외 처리                                                                         | ✅   |
| Non-Functional Requirements 존재                                                       | ✅   |
| 우선순위 명시 (P0/P1/P2)                                                                   | ✅   |
| Dependencies & Constraints 명시                                                        | ✅   |
| Release Plan 존재                                                                      | ✅   |
| 측정 가능한 성공 지표                                                                         | ✅   |
| Open Questions 존재                                                                    | ✅   |
| 변경 이력 작성됨                                                                            | ✅   |
| CampaignStatus 타입과 상태 다이어그램 간 일관성                                                    | ❌   |
| Priority 타입 정의 일관성                                                                   | ❌   |
| AC-041-01 상태값 정확성                                                                    | ❌   |
| API 경로 버전 표기 일관성                                                                     | ⚠️  |


#### 잘된 점

- F-037~F-043 전 기능에 걸쳐 유저 스토리, AC(Given-When-Then), 비즈니스 규칙, 예외 처리가 빠짐없이 작성되었다.
- NFR이 10개 항목으로 발송 처리량, SLA, 보안, 감사 로그, 재시도 로직까지 구체적으로 명시되었다.
- 의존성(PRD-GLO-001, 002, 003, 005)이 하드/소프트 의존성 구분과 함께 체계적으로 정리되었다.
- Open Questions와 Risks 섹션이 실질적인 미결 사항과 대응 방안을 포함하고 있다.

#### 개선 필요


| ID      | 심각도      | 위치                                              | 이슈                                                                                                                                                                                  | 제안                                                                                                    |
| ------- | -------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| ISS-001 | 🟡 Major | Section 5.1 (PUSH_CAMPAIGN 데이터 모델)              | `CampaignStatus` 타입에 `"completed"` 상태가 포함되어 있으나, DIA-GLO-007 DIA-030 상태 다이어그램 및 ERD 주석에는 해당 상태가 없다. 최종 완료 상태가 `"sent"`인지 `"completed"`인지 불명확하며, 두 문서 간 정합성이 깨진다.                    | `CampaignStatus`에서 `"completed"`를 제거하거나, DIA-030 상태 다이어그램에 `"completed"` 전이를 추가하고 두 문서 간 최종 상태를 통일한다. |
| ISS-002 | 🟡 Major | Section 3.7 REQ-042-05, Section 5.1 Priority 타입 | `Priority` 타입이 `"normal" | "critical"` 2가지로 정의되어 있으나, DIA-GLO-007 ERD의 `PUSH_CAMPAIGN.priority` 컬럼 주석에는 `"normal | high | critical"` 3가지가 명시되어 있다. `"high"` 우선순위 지원 여부가 문서 간 불일치한다. | PRD에서 `"high"` 포함 여부를 확정하고 PRD와 DIA를 동일하게 수정한다.                                                       |
| ISS-003 | 🟡 Major | Section 3.6 AC-041-01                           | 발송 퍼널 표시 AC에서 사전 조건(Given)이 `"캠페인 상태가 'completed'이다"`로 작성되어 있으나, PRD 상태 목록에서 `"sent"`가 발송 완료 상태이고 `"completed"`는 맥락상 정의가 불분명하다. `"completed"`가 `"sent"`의 오기인지, 별개 상태인지 명확하지 않다.     | `AC-041-01`의 Given 상태값을 `"sent"`로 수정하거나, `"completed"` 상태를 PRD 및 DIA에 명시적으로 정의한다.                     |
| ISS-004 | 🟢 Minor | Section 6 (API Endpoints)                       | API 경로가 `/api/push/...` 형식으로 작성되어 있으나, UX-GLO-007 데이터 요구사항에서는 `/api/v1/push/...` 형식을 사용한다. 버전 접두사 포함 여부가 불일치한다.                                                                     | PRD 섹션 6의 API 경로를 `/api/v1/push/...` 형식으로 통일하거나, 두 문서에서 동일한 형식을 사용하도록 조율한다.                           |
| ISS-005 | 🟢 Minor | Section 3.2 REQ-037-04                          | 이미지 URL 요구사항(REQ-037-04)에서 "1MB 이하 파일만 유효하다"고 명시했으나, 이 콘솔은 URL을 입력받을 뿐 실제 파일을 직접 수신하지 않는다. URL 기반으로 크기 사전 검증이 불가능하므로, "1MB 초과 시 경고" 처리(REQ 예외 처리 ERR-037-03)와 모순된다.                 | 요구사항을 "1MB 이하 파일 URL을 권장하며, 크기 초과 시 경고를 표시한다"는 방식으로 수정하여 URL 입력 방식과의 정합성을 맞춘다.                        |


---

### 2.2 UX-GLO-007

**버전**: v1.0
**결과**: ⚠️ Conditional

#### 체크리스트 결과


| 항목                                                | 상태  |
| ------------------------------------------------- | --- |
| YAML front matter 완전                              | ✅   |
| Information Architecture 존재                       | ✅   |
| 네비게이션 구조 정의                                       | ✅   |
| 화면 목록 완전 (SCR-028~SCR-032)                        | ✅   |
| 모든 화면에 고유 ID                                      | ✅   |
| 모든 화면에 와이어프레임 존재                                  | ✅   |
| 모든 화면에 UI 요소 명세 존재                                | ✅   |
| 모든 화면에 상태별 화면 정의 (Default, Loading, Empty, Error) | ⚠️  |
| 모든 화면에 인터랙션 정의                                    | ✅   |
| 모든 화면에 데이터 요구사항 존재                                | ✅   |
| PRD 기능과 화면 매핑됨                                    | ✅   |
| 공통 컴포넌트 정의됨                                       | ✅   |
| 화면 흐름 정의                                          | ✅   |
| 접근성 기준 명시                                         | ✅   |
| 재사용 컴포넌트 명시                                       | ✅   |
| 우선순위 옵션(SCR-029 E-029-16)과 PRD Priority 타입 일관성    | ❌   |
| API 경로 버전 표기 일관성 (PRD 대비)                         | ⚠️  |
| 화면 흐름(4.2)에서 failed 상태 처리                         | ⚠️  |


#### 잘된 점

- SCR-028~SCR-032 5개 화면 전부에 와이어프레임, UI 요소 명세, 상태별 화면(대부분 4종), 인터랙션 정의, 데이터 요구사항이 빠짐없이 작성되었다.
- 디바이스 미리보기 패널, 변수 삽입 드롭다운, CampaignStatusBadge 등 신규 컴포넌트가 명세되었고, UX-GLO-001/003 재사용 컴포넌트가 명시적으로 참조되어 있다.
- 접근성 기준(44px 터치 영역, WCAG 2.1 AA, aria-* 속성)이 구체적으로 명시되었다.
- 화면 흐름(4.1~4.3)이 텍스트 다이어그램으로 시각화되어 있다.

#### 개선 필요


| ID      | 심각도      | 위치                         | 이슈                                                                                                                                                                                                     | 제안                                                                        |
| ------- | -------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| ISS-006 | 🟡 Major | SCR-029 E-029-16 UI 요소 명세  | 우선순위 선택 요소(E-029-16) 명세에 `"normal / high / critical"` 3가지 옵션이 기재되어 있으나, PRD-GLO-007 `Priority` 타입 정의는 `"normal" | "critical"` 2가지이다. `"high"` 옵션 지원 여부에 대해 PRD와 불일치한다.                                 | PRD의 Priority 타입과 동일하게 수정하여 일관성을 유지한다. ISS-002와 연계 처리한다.                  |
| ISS-007 | 🟢 Minor | Section 4.2 승인 워크플로우 화면 흐름 | 화면 흐름 4.2에서 `failed` 상태에 대한 UI 처리 경로가 명시되어 있지 않다. DIA-GLO-007 DIA-030과 DIA-032에는 `failed → draft(복제)` 전이가 정의되어 있고, SCR-028 테이블 행 호버 상태에서도 `failed` 상태의 액션이 `[상세] [복제]`로 정의되어 있으나, 화면 흐름 다이어그램에는 누락되었다. | 화면 흐름 4.2에 `sending → failed → (복제) → draft` 경로를 추가한다.                    |
| ISS-008 | 🟢 Minor | SCR-030 E-030-04 KPI 카드 설명 | E-030-04 설명에 "`sent` 상태에서만 수치 표시"라고 되어 있으나, SCR-030 `sending` 상태 와이어프레임에서는 4개 KPI 카드에 진행 중 수치(128,450건)가 이미 표시되어 있다. 명세와 와이어프레임이 불일치한다.                                                                | E-030-04 설명을 "`sent` 이상 또는 `sending` 상태에서 수치 표시"로 수정하거나, 와이어프레임 설명을 정정한다. |


---

### 2.3 DIA-GLO-007

**버전**: v1.0
**결과**: ⚠️ Conditional

#### 체크리스트 결과


| 항목                          | 상태  |
| --------------------------- | --- |
| YAML front matter 완전        | ✅   |
| related_docs에 UX-GLO-007 포함 | ❌   |
| Mermaid 문법 올바름 (5종 다이어그램)   | ✅   |
| 시작/종료 명확 (DIA-030, DIA-032) | ✅   |
| 분기 조건 명시                    | ✅   |
| 예외 흐름 포함 (실패, 재시도 등)        | ✅   |
| 설명 섹션 존재 (각 다이어그램)          | ✅   |
| 각 다이어그램에 참고 주석 존재           | ✅   |
| 변경 이력 작성됨                   | ✅   |
| PRD 로직과 일치 (상태 전이)          | ⚠️  |
| ERD와 PRD 데이터 모델 일치          | ❌   |


#### 잘된 점

- DIA-029(ERD), DIA-030(상태 머신), DIA-031(시퀀스), DIA-032(플로우차트), DIA-033(아키텍처) 5종 다이어그램이 모두 작성되었으며 Mermaid 문법이 정확하다.
- DIA-030 상태 다이어그램에 8가지 상태와 전이 조건, 역할별 분기가 명확하게 표현되었다.
- DIA-031 시퀀스 다이어그램이 end-to-end 발송 흐름을 `autonumber` 포함하여 상세히 기술했다.
- DIA-033 아키텍처 다이어그램에 계층별 컴포넌트 역할 요약 테이블이 함께 제공되어 가독성이 높다.

#### 개선 필요


| ID      | 심각도      | 위치                                   | 이슈                                                                                                                                                                              | 제안                                                        |
| ------- | -------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| ISS-009 | 🟡 Major | DIA-029 ERD — PUSH_CAMPAIGN.priority | ERD에서 `priority` 컬럼을 `"normal | high | critical"` 3가지로 정의했으나, PRD-GLO-007 섹션 5.1 `Priority` 타입에는 `"normal" | "critical"` 2가지만 존재한다. `"high"` 포함 여부가 불일치한다. ISS-002와 동일 근원 이슈이다. | PRD에서 `"high"` 포함 여부를 확정한 후, DIA-029 ERD를 PRD와 동일하게 수정한다. |
| ISS-010 | 🟢 Minor | YAML front matter related_docs       | `related_docs` 목록에 `UX-GLO-007`이 누락되어 있다. 다른 두 문서(`PRD-GLO-007`, `DIA-GLO-002`)는 포함되어 있으나 UX 문서 참조가 빠져 있다.                                                                      | `related_docs`에 `"UX-GLO-007"`을 추가한다.                     |


---

## 3. 교차 문서 검토

### 3.1 기능 추적 매트릭스


| PRD 기능                | 화면 (UX)                                | 다이어그램 (DIA)                                      | 상태  |
| --------------------- | -------------------------------------- | ------------------------------------------------ | --- |
| F-037 (푸시 메시지 작성)     | SCR-028 (목록), SCR-029 Step1            | DIA-029, DIA-031, DIA-032                        | ✅   |
| F-038 (타겟 오디언스 설정)    | SCR-029 Step2                          | DIA-029, DIA-031, DIA-032                        | ✅   |
| F-039 (발송 스케줄링 + 승인)  | SCR-028 (상태), SCR-029 Step3/5, SCR-030 | DIA-030, DIA-031, DIA-032                        | ✅   |
| F-040 (템플릿 관리)        | SCR-031, SCR-032                       | DIA-029 (PUSH_TEMPLATE 엔티티)                      | ✅   |
| F-041 (발송 분석 대시보드)    | SCR-030                                | DIA-029 (PUSH_DELIVERY_LOG 집계), DIA-031 (이벤트 추적) | ✅   |
| F-042 (빈도 제한 및 방해 금지) | SCR-029 Step4                          | DIA-031 (Worker 발송 전 검증), DIA-033 (Rate Limiter) | ✅   |
| F-043 (푸시 A/B 테스트)    | SCR-030 (v1.2)                         | DIA-029 (PUSH_AB_VARIANT 엔티티)                    | ✅   |


모든 F-번호 기능이 UX 화면 및 다이어그램에 추적 가능하다.

### 3.2 데이터 모델 정합성


| 항목                             | PRD-GLO-007                                           | DIA-GLO-007                                               | 상태                                                                   |
| ------------------------------ | ----------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------- |
| CampaignStatus 최종 완료 상태        | `"sent"` + `"completed"` (중복)                         | `"sent"` 만 존재 (ERD 주석, DIA-030)                           | ❌ 불일치 (ISS-001)                                                      |
| Priority 값 목록                  | `"normal" | "critical"` (2가지)                         | `"normal | high | critical"` (3가지)                        | ❌ 불일치 (ISS-002, ISS-009)                                             |
| PUSH_AB_VARIANT.deepLink       | 없음 (PRD 타입 미정의)                                       | `deepLink` 필드 존재 (DIA-029 ERD)                            | ⚠️ PRD 타입에 누락                                                        |
| PUSH_DELIVERY_LOG 상태값          | `"frequency_limit_exceeded"`, `"quiet_hours_held"` 포함 | `"sent | delivered | opened | converted | failed"` (5가지만) | ⚠️ DIA-029 ERD가 PRD 상태값 일부 누락                                        |
| PUSH_CAMPAIGN.audienceIds (복수) | `audienceIds?: string[]`                              | `audienceId FK` (단수)                                      | ⚠️ PRD는 복수 오디언스 지원(BR-038-04), DIA ERD는 단일 FK — 설명 주석에서 복수 지원 여부 불명확 |


### 3.3 상태 전이 정합성


| 항목               | PRD (F-039) | DIA-030 | UX (SCR-028, SCR-030) | 상태              |
| ---------------- | ----------- | ------- | --------------------- | --------------- |
| draft            | 정의됨         | 정의됨     | 상태 배지 정의됨             | ✅               |
| pending_approval | 정의됨         | 정의됨     | 상태 배지 정의됨             | ✅               |
| approved         | 정의됨         | 정의됨     | 상태 배지 정의됨             | ✅               |
| scheduled        | 정의됨         | 정의됨     | 상태 배지 정의됨             | ✅               |
| sending          | 정의됨         | 정의됨     | 상태 배지 정의됨             | ✅               |
| sent             | 정의됨         | 정의됨     | 상태 배지 정의됨             | ✅               |
| failed           | 정의됨         | 정의됨     | 상태 배지 정의됨             | ✅               |
| cancelled        | 정의됨         | 정의됨     | 상태 배지 정의됨             | ✅               |
| completed        | PRD 타입에 포함  | 없음      | 없음                    | ❌ 불일치 (ISS-001) |


### 3.4 용어 일관성


| 항목                    | PRD                       | UX                        | DIA                | terminology.md | 상태                   |
| --------------------- | ------------------------- | ------------------------- | ------------------ | -------------- | -------------------- |
| "회원" vs "사용자/유저/플레이어" | "플레이어" 사용                 | "회원" + "플레이어" 혼용          | "플레이어" 사용          | "회원"(표준)       | ⚠️ 도메인 특화 용어         |
| "관리자"                 | "관리자" + "운영자" 혼용          | "관리자" 주 사용                | "관리자" 사용           | "관리자"(표준)      | ⚠️ PRD에서 일부 "운영자" 사용 |
| "운영자" (페르소나 직함)       | Editor/Operator 역할명 병행 사용 | Editor/Operator 역할명 병행 사용 | Editor/Operator 사용 | 해당 없음          | ✅ 역할명으로 맥락 명확        |


> **용어 비고**: "플레이어"와 "회원"은 terminology.md 기준으로는 "회원"이 표준이나, 이 도메인(게임 운영)에서는 "플레이어"가 업계 표준 용어이고 PRD-GLO-001 세그멘테이션 문서부터 일관되게 "플레이어"를 사용하고 있다. 세 문서 모두 "플레이어"를 주 용어로 사용하므로 도메인 내 일관성은 유지된다. terminology.md 갱신을 권장한다.

### 3.5 API 경로 일관성


| 항목       | PRD (섹션 6)                                | UX 데이터 요구사항                                  | 상태                             |
| -------- | ----------------------------------------- | -------------------------------------------- | ------------------------------ |
| 캠페인 목록   | `GET /api/push/campaigns`                 | `GET /api/v1/push/campaigns`                 | ❌ 불일치 (ISS-004)                |
| 캠페인 생성   | `POST /api/push/campaigns`                | `POST /api/v1/push/campaigns`                | ❌ 불일치 (ISS-004)                |
| 예상 도달 수  | `GET /api/push/campaigns/estimated-reach` | `POST /api/v1/push/campaigns/estimate-reach` | ❌ Method + 경로 모두 불일치 (ISS-004) |
| 템플릿 CRUD | `GET /api/push/templates`                 | `GET /api/v1/push/templates`                 | ❌ 불일치 (ISS-004)                |


### 3.6 기존 문서 참조 정합성


| 참조 문서                 | PRD              | UX                              | DIA                       | 상태  |
| --------------------- | ---------------- | ------------------------------- | ------------------------- | --- |
| PRD-GLO-001 (오디언스)    | 의존성 명시, F-038 연동 | UX-GLO-001 참조 (Audience Picker) | Audience Service 아키텍처 포함  | ✅   |
| PRD-GLO-002 (2단계 승인)  | 패턴 재사용 명시        | UX-GLO-002 Approval Dialog 재사용  | DIA-030 승인 전이 반영          | ✅   |
| PRD-GLO-003 (A/B 테스트) | F-043 소프트 의존성    | SCR-030 F-043 v1.2 명시           | DIA-029 abExperimentId 포함 | ✅   |
| PRD-GLO-005 (RBAC)    | 하드 의존성 명시        | Editor/Operator 역할별 권한 구분       | API Gateway RBAC 검증 포함    | ✅   |


---

## 4. 이슈 목록


| ID      | 심각도      | 문서                       | 위치                                               | 이슈 설명                                                                                                                  | 제안                                                                |
| ------- | -------- | ------------------------ | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| ISS-001 | 🟡 Major | PRD-GLO-007              | 섹션 5.1 CampaignStatus 타입                         | `CampaignStatus`에 `"completed"` 상태가 포함되어 있으나 DIA-030 상태 다이어그램에 없음. 최종 완료 상태가 `"sent"`인지 `"completed"`인지 불명확            | `"completed"` 제거 또는 DIA-030에 추가하여 두 문서 최종 상태 통일                   |
| ISS-002 | 🟡 Major | PRD-GLO-007, DIA-GLO-007 | PRD 섹션 5.1 Priority 타입 / DIA-029 ERD priority 컬럼 | PRD는 `"normal" | "critical"` 2가지, DIA ERD는 `"normal | high | critical"` 3가지. `"high"` 지원 여부 불일치                        | `"high"` 포함 여부 확정 후 PRD와 DIA 동시 수정                                |
| ISS-003 | 🟡 Major | PRD-GLO-007              | 섹션 3.6 AC-041-01 Given 조건                        | `"캠페인 상태가 'completed'이다"`는 PRD 및 DIA 상태 체계와 불일치. `"completed"`가 `"sent"`의 오기로 추정                                       | Given 조건을 `"캠페인 상태가 'sent'이다"`로 수정                                |
| ISS-004 | 🟢 Minor | PRD-GLO-007, UX-GLO-007  | PRD 섹션 6 API Endpoints / UX 각 화면 데이터 요구사항        | API 경로 버전 표기 불일치 (PRD: `/api/push/...`, UX: `/api/v1/push/...`). 예상 도달 수 API의 경우 HTTP Method도 불일치 (PRD: GET, UX: POST) | 두 문서에서 `/api/v1/push/...` 형식으로 통일하고, 예상 도달 수 API Method를 POST로 통일 |
| ISS-005 | 🟢 Minor | PRD-GLO-007              | 섹션 3.2 REQ-037-04                                | 이미지 URL 요구사항에서 "1MB 이하 파일만 유효"라고 명시했으나, URL 입력 방식에서 사전 크기 검증이 불가능함. 예외 처리 ERR-037-03에서는 경고(비차단)로 처리하는 등 상충됨            | 요구사항을 "1MB 이하 권장, 초과 시 경고 표시"로 수정하여 URL 입력 방식과 정합                 |
| ISS-006 | 🟡 Major | UX-GLO-007               | SCR-029 E-029-16 UI 요소 명세                        | 우선순위 옵션이 `"normal / high / critical"` 3가지이나 PRD Priority 타입은 `"normal" | "critical"` 2가지. ISS-002와 연계됨                 | ISS-002 해결 후 PRD 확정값과 동일하게 수정                                     |
| ISS-007 | 🟢 Minor | UX-GLO-007               | 섹션 4.2 승인 워크플로우 화면 흐름                            | `failed` 상태 진입 후 UI 경로(복제 → draft)가 화면 흐름에 누락됨. SCR-028과 DIA-032에는 정의되어 있음                                             | 화면 흐름 4.2에 `sending → failed → (복제) → draft` 경로 추가                |
| ISS-008 | 🟢 Minor | UX-GLO-007               | SCR-030 E-030-04 UI 요소 명세                        | KPI 카드 설명에 "`sent` 상태에서만 수치 표시"라고 명시되어 있으나, `sending` 상태 와이어프레임에서도 진행 중 수치가 표시됨                                        | 설명을 "`sent` 또는 `sending` 상태에서 수치 표시"로 수정                          |
| ISS-009 | 🟡 Major | DIA-GLO-007              | DIA-029 ERD PUSH_CAMPAIGN.priority               | ISS-002와 동일 근원. ERD에 `"normal | high | critical"` 3가지, PRD에 `"normal" | "critical"` 2가지. `"high"` 불일치                  | ISS-002 연계 처리                                                     |
| ISS-010 | 🟢 Minor | DIA-GLO-007              | YAML front matter related_docs                   | `UX-GLO-007`이 related_docs에 누락됨                                                                                        | `related_docs`에 `"UX-GLO-007"` 추가                                 |


---

## 5. 종합 피드백

### 5.1 즉시 조치 (Critical)

없음.

### 5.2 승인 전 조치 (Major)


| 담당           | 문서                       | 이슈 ID            | 조치 내용                                                         |
| ------------ | ------------------------ | ---------------- | ------------------------------------------------------------- |
| prd          | PRD-GLO-007              | ISS-001          | `CampaignStatus` 타입에서 `"completed"` 상태 제거 또는 DIA-030과 합의하여 통일 |
| prd, diagram | PRD-GLO-007, DIA-GLO-007 | ISS-002, ISS-009 | `Priority` 값 목록(`"high"` 포함 여부) 확정 후 두 문서 동시 수정               |
| prd          | PRD-GLO-007              | ISS-003          | AC-041-01 Given 조건의 `"completed"` 상태값을 `"sent"`로 수정           |
| uiux-spec    | UX-GLO-007               | ISS-006          | ISS-002 해결 후 E-029-16 우선순위 옵션을 PRD 확정값과 동일하게 수정               |


### 5.3 권장 조치 (Minor)


| 담당             | 문서                      | 이슈 ID   | 조치 내용                                                            |
| -------------- | ----------------------- | ------- | ---------------------------------------------------------------- |
| prd, uiux-spec | PRD-GLO-007, UX-GLO-007 | ISS-004 | API 경로를 `/api/v1/push/...` 형식으로 통일. 예상 도달 수 API Method를 POST로 통일 |
| prd            | PRD-GLO-007             | ISS-005 | REQ-037-04 이미지 URL 크기 검증 요구사항을 "권장/경고" 방식으로 수정                   |
| uiux-spec      | UX-GLO-007              | ISS-007 | 화면 흐름 4.2에 failed 상태 UI 경로 추가                                    |
| uiux-spec      | UX-GLO-007              | ISS-008 | E-030-04 KPI 카드 상태 조건 설명 수정                                      |
| diagram        | DIA-GLO-007             | ISS-010 | YAML front matter related_docs에 UX-GLO-007 추가                    |


### 5.4 추가 검토 권장 사항

- **PUSH_DELIVERY_LOG 상태값 DIA 반영**: PRD에 정의된 `"frequency_limit_exceeded"`, `"quiet_hours_held"` 상태가 DIA-029 ERD의 PUSH_DELIVERY_LOG 엔티티에 누락되어 있다. Major 수준에 해당하지 않으나 DIA-029의 완결성 측면에서 v1.1 반영을 권장한다.
- **PUSH_CAMPAIGN.audienceIds 복수 지원**: PRD의 `audienceIds: string[]`(복수)과 DIA ERD의 `audienceId FK`(단수) 불일치를 명확히 해소하고, 복수 오디언스 선택(BR-038-04) 구현 시 FK 설계 변경이 필요함을 DIA에 명시하는 것을 권장한다.
- **terminology.md 갱신**: 게임 운영 도메인에서 "플레이어"는 사실상 표준 용어이므로, terminology.md에 "플레이어(게임 도메인에서의 회원)"를 추가하여 용어 혼용 문제를 체계적으로 해소할 것을 권장한다.

---

## 6. 승인 상태


| 문서          | 버전   | 결과        | 조건                             |
| ----------- | ---- | --------- | ------------------------------ |
| PRD-GLO-007 | v1.0 | ⚠️ 조건부 승인 | ISS-001, ISS-002, ISS-003 해결 후 |
| UX-GLO-007  | v1.0 | ⚠️ 조건부 승인 | ISS-006 해결 후 (ISS-002 선행 필요)   |
| DIA-GLO-007 | v1.0 | ⚠️ 조건부 승인 | ISS-009 해결 후 (ISS-002 선행 필요)   |


**다음 단계**: ISS-002(Priority 값 확정)가 ISS-001, ISS-003, ISS-006, ISS-009의 선행 조건이므로, prd와 diagram 에이전트가 `"high"` 우선순위 포함 여부를 먼저 확정하고, 그 결과를 바탕으로 나머지 이슈를 일괄 수정하여 재검토 요청한다.

---

## Appendix

### A. 검토 기준 참조

- `shared/review-checklist.md`
- `shared/terminology.md`
- `shared/style-guide.md`
- `shared/conventions.md`

### B. 변경 이력


| 버전   | 일자         | 변경 내용                                              | 작성자      |
| ---- | ---------- | -------------------------------------------------- | -------- |
| v1.0 | 2026-03-27 | 초안 작성 — PRD-GLO-007, UX-GLO-007, DIA-GLO-007 통합 검토 | reviewer |


