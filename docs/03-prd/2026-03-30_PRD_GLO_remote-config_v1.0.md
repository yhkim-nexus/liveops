---
id: "PRD-GLO-008"
title: "PRD: Key-Value 원격 설정 (Remote Config)"
project: "GLO"
version: "v1.0"
status: "draft"
created: "2026-03-30"
updated: "2026-03-30"
author: "prd"
reviewers: []
related_docs:
  - "SES-GLO-009"
  - "PRD-GLO-003"
  - "PRD-GLO-001"
  - "RES-GLO-002"
tags:
  - "project:game-liveops"
  - "type:prd"
  - "topic:remote-config"
  - "status:draft"
  - "phase:planning"
---

# PRD: Key-Value 원격 설정 (Remote Config)

> 운영팀과 개발팀이 관리 콘솔에서 게임 클라이언트 및 서버의 동작을 코드 배포 없이 실시간으로 제어하는 Key-Value 원격 설정 시스템을 정의한다.

## 문서 정보

| 항목 | 내용 |
|------|------|
| 문서 ID | PRD-GLO-008 |
| 버전 | v1.0 |
| 상태 | draft |
| 작성일 | 2026-03-30 |
| 작성자 | prd |
| 관련 문서 | SES-GLO-009, PRD-GLO-003, PRD-GLO-001, RES-GLO-002 |

---

## 1. Overview

### 1.1 제품 비전

게임 운영팀과 개발팀이 클라이언트·서버 코드를 재배포하지 않고 관리 콘솔에서 게임 동작 파라미터를 즉시 변경·적용할 수 있는 Key-Value 원격 설정 시스템을 구축한다. 설정 항목의 체계적인 관리(타입 검증, 대상 구분, 태그 분류), 변경 이력의 완전한 추적, 직관적인 검색·필터 인터페이스를 통해 운영 민첩성을 높이고 배포 리스크를 줄이는 것을 목표로 한다.

### 1.2 배경 및 목적

**배경**

- SES-GLO-009 킥오프에서 "운영팀이 코드 배포 없이 게임 파라미터를 조정할 수 있는 원격 설정" 기능이 기획 범위에 포함되었다.
- 경쟁사 분석(RES-GLO-002)에서 Firebase Remote Config, Leanplum, Unity Cloud Remote Config 등이 핵심 기능으로 제공하고 있으며, 특히 타입 검증과 변경 이력 추적이 운영팀의 핵심 요구사항으로 확인되었다.
- PRD-GLO-003 A/B 테스트 프레임워크에서 실험 변형별 파라미터 값 주입이 필요한 상황에서, Remote Config가 그 기반 인프라로 활용될 수 있다.
- PRD-GLO-001 플레이어 세그멘테이션 시스템과 연계하여 향후 세그먼트별 조건부 딜리버리 확장이 가능한 구조로 설계한다.
- 현재 게임 운영팀이 파라미터 수정마다 개발팀에 코드 배포를 요청하는 병목이 발생하고 있으며, 이로 인해 긴급 밸런스 조정, 이벤트 배율 변경, 기능 플래그 전환 등의 대응이 수 시간~수일 지연되는 문제가 있다.
- 다양한 값 타입(string, number, boolean, JSON)을 타입 안전하게 관리하고, 모든 변경 사항을 필드 단위로 추적하여 오운영 발생 시 원인 파악과 롤백 대응을 지원한다.

**목적**

- 이 PRD는 GLO 서비스의 **Key-Value 원격 설정(Remote Config)** 기능 범위를 정의한다.
- 설정 키-값 CRUD(F-044), 타입별 값 입력 및 유효성 검증(F-045), 검색·필터·정렬·페이지네이션(F-046), 변경 이력 추적(F-047)을 명세한다.
- MVP에 필요한 최소 기능과 수용 기준을 확정하고, Out of Scope(세그먼트별 딜리버리, 승인 워크플로우, 버전 스냅샷, 환경 분리, JSON Schema 검증)를 명확히 경계 짓는다.

### 1.3 성공 지표 (Success Metrics)

| 지표 | 현재 | 목표 | 측정 방법 |
|------|------|------|----------|
| 파라미터 변경 소요 시간 | 수 시간~수일 (코드 배포 포함) | 5분 이내 | 설정 생성/수정 시작 ~ 저장 완료까지 소요 시간 |
| 설정 값 유형 오류율 | - | 0% | 잘못된 타입 값이 저장된 건수 / 전체 저장 시도 수 |
| 변경 이력 추적률 | 0% (현재 추적 없음) | 100% | 이력 기록 건수 / 전체 CRUD 작업 수 |
| 목록 페이지 응답 시간 | - | 95%ile 1초 이내 | API 응답 시간 측정 |
| 설정 키 검색 성공률 | - | 95%+ | 검색 후 목표 설정 접근 성공 수 / 전체 검색 수 |
| 관리자 운영 자급률 | 0% (전량 개발팀 의존) | 80%+ | 개발팀 요청 없이 운영팀이 직접 처리한 설정 변경 수 / 전체 설정 변경 수 |

---

## 2. Target Users

### 2.1 사용자 페르소나

#### Primary Persona: 최준혁 (LiveOps 운영자 / Editor)

| 항목 | 내용 |
|------|------|
| 소속 | 게임사 LiveOps 운영팀 |
| 역할 | 게임 이벤트 파라미터 조정, 밸런스 수치 변경 요청, 기능 플래그 전환 |
| 기술 수준 | 비개발자. 스프레드시트 및 내부 운영툴 사용 경험 보유. JSON 기초 이해 수준 |
| 주요 도구 | 관리자 대시보드, 스프레드시트, 메신저, 지라 |

**Goals**
- 이벤트 보너스 배율, 출석 보상 수량, 공지 텍스트 등 게임 파라미터를 코드 배포 없이 즉시 변경하고 싶다.
- 변경한 값이 정말 반영되었는지, 언제 누가 변경했는지 이력을 확인하고 싶다.
- 수십~수백 개의 설정 항목 중 원하는 키를 빠르게 검색하고 필터링하여 접근하고 싶다.
- JSON 타입 설정은 복잡할 수 있으니 입력 전에 유효성 오류를 바로 알고 싶다.

**Pain Points**
- 파라미터 하나를 바꾸려면 개발팀에 Jira 티켓을 올리고 배포 대기하는 구조라 라이브 대응이 느리다.
- 과거에 누가 어떤 값으로 변경했는지 알 방법이 없어 장애 발생 시 원인 추적이 어렵다.
- 설정 키가 늘어날수록 어떤 키가 어느 용도인지 파악하기 어렵다.

#### Secondary Persona: 서지현 (백엔드 개발자 / Admin)

| 항목 | 내용 |
|------|------|
| 소속 | 게임사 서버 개발팀 |
| 역할 | Remote Config 키 초기 설계 및 등록, JSON Schema 정의, 서버 측 설정 조회 API 연동 |
| 기술 수준 | 개발자. REST API, JSON, 환경 변수 관리 경험 풍부 |

**Goals**
- 신규 기능 개발 시 하드코딩 대신 Remote Config 키를 등록하여 운영팀이 직접 조정할 수 있도록 위임하고 싶다.
- 서버(server)와 클라이언트(client)에서 조회하는 설정 키를 명확히 구분하여 접근 범위를 제어하고 싶다.
- 잘못된 값이 저장될 경우 서비스 장애로 이어질 수 있으므로, 타입 기반 유효성 검증이 보장되길 원한다.

**Pain Points**
- 운영팀이 잘못된 값(타입 불일치, 잘못된 JSON)을 입력해도 현재는 검증 없이 저장된다.
- 설정 키 목적과 기본값에 대한 설명이 없어 다른 팀원이 수정할 때 의도가 전달되지 않는다.

#### Tertiary Persona: 이민재 (팀 리드 / Operator)

| 항목 | 내용 |
|------|------|
| 소속 | 게임사 운영팀 리드 |
| 역할 | 주요 설정 변경 내역 모니터링, 비정상 변경 감지 시 롤백 요청 |
| 기술 수준 | 비개발자. 대시보드 조회 중심 |

**Goals**
- 중요 파라미터(결제 금액, 배율 설정 등)가 언제 변경되었는지 이력을 주기적으로 확인하고 싶다.
- 특정 키의 변경 이력을 시계열로 조회하여 이상 변경을 즉시 파악하고 싶다.

**Pain Points**
- 변경 이력이 없어 잘못된 값이 언제 들어갔는지 추적이 불가능하다.

### 2.2 사용자 시나리오

#### SC-013: 이벤트 배율 설정 긴급 변경

> 최준혁(운영자)은 라이브 이벤트 도중 보너스 골드 배율이 잘못 설정된 것을 발견하고, 코드 배포 없이 즉시 값을 수정하여 서비스에 반영해야 한다.

**Steps**
1. 관리 콘솔 Remote Config 목록 페이지에서 검색창에 "event.gold_bonus"를 입력한다.
2. 검색 결과에서 해당 키를 클릭하여 상세 페이지로 이동한다.
3. "수정" 버튼을 클릭하고 값 입력 필드에서 현재 값 `3.0`을 `1.5`로 변경한다.
4. "저장" 버튼을 클릭하고 확인 다이얼로그에서 변경을 확정한다.
5. 변경 이력 테이블에 "event.gold_bonus: 3.0 → 1.5" 기록이 즉시 생성된다.
6. 클라이언트 앱이 다음 설정 조회 시 변경된 값을 수신한다.

#### SC-014: 신규 기능 플래그 등록

> 서지현(개발자)은 신규 길드 기능 개발 완료 후, 출시 전 기능 플래그를 Remote Config에 등록하여 운영팀이 적시에 플래그를 활성화할 수 있도록 위임한다.

**Steps**
1. Remote Config 목록 페이지에서 "새 설정 추가" 버튼을 클릭한다.
2. 키 입력 필드에 `feature.guild_system_enabled`를 입력한다.
3. 타입을 `boolean`으로 선택하고 값을 `false`로 설정한다.
4. 설명란에 "길드 시스템 활성화 여부. 출시 시 운영팀이 true로 변경"을 입력한다.
5. Target을 `client`로, Tags에 `feature-flag`, `guild`를 입력하고 저장한다.
6. 출시 일정에 최준혁(운영자)이 해당 키를 찾아 `true`로 변경하여 기능을 활성화한다.

