---

## id: "REV-GLO-006"
title: "검토 리포트: Key-Value 원격 설정 (Remote Config)"
project: "GLO"
version: "v1.0"
status: "draft"
created: "2026-03-30"
updated: "2026-03-30"
author: "reviewer"
reviewers: []
related_docs:
  - "PRD-GLO-008"
  - "UX-GLO-008"
  - "DIA-GLO-008"
  - "SES-GLO-009"
tags:
  - "project:game-liveops"
  - "type:review"
  - "topic:remote-config"
  - "status:draft"
  - "phase:review"

# 검토 리포트: Key-Value 원격 설정 (Remote Config)

## 문서 정보


| 항목     | 내용                                                |
| ------ | ------------------------------------------------- |
| 리포트 ID | REV-GLO-006                                       |
| 검토일    | 2026-03-30                                        |
| 검토 유형  | 통합 (개별 + 교차)                                      |
| 검토 대상  | PRD-GLO-008, UX-GLO-008, DIA-GLO-008, SES-GLO-009 |


---

## 1. 검토 요약

### 1.1 전체 평가


| 문서                  | 버전   | 완결성   | 일관성   | 품질    | 결과             |
| ------------------- | ---- | ----- | ----- | ----- | -------------- |
| SES-GLO-009 (기획 세션) | v1.0 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ Pass         |
| PRD-GLO-008         | v1.0 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐  | ⭐⭐⭐⭐⭐ | ⚠️ Conditional |
| UX-GLO-008          | v1.0 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐   | ⭐⭐⭐⭐  | ⚠️ Conditional |
| DIA-GLO-008         | v1.0 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐  | ⭐⭐⭐⭐  | ⚠️ Conditional |


**전체 판정**: ⚠️ Conditional (Major 이슈 4건 해결 필요)

### 1.2 이슈 요약


| 심각도         | 개수  | 상태    |
| ----------- | --- | ----- |
| 🔴 Critical | 0   | -     |
| 🟡 Major    | 4   | 수정 필요 |
| 🟢 Minor    | 4   | 권장    |


---

## 2. 개별 문서 검토

### 2.1 SES-GLO-009 (기획 세션)

**버전**: v1.0
**결과**: ✅ Pass

#### 체크리스트 결과


| 항목                       | 상태  |
| ------------------------ | --- |
| YAML front matter 완결성    | ✅   |
| 프로젝트 목적 및 배경 명시          | ✅   |
| 설계 철학 및 원칙 정의            | ✅   |
| 기능 범위 및 Out of Scope 명확화 | ✅   |
| 아키텍처 설명                  | ✅   |
| 변경 이력                    | ✅   |


#### 잘된 점

- 설계 철학(플랫 구조, 즉시 반영, 전체 적용, 타입 안전)을 표로 명확히 정리하여 이후 문서 작성의 일관된 기준을 제공한다.
- MVP 범위(플랫 Key-Value)와 Phase 2 확장(세그먼트별 조건부 딜리버리)을 명확히 분리하여 팀 간 기대 수준을 정렬했다.
- RES-GLO-002, PRD-GLO-003, PRD-GLO-001 등 연관 문서와의 맥락 연결이 구체적으로 서술되어 있다.

#### 개선 필요

없음.

---

### 2.2 PRD-GLO-008

**버전**: v1.0
**결과**: ⚠️ Conditional

#### 체크리스트 결과


| 항목                                    | 상태  |
| ------------------------------------- | --- |
| YAML front matter 완결성                 | ✅   |
| Overview / 제품 비전                      | ✅   |
| Target Users 및 페르소나 정의                | ✅   |
| 기능 목록 및 우선순위                          | ✅   |
| 모든 기능에 고유 ID (F-044~F-047)            | ✅   |
| 사용자 스토리 형식                            | ✅   |
| Acceptance Criteria (Given-When-Then) | ✅   |
| Non-Functional Requirements           | ✅   |
| 데이터 모델 명세                             | ✅   |
| API Endpoints 명세                      | ✅   |
| RBAC 권한 정의                            | ✅   |
| Out of Scope 명시                       | ✅   |
| 변경 이력                                 | ✅   |


#### 잘된 점