#### SC-015: 설정 변경 이력 감사

> 이민재(팀 리드)는 결제 관련 설정 키가 비정상적으로 변경된 것으로 의심되어 변경 이력을 조회하여 원인을 파악한다.

**Steps**
1. Remote Config 목록에서 `payment.max_purchase_amount` 키를 검색한다.
2. 해당 키 상세 페이지 하단의 변경 이력 테이블을 확인한다.
3. 이력에서 "2026-03-28 14:32 / 관리자 A / updated / value: 100000 → 9999999"를 발견한다.
4. 변경 시각과 변경자를 확인하고 관련 관리자에게 확인 요청을 한다.
5. 필요 시 `100000` 값을 재입력하여 수동으로 원복한다.

#### SC-016: 필터·검색으로 대상 키 범위 파악

> 최준혁(운영자)은 클라이언트에 전달되는 설정 중 이벤트 관련 항목만 필터링하여 현재 활성화된 이벤트 파라미터 전체를 점검한다.

**Steps**
1. Remote Config 목록 페이지에서 Target 필터를 `client`로 설정한다.
2. 검색창에 `event`를 입력하여 이벤트 관련 키만 표시한다.
3. 결과 목록에서 각 키의 현재 값을 검토한다.
4. 수정이 필요한 항목을 클릭하여 상세 페이지로 이동 후 값을 변경한다.

---

## 3. Features & Requirements

### 3.1 기능 목록

| ID | 기능명 | 설명 | 우선순위 | 릴리즈 |
|----|--------|------|----------|--------|
| F-044 | 설정 키-값 CRUD | 원격 설정 항목 생성/조회/수정/삭제. key, valueType, value, description, target, tags 관리 | P0 | MVP |
| F-045 | 타입별 값 입력 및 유효성 검증 | string / number / boolean / JSON 4가지 타입별 전용 입력 UI. Zod 기반 폼 유효성 검증. JSON 실시간 검증 | P0 | MVP |
| F-046 | 검색·필터·정렬·페이지네이션 | key/description 부분 문자열 검색(debounce), Target/Type/Tag 3중 필터, 키순/최신수정순 정렬, PaginationBar | P0 | MVP |
| F-047 | 변경 이력 추적 | 모든 CRUD 작업 자동 로그 기록. 필드 단위 변경 추적. 상세 페이지 하단 이력 테이블 | P0 | MVP |

**우선순위 기준**
- **P0 (필수)**: MVP에 반드시 포함. 없으면 핵심 기능 동작 불가
- **P1 (중요)**: 높은 운영 가치. v1.1에서 포함
- **P2 (선택)**: 고도화 기능. v1.2 이후 포함

---

### 3.2 F-044: 설정 키-값 CRUD

**설명:** 운영팀과 개발팀이 관리 콘솔에서 원격 설정 항목을 생성·조회·수정·삭제한다. 각 항목은 고유 키(dot notation), 값 타입, 직렬화된 값, 설명, 적용 대상(client/server/both), 태그로 구성된다.

#### 유저 스토리

| ID | 스토리 | 우선순위 |
|----|--------|---------|
| US-064 | 개발자로서, 새로운 설정 키를 dot notation 형식으로 생성하여 운영팀이 코드 배포 없이 해당 파라미터를 조정할 수 있도록 위임할 수 있다 | P0 |
| US-065 | 운영자로서, 전체 설정 목록을 조회하여 현재 적용 중인 파라미터 값을 한눈에 파악할 수 있다 | P0 |
| US-066 | 운영자로서, 기존 설정의 값·설명·target·tags를 수정하여 게임 동작을 즉시 변경할 수 있다 (key는 변경 불가) | P0 |
| US-067 | 개발자로서, 더 이상 사용하지 않는 설정 항목을 삭제하여 설정 목록을 깔끔하게 유지할 수 있다 | P0 |

#### 요구사항

| ID | 요구사항 | 우선순위 |
|----|----------|---------|
| REQ-044-01 | 설정 키 생성 폼을 제공한다. 필수 입력: key, valueType, value. 선택 입력: description, target, tags | P0 |
| REQ-044-02 | 키(key) 필드는 소문자 영문(a-z), 숫자(0-9), dot(.), underscore(_), hyphen(-) 만 허용한다. 1자 이상 256자 이하. 프로젝트 내 유니크 제약 | P0 |
| REQ-044-03 | 설정 목록 페이지에서 전체 설정 항목을 테이블 형식으로 조회할 수 있다. 표시 컬럼: key, valueType, value(30자 truncate), target, updatedAt, 작업 버튼 | P0 |
| REQ-044-04 | 설정 상세 페이지에서 단일 항목의 전체 정보(key, valueType, value 원문, description, target, tags, 생성/수정 일시, 생성/수정자)를 조회할 수 있다 | P0 |
| REQ-044-05 | 수정 폼에서 value, description, target, tags 필드를 변경할 수 있다. key와 valueType은 생성 후 변경 불가 | P0 |
| REQ-044-06 | 삭제 버튼 클릭 시 확인 다이얼로그를 표시한다. 다이얼로그에는 삭제 대상 key를 명시한다. 확인 후에만 삭제가 실행된다 | P0 |
| REQ-044-07 | target 필드는 "client" / "server" / "both" 3가지 선택지로 제공한다. 기본값은 "both" | P0 |
| REQ-044-08 | tags 필드는 쉼표(,) 구분으로 복수 태그를 입력할 수 있다. 각 태그는 최대 50자 이하, 전체 태그는 최대 10개 | P0 |
| REQ-044-09 | 설정 목록 테이블에서 행(row)을 클릭하면 해당 설정 상세 페이지로 이동한다 | P0 |
| REQ-044-10 | 목록 페이지에서 각 행의 작업 메뉴(수정, 삭제)에 빠르게 접근할 수 있는 액션 버튼을 제공한다 | P0 |

#### 수용 기준 (Acceptance Criteria)

**AC-044-01: 새 설정 키 생성**

```gherkin
Scenario: 유효한 key로 새 설정을 생성한다
  Given Remote Config 목록 페이지에서 "새 설정 추가" 버튼을 클릭한다
  When key에 "feature.guild_system_enabled", valueType에 "boolean", value에 "false"를 입력하고 저장 버튼을 클릭한다
  Then 설정이 저장되고 목록 페이지로 이동한다
  And 목록에 "feature.guild_system_enabled" 항목이 표시된다
  And 변경 이력에 action: "created" 로그가 생성된다
```

**AC-044-02: 중복 키 생성 방지**

```gherkin
Scenario: 이미 존재하는 key로 생성 시도 시 오류 표시
  Given "feature.guild_system_enabled" 키가 이미 존재하는 상태이다
  When 동일한 key "feature.guild_system_enabled"로 새 설정을 생성하려 한다
  Then "이미 사용 중인 키입니다" 오류 메시지가 표시된다
  And 설정이 저장되지 않는다
```

**AC-044-03: 설정 수정 — key 변경 불가**

```gherkin
Scenario: 수정 폼에서 key 필드가 비활성화되어 있다
  Given "event.gold_bonus_multiplier" 설정 상세 페이지에서 "수정" 버튼을 클릭한다
  When 수정 폼이 열린다
  Then key 입력 필드가 disabled 상태로 표시된다
  And key 필드 값을 변경할 수 없다
```

**AC-044-04: 설정 수정 저장**

```gherkin
Scenario: 설정 값을 수정하고 저장한다
  Given "event.gold_bonus_multiplier" 설정 수정 폼이 열려 있고 현재 value는 "1.5"이다
  When value를 "2.0"으로 변경하고 저장 버튼을 클릭한다
  Then 설정이 저장되고 상세 페이지로 이동한다
  And 상세 페이지의 value가 "2.0"으로 표시된다
  And 변경 이력에 action: "updated", field: "value", previousValue: "1.5", newValue: "2.0" 로그가 생성된다
```

**AC-044-05: 설정 삭제 확인 다이얼로그**

```gherkin
Scenario: 삭제 버튼 클릭 시 확인 다이얼로그가 표시된다
  Given "feature.deprecated_flag" 설정 목록 행에서 삭제 버튼을 클릭한다
  When 확인 다이얼로그가 열린다
  Then 다이얼로그에 "feature.deprecated_flag 설정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다"라는 안내가 표시된다
  And 취소 버튼과 삭제 확인 버튼이 제공된다
```

**AC-044-06: 설정 삭제 실행**

```gherkin
Scenario: 삭제 확인 후 설정이 제거된다
  Given 삭제 확인 다이얼로그에서 "삭제" 버튼을 클릭한다
  When 삭제 API 요청이 완료된다
  Then 목록에서 해당 설정이 제거된다
  And 변경 이력에 action: "deleted" 로그가 생성된다
  And "설정이 삭제되었습니다" 성공 토스트가 표시된다
```

**AC-044-07: 삭제 취소**

```gherkin
Scenario: 삭제 다이얼로그에서 취소 버튼을 클릭하면 설정이 유지된다
  Given 삭제 확인 다이얼로그가 열려 있다
  When 취소 버튼을 클릭한다
  Then 다이얼로그가 닫히고 설정이 삭제되지 않는다
  And 목록에 해당 설정이 그대로 표시된다
```

#### 비즈니스 규칙

| ID | 규칙 | 예시 |
|----|------|------|
| BR-044-01 | key는 소문자 영문, 숫자, dot, underscore, hyphen만 허용한다. 대문자, 공백, 특수문자는 허용하지 않는다 | `Feature.Flag` → 오류. `feature.flag_01` → 허용 |
| BR-044-02 | key는 1자 이상 256자 이하여야 한다 | 257자 key 입력 시 차단 |
| BR-044-03 | key는 프로젝트 내에서 유일해야 한다. 동일 key로 생성 시도하면 오류를 반환한다 | `event.bonus`가 이미 존재하면 재생성 불가 |
| BR-044-04 | key와 valueType은 생성 후 변경할 수 없다 | 수정 폼에서 해당 필드를 disabled 처리 |
| BR-044-05 | target 기본값은 "both"이다. 명시하지 않으면 client와 server 모두에서 조회 가능 | |
| BR-044-06 | tags는 최대 10개까지 허용한다. 각 태그는 최대 50자 이하이다 | 11번째 태그 입력 시 차단 |
| BR-044-07 | 삭제된 설정 항목은 복구할 수 없다. 삭제 시 확인 다이얼로그를 거쳐야 한다 | |

#### 데이터 요구사항

| 필드 | 타입 | 필수 | 설명 | 유효성 규칙 |
|------|------|------|------|------------|
| key | string | Y | dot notation 설정 키 | `^[a-z0-9._-]{1,256}$`, 유니크 |
| valueType | enum | Y | string / number / boolean / json | 4가지 중 하나 |
| value | string | Y | 직렬화된 값 (저장 시 항상 string) | 타입별 유효성 적용 |
| description | string | N | 설정 목적 설명 | 최대 500자 |
| target | enum | Y | client / server / both | 기본값 "both" |
| tags | string[] | N | 분류 태그 목록 | 최대 10개, 각 50자 이하 |

#### 예외 처리

| 상황 | 처리 | 메시지 | 코드 |
|------|------|--------|------|
| 중복 key 생성 시도 | 저장 차단 + 오류 표시 | "이미 사용 중인 키입니다" | ERR-044-01 |
| 허용되지 않은 key 문자 입력 | 입력 차단 + 오류 표시 | "키는 소문자 영문, 숫자, .(dot), _(underscore), -(hyphen)만 사용할 수 있습니다" | ERR-044-02 |
| key 256자 초과 | 입력 차단 | "키는 최대 256자까지 입력할 수 있습니다" | ERR-044-03 |
| 필수 필드 미입력 후 저장 시도 | 저장 차단 + 필드별 오류 표시 | "필수 항목을 입력해 주세요" | ERR-044-04 |
| tags 10개 초과 | 입력 차단 | "태그는 최대 10개까지 추가할 수 있습니다" | ERR-044-05 |
| 삭제 API 오류 | 오류 토스트 표시 | "설정 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요" | ERR-044-06 |
| 저장 API 오류 | 오류 토스트 표시 | "설정 저장에 실패했습니다. 잠시 후 다시 시도해 주세요" | ERR-044-07 |

#### UI/UX 요구사항
- 설정 목록은 테이블 컴포넌트(React Table 기반)를 사용한다. 관련 화면: SCR-044 (화면정의서 참조)
- key 입력 필드에는 실시간 유효성 피드백(유효: 초록 테두리, 오류: 빨간 테두리 + 오류 메시지)을 제공한다
- 수정 폼의 key/valueType 필드는 시각적으로 disabled 처리(회색 배경, cursor: not-allowed)하여 변경 불가임을 명확히 표시한다
- 삭제 확인 다이얼로그에서 삭제 버튼은 destructive 스타일(빨간색)로 표시하여 주의를 환기한다

---

### 3.3 F-045: 타입별 값 입력 및 유효성 검증

**설명:** 설정 키의 valueType에 따라 전용 입력 UI를 렌더링하고, Zod 기반 스키마로 폼 유효성을 검증한다. JSON 타입은 실시간 구문 검증을 제공하여 저장 전에 오류를 사전 차단한다.

#### 유저 스토리

| ID | 스토리 | 우선순위 |
|----|--------|---------|
| US-068 | 운영자로서, boolean 타입 설정 값을 Select 드롭다운(True/False)으로 직관적으로 선택할 수 있다 | P0 |
| US-069 | 개발자로서, JSON 타입 설정을 Textarea에 입력할 때 실시간으로 JSON 구문 오류를 확인하여 잘못된 값이 저장되는 것을 방지할 수 있다 | P0 |
| US-070 | 운영자로서, number 타입 설정에 문자열을 실수로 입력했을 때 즉시 오류 메시지를 확인하여 입력 실수를 바로잡을 수 있다 | P0 |

#### 요구사항

| ID | 요구사항 | 우선순위 |
|----|----------|---------|
| REQ-045-01 | valueType에 따라 값 입력 UI가 동적으로 전환된다: string → 텍스트 Input, number → 숫자 Input, boolean → Select(True/False), json → Textarea | P0 |
| REQ-045-02 | string 타입: 텍스트 Input으로 임의의 UTF-8 문자열을 입력받는다. 최대 65,535바이트(64KB) 제한 | P0 |
| REQ-045-03 | number 타입: 숫자 전용 Input을 제공한다. 정수 및 소수점 모두 허용한다. 숫자가 아닌 문자 입력 시 즉시 오류를 표시한다 | P0 |
| REQ-045-04 | boolean 타입: "True" / "False" 2개 옵션을 가진 Select 컴포넌트를 제공한다. 텍스트 직접 입력 방식을 허용하지 않는다 | P0 |
| REQ-045-05 | json 타입: Textarea로 멀티라인 JSON을 입력받는다. 입력 중(onBlur 또는 300ms debounce) JSON.parse()로 실시간 구문 검증을 수행한다 | P0 |
| REQ-045-06 | JSON 유효성 오류 시 Textarea 하단에 오류 위치(line:col 형식)와 오류 메시지를 표시한다 | P0 |
| REQ-045-07 | JSON 입력이 유효할 때 Textarea 하단에 "유효한 JSON 형식입니다" 성공 메시지를 표시한다 | P0 |
| REQ-045-08 | valueType 변경(생성 폼에서만 가능) 시 value 입력 필드와 입력된 값을 초기화한다 | P0 |
| REQ-045-09 | 폼 유효성 검증은 Zod 스키마 기반으로 수행한다. 저장 버튼 클릭 시 최종 검증을 수행하며, 오류가 있으면 저장을 차단하고 오류 필드를 하이라이트한다 | P0 |
| REQ-045-10 | JSON 타입 Textarea에는 기본 들여쓰기(2 spaces) 자동 포맷 버튼을 제공한다 | P0 |

#### 수용 기준 (Acceptance Criteria)

**AC-045-01: valueType 변경 시 입력 UI 전환 및 값 초기화**

```gherkin
Scenario: 생성 폼에서 valueType을 변경하면 입력 UI가 전환되고 값이 초기화된다
  Given 새 설정 추가 폼에서 valueType이 "string"으로 선택된 상태이다
  And value 입력 필드에 "hello world"가 입력된 상태이다
  When valueType을 "boolean"으로 변경한다
  Then value 입력 UI가 텍스트 Input에서 Select(True/False)로 전환된다
  And value 입력 필드가 초기화(빈 상태)된다
```

**AC-045-02: number 타입 비숫자 입력 오류**

```gherkin
Scenario: number 타입 설정에 문자열을 입력하면 오류 메시지가 표시된다
  Given valueType이 "number"로 설정된 생성/수정 폼이 열려 있다
  When value 입력 필드에 "abc"를 입력한다
  Then "숫자 값을 입력해 주세요" 오류 메시지가 표시된다
  And 저장 버튼이 비활성화된다
```

**AC-045-03: number 타입 유효 입력 — 소수**

```gherkin
Scenario: number 타입 설정에 소수를 입력하면 정상 처리된다
  Given valueType이 "number"로 설정된 폼이 열려 있다
  When value 입력 필드에 "1.5"를 입력한다
  Then 오류 메시지가 표시되지 않는다
  And 저장 버튼이 활성화된다
```

**AC-045-04: boolean 타입 — Select 전용 입력**

```gherkin
Scenario: boolean 타입은 Select로만 입력 가능하다
  Given valueType이 "boolean"으로 설정된 폼이 열려 있다
  When value Select 드롭다운을 클릭한다
  Then "True"와 "False" 두 가지 옵션만 표시된다
  And 직접 텍스트 입력은 불가능하다
```

**AC-045-05: JSON 타입 실시간 구문 오류 표시**

```gherkin
Scenario: 잘못된 JSON 입력 시 실시간 오류 메시지가 표시된다
  Given valueType이 "json"으로 설정된 폼의 Textarea가 활성화된 상태이다
  When Textarea에 "{ key: value }" (따옴표 누락된 JSON)를 입력하고 포커스를 벗어난다
  Then "올바른 JSON 형식이 아닙니다 (1:3 Unexpected token)" 오류 메시지가 표시된다
  And 저장 버튼이 비활성화된다
```

**AC-045-06: JSON 타입 유효성 성공 표시**

```gherkin
Scenario: 유효한 JSON 입력 시 성공 메시지가 표시된다
  Given valueType이 "json"으로 설정된 폼의 Textarea에 유효한 JSON이 입력된 상태이다
  When 포커스를 벗어난다
  Then Textarea 하단에 "유효한 JSON 형식입니다" 성공 메시지가 표시된다
  And 저장 버튼이 활성화된다
```

**AC-045-07: JSON 자동 포맷**

```gherkin
Scenario: JSON 자동 포맷 버튼 클릭 시 들여쓰기가 정렬된다
  Given Textarea에 '{"key":"value","nested":{"a":1}}' (한 줄 JSON)이 입력된 상태이다
  When "포맷" 버튼을 클릭한다
  Then Textarea 내용이 2-space 들여쓰기가 적용된 멀티라인 JSON으로 포맷된다
```

**AC-045-08: 저장 시 최종 Zod 검증**

```gherkin
Scenario: 유효성 오류가 있는 상태에서 저장 시도 시 차단된다
  Given number 타입 value 필드에 "abc"가 입력된 상태이다 (오류 상태)
  When 저장 버튼을 클릭한다
  Then 저장 API 요청이 발생하지 않는다
  And 오류 필드가 하이라이트(빨간 테두리)된다
```

#### 비즈니스 규칙

| ID | 규칙 | 예시 |
|----|------|------|
| BR-045-01 | string 타입 값은 최대 64KB(65,535바이트)이다 | 65,536바이트 입력 시 오류 |
| BR-045-02 | number 타입 값은 JavaScript IEEE 754 배정밀도 부동소수점 범위 내의 숫자여야 한다 | Infinity, NaN 입력 불가 |
| BR-045-03 | boolean 타입 값은 Select를 통해서만 입력한다. 저장 시 "true" 또는 "false" 소문자 문자열로 직렬화한다 | |
| BR-045-04 | json 타입 값은 `JSON.parse()` 통과 가능한 유효한 JSON 문자열이어야 한다. JSON5, YAML, 주석 등은 허용하지 않는다 | `{ key: "value" }` 입력 불가 |
| BR-045-05 | valueType 변경은 설정 생성 시에만 가능하다. 수정 폼에서는 valueType이 잠긴다 | 이미 저장된 string을 number로 변경 불가 |
| BR-045-06 | 모든 value는 내부적으로 string으로 직렬화하여 저장한다. 조회 시 valueType에 따라 역직렬화한다 | boolean `true` → `"true"` 저장 |