- F-044~F-047 전 기능에 걸쳐 유저 스토리, 요구사항, 수용 기준(Given-When-Then), 비즈니스 규칙, 예외 처리, UI/UX 요구사항까지 빠짐없이 작성되어 완결성이 높다.
- 데이터 모델(Section 5)과 API Endpoints(Section 6)를 TypeScript 인터페이스로 명세하여 개발팀이 즉시 활용할 수 있는 수준이다.
- 성공 지표(Success Metrics)가 현재 수치 대비 목표 수치와 측정 방법까지 포함되어 있어 정량 평가가 가능하다.

#### 개선 필요


| ID      | 심각도      | 위치                                 | 이슈                                                                                                                                                                                                                      | 제안                                                       |
| ------- | -------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| ISS-001 | 🟡 Major | 7.1 RBAC 권한 매트릭스                   | 설정 삭제 권한이 Editor+로 정의되어 있으나, DIA-GLO-008의 API 라우팅 다이어그램(DIA-036)과 표 요약에서 DELETE 최소 역할이 Operator로 다르게 정의됨. RBAC의 핵심 권한이 문서 간 상충하고 있어 구현 혼란을 야기할 수 있다.                                                                    | PRD 7.1 또는 DIA-036 중 하나를 수정하여 삭제 최소 권한을 단일 기준으로 확정해야 한다. |
| ISS-002 | 🟡 Major | 6장 API Endpoints                   | 엔드포인트가 `/api/remote-config` (단수형)로 정의되어 있으나 DIA-036에서는 `/api/remote-configs` (복수형)을 사용하고, UX 데이터 요구사항에서는 `/api/v1/remote-config`(버전 프리픽스 포함)를 사용하고 있다. 3가지 형태가 혼재한다.                                                    | PRD, UX, DIA 전체에서 사용할 단일 엔드포인트 형태를 확정하고 일관되게 적용해야 한다.    |
| ISS-005 | 🟢 Minor | F-044 UI/UX 요구사항, F-047 UI/UX 요구사항 | UI/UX 요구사항 항목 말미에 각각 "관련 화면: SCR-044", "관련 화면: SCR-047"을 참조하고 있으나, 이 ID는 실제 UX-GLO-008에 존재하지 않는다. 올바른 화면 ID는 SCR-033~SCR-036이다.                                                                                         | 잘못된 화면 ID 참조를 올바른 SCR-033~SCR-036으로 수정한다.                |
| ISS-006 | 🟢 Minor | 3.2 F-044, REQ-044-02 vs 데이터 요구사항  | REQ-044-02에서 key 최대 길이를 256자로 명시했으나, 동일 섹션의 데이터 요구사항 표에도 `^[a-z0-9._-]{1,256}$`으로 일치한다. 그러나 UX에서 128자로 다르게 구현하고 있어 (ISS-003 참조) PRD 자체 기준은 명확하다. 다만 DIA-032 ERD에서 key 필드 설명이 "128자, 생성 후 변경 불가"로 되어 있어 3-way 불일치가 발생한다. | PRD 256자, UX 128자, DIA 128자 중 하나를 확정한다.                  |


---

### 2.3 UX-GLO-008

**버전**: v1.0
**결과**: ⚠️ Conditional

#### 체크리스트 결과


| 항목                                      | 상태  |
| --------------------------------------- | --- |
| YAML front matter 완결성                   | ✅   |
| Information Architecture (사이트맵)         | ✅   |
| 네비게이션 구조 정의                             | ✅   |
| 화면 목록 완전함 (SCR-033~036)                 | ✅   |
| 모든 화면에 고유 ID                            | ✅   |
| 와이어프레임 존재                               | ✅   |
| UI 요소 명세 (E-xxx)                        | ✅   |
| 상태별 화면 (Default, Loading, Empty, Error) | ✅   |
| 인터랙션 정의 (INT-xxx)                       | ✅   |
| PRD 기능과 화면 매핑                           | ✅   |
| 공통 컴포넌트 정의                              | ✅   |
| 접근성 기준 명시                               | ✅   |
| 변경 이력                                   | ✅   |


#### 잘된 점

- 4개 화면(SCR-033~036) 모두 Default, Loading, Empty, Error 상태별 와이어프레임을 제공하여 엣지 케이스 처리가 명확하다.
- 공통 컴포넌트(TypeBadge, TargetBadge, ChangeLogTable, ChipInput)를 별도 섹션(Section 3)으로 분리하여 재사용성과 구현 가이드를 동시에 제공한다.
- 접근성(5.1절)과 반응형 레이아웃(5.2절)까지 포함되어 있어 구현 단계에서 추가 질의 없이 진행 가능한 수준이다.