#### 예외 처리

| 상황 | 처리 | 메시지 | 코드 |
|------|------|--------|------|
| number 타입에 비숫자 입력 | 실시간 오류 표시 + 저장 차단 | "숫자 값을 입력해 주세요" | ERR-045-01 |
| json 타입에 잘못된 JSON 입력 | 실시간 오류 표시 + 저장 차단 | "올바른 JSON 형식이 아닙니다 ({위치} {이유})" | ERR-045-02 |
| string 타입 64KB 초과 | 실시간 오류 표시 + 저장 차단 | "값은 최대 64KB까지 입력할 수 있습니다" | ERR-045-03 |
| 빈 value로 저장 시도 | 저장 차단 + 오류 표시 | "값을 입력해 주세요" | ERR-045-04 |

#### UI/UX 요구사항
- JSON Textarea는 최소 6줄 높이를 기본으로 하고, 내용에 따라 최대 20줄까지 자동 확장(resize)된다
- boolean Select는 "True", "False" 순서로 옵션을 표시하며 기본값은 선택 없음("값을 선택해 주세요")이다
- number Input은 `type="text"` + Zod 검증 방식을 사용한다 (`type="number"`의 브라우저 기본 스피너 UI 제거)
- 입력 필드별 오류 메시지는 필드 하단에 빨간색 소형 텍스트로 표시한다

---

### 3.4 F-046: 검색·필터·정렬·페이지네이션

**설명:** 운영팀이 수십~수백 개의 설정 항목 중 원하는 항목을 빠르게 찾을 수 있도록 텍스트 검색, 3중 필터(Target/Type/Tag), 정렬, 페이지네이션을 제공한다.

#### 유저 스토리

| ID | 스토리 | 우선순위 |
|----|--------|---------|
| US-071 | 운영자로서, key 또는 description에 특정 키워드를 입력하면 해당 설정 항목만 필터링되어 원하는 설정을 빠르게 찾을 수 있다 | P0 |
| US-072 | 운영자로서, Target 필터로 "client" 전용 설정만 표시하여 클라이언트에 노출되는 파라미터만 집중적으로 관리할 수 있다 | P0 |
| US-073 | 운영자로서, 최신 수정순으로 정렬하여 최근 변경된 설정을 우선적으로 검토할 수 있다 | P0 |
| US-074 | 운영자로서, 필터 결과가 없을 때 "필터 초기화" 버튼을 클릭하여 전체 목록으로 빠르게 돌아올 수 있다 | P0 |

#### 요구사항

| ID | 요구사항 | 우선순위 |
|----|----------|---------|
| REQ-046-01 | 검색 입력 필드를 제공한다. key 및 description에 대한 부분 문자열(substring) 매칭을 수행한다. 대소문자를 구분하지 않는다 | P0 |
| REQ-046-02 | 검색 입력에 300ms debounce를 적용하여 API 호출을 최소화한다 | P0 |
| REQ-046-03 | Target 필터를 제공한다. 옵션: All(기본) / client / server / both | P0 |
| REQ-046-04 | Type 필터를 제공한다. 옵션: All(기본) / string / number / boolean / json | P0 |
| REQ-046-05 | Tag 필터를 제공한다. 등록된 태그 목록을 드롭다운으로 표시하며 단일 선택 방식으로 제공한다 | P0 |
| REQ-046-06 | 3개 필터(Target, Type, Tag)는 독립적으로 적용 가능하며, 동시에 여러 필터를 조합하여 적용할 수 있다 | P0 |
| REQ-046-07 | 정렬 옵션 2가지를 제공한다: 키순(key 알파벳 오름차순, 기본값) / 최신 수정순(updatedAt 내림차순) | P0 |
| REQ-046-08 | 정렬 변경 시 현재 페이지를 1페이지로 초기화하고 즉시 재조회한다 | P0 |
| REQ-046-09 | 페이지네이션은 기존 PaginationBar 컴포넌트를 재사용한다. 기본 페이지 사이즈는 20개 | P0 |
| REQ-046-10 | 필터/검색 결과가 0건인 경우 빈 상태(Empty State) UI를 표시한다. 빈 상태 UI에는 "조건에 맞는 설정이 없습니다"와 "필터 초기화" 버튼을 포함한다 | P0 |
| REQ-046-11 | 검색어, 필터, 정렬 상태를 URL 쿼리 파라미터에 반영하여 링크 공유와 새로고침 후 상태 복원을 지원한다 | P0 |
| REQ-046-12 | 활성화된 필터(All이 아닌 상태)는 시각적으로 구분하여 표시한다 | P0 |

#### 수용 기준 (Acceptance Criteria)

**AC-046-01: 검색 debounce 동작**

```gherkin
Scenario: 검색 입력 후 300ms 뒤에 결과가 갱신된다
  Given Remote Config 목록 페이지가 열려 있다
  When 검색 필드에 "event"를 입력한다
  Then 입력 후 즉시 API 요청이 발생하지 않는다
  And 300ms 경과 후 "event"를 key 또는 description에 포함한 설정만 목록에 표시된다
```

**AC-046-02: 검색 결과 대소문자 무관**

```gherkin
Scenario: 대소문자 관계없이 검색 결과가 동일하다
  Given "event.gold_bonus_multiplier" 설정이 존재한다
  When 검색 필드에 "EVENT"를 입력한다 (대문자)
  Then "event.gold_bonus_multiplier" 설정이 검색 결과에 표시된다
```

**AC-046-03: Target 필터 독립 적용**

```gherkin
Scenario: Target 필터를 client로 변경하면 client 설정만 표시된다
  Given 설정 목록에 target: "client" 3건, target: "server" 2건, target: "both" 5건이 있다
  When Target 필터를 "client"로 변경한다
  Then target: "client"인 3건만 목록에 표시된다
  And target: "server", "both" 설정은 표시되지 않는다
```

**AC-046-04: 다중 필터 조합**

```gherkin
Scenario: Target과 Type 필터를 동시에 적용할 수 있다
  Given Target 필터가 "client"로, Type 필터가 "boolean"으로 설정된 상태이다
  When 필터 결과가 갱신된다
  Then target: "client"이면서 valueType: "boolean"인 설정만 목록에 표시된다
```

**AC-046-05: 빈 결과 처리**

```gherkin
Scenario: 필터 결과가 없을 때 Empty State UI가 표시된다
  Given 검색어 "zzz_nonexistent"와 Target "server" 필터가 적용된 상태이다
  When 필터 조건에 맞는 설정이 0건이다
  Then "조건에 맞는 설정이 없습니다" 메시지와 "필터 초기화" 버튼이 표시된다
```

**AC-046-06: 필터 초기화**

```gherkin
Scenario: 필터 초기화 버튼 클릭 시 전체 목록이 표시된다
  Given 검색어 및 필터가 적용된 상태에서 Empty State의 "필터 초기화" 버튼을 클릭한다
  When 초기화 처리가 완료된다
  Then 검색어가 비워지고 모든 필터가 "All"로 리셋된다
  And 전체 설정 목록이 표시된다
```

**AC-046-07: 정렬 변경 즉시 반영**

```gherkin
Scenario: 정렬을 최신 수정순으로 변경하면 즉시 재정렬된다
  Given 설정 목록이 키순으로 정렬된 상태이다
  When 정렬 옵션을 "최신 수정순"으로 변경한다
  Then 가장 최근에 수정된 설정이 목록 첫 번째에 표시된다
  And 페이지가 1페이지로 초기화된다
```

**AC-046-08: URL 쿼리 파라미터 동기화**

```gherkin
Scenario: 필터 상태가 URL에 반영되어 새로고침 후 복원된다
  Given 검색어 "event", Target 필터 "client"가 적용된 상태이다
  When 브라우저 URL을 확인한다
  Then URL에 ?q=event&target=client 파라미터가 포함된다
  And 해당 URL을 새 탭에서 열면 동일한 필터 상태가 복원된다
```

#### 비즈니스 규칙

| ID | 규칙 | 예시 |
|----|------|------|
| BR-046-01 | 검색은 key와 description 필드에 대한 부분 문자열 매칭이다. key만 또는 description만 일치해도 결과에 포함된다 | "bonus" 검색 → key에 "bonus" 포함 OR description에 "bonus" 포함 |
| BR-046-02 | 300ms debounce는 마지막 입력 이후 300ms 이내에 추가 입력이 없을 때 API를 호출한다 | |
| BR-046-03 | Tag 필터는 단일 선택이다. 복수 태그 AND/OR 필터링은 Out of Scope | |
| BR-046-04 | 페이지 사이즈는 고정 20개이다. 사용자가 변경할 수 없다 | |
| BR-046-05 | 필터 변경 시 항상 1페이지로 초기화된다 | |

#### 예외 처리

| 상황 | 처리 | 메시지 | 코드 |
|------|------|--------|------|
| 검색/필터 결과 0건 | Empty State UI 표시 | "조건에 맞는 설정이 없습니다" | - |
| 목록 API 로딩 오류 | 오류 메시지 + 재시도 버튼 | "설정 목록을 불러오지 못했습니다. 다시 시도해 주세요" | ERR-046-01 |
| Tag 목록 로딩 오류 | Tag 필터 비활성화 처리 | Tag 필터 드롭다운 disabled 처리 | ERR-046-02 |

#### UI/UX 요구사항
- 검색 필드, Target/Type/Tag 필터, 정렬 선택은 목록 테이블 상단 컨트롤 바에 가로로 배치한다
- 활성화된 필터(All이 아닌 상태)는 배지(badge) 또는 강조 색상으로 시각적으로 구분한다
- 목록 로딩 중에는 테이블 영역에 스켈레톤 UI를 표시한다
- 관련 화면: SCR-046 (화면정의서 참조)

---

### 3.5 F-047: 변경 이력 추적

**설명:** 설정 항목에 대한 모든 CRUD 작업 시 변경 이력을 자동으로 기록한다. 필드 단위로 이전 값과 새 값을 추적하며, 설정 상세 페이지 하단에 변경 이력 테이블로 표시한다.

#### 유저 스토리

| ID | 스토리 | 우선순위 |
|----|--------|---------|
| US-075 | 팀 리드로서, 설정 상세 페이지에서 해당 키의 전체 변경 이력(시각, 변경자, 유형, 필드, 이전값, 새값)을 확인하여 오운영 원인을 파악할 수 있다 | P0 |
| US-076 | 운영자로서, 내가 방금 수정한 설정이 이력에 즉시 반영되어 변경 사항이 기록되었음을 확인할 수 있다 | P0 |
| US-077 | 개발자로서, 설정 생성 시 "created" 로그가 자동 기록되어 키 등록 시점과 등록자를 추적할 수 있다 | P0 |

#### 요구사항

| ID | 요구사항 | 우선순위 |
|----|----------|---------|
| REQ-047-01 | 설정 항목의 생성(created), 수정(updated), 삭제(deleted) 시 변경 이력이 자동으로 기록된다 | P0 |
| REQ-047-02 | 수정 시 변경된 필드별로 별도 로그를 생성한다. 하나의 수정 작업에서 여러 필드가 변경되면 필드마다 개별 로그가 생성된다 | P0 |
| REQ-047-03 | 이력 테이블에 표시되는 컬럼: 일시(changedAt), 변경자(changedBy), 유형(action), 필드(field), 이전값(previousValue), 새값(newValue) | P0 |
| REQ-047-04 | 생성(created) 이력에는 field: null, previousValue: null로 기록한다 | P0 |
| REQ-047-05 | 삭제(deleted) 이력에는 field: null, newValue: null로 기록한다 | P0 |
| REQ-047-06 | 변경 이력 테이블은 설정 상세 페이지 하단에 최신 이력 순(changedAt 내림차순)으로 표시된다 | P0 |
| REQ-047-07 | 변경 이력 테이블은 기본 20건을 표시하고, "더 보기" 버튼으로 추가 이력을 로드할 수 있다 | P0 |
| REQ-047-08 | value 필드 이력에서 긴 값(50자 이상)은 truncate하여 표시하고 호버 시 전체 값을 툴팁으로 표시한다 | P0 |
| REQ-047-09 | changedBy 필드에는 관리자 표시명(이름 또는 이메일)을 기록한다. 관리자 계정 삭제 후에도 이력의 changedBy 값은 유지된다 | P0 |

#### 수용 기준 (Acceptance Criteria)

**AC-047-01: 설정 생성 시 이력 자동 기록**

```gherkin
Scenario: 설정을 생성하면 created 이력이 생성된다
  Given 새 설정 "feature.guild_system_enabled" 생성이 완료되었다
  When 해당 설정 상세 페이지의 변경 이력 섹션을 확인한다
  Then 이력 테이블에 action: "created", changedBy: {현재 관리자}, field: null, previousValue: null 로그가 표시된다
  And changedAt은 생성 시각(ISO 8601)으로 기록된다
```

**AC-047-02: 단일 필드 수정 이력**

```gherkin
Scenario: value 필드만 수정하면 value 필드에 대한 이력 1건이 생성된다
  Given "event.gold_bonus_multiplier" 설정의 value가 "1.5"인 상태이다
  When value를 "2.0"으로 수정하고 저장한다
  Then 변경 이력에 action: "updated", field: "value", previousValue: "1.5", newValue: "2.0" 로그 1건이 추가된다
```

**AC-047-03: 복수 필드 수정 이력**

```gherkin
Scenario: 여러 필드를 동시에 수정하면 필드별 이력이 각각 생성된다
  Given "server.max_players" 설정에서 value "100"과 description "최대 플레이어 수"가 설정된 상태이다
  When value를 "200"으로, description을 "서버당 최대 동시 접속 플레이어 수"로 동시에 변경하고 저장한다
  Then 변경 이력에 field: "value" 로그 1건과 field: "description" 로그 1건이 동일 타임스탬프로 생성된다
```

**AC-047-04: 설정 삭제 이력**

```gherkin
Scenario: 설정 삭제 시 deleted 이력이 기록된다
  Given "feature.deprecated_flag" 설정이 존재한다
  When 해당 설정을 삭제한다
  Then 해당 configId를 가진 이력에 action: "deleted", field: null, newValue: null 로그가 기록된다
  And 삭제 후 설정 목록에는 표시되지 않지만 감사 로그(Audit Log)에는 이력이 유지된다
```

**AC-047-05: 이력 최신순 정렬 및 페이지네이션**

```gherkin
Scenario: 변경 이력은 최신 이력이 가장 위에 표시된다
  Given 특정 설정에 10건의 변경 이력이 있다
  When 해당 설정 상세 페이지의 변경 이력 섹션을 확인한다
  Then 가장 최근 변경 시각(changedAt)을 가진 이력이 테이블 첫 번째 행에 표시된다
```

**AC-047-06: 긴 값 truncate 및 툴팁**

```gherkin
Scenario: 긴 JSON 값은 truncate되고 호버 시 전체 값이 표시된다
  Given 이력의 newValue가 500자 JSON 문자열인 경우
  When 이력 테이블의 newValue 셀을 확인한다
  Then 첫 50자만 표시되고 "..." 처리된다
  And 해당 셀에 마우스를 올리면 전체 값이 툴팁으로 표시된다
```

#### 비즈니스 규칙

| ID | 규칙 | 예시 |
|----|------|------|
| BR-047-01 | 모든 CRUD 작업에 대해 이력이 반드시 기록된다. 이력 기록 실패가 원본 작업을 롤백해서는 안 된다 (best-effort 기록) | 이력 DB 장애 시 원본 설정 저장은 성공 처리 |
| BR-047-02 | 수정 시 변경되지 않은 필드에 대한 이력은 생성하지 않는다 | description만 변경 시 value 이력 생성 안 함 |
| BR-047-03 | changedBy는 API 요청 시 인증된 관리자 ID를 기준으로 자동 기록한다. 수동 입력 불가 | |
| BR-047-04 | 변경 이력은 영구 보관한다. 삭제 정책을 적용하지 않는다 | 설정이 삭제된 이후에도 해당 configId의 이력은 보존 |
| BR-047-05 | 이력 조회 시 기본 20건을 반환한다. 더 보기 시 다음 20건씩 추가 로드한다 (cursor-based pagination) | |

#### 데이터 요구사항 (RemoteConfigChangeLog)

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | string (UUID) | Y | 이력 고유 ID |
| configId | string | Y | 설정 항목 ID (FK) |
| action | enum | Y | created / updated / deleted |
| field | string \| null | N | 변경된 필드명 (updated 시) |
| previousValue | string \| null | N | 이전 값 (updated / deleted 시) |
| newValue | string \| null | N | 새 값 (created / updated 시) |
| changedBy | string | Y | 변경한 관리자 표시명 또는 ID |
| changedAt | string (ISO 8601) | Y | 변경 일시 |

#### 예외 처리

| 상황 | 처리 | 메시지 | 코드 |
|------|------|--------|------|
| 이력 로딩 오류 | 오류 메시지 + 재시도 버튼 | "변경 이력을 불러오지 못했습니다. 다시 시도해 주세요" | ERR-047-01 |
| 이력 기록 실패 (서버 장애) | 원본 CRUD 작업은 성공 처리. 이력 기록 실패는 내부 모니터링 알림만 발송 | (사용자에게 별도 오류 메시지 표시 안 함) | ERR-047-02 |

#### UI/UX 요구사항
- 변경 이력 테이블은 설정 상세 페이지 하단에 "변경 이력" 섹션 제목과 함께 표시한다
- action 유형은 배지(badge)로 시각화한다: created(파란색), updated(노란색), deleted(빨간색)
- changedAt은 "YYYY-MM-DD HH:mm:ss" 형식으로 표시하고 호버 시 전체 ISO 8601 타임스탬프를 툴팁으로 표시한다
- 관련 화면: SCR-047 (화면정의서 참조)

---

## 4. Non-Functional Requirements

| ID | 요구사항 | 기준 |
|----|----------|------|
| NFR-008-01 | 목록 API 응답 시간 | 95%ile 1초 이내. 설정 1,000건 기준 |
| NFR-008-02 | 단건 조회 + 이력 API 응답 시간 | 95%ile 500ms 이내 |
| NFR-008-03 | 생성/수정 API 응답 시간 | 95%ile 500ms 이내 |
| NFR-008-04 | 삭제 API 응답 시간 | 95%ile 500ms 이내 |
| NFR-008-05 | 설정 규모 지원 | 프로젝트당 최대 10,000개 설정 항목 관리 가능한 아키텍처 |
| NFR-008-06 | 권한 제어 | 모든 생성/수정/삭제 API에 Editor 이상 권한 검증. 조회 API에 Viewer 이상 권한 검증 |
| NFR-008-07 | 감사 로그 | 모든 CRUD 이벤트를 시스템 감사 로그에 기록. Settings > Audit Log에서 조회 가능 |
| NFR-008-08 | 변경 이력 보관 | 변경 이력 영구 보관. 삭제 정책 미적용 |
| NFR-008-09 | 동시 수정 충돌 | 동일 설정에 대한 동시 수정 요청 시 서버에서 순차 처리(Last-Write-Wins 정책) |
| NFR-008-10 | 검색 성능 | key / description full-text 인덱스 적용으로 1,000건 기준 검색 응답 200ms 이내 |

---

## 5. Data Model

### 5.1 RemoteConfigEntry 엔티티

```typescript
type ValueType = "string" | "number" | "boolean" | "json";
type TargetType = "client" | "server" | "both";

interface RemoteConfigEntry {
  id: string;              // UUID, 설정 항목 고유 ID
  key: string;             // dot notation, 유니크, 1-256자, ^[a-z0-9._-]+$
  valueType: ValueType;    // 값 타입 (생성 후 변경 불가)
  value: string;           // 직렬화된 값 (저장 시 항상 string)
  description?: string;    // 설정 목적 설명 (최대 500자, 선택)
  target: TargetType;      // 적용 대상 (기본값: "both")
  tags: string[];          // 분류 태그 (최대 10개, 각 50자 이하)

  // 메타데이터
  createdAt: string;       // ISO 8601 생성 일시
  createdBy: string;       // 생성 관리자 표시명
  updatedAt: string;       // ISO 8601 최종 수정 일시
  updatedBy: string;       // 최종 수정 관리자 표시명
}
```

### 5.2 RemoteConfigChangeLog 엔티티