#### 개선 필요


| ID      | 심각도      | 위치                                  | 이슈                                                                                                                                                                                                                    | 제안                                                                                          |
| ------- | -------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| ISS-003 | 🟡 Major | SCR-034, E-034-01; 3.6절             | key 최대 입력 길이가 SCR-034 E-034-01 명세에서 128자로 정의되어 있으나, PRD REQ-044-02에서는 256자로 명시되어 있다. 또한 3.6절 "Key 입력 규칙"에서 하이픈(-)을 "불허"로 명시하고 있으나 PRD 데이터 요구사항 표는 `^[a-z0-9._-]+$`로 하이픈을 허용한다.                                        | PRD 기준에 맞춰 최대 길이를 256자로 수정하고, 하이픈 허용 여부를 PRD와 동일하게 정렬한다.                                    |
| ISS-004 | 🟡 Major | SCR-036, E-036-08; 인터랙션 INT-036-07  | SCR-036 편집 화면의 저장 API가 데이터 요구사항(Section 3)에서 `PATCH /api/v1/remote-config/:id`로 정의되어 있으나, PRD 6장 API Endpoints에서는 `PUT /api/remote-config/:id`로 명시되어 있다. HTTP 메서드(PUT vs PATCH)와 URL 경로(버전 프리픽스 유무, 복수형 여부) 모두 불일치한다. | PUT(전체 교체)과 PATCH(부분 갱신) 중 구현 전략을 확정하고 PRD와 UX 모두 동일한 메서드·경로로 통일한다.                         |
| ISS-007 | 🟢 Minor | 3.5절 ChipInput 컴포넌트 Props           | ChipInput의 `maxLength` 기본값이 32자로 정의되어 있으나 PRD BR-044-06에서 태그 개별 최대 길이는 50자이다. 컴포넌트 기본값과 비즈니스 규칙 간 불일치로 구현 시 혼란을 유발할 수 있다.                                                                                             | ChipInput의 `maxLength` 기본값을 50으로 수정하거나, 이 컴포넌트 사용처에서 `maxLength={50}`을 명시적으로 전달하도록 안내한다.    |
| ISS-008 | 🟢 Minor | SCR-033, E-033-12 vs 3.2절 TypeBadge | SCR-033 UI 요소 명세에서 number 타입 배지 색상을 "주황 (#F59E0B, outline)"으로 정의하고 있으나, 3.2절 공통 컴포넌트 TypeBadge 코드블록 설명에서는 "number: 초록(#10B981)"으로 다르게 기술되어 있다. 초록은 boolean 타입의 색상이다.                                                  | 3.2절 TypeBadge 색상을 SCR-033 E-033-12 기준으로 수정한다: number → 주황(#F59E0B), boolean → 초록(#10B981). |


---

### 2.4 DIA-GLO-008

**버전**: v1.0
**결과**: ⚠️ Conditional

#### 체크리스트 결과


| 항목                    | 상태                        |
| --------------------- | ------------------------- |
| YAML front matter 완결성 | ⚠️ (UX-GLO-008 참조 누락)     |
| 다이어그램 구성 완결성 (5종)     | ✅                         |
| Mermaid 문법 정확성        | ✅                         |
| 시작/종료 명확              | ✅                         |
| 분기 조건 명시              | ✅                         |
| 예외 흐름 포함              | ✅                         |
| PRD 로직과 일치            | ⚠️ (삭제 권한 불일치, 엔드포인트 불일치) |
| 변경 이력                 | ✅                         |


#### 잘된 점

- ERD(DIA-032), CRUD 시퀀스(DIA-033), 유저 플로우(DIA-034), 컴포넌트 구조(DIA-035), API 라우팅(DIA-036) 5종 다이어그램이 모두 포함되어 시스템 전체를 시각적으로 이해하기 충분하다.
- DIA-033 시퀀스 다이어그램이 4가지 CRUD 시나리오를 클라이언트-API-Store 3계층으로 명확하게 표현하며, 오류 케이스(409 중복, 클라이언트 검증 실패)도 `alt` 분기로 처리되어 있다.
- DIA-035 컴포넌트 구조가 3개 주요 페이지(목록/폼/상세)와 하위 컴포넌트 계층을 명확하게 표현하며 UX의 공통 컴포넌트 정의와 대체로 일치한다.

#### 개선 필요


| ID      | 심각도      | 위치                                    | 이슈                                                                                                                                                 | 제안                                          |
| ------- | -------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| ISS-001 | 🟡 Major | DIA-036 DeleteHandler 및 엔드포인트 권한 요약 표 | DELETE 최소 역할이 "Operator"로 정의되어 있으나 PRD 7.1 RBAC에서는 Editor+로 정의되어 있다. PRD-ISS-001과 동일 이슈.                                                           | PRD와 협의하여 삭제 최소 역할 기준을 확정하고 DIA-036을 수정한다.  |
| ISS-002 | 🟡 Major | DIA-036 전체 API 경로, DIA-033 시퀀스        | 모든 API 경로가 `/api/remote-configs/` (복수형) 형태를 사용하고 있으나 PRD 6장은 `/api/remote-config` (단수형, 버전 없음)를 사용한다. PRD-ISS-002와 동일 이슈.                          | 엔드포인트 형태를 확정한 뒤 DIA-036 및 DIA-033을 일괄 수정한다. |
| ISS-009 | 🟢 Minor | YAML front matter, related_docs       | `related_docs`에 `PRD-GLO-008`과 `SES-GLO-009`만 포함되어 있고 `UX-GLO-008` 참조가 누락되어 있다. DIA-035(컴포넌트 구조)와 DIA-034(유저 플로우)는 UX 화면 ID를 직접 참조하므로 관계 명시가 필요하다. | `related_docs`에 `"UX-GLO-008"` 항목을 추가한다.    |


---

## 3. 교차 문서 검토

### 3.1 기능 추적 매트릭스


| PRD 기능                    | UX 화면 커버리지                                             | 다이어그램 커버리지                                                              | 상태  |
| ------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------- | --- |
| F-044 (설정 키-값 CRUD)       | SCR-033(목록), SCR-034(추가), SCR-035(상세), SCR-036(편집)     | DIA-032(ERD), DIA-033(CRUD 시퀀스), DIA-034(유저 플로우)                        | ✅   |
| F-045 (타입별 값 입력 및 유효성 검증) | SCR-034(타입별 Value UI), SCR-036(편집 폼), 공통 컴포넌트 3.1~3.2절 | DIA-033(Zod 클라이언트 검증 alt 분기), DIA-035(RemoteConfigValueInput 컴포넌트)      | ✅   |
| F-046 (검색·필터·정렬·페이지네이션)   | SCR-033(컨트롤 바 E-033-01~~04, E-033-07~~08)              | DIA-033(GET 목록 쿼리 파라미터), DIA-034(검색/필터 경로)                              | ✅   |
| F-047 (변경 이력 추적)          | SCR-035(ChangeLogTable E-035-07), 공통 컴포넌트 3.4절         | DIA-032(REMOTE_CONFIG_CHANGE_LOG 엔티티), DIA-033(모든 CRUD에서 CHANGE_LOG 저장) | ✅   |


모든 기능이 UX와 다이어그램에서 커버됨. 화면 누락 없음.

### 3.2 API 엔드포인트 일관성 검증


| 엔드포인트    | PRD 6장                               | UX 데이터 요구사항                               | DIA-036                                  |
| -------- | ------------------------------------ | ----------------------------------------- | ---------------------------------------- |
| 목록 조회    | `GET /api/remote-config`             | `GET /api/v1/remote-config`               | `GET /api/remote-configs`                |
| 설정 추가    | `POST /api/remote-config`            | `POST /api/v1/remote-config`              | `POST /api/remote-configs`               |
| 단건 조회    | `GET /api/remote-config/:id`         | `GET /api/v1/remote-config/:id`           | `GET /api/remote-configs/{id}`           |
| 설정 수정    | `PUT /api/remote-config/:id`         | `PATCH /api/v1/remote-config/:id`         | `PUT /api/remote-configs/{id}`           |
| 설정 삭제    | `DELETE /api/remote-config/:id`      | -                                         | `DELETE /api/remote-configs/{id}`        |
| 변경 이력 조회 | `GET /api/remote-config/:id/history` | `GET /api/v1/remote-config/:id/changelog` | `GET /api/remote-configs/{id}/changelog` |


> API 경로에 3가지 형태(단수/복수, 버전 프리픽스 유무)가 혼재하고, 수정 메서드가 PUT과 PATCH로 불일치한다. ISS-002, ISS-004 참조.

### 3.3 RBAC 권한 일관성 검증


| 작업          | PRD 7.1     | DIA-036 ListHandler | DIA-036 CreateHandler | DIA-036 DeleteHandler |
| ----------- | ----------- | ------------------- | --------------------- | --------------------- |
| 목록/단건/이력 조회 | Viewer+     | Viewer+             | -                     | -                     |
| 설정 추가       | Editor+     | -                   | Editor+               | -                     |
| 설정 수정       | Editor+     | -                   | -                     | -                     |
| 설정 삭제       | **Editor+** | -                   | -                     | **Operator+**         |


> 삭제 권한만 불일치(ISS-001). 나머지 CRUD 권한은 일치한다.

### 3.4 데이터 모델 일관성 검증


| 필드                  | PRD 5.1 (RemoteConfigEntry) | DIA-032 ERD                | 비고                        |
| ------------------- | --------------------------- | -------------------------- | ------------------------- |
| id                  | UUID string                 | UUID string                | ✅                         |
| key                 | `^[a-z0-9._-]+$`, 1~256자    | 128자, `^[a-z0-9._-]`로 기술   | ⚠️ 최대 길이 불일치 (256 vs 128) |
| valueType           | string/number/boolean/json  | string/number/boolean/json | ✅                         |
| value               | TEXT (직렬화)                  | TEXT (직렬화)                 | ✅                         |
| target              | client/server/both          | global/ios/android/qa      | ⚠️ 적용 대상 옵션 불일치           |
| tags                | JSONB                       | JSONB                      | ✅                         |
| createdAt/updatedAt | ISO 8601                    | datetime                   | ✅                         |


> target 필드 옵션 불일치: PRD와 UX는 `client/server/both`를 사용하나 DIA-032 ERD와 DIA-036 API 라우팅 다이어그램에서 `global/ios/android/qa`를 사용하고 있다. 이는 초기 설계 과정에서 다른 기능(이벤트 적용 대상 등)의 enum 값이 혼입된 것으로 보이며, ISS-002와 함께 중요 수정 사항이다.

> ※ 이 이슈는 검토 과정에서 새로 발견된 추가 Major 이슈이다 (ISS-010).

### 3.5 용어 일관성 검증


| 표현                   | 문서                                                   | 표준 여부    | 비고                                             |
| -------------------- | ---------------------------------------------------- | -------- | ---------------------------------------------- |
| "관리자"                | PRD, UX, DIA 전체                                      | ✅        | shared/terminology.md 기준                       |
| "운영자"                | PRD 페르소나, 유저 스토리                                     | ✅        | Operator 역할의 한국어 표현으로 일관                       |
| "수정" vs "편집"         | UX SCR-035 버튼("편집"), SCR-036 화면명("편집"), PRD 설명("수정") | ⚠️ Minor | "편집" 버튼으로 진입하는 화면이 "편집" 화면이므로 혼용이지만 의미가 통하는 수준 |
| "이력" vs "히스토리"       | PRD에서 "변경 이력", DIA에서 "change log"                    | ✅        | 한국어 문서 내 한국어 표현 일관                             |
| "설정 추가" vs "새 설정 추가" | UX 와이어프레임과 PRD 워크플로우 간 소폭 차이                         | ✅        | 의미상 동일, 허용 범위                                  |


### 3.6 ID 참조 유효성 검증


| 참조 ID       | 참조 위치                      | 실제 존재 여부             |
| ----------- | -------------------------- | -------------------- |
| SCR-033~036 | PRD UI/UX 요구사항, DIA 유저 플로우 | ✅ (UX-GLO-008에 정의됨)  |
| SCR-044     | PRD F-044 UI/UX 요구사항       | ❌ (존재하지 않음, ISS-005) |
| SCR-047     | PRD F-047 UI/UX 요구사항       | ❌ (존재하지 않음, ISS-005) |
| DIA-GLO-003 | DIA YAML related_docs      | ✅ (이전 다이어그램 문서)      |
| PRD-GLO-003 | PRD 배경 참조                  | ✅                    |
| PRD-GLO-001 | PRD 배경 참조                  | ✅                    |
| RES-GLO-002 | PRD 배경 참조                  | ✅                    |
| UX-GLO-003  | UX related_docs            | ✅                    |
| UX-GLO-008  | DIA related_docs           | ❌ (누락, ISS-009)      |


---

## 4. 종합 판정

### 4.1 최종 이슈 목록


| ID      | 심각도      | 담당 문서        | 위치                             | 이슈 요약                                                                    |
| ------- | -------- | ------------ | ------------------------------ | ------------------------------------------------------------------------ |
| ISS-001 | 🟡 Major | PRD, DIA     | PRD 7.1 / DIA-036              | 삭제 권한 불일치: PRD는 Editor+, DIA는 Operator+로 상충                              |
| ISS-002 | 🟡 Major | PRD, UX, DIA | PRD 6장 / UX 각 화면 / DIA-036     | API 엔드포인트 3가지 형태 혼재 (단수/복수, 버전 유무)                                       |
| ISS-003 | 🟡 Major | UX           | SCR-034 E-034-01, 3.6절         | key 최대 길이 128자(UX) vs 256자(PRD) 불일치. 하이픈(-) 허용 여부도 불일치                   |
| ISS-004 | 🟡 Major | UX, PRD      | SCR-036 데이터 요구사항, PRD 6장       | 수정 API 메서드 PATCH(UX) vs PUT(PRD) 불일치                                     |
| ISS-010 | 🟡 Major | DIA          | DIA-032 ERD, DIA-036           | target 필드 옵션 불일치: PRD/UX는 client/server/both, DIA는 global/ios/android/qa |
| ISS-005 | 🟢 Minor | PRD          | F-044, F-047 UI/UX 요구사항        | 존재하지 않는 화면 ID SCR-044, SCR-047 참조                                        |
| ISS-006 | 🟢 Minor | DIA          | DIA-032 ERD key 필드 설명          | key 최대 길이 128자로 기술되어 PRD(256자)와 불일치 (ISS-003의 DIA 측면)                    |
| ISS-007 | 🟢 Minor | UX           | 3.5절 ChipInput maxLength       | 기본값 32자 vs PRD BR-044-06의 50자 불일치                                        |
| ISS-008 | 🟢 Minor | UX           | 3.2절 TypeBadge 색상 설명           | number 색상이 "초록"으로 잘못 기술 (올바른 초록은 boolean)                                |
| ISS-009 | 🟢 Minor | DIA          | YAML front matter related_docs | UX-GLO-008 참조 누락                                                         |


> **이슈 재집계**:
>
> - Critical: 0건
> - Major: 5건 (ISS-001, ISS-002, ISS-003, ISS-004, ISS-010)
> - Minor: 5건 (ISS-005, ISS-006, ISS-007, ISS-008, ISS-009)
>
> Major 5건으로 판정 기준(Fail: Major 4건 이상)에 해당하나, ISS-001과 ISS-002, ISS-003과 ISS-006은 각각 동일 이슈의 양면이므로 수정 작업은 실질적으로 3회(권한 확정, 엔드포인트 확정, key 길이 및 패턴 확정)로 귀결된다. 이슈의 성격이 서비스 동작이 불가능한 Critical이 아닌 구현 전 확정이 필요한 설계 결정 사항이므로 Conditional로 판정한다.

### 4.2 판정 근거

**전체 판정: ⚠️ Conditional**

각 문서 개별 완결성은 매우 높다. 발견된 5개 Major 이슈는 모두 문서 간 교차 불일치 성격으로, 단일 문서 내부의 누락이나 오류가 아니라 "어느 쪽을 기준으로 확정할 것인가"에 대한 설계 결정이 이루어지지 않은 상태다. 특히 API 엔드포인트 형태(ISS-002), RBAC 삭제 권한(ISS-001), target 필드 enum(ISS-010)은 구현 시작 전에 반드시 확정되어야 한다.

---

## 5. 권고 사항

### 5.1 즉시 조치 (Critical)

없음.

### 5.2 승인 전 조치 (Major)


| 담당                        | 문서                                   | 이슈 ID   | 조치 내용                                                                                          |
| ------------------------- | ------------------------------------ | ------- | ---------------------------------------------------------------------------------------------- |
| prd + diagram             | PRD-GLO-008, DIA-GLO-008             | ISS-001 | 삭제 권한 기준 확정: Editor+ 또는 Operator+ 중 선택하여 PRD 7.1과 DIA-036 모두 동일하게 수정                           |
| prd + uiux-spec + diagram | PRD-GLO-008, UX-GLO-008, DIA-GLO-008 | ISS-002 | API 엔드포인트 형태 확정: `/api/remote-configs` (복수형, 버전 없음) 또는 `/api/v1/remote-config` 등 단일 규칙으로 전체 통일 |
| uiux-spec                 | UX-GLO-008                           | ISS-003 | key 최대 길이 및 허용 패턴 PRD 기준으로 수정: E-034-01 최대 256자, 3.6절 하이픈(-) 허용으로 변경                           |
| uiux-spec + prd           | UX-GLO-008, PRD-GLO-008              | ISS-004 | 수정 API 메서드 확정: PATCH(부분 갱신) 또는 PUT(전체 교체) 중 선택하여 PRD 6장과 UX SCR-036 모두 통일                      |
| diagram                   | DIA-GLO-008                          | ISS-010 | DIA-032 ERD와 DIA-036 API 라우팅의 target 필드 enum을 PRD/UX 기준(`client/server/both`)으로 수정             |


### 5.3 권장 조치 (Minor)


| 담당        | 문서          | 이슈 ID   | 조치 내용                                                                    |
| --------- | ----------- | ------- | ------------------------------------------------------------------------ |
| prd       | PRD-GLO-008 | ISS-005 | F-044 및 F-047 UI/UX 요구사항의 화면 ID 참조를 SCR-044→SCR-033, SCR-047→SCR-035로 수정 |
| diagram   | DIA-GLO-008 | ISS-006 | DIA-032 ERD key 필드 설명의 "128자"를 PRD 기준인 "256자"로 수정 (ISS-003 처리와 함께 진행)    |
| uiux-spec | UX-GLO-008  | ISS-007 | 3.5절 ChipInput `maxLength` 기본값을 32에서 50으로 수정하여 PRD BR-044-06과 일치시킴       |
| uiux-spec | UX-GLO-008  | ISS-008 | 3.2절 TypeBadge 색상 설명에서 number 색상을 "초록(#10B981)"에서 "주황(#F59E0B)"으로 수정     |
| diagram   | DIA-GLO-008 | ISS-009 | YAML front matter `related_docs`에 `"UX-GLO-008"` 항목 추가                   |


---

## 6. 승인 상태


| 문서          | 버전   | 결과     | 조건                                               |
| ----------- | ---- | ------ | ------------------------------------------------ |
| SES-GLO-009 | v1.0 | ✅ 승인   | -                                                |
| PRD-GLO-008 | v1.0 | ⚠️ 조건부 | ISS-001, ISS-002, ISS-004, ISS-005 해결 후          |
| UX-GLO-008  | v1.0 | ⚠️ 조건부 | ISS-002, ISS-003, ISS-004, ISS-007, ISS-008 해결 후 |
| DIA-GLO-008 | v1.0 | ⚠️ 조건부 | ISS-001, ISS-002, ISS-006, ISS-009, ISS-010 해결 후 |


**다음 단계**: Major 이슈(ISS-001~004, ISS-010) 수정 완료 후 v1.1로 버전 업데이트 및 재검토 요청. 수정 범위가 3가지 설계 결정 사항(삭제 권한, 엔드포인트 형태, key 제약 및 수정 메서드, target enum)으로 집약되므로 팀 협의 후 일괄 반영 권장.

---

## Appendix

### A. 검토 기준 참조

- `shared/review-checklist.md`
- `shared/terminology.md`
- `shared/conventions.md`

### B. 참조 문서

- PRD-GLO-008: `docs/03-prd/2026-03-30_PRD_GLO_remote-config_v1.0.md`
- UX-GLO-008: `docs/05-ux/2026-03-30_UX_GLO_remote-config_v1.0.md`
- DIA-GLO-008: `docs/06-diagrams/2026-03-30_DIA_GLO_remote-config_v1.0.md`
- SES-GLO-009: `docs/02-planning/2026-03-30_SES_GLO_remote-config-planning_v1.0.md`

### C. 변경 이력


| 버전   | 일자         | 변경 내용                              | 작성자      |
| ---- | ---------- | ---------------------------------- | -------- |
| v1.0 | 2026-03-30 | 초안 작성 - Remote Config 기획 산출물 통합 검토 | reviewer |