```typescript
type ChangeAction = "created" | "updated" | "deleted";

interface RemoteConfigChangeLog {
  id: string;                  // UUID, 이력 고유 ID
  configId: string;            // 설정 항목 ID (FK → RemoteConfigEntry.id)
  action: ChangeAction;        // 변경 유형

  // 필드 단위 변경 추적 (updated 시 필드별 개별 로그)
  field: string | null;        // 변경된 필드명. created/deleted 시 null
  previousValue: string | null; // 이전 값. created 시 null
  newValue: string | null;      // 새 값. deleted 시 null

  // 변경 메타
  changedBy: string;           // 변경 관리자 표시명 (계정 삭제 후에도 유지)
  changedAt: string;           // ISO 8601 변경 일시
}
```

### 5.3 엔티티 관계

```
RemoteConfigEntry (1) ───────── (N) RemoteConfigChangeLog
  id (PK)                              configId (FK)
  key (UNIQUE)
  valueType
  value
  description
  target
  tags[]
  createdAt / createdBy
  updatedAt / updatedBy
```

### 5.4 저장 전략

```
valueType      입력 예시             저장 값 (string)
─────────────────────────────────────────────────
string         "hello world"        "hello world"
number         1.5                  "1.5"
boolean        true (Select)        "true"
json           {"key":"value"}      "{\"key\":\"value\"}"
```

### 5.5 인덱스 전략

```sql
-- 조회 성능 최적화
CREATE UNIQUE INDEX idx_remote_config_key ON remote_config_entries (key);
CREATE INDEX idx_remote_config_target ON remote_config_entries (target);
CREATE INDEX idx_remote_config_value_type ON remote_config_entries (value_type);
CREATE INDEX idx_remote_config_updated_at ON remote_config_entries (updated_at DESC);

-- 검색 성능 최적화 (full-text search)
CREATE INDEX idx_remote_config_fulltext ON remote_config_entries USING GIN (to_tsvector('english', key || ' ' || COALESCE(description, '')));

-- 이력 조회 최적화
CREATE INDEX idx_change_log_config_id ON remote_config_change_logs (config_id);
CREATE INDEX idx_change_log_changed_at ON remote_config_change_logs (changed_at DESC);
```

---

## 6. API Endpoints

| # | Method | Endpoint | 설명 | 권한 |
|---|--------|----------|------|------|
| 1 | GET | `/api/remote-config?q={}&target={}&valueType={}&tag={}&sort={}&page={n}&size={n}` | 목록 조회 (검색, 필터, 정렬, 페이지네이션) | Viewer+ |
| 2 | POST | `/api/remote-config` | 설정 추가 | Editor+ |
| 3 | GET | `/api/remote-config/:id` | 단건 조회 | Viewer+ |
| 4 | GET | `/api/remote-config/:id/history` | 변경 이력 조회 (cursor-based pagination) | Viewer+ |
| 5 | PUT | `/api/remote-config/:id` | 설정 수정 (value, description, target, tags) | Editor+ |
| 6 | DELETE | `/api/remote-config/:id` | 설정 삭제 | Editor+ |

### 6.1 요청/응답 스키마 상세

#### GET /api/remote-config (목록 조회)

**Query Parameters**

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| q | string | - | 검색어 (key 또는 description 부분 매칭) |
| target | "client"\|"server"\|"both" | - | Target 필터 (미전달 시 전체) |
| valueType | "string"\|"number"\|"boolean"\|"json" | - | 타입 필터 (미전달 시 전체) |
| tag | string | - | Tag 필터 (단일 태그명) |
| sort | "key"\|"updatedAt" | "key" | 정렬 기준 |
| page | number | 1 | 페이지 번호 (1 기반) |
| size | number | 20 | 페이지 사이즈 (고정) |

**Response**

```typescript
interface RemoteConfigListResponse {
  data: RemoteConfigEntry[];
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}
```

#### POST /api/remote-config (설정 추가)

**Request Body**

```typescript
interface CreateRemoteConfigRequest {
  key: string;              // 필수. ^[a-z0-9._-]{1,256}$
  valueType: ValueType;     // 필수.
  value: string;            // 필수. 타입별 유효성 적용
  description?: string;     // 선택. 최대 500자
  target?: TargetType;      // 선택. 기본값 "both"
  tags?: string[];          // 선택. 최대 10개
}
```

**Response**

```typescript
// 201 Created
interface CreateRemoteConfigResponse {
  data: RemoteConfigEntry;
}

// 409 Conflict (중복 key)
{ "error": "KEY_ALREADY_EXISTS", "message": "이미 사용 중인 키입니다" }
```

#### PUT /api/remote-config/:id (설정 수정)

**Request Body**

```typescript
interface UpdateRemoteConfigRequest {
  value?: string;           // 타입별 유효성 적용
  description?: string;     // 최대 500자
  target?: TargetType;
  tags?: string[];          // 최대 10개
  // key, valueType 필드는 무시됨 (변경 불가)
}
```

**Response**

```typescript
// 200 OK
interface UpdateRemoteConfigResponse {
  data: RemoteConfigEntry;
}

// 404 Not Found
{ "error": "CONFIG_NOT_FOUND", "message": "설정을 찾을 수 없습니다" }
```

#### GET /api/remote-config/:id/history (변경 이력 조회)

**Query Parameters**

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| cursor | string | - | 커서 기반 페이지네이션 커서 값 |
| limit | number | 20 | 조회할 이력 수 |

**Response**

```typescript
interface RemoteConfigHistoryResponse {
  data: RemoteConfigChangeLog[];
  nextCursor: string | null;  // 다음 페이지 커서. null이면 마지막 페이지
}
```

---

## 7. RBAC (Role-Based Access Control)

### 7.1 역할별 권한 매트릭스

| 작업 | Viewer | Editor | Operator | Admin |
|------|--------|--------|----------|-------|
| 목록 조회 | O | O | O | O |
| 단건 조회 | O | O | O | O |
| 변경 이력 조회 | O | O | O | O |
| 설정 추가 | X | O | O | O |
| 설정 수정 | X | O | O | O |
| 설정 삭제 | X | O | O | O |

### 7.2 RBAC 상세

- **Viewer**: 읽기 전용. 설정 목록, 상세, 변경 이력 조회만 가능. "새 설정 추가", 수정, 삭제 UI 요소를 비표시 처리한다
- **Editor**: CRUD 전체 권한. 승인 워크플로우가 없으므로 즉시 반영 가능 (MVP 기준)
- **Operator / Admin**: Editor와 동일. 향후 승인 워크플로우(Out of Scope) 추가 시 Operator 이상만 최종 발행 가능

### 7.3 Viewer 역할 UI 처리

```
Viewer 접근 시:
- "새 설정 추가" 버튼 비표시
- 목록 행의 수정/삭제 액션 버튼 비표시
- 상세 페이지의 "수정", "삭제" 버튼 비표시
- 직접 API 호출 시 403 Forbidden 반환
```

---

## 8. User Workflows & Scenarios

### 8.1 설정 생성 플로우

```
[운영자/개발자]
     |
     v
목록 페이지 접근
     |
     v
"새 설정 추가" 버튼 클릭
     |
     v
생성 폼 표시
     |
     +-- key 입력 (실시간 유효성 검증)
     |
     +-- valueType 선택
     |       |
     |       +-- string  → 텍스트 Input
     |       +-- number  → 숫자 Input
     |       +-- boolean → Select(True/False)
     |       +-- json    → Textarea (실시간 JSON 검증)
     |
     +-- description 입력 (선택)
     |
     +-- target 선택 (기본: both)
     |
     +-- tags 입력 (선택)
     |
     v
"저장" 버튼 클릭
     |
     v
Zod 최종 검증
     |
     +-- 오류 → 오류 하이라이트 표시, 저장 차단
     |
     +-- 성공 → POST /api/remote-config
                    |
                    +-- 409 중복 key → 오류 메시지 표시
                    |
                    +-- 201 성공 → 목록 페이지 이동
                                   + "설정이 추가되었습니다" 토스트
                                   + created 이력 자동 기록
```

### 8.2 설정 수정 플로우

```
[운영자]
     |
     v
목록 또는 상세 페이지에서 "수정" 버튼 클릭
     |
     v
수정 폼 표시 (기존 값 프리필)
     - key: disabled (변경 불가)
     - valueType: disabled (변경 불가)
     - value: 편집 가능 (타입별 전용 UI)
     - description: 편집 가능
     - target: 편집 가능
     - tags: 편집 가능
     |
     v
값 수정
     |
     v
"저장" 버튼 클릭
     |
     v
Zod 최종 검증
     |
     +-- 오류 → 저장 차단
     |
     +-- 성공 → PUT /api/remote-config/:id
                    |
                    +-- 404 미존재 → 오류 토스트
                    |
                    +-- 200 성공 → 상세 페이지 이동
                                   + "설정이 수정되었습니다" 토스트
                                   + 변경된 필드별 updated 이력 자동 기록
```

### 8.3 설정 삭제 플로우

```
[Editor+]
     |
     v
목록 행 또는 상세 페이지에서 "삭제" 버튼 클릭
     |
     v
확인 다이얼로그 표시
     "{key} 설정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
     [취소] [삭제]
     |
     +-- 취소 → 다이얼로그 닫기, 설정 유지
     |
     +-- 삭제 확인 → DELETE /api/remote-config/:id
                           |
                           +-- 오류 → 오류 토스트 표시
                           |
                           +-- 200 성공 → 목록 페이지 이동
                                          + "설정이 삭제되었습니다" 토스트
                                          + deleted 이력 자동 기록
```

### 8.4 변경 이력 조회 플로우

```
[Viewer+]
     |
     v
설정 상세 페이지 하단 "변경 이력" 섹션 확인
     |
     v
GET /api/remote-config/:id/history?limit=20
     |
     v
이력 테이블 표시 (최신순)
     - changedAt | changedBy | action | field | previousValue | newValue
     |
     v
"더 보기" 버튼 클릭 (nextCursor 존재 시)
     |
     v
GET /api/remote-config/:id/history?cursor={cursor}&limit=20
     |
     v
추가 이력 테이블에 append
```

---

## 9. Architecture / Technical Approach

### 9.1 프론트엔드 아키텍처

```
apps/admin/src/
├── app/
│   └── remote-config/
│       ├── page.tsx              # 목록 페이지 (F-046 검색/필터)
│       ├── new/
│       │   └── page.tsx          # 생성 폼 페이지
│       └── [id]/
│           ├── page.tsx          # 상세 + 변경 이력 페이지 (F-047)
│           └── edit/
│               └── page.tsx      # 수정 폼 페이지
│
├── features/
│   └── remote-config/
│       ├── components/
│       │   ├── RemoteConfigTable.tsx          # 목록 테이블 (F-044, F-046)
│       │   ├── RemoteConfigForm.tsx           # 생성/수정 폼 (F-044, F-045)
│       │   ├── ValueTypeInput.tsx             # 타입별 입력 UI 분기 (F-045)
│       │   │   ├── StringInput.tsx
│       │   │   ├── NumberInput.tsx
│       │   │   ├── BooleanSelect.tsx
│       │   │   └── JsonTextarea.tsx           # JSON 실시간 검증 포함
│       │   ├── RemoteConfigSearchBar.tsx      # 검색 + 필터 컨트롤 바 (F-046)
│       │   ├── RemoteConfigDetail.tsx         # 상세 정보 표시
│       │   ├── ChangeHistoryTable.tsx         # 변경 이력 테이블 (F-047)
│       │   └── DeleteConfirmDialog.tsx        # 삭제 확인 다이얼로그
│       ├── lib/
│       │   ├── schemas.ts                     # Zod 검증 스키마
│       │   ├── mock-remote-config.ts          # Mock 데이터
│       │   └── utils.ts                       # 타입별 직렬화/역직렬화
│       ├── hooks/
│       │   ├── useRemoteConfigList.ts         # 목록 조회 + 필터 상태 (React Query)
│       │   ├── useRemoteConfigDetail.ts       # 단건 조회
│       │   └── useChangeHistory.ts            # 이력 조회 (cursor pagination)
│       └── types/
│           └── remote-config.ts               # 타입 정의
```

### 9.2 상태 관리 전략

```typescript
// URL 쿼리 파라미터 동기화 (F-046)
// useSearchParams() + useRouter() 조합으로 필터 상태를 URL에 동기화한다

// 서버 상태 관리 (React Query)
const { data, isLoading, error } = useQuery({
  queryKey: ['remote-config', { q, target, valueType, tag, sort, page }],
  queryFn: () => fetchRemoteConfigList({ q, target, valueType, tag, sort, page }),
  staleTime: 30_000, // 30초
});

// 검색 디바운스 (F-046)
const [searchInput, setSearchInput] = useState('');
const debouncedSearch = useDebounce(searchInput, 300);
```

### 9.3 폼 유효성 검증 (Zod 스키마)

```typescript
// F-045 Zod 스키마 설계

const baseConfigSchema = z.object({
  key: z
    .string()
    .min(1, "키를 입력해 주세요")
    .max(256, "키는 최대 256자까지 입력할 수 있습니다")
    .regex(/^[a-z0-9._-]+$/, "키는 소문자 영문, 숫자, .(dot), _(underscore), -(hyphen)만 사용할 수 있습니다"),
  valueType: z.enum(["string", "number", "boolean", "json"]),
  description: z.string().max(500).optional(),
  target: z.enum(["client", "server", "both"]).default("both"),
  tags: z.array(z.string().max(50)).max(10).default([]),
});

// 타입별 value 검증 (discriminated union 활용)
const remoteConfigSchema = z.discriminatedUnion("valueType", [
  baseConfigSchema.extend({
    valueType: z.literal("string"),
    value: z.string().min(1, "값을 입력해 주세요").max(65535),
  }),
  baseConfigSchema.extend({
    valueType: z.literal("number"),
    value: z.string().refine(
      (v) => !isNaN(parseFloat(v)) && isFinite(parseFloat(v)),
      "숫자 값을 입력해 주세요"
    ),
  }),
  baseConfigSchema.extend({
    valueType: z.literal("boolean"),
    value: z.enum(["true", "false"], { message: "True 또는 False를 선택해 주세요" }),
  }),
  baseConfigSchema.extend({
    valueType: z.literal("json"),
    value: z.string().refine((v) => {
      try { JSON.parse(v); return true; } catch { return false; }
    }, "올바른 JSON 형식이 아닙니다"),
  }),
]);
```

### 9.4 JSON Textarea 실시간 검증

```typescript
// JsonTextarea.tsx — 실시간 JSON 유효성 검증 구현

function JsonTextarea({ value, onChange, onValidityChange }) {
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  const validateJson = useCallback(
    debounce((input: string) => {
      if (!input.trim()) {
        setJsonError(null);
        setIsValid(false);
        onValidityChange(false);
        return;
      }
      try {
        JSON.parse(input);
        setJsonError(null);
        setIsValid(true);
        onValidityChange(true);
      } catch (e) {
        // 오류 위치(line:col) 파싱
        const match = e.message.match(/position (\d+)/);
        setJsonError(`올바른 JSON 형식이 아닙니다: ${e.message}`);
        setIsValid(false);
        onValidityChange(false);
      }
    }, 300),
    []
  );

  const handleFormat = () => {
    try {
      const formatted = JSON.stringify(JSON.parse(value), null, 2);
      onChange(formatted);
    } catch {
      // 포맷 불가 — 현재 값 유지
    }
  };

  return (
    <div>
      <Textarea
        value={value}
        onChange={(e) => { onChange(e.target.value); validateJson(e.target.value); }}
        rows={6}
        className={jsonError ? 'border-red-500' : isValid ? 'border-green-500' : ''}
      />
      <div className="flex items-center justify-between mt-1">
        <span className={`text-sm ${jsonError ? 'text-red-500' : 'text-green-500'}`}>
          {jsonError || (isValid ? "유효한 JSON 형식입니다" : "")}
        </span>
        <Button variant="ghost" size="sm" onClick={handleFormat}>포맷</Button>
      </div>
    </div>
  );
}
```

---

## 10. Success Metrics Deep Dive

### 10.1 파라미터 변경 소요 시간

**현재 상태**: 개발팀에 Jira 티켓 → 코드 수정 → 리뷰 → 배포 → 적용까지 평균 수 시간~수일

**목표**: 관리 콘솔에서 설정 수정 시작부터 저장 완료까지 5분 이내

**측정 방법**:
- 클라이언트 사이드: 수정 폼 최초 입력 시각 ~ "설정이 수정되었습니다" 토스트 표시 시각
- 서버 사이드: 수정 API 요청 수신 시각 ~ 응답 완료 시각 (API 응답 시간 P95 목표: 500ms)

**이정표**:
- MVP 출시 직후: 평균 10분 이내 (학습 곡선 포함)
- 1개월 운영 후: 평균 5분 이내

### 10.2 설정 값 유형 오류율

**정의**: 타입 불일치 또는 잘못된 JSON이 저장된 건수 / 전체 저장 시도 수

**목표**: 0% (Zod 기반 클라이언트 검증 + 서버 사이드 검증으로 완전 차단)

**측정 방법**:
- 서버 400 오류(유효성 검증 실패) 발생 건수 모니터링
- 저장된 값에 대한 주기적 타입 무결성 검증 스크립트 실행

### 10.3 변경 이력 추적률

**현재 상태**: 0% (추적 인프라 없음)

**목표**: 100% (모든 CRUD 작업에 대해 이력 기록 보장)

**측정 방법**:
- DB에서 `remote_config_entries` 수정/삭제 건수 vs `remote_config_change_logs` 기록 건수 비교
- 이력 기록 실패 시 내부 모니터링 알림 발송

### 10.4 관리자 운영 자급률

**현재 상태**: 0% (전량 개발팀 배포 의존)

**목표**: 80% (개발팀 요청 없이 운영팀이 직접 처리한 설정 변경 비율)

**측정 방법**:
- Remote Config를 통한 설정 변경 건수 vs 코드 배포를 통한 파라미터 변경 건수 주기적 비교
- Jira에서 "파라미터 변경 요청" 티켓 감소 추이 추적

---

## 11. Dependencies & Constraints

### 11.1 선행 의존성

| 의존 대상 | 문서 ID | 의존 유형 | 설명 |
|-----------|---------|----------|------|
| RBAC 시스템 | PRD-GLO-005 | 하드 의존성 | Editor 역할 이상만 설정 CRUD 가능. Viewer는 조회만 가능. RBAC 기반 API 권한 검증 필수 |
| 관리자 인증 | PRD-GLO-005 | 하드 의존성 | 변경 이력의 changedBy 필드에 인증된 관리자 정보를 자동 기록하기 위해 인증 컨텍스트 필요 |
| Audit Log 시스템 | PRD-GLO-005 | 소프트 의존성 | Remote Config CRUD 이벤트를 시스템 감사 로그(Settings > Audit Log)에 기록. 감사 로그 시스템과 연동 |
| A/B 테스트 프레임워크 | PRD-GLO-003 | 소프트 의존성 | 향후 실험 변형별 Remote Config 값 오버라이드 기능 확장 시 연동 필요. MVP에는 불필요 |
| 플레이어 세그멘테이션 | PRD-GLO-001 | 소프트 의존성 | 향후 세그먼트별 조건부 딜리버리(Out of Scope) 확장 시 연동 필요. MVP에는 불필요 |

### 11.2 외부 의존성

| 시스템 | 설명 | 의존 기능 |
|--------|------|----------|
| 클라이언트 SDK | 게임 클라이언트가 `/api/remote-config` 또는 별도 SDK 엔드포인트를 통해 설정 조회 | F-044 전체 |
| 서버 SDK | 게임 서버가 target: "server" 또는 "both" 설정을 조회하여 서버 동작에 반영 | F-044 전체 |

### 11.3 제약사항

| 제약 | 설명 |
|------|------|
| key 변경 불가 | key는 클라이언트/서버 코드에 하드코딩된 상수값이므로 생성 후 변경을 허용하지 않는다 (D-044) |
| valueType 변경 불가 | valueType 변경 시 기존 클라이언트/서버 코드에서 타입 불일치 오류가 발생할 수 있으므로 허용하지 않는다 (D-045) |
| 승인 워크플로우 없음 (MVP) | MVP에서는 Editor 이상이면 즉시 저장/적용된다. 승인 워크플로우는 Out of Scope |
| 환경 분리 없음 (MVP) | dev / staging / prod 환경 분리는 Out of Scope. MVP에서는 단일 환경만 관리 |
| Mock 데이터 전용 | 현재 구현은 Mock API 기반. 실제 클라이언트 SDK 연동은 백엔드 구현 후 반영 |

### 11.4 가정사항

- 게임 클라이언트 SDK가 Remote Config API를 주기적으로 폴링하거나 웹소켓/SSE로 변경 알림을 수신하여 실시간 적용할 수 있다
- 게임 서버가 Remote Config API에 접근하여 target: "server" 또는 "both" 설정 값을 조회할 수 있다
- 관리자 인증 시스템(JWT 기반)에서 현재 로그인한 관리자 정보를 API 요청 컨텍스트에서 조회할 수 있다
- DB는 PostgreSQL(또는 동등한 RDBMS)을 사용하여 full-text 인덱스 및 UUID 지원이 가능하다

---

## 12. Release Plan

### Phase 1 (MVP)

| 기능 | ID | 핵심 요구사항 |
|------|-----|-------------|
| 설정 키-값 CRUD | F-044 | 생성/조회/수정/삭제, key 유효성 검증, 확인 다이얼로그 |
| 타입별 값 입력 및 유효성 검증 | F-045 | string/number/boolean/json 전용 UI, Zod 검증, JSON 실시간 검증 |
| 검색·필터·정렬·페이지네이션 | F-046 | 검색 debounce, Target/Type/Tag 필터, 정렬, Empty State |
| 변경 이력 추적 | F-047 | CRUD 자동 이력 기록, 필드 단위 추적, 이력 테이블 |

### Phase 2 (v1.1) — Out of Scope 재검토 항목

| 기능 | 설명 |
|------|------|
| 승인/발행 워크플로우 | Editor가 변경 초안을 작성하고 Operator 이상이 발행(publish)하는 2단계 워크플로우 추가 |
| 버전 스냅샷 및 롤백 | 특정 시점의 전체 설정 스냅샷 저장 및 원클릭 롤백 기능 |
| 환경 분리 | dev / staging / production 환경별 설정 독립 관리 |

### Phase 3 (v1.2) — 장기 로드맵

| 기능 | 설명 |
|------|------|
| 세그먼트별 조건부 딜리버리 | PRD-GLO-001 세그먼트 시스템과 연동하여 플레이어 세그먼트별 다른 설정 값 제공 |
| JSON Schema 유효성 검증 | json 타입 설정에 대해 JSON Schema를 정의하고 저장 시 Schema 기준 검증 |
| A/B 테스트 연동 | PRD-GLO-003 실험 프레임워크와 연동하여 실험 변형별 Remote Config 값 오버라이드 |
| 변경 예약 | 특정 일시에 설정 값이 자동으로 변경되도록 예약 기능 |

### Out of Scope (이번 버전에서 제외)

- 세그먼트별 조건부 딜리버리: 플레이어 세그먼트에 따라 다른 설정 값 제공
- 승인/발행 워크플로우: 설정 변경에 대한 Operator 승인 프로세스
- 버전 스냅샷 및 롤백: 전체 설정 상태의 특정 시점 스냅샷 저장 및 롤백
- 환경 분리 (dev/staging/prod): 환경별 독립적인 설정 관리
- JSON Schema 유효성 검증: json 타입 설정의 스키마 기반 상세 검증
- 변경 예약: 특정 일시에 설정 자동 적용
- 설정 import/export: CSV 또는 JSON 파일을 통한 일괄 등록/내보내기
- 태그 복수 AND/OR 필터링

---

## 13. Open Questions

| ID | 질문 | 담당 | 상태 |
|----|------|------|------|
| Q-031 | 클라이언트 SDK의 설정 조회 방식은 폴링(polling)인가 Push(SSE/웹소켓)인가? 실시간성 요구사항(변경 후 클라이언트 반영까지 최대 허용 지연 시간)은? | 클라이언트팀 / 백엔드팀 | open |
| Q-032 | 설정 항목 수의 현실적 규모 예측은? 초기 수십 개 수준인지, 수백~수천 개 수준인지에 따라 인덱스 전략과 full-text search 구현 방식이 달라진다 | 운영팀 | open |
| Q-033 | MVP에서 승인 워크플로우 없이 Editor가 즉시 반영 가능한 것이 운영 정책상 허용되는가? 결제/배율 관련 고위험 키에 대해서라도 승인 플로우가 필요한지 확인 필요 | 운영팀 리드 | open |
| Q-034 | 삭제된 설정 항목의 이력은 영구 보관하는 것으로 설계했으나, GDPR 또는 내부 데이터 보관 정책에 따른 최대 보관 기간 제약이 있는지 확인 필요 | 법무팀 | open |
| Q-035 | tag 필터링을 단일 선택으로 MVP에서 제공하는 것이 충분한가, 아니면 복수 태그 AND/OR 필터가 MVP부터 필요한가? 운영팀의 실제 사용 패턴 확인 필요 | 운영팀 | open |

---

## 14. Risks

| ID | 리스크 | 영향 | 확률 | 대응 방안 |
|----|--------|------|------|----------|
| R-008-01 | 잘못된 설정 값 입력으로 인한 게임 서비스 장애 | 매우 높음 | 중간 | 타입별 Zod 검증으로 입력 단계에서 차단. JSON 실시간 검증 제공. 변경 이력 추적으로 빠른 원인 파악 지원. 향후 Phase 2에서 승인 워크플로우와 롤백 기능으로 대응 강화 |
| R-008-02 | key/valueType 변경 불가 정책으로 인한 운영 불편 | 중간 | 중간 | 키 네이밍 가이드 및 예시를 생성 폼에 제공하여 초기 설계 오류를 최소화. 필요 시 기존 키 삭제 후 새 키 생성으로 우회 가능(이력은 별도 보관) |
| R-008-03 | 설정 항목 급증 시 목록 성능 저하 | 중간 | 낮음 | full-text 인덱스 적용. 10,000건 기준 성능 테스트 실시. 필요 시 ElasticSearch 도입 검토 |
| R-008-04 | 이력 기록 실패로 인한 변경 추적 누락 | 중간 | 낮음 | 이력 기록 실패가 원본 작업을 롤백하지 않는 best-effort 방식 채택. 이력 기록 실패 시 내부 모니터링 알림(Slack/PagerDuty) 즉시 발송 |
| R-008-05 | MVP 승인 워크플로우 부재로 인한 오운영 | 높음 | 중간 | 변경 이력을 통한 사후 추적 보장. Editor 이상 권한 관리 철저히. 고위험 설정 키는 Admin만 편집 가능하도록 RBAC 세분화(Q-033 해결 후 반영) |
| R-008-06 | 클라이언트/서버 SDK 연동 지연으로 인한 기능 미활용 | 중간 | 중간 | 관리 콘솔 Remote Config UI를 SDK 연동과 독립적으로 개발하여 먼저 출시. SDK 연동 가이드 문서 조기 작성 제공 |

---

## Appendix

### A. 용어 정의

| 용어 | 정의 |
|------|------|
| Remote Config | 클라이언트/서버 코드 재배포 없이 게임 동작 파라미터를 원격으로 변경하는 Key-Value 설정 시스템 |
| key | dot notation 형식의 설정 식별자. 예: `event.gold_bonus_multiplier`, `feature.guild_system_enabled` |
| dot notation | 계층 구조를 점(.)으로 구분하여 표현하는 키 명명 방식. 예: `{domain}.{feature}.{parameter}` |
| valueType | 설정 값의 데이터 타입. string / number / boolean / json 4가지 |
| value | 설정의 실제 값. 내부적으로 항상 string으로 직렬화하여 저장 |
| target | 설정이 적용되는 대상. client(게임 클라이언트), server(게임 서버), both(양쪽 모두) |
| 변경 이력 (Change Log) | 설정 항목에 대한 CRUD 작업의 필드 단위 기록. 시각, 변경자, 유형, 이전값, 새값 포함 |
| 기능 플래그 (Feature Flag) | boolean 타입 Remote Config를 활용하여 특정 기능의 활성화/비활성화를 제어하는 패턴 |
| best-effort 기록 | 이력 기록 실패가 원본 작업을 롤백하지 않는 방식. 원본 작업의 성공을 우선시 |
| Zod | TypeScript 우선 스키마 선언 및 유효성 검증 라이브러리. 폼 검증에 활용 |

### B. 관련 문서

| 문서 | 경로 |
|------|------|
| 기획 세션 | docs/02-planning/SES-GLO-009 |
| A/B 테스트 PRD | docs/03-prd/PRD-GLO-003 |
| 플레이어 세그멘테이션 PRD | docs/03-prd/PRD-GLO-001 |
| 리서치 | docs/01-research/RES-GLO-002 |
| 화면정의서 | docs/05-ux/ |
| 다이어그램 | docs/06-diagrams/ |

### C. 키 네이밍 컨벤션 가이드

운영팀과 개발팀이 일관된 키 네이밍을 사용할 수 있도록 아래 컨벤션을 권장한다.

```
패턴: {domain}.{feature}.{parameter}

domain 예시:
  - event       : 이벤트 관련
  - feature     : 기능 플래그
  - server      : 서버 설정
  - client      : 클라이언트 설정
  - payment     : 결제 관련
  - ui          : UI/UX 관련

예시:
  event.daily_bonus.multiplier        (일일 보너스 배율)
  event.login_reward.enabled          (로그인 보상 활성화)
  feature.guild_system_enabled        (길드 시스템 기능 플래그)
  server.max_players_per_room         (방당 최대 플레이어 수)
  client.maintenance_message          (점검 안내 메시지)
  payment.max_purchase_amount_krw     (원화 최대 결제 금액)
```

### D. 변경 이력 예시

```
설정: event.gold_bonus_multiplier
────────────────────────────────────────────────────────────────────────
changedAt           | changedBy    | action  | field       | prev  | new
────────────────────────────────────────────────────────────────────────
2026-03-30 15:42:01 | 최준혁       | updated | value       | 1.5   | 2.0
2026-03-30 15:42:01 | 최준혁       | updated | description | (null)| 이벤트 기간 골드 보너스 배율
2026-03-28 09:15:33 | 서지현       | updated | value       | 1.0   | 1.5
2026-03-25 11:00:00 | 서지현       | created | (null)      | (null)| (null)
```

### E. 변경 이력

| 버전 | 일자 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| v1.0 | 2026-03-30 | 초안 작성. F-044~F-047 전체 명세 완료 | prd |
