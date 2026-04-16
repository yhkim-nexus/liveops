---
id: "PRD-GLO-001"
title: "PRD: 플레이어 세그멘테이션"
project: "GLO"
version: "v1.1"
status: "draft"
created: "2026-03-10"
updated: "2026-03-26"
author: "prd"
reviewers: []
related_docs:
  - "RES-GLO-001"
  - "RES-GLO-002"
  - "RES-GLO-003"
  - "MTG-GLO-003"
tags:
  - "project:game-liveops"
  - "type:prd"
  - "topic:player-segmentation"
---

# PRD: 플레이어 세그멘테이션

> Game LiveOps Service(GLO)의 모든 LiveOps 기능(Live Events, Experiments, Feature Flags, Messages)이 공통으로 사용하는 플레이어 타겟팅 기반 시스템을 정의한다.

## 문서 정보

| 항목 | 내용 |
|------|------|
| 문서 ID | PRD-GLO-001 |
| 버전 | v1.0 |
| 상태 | draft |
| 작성일 | 2026-03-10 |
| 작성자 | prd |
| 관련 문서 | RES-GLO-001, RES-GLO-002, RES-GLO-003, MTG-GLO-003 |

---

## 1. Overview

### 1.1 제품 비전

인디~중소 게임사 기획자/운영자가 코드 작성 없이 플레이어 행동 데이터 기반으로 정밀한 세그먼트를 정의하고, 그 세그먼트를 모든 LiveOps 기능에서 일관되게 재사용할 수 있는 통합 타겟팅 플랫폼을 제공한다.

### 1.2 배경 및 목적

**배경**

- 경쟁사 7개 플랫폼(Satori, Unity, AccelByte, Hive, Balancy, GameAnalytics, Metaplay) 분석 결과, 플레이어 세그멘테이션은 7/7 플랫폼이 지원하는 유일한 필수 공통 기능이다. (D-005, D-007)
- 세그멘테이션 없이 이벤트/A/B 테스트/피처 플래그를 운영하면 전체 플레이어에게 동일한 경험을 제공하게 되어 LTV(Life Time Value) 개선 효과가 제한된다.
- 인디~중소 게임사 운영자는 개발자 의존 없이 세그먼트를 직접 정의하고 수정해야 하는 니즈가 있다. (RES-GLO-001, RES-GLO-002)

**목적**

- 이 PRD는 GLO 서비스의 **플레이어 세그멘테이션** 기능 범위를 정의한다.
- 속성(Properties) 수집/계산 체계, 오디언스(Audience) 정의 방식, 필터 표현식 DSL, 실시간 갱신 메커니즘, LiveOps 기능 연동 방식을 명세한다.
- MVP(Phase 1) 출시에 필요한 최소 기능과 수용 기준을 확정한다.

### 1.3 성공 지표 (Success Metrics)

| 지표 | 현재 | 목표 | 측정 방법 |
|------|------|------|----------|
| 오디언스 생성 소요 시간 | - | 폼 빌더 기준 5분 이내 | 신규 오디언스 생성 완료까지 소요 시간 측정 |
| 오디언스 갱신 지연 | - | 정기 갱신 10분 이내 / 즉시 갱신 30초 이내 | 갱신 요청 시각 ~ 멤버십 확정 시각 차이 |
| 초기 세그먼트 제공 수 | 0 | 8개 사전 정의 오디언스 | 서비스 가입 직후 활성 오디언스 수 |
| 타겟팅 연동률 | - | Live Events/Experiments/Feature Flags/Messages 4종 100% 연동 | 기능별 오디언스 선택 가능 여부 |
| 필터 표현식 오류율 | - | 미리보기 시 문법 오류 감지율 100% | 잘못된 표현식 저장 시도 대비 차단 비율 |

---

## 2. Target Users

### 2.1 사용자 페르소나

#### Primary Persona: 김지연 (게임 기획자/LiveOps 운영자)

| 항목 | 내용 |
|------|------|
| 소속 | 인디~중소 게임사 (팀 규모 5~30명) |
| 역할 | 게임 기획자 겸 LiveOps 운영 담당 |
| 기술 수준 | 비개발자. SQL 기초 이해 가능, 코드 작성 불가 |
| 주요 도구 | 스프레드시트, Notion, 간단한 BI 대시보드 |

**Goals**
- 플레이어 행동 패턴(신규/활성/이탈/결제)에 따라 다른 이벤트를 적용하고 싶다.
- 세그먼트 정의 후 이벤트/메시지에 반복 적용하고 싶다 (매번 조건 재입력 불필요).
- 세그먼트별 플레이어 수를 실시간에 가깝게 파악하고 싶다.

**Pain Points**
- 개발자에게 세그먼트 조건 수정을 요청할 때마다 배포 사이클을 기다려야 한다.
- 여러 이벤트에 동일 조건을 각각 입력하면서 불일치가 발생한다.
- 세그먼트가 현재 몇 명인지 알 수 없어 캠페인 규모를 예측하기 어렵다.

#### Secondary Persona: 박현수 (개발자/기술 운영자)

| 항목 | 내용 |
|------|------|
| 소속 | 중소 게임사 서버 개발자 |
| 역할 | LiveOps 백엔드 연동 및 고급 세그먼트 관리 |
| 기술 수준 | SQL, 프로그래밍 언어 숙련 |

**Goals**
- 복잡한 복합 조건(복수 Computed Properties 조합)을 직접 쿼리로 입력하고 싶다.
- 외부 BI 시스템에서 산출한 세그먼트를 GLO로 임포트하고 싶다.

**Pain Points**
- 폼 빌더가 표현하지 못하는 복잡한 조건은 우회 방법이 없다.

### 2.2 사용자 시나리오

#### SC-001: 신규 이벤트에 기존 오디언스 타겟팅 적용

> 김지연은 신규 플레이어 온보딩 이벤트를 만들 때, 이미 정의된 "신규 플레이어(가입 3일 이내)" 오디언스를 선택해 바로 적용한다. 조건을 재입력하지 않고 10분 이내에 이벤트 타겟팅을 완료한다.

**Steps**
1. Live Events 메뉴에서 새 이벤트 생성
2. 타겟팅 단계에서 오디언스 목록 조회
3. "신규 플레이어" 오디언스 선택
4. 이벤트 저장 및 활성화

#### SC-002: 이탈 결제자 복귀 캠페인 오디언스 신규 생성

> 김지연은 "결제 경험 있으며 최근 30일 미접속" 조건의 오디언스가 없어 폼 빌더로 직접 생성한다. 미리보기로 현재 해당 플레이어 수를 확인한 뒤 캠페인에 연결한다.

**Steps**
1. 오디언스 관리 페이지 진입
2. "새 오디언스 만들기" 클릭
3. 폼 빌더에서 조건 설정: `purchaseCompletedCount > 0` AND `비접속 기간 >= 30일`
4. 미리보기로 현재 멤버 수 확인 (예: 1,247명)
5. 오디언스명 입력 후 저장
6. Messages 캠페인에서 해당 오디언스 선택

#### SC-003: 개발자가 쿼리 모드로 복잡한 오디언스 생성

> 박현수는 "국내 iOS, 최근 7일 접속, 세션 100회 이상, 결제 미경험" 조건을 쿼리 모드로 직접 입력해 정밀 세그먼트를 생성한다.

**Steps**
1. 오디언스 신규 생성 → 쿼리 모드 전환
2. 필터 표현식 직접 입력
3. 유효성 검사 통과 확인
4. 미리보기 실행 후 저장

---

## 3. Features & Requirements

### 3.1 기능 목록

| ID | 기능명 | 설명 | 우선순위 | 범위 |
|----|--------|------|----------|------|
| F-001 | 플레이어 속성 관리 | Default/Computed/Custom 3계층 속성 정의 및 관리 | P0 | MVP |
| F-002 | 오디언스 생성 및 관리 | 필터 표현식 기반 플레이어 그룹 정의, 수정, 삭제 | P0 | MVP |
| F-003 | 필터 표현식 시스템 | 폼 빌더 UI + 쿼리 직접 입력 모드 | P0 | MVP |
| F-004 | 오디언스 실시간 갱신 및 멤버십 관리 | 주기적/즉시 갱신, Sticky 멤버십 | P0 | MVP |
| F-005 | 오디언스 대시보드 및 분석 | 멤버 수 추이, 오버랩 분석 | P1 | MVP |
| F-006 | 오디언스 타겟팅 연동 | Live Events, Experiments, Feature Flags, Messages 4종 연동 | P0 | MVP |
| F-007 | 이벤트 택소노미 관리 | 추적 이벤트 정의, Computed Properties 계산 규칙 설정 | P0 | MVP |
| F-008 | 오디언스 임포트/익스포트 | CSV/API 기반 외부 세그먼트 임포트 (Managed Audience) | P2 | Phase 2 |

**우선순위 기준**
- **P0 (필수)**: MVP에 반드시 포함. 없으면 서비스 핵심 가치 미달.
- **P1 (중요)**: 높은 운영 가치. MVP에 포함하되 일정 압박 시 간소화 가능.
- **P2 (선택)**: Phase 2 이후 개발. MVP 출시에 영향 없음.

---

### 3.2 기능 상세: F-001 플레이어 속성 관리

#### 개요

플레이어 데이터를 Default(자동수집), Computed(이벤트 기반 자동계산), Custom(사용자 정의) 3계층으로 분류해 관리한다. 속성은 오디언스 필터 표현식의 기본 데이터 소스가 된다.

#### 사용자 스토리

**US-001**
```
As a 게임 기획자(관리자),
I want to 플레이어의 가입일, 접속 플랫폼, 국가 정보가 자동으로 수집되기를,
So that 별도 설정 없이 기본 세그먼트(국가별, 플랫폼별)를 바로 활용할 수 있다.
```

**US-002**
```
As a 게임 기획자(관리자),
I want to 결제 횟수, 마지막 접속일 같은 집계 지표가 자동으로 계산되기를,
So that 이탈/결제 여부 조건을 별도 개발 없이 오디언스에 적용할 수 있다.
```

**US-003**
```
As a 게임 기획자(관리자),
I want to 게임 내 레벨, 길드 소속, VIP 등급 등 서비스 고유 속성을 직접 정의하기를,
So that 게임 특성에 맞는 맞춤 세그먼트를 만들 수 있다.
```

#### 상세 요구사항

| ID | 요구사항 | 필수 |
|----|----------|------|
| REQ-001-01 | Default Properties는 SDK 초기화 시 자동 수집되어야 한다: `countryCode`, `platform`, `createTime`, `updateTime` | Y |
| REQ-001-02 | `countryCode`는 ISO 3166-1 alpha-2 코드(2자리 대문자)로 저장해야 한다. (예: `KR`, `US`, `JP`) | Y |
| REQ-001-03 | `platform`은 `ios`, `android`, `pc`, `console`, `web` 중 하나의 값으로 저장해야 한다. | Y |
| REQ-001-04 | Computed Properties는 이벤트 택소노미에 정의된 이벤트 발생 시 자동 계산되어야 한다. | Y |
| REQ-001-05 | Computed Properties 4종을 지원해야 한다: `Count`(이벤트 발생 횟수), `SeenLast`(마지막 이벤트 타임스탬프), `ValueSum`(이벤트 속성값 합계), `ValueHigh`/`ValueLow`(이벤트 속성값 최대/최소) | Y |
| REQ-001-06 | Custom Properties는 `string`과 `numeric`(부동소수점) 2가지 타입을 지원해야 한다. | Y |
| REQ-001-07 | Custom Properties는 프로젝트(게임)당 최대 100개까지 생성 가능해야 한다. | Y |
| REQ-001-08 | Custom Properties 키 이름은 영문 소문자, 숫자, 언더스코어(`_`)만 허용하며, 최대 64자다. | Y |
| REQ-001-09 | Custom Properties 값은 SDK 또는 REST API를 통해 업데이트 가능해야 한다. | Y |
| REQ-001-10 | 관리자는 Custom Properties 목록을 조회, 생성, 수정(설명 변경), 삭제할 수 있어야 한다. | Y |
| REQ-001-11 | 오디언스에서 참조 중인 Custom Property는 삭제가 불가해야 하며, 삭제 시도 시 참조 오디언스 목록을 안내해야 한다. | Y |

#### 수용 조건 (Acceptance Criteria)

**AC-001-01**
```gherkin
Scenario: SDK 초기화 시 Default Properties 자동 수집
  Given 플레이어가 GLO SDK를 연동한 게임을 최초 실행한다
  When SDK 초기화가 완료된다
  Then 해당 플레이어의 countryCode, platform, createTime이 GLO에 저장된다
  And countryCode는 ISO 3166-1 alpha-2 형식(예: "KR")이어야 한다
  And platform은 허용된 5가지 값 중 하나여야 한다
```

**AC-001-02**
```gherkin
Scenario: 이벤트 발생 시 Computed Properties 자동 갱신
  Given 이벤트 택소노미에 "purchase_completed" 이벤트가 등록되어 있다
  And 해당 이벤트에 Count 타입 Computed Property "purchaseCompletedCount"가 설정되어 있다
  When 플레이어가 "purchase_completed" 이벤트를 발생시킨다
  Then "purchaseCompletedCount" 값이 이전 값 + 1로 갱신된다
  And 갱신은 이벤트 수신 후 10분 이내에 반영된다
```

**AC-001-03**
```gherkin
Scenario: Custom Property 생성 성공
  Given 관리자가 Custom Properties 관리 페이지에 있다
  When 관리자가 키: "player_level", 타입: "numeric", 설명: "현재 플레이어 레벨"을 입력하고 저장한다
  Then "player_level" Custom Property가 목록에 추가된다
  And 이후 오디언스 필터 표현식에서 PropertiesCustom("player_level", 0) 형태로 참조 가능하다
```

**AC-001-04**
```gherkin
Scenario: 오디언스 참조 중인 Custom Property 삭제 시도
  Given "player_level" Custom Property가 "하드코어" 오디언스에서 참조 중이다
  When 관리자가 "player_level" Custom Property를 삭제하려 한다
  Then 삭제가 차단된다
  And "다음 오디언스에서 참조 중입니다: 하드코어" 안내 메시지가 표시된다
```

#### 비즈니스 규칙

| ID | 규칙 | 예시 |
|----|------|------|
| BR-001-01 | Default Properties는 관리자가 수정하거나 삭제할 수 없다. | countryCode 수동 변경 불가 |
| BR-001-02 | Computed Properties는 이벤트 택소노미 설정 이후 발생하는 이벤트부터 계산된다. 과거 이벤트 소급 계산은 지원하지 않는다. | 택소노미 설정 이전 결제 이벤트는 카운트되지 않음 |
| BR-001-03 | Custom Property의 키 이름은 프로젝트 내에서 고유해야 한다. | 동일 키 중복 생성 불가 |
| BR-001-04 | 삭제된 Custom Property에 대한 기존 SDK 업데이트 요청은 무시(silently ignored)한다. | 삭제된 키 업데이트 시 400 에러 반환 |

#### 데이터 요구사항

| 필드 | 타입 | 필수 | 설명 | 유효성 |
|------|------|------|------|--------|
| key | String | Y | Custom Property 식별자 | 영문 소문자/숫자/언더스코어, 1~64자 |
| type | Enum | Y | 값 타입 | `string` 또는 `numeric` |
| description | String | N | 관리자용 설명 | 최대 255자 |
| default_value | String/Number | Y | 해당 속성이 없는 플레이어의 기본값 | type에 따라 string: "", numeric: 0 |
| created_at | Timestamp | Y | 생성 시각 | ISO 8601 |
| updated_at | Timestamp | Y | 마지막 수정 시각 | ISO 8601 |

#### 예외 처리

| 상황 | 처리 | 메시지 | 코드 |
|------|------|--------|------|
| Custom Property 키 중복 | 저장 차단 | "이미 사용 중인 속성 키입니다." | ERR-001-01 |
| Custom Property 100개 초과 | 저장 차단 | "Custom Property는 최대 100개까지 생성할 수 있습니다." | ERR-001-02 |
| 키 이름 형식 위반 | 저장 차단 | "키 이름은 영문 소문자, 숫자, 언더스코어만 사용할 수 있습니다." | ERR-001-03 |
| 삭제된 키 SDK 업데이트 | 요청 무시 | (클라이언트에 오류 응답 없음) | - |

#### UI/UX 요구사항
- Default / Computed / Custom 3개 탭으로 속성 유형을 구분하여 표시한다.
- Custom Property 목록에는 키, 타입, 설명, 생성일, 참조 오디언스 수를 표시한다.
- 참조 오디언스 수를 클릭하면 해당 오디언스 목록으로 이동한다.
- 관련 화면: SCR-004 (속성 관리 화면 — 화면정의서 참조)

---

### 3.3 기능 상세: F-002 오디언스 생성 및 관리

#### 개요

필터 표현식으로 정의된 플레이어 그룹(오디언스)을 생성, 조회, 수정, 삭제, 복제한다. 오디언스는 중첩(다른 오디언스를 조건으로 참조)이 가능하며, 생성된 오디언스는 모든 LiveOps 기능에서 공통 타겟팅 단위로 재사용된다.

#### 사용자 스토리

**US-004**
```
As a 게임 기획자(관리자),
I want to 오디언스 이름, 설명, 필터 조건을 설정해 새 오디언스를 만들기를,
So that 이후 이벤트/메시지에서 해당 오디언스를 바로 선택할 수 있다.
```

**US-005**
```
As a 게임 기획자(관리자),
I want to 기존 오디언스를 복제하기를,
So that 유사한 조건의 오디언스를 빠르게 변형해 만들 수 있다.
```

**US-006**
```
As a 게임 기획자(관리자),
I want to 서비스 가입 직후 기본 오디언스 8개가 준비되어 있기를,
So that 별도 설정 없이 즉시 이벤트 타겟팅을 시작할 수 있다.
```

#### 상세 요구사항

| ID | 요구사항 | 필수 |
|----|----------|------|
| REQ-002-01 | 오디언스는 이름(필수), 설명(선택), 필터 표현식(필수)으로 구성된다. | Y |
| REQ-002-02 | 오디언스 이름은 프로젝트 내에서 고유해야 한다. | Y |
| REQ-002-03 | 오디언스 수는 프로젝트당 제한 없이 생성 가능하다. | Y |
| REQ-002-04 | 오디언스는 다른 오디언스를 필터 조건으로 참조하는 중첩 구조를 지원해야 한다. 단, 순환 참조는 저장 시 차단된다. | Y |
| REQ-002-05 | 오디언스 삭제 시 LiveOps 기능(이벤트, Experiments, Feature Flags, Messages)에서 참조 중인 경우 삭제가 차단된다. | Y |
| REQ-002-06 | 기존 오디언스를 복제해 새 오디언스로 저장하는 기능을 제공한다. 복제 시 이름에 "(복사본)" 접미사가 자동 추가된다. | Y |
| REQ-002-07 | 프로젝트(게임) 최초 생성 시 사전 정의된 오디언스 8개가 자동으로 생성된다. | Y |
| REQ-002-08 | 사전 정의 오디언스 8개는 삭제 및 필터 표현식 수정이 가능해야 한다. | Y |
| REQ-002-09 | 오디언스 목록은 이름, 멤버 수, 마지막 갱신 시각, 연동 기능 수를 표시해야 한다. | Y |
| REQ-002-10 | 오디언스 목록은 이름(가나다/ABC순), 멤버 수, 마지막 갱신 시각 기준으로 정렬 가능해야 한다. | Y |

#### 사전 정의 오디언스 8개

| 오디언스명 | 필터 표현식 | 활용 |
|-----------|------------|------|
| 신규 플레이어 | `Now() - Properties("createTime", 0) <= Duration("3d")` | 온보딩 이벤트 |
| 활성 플레이어 | `Now() - PropertiesComputed("sessionSeenLast", 0) <= Duration("7d")` | 정기 이벤트 |
| 휴면 플레이어 | `Now() - PropertiesComputed("sessionSeenLast", 0) > Duration("7d") and Now() - PropertiesComputed("sessionSeenLast", 0) <= Duration("30d")` | 복귀 유도 캠페인 |
| 이탈 플레이어 | `Now() - PropertiesComputed("sessionSeenLast", 0) > Duration("30d")` | 재활성화 메시지 |
| 결제 경험자 | `PropertiesComputed("purchaseCompletedCount", 0) > 0` | 구매 촉진 이벤트 |
| 이탈 결제자 | `PropertiesComputed("purchaseCompletedCount", 0) > 0 and Now() - PropertiesComputed("purchaseCompletedSeenLast", 0) >= Duration("30d")` | VIP 복귀 오퍼 |
| 하드코어 플레이어 | `PropertiesComputed("sessionCount", 0) >= 500` | 고급 콘텐츠 조기 접근 |
| 국내 플레이어 | `Properties("countryCode", "") == "KR"` | 지역 특화 이벤트 |

#### 수용 조건 (Acceptance Criteria)

**AC-002-01**
```gherkin
Scenario: 오디언스 신규 생성 성공
  Given 관리자가 오디언스 목록 페이지에 있다
  When 관리자가 이름 "이탈 결제자 VIP", 필터 표현식을 입력하고 저장한다
  Then 오디언스가 목록에 추가된다
  And 오디언스의 초기 상태는 "갱신 대기"이며, 10분 이내에 첫 멤버 수가 계산된다
```

**AC-002-02**
```gherkin
Scenario: 중첩 오디언스 생성
  Given "활성 플레이어" 오디언스가 이미 존재한다
  When 관리자가 "활성 결제자" 오디언스를 "활성 플레이어 AND purchaseCompletedCount > 0" 조건으로 생성한다
  Then 오디언스가 저장된다
  And "활성 결제자"의 멤버는 "활성 플레이어" 오디언스 멤버의 부분집합이어야 한다
```

**AC-002-03**
```gherkin
Scenario: 순환 참조 오디언스 저장 차단
  Given 오디언스 A가 오디언스 B를 참조하고 있다
  When 관리자가 오디언스 B의 조건에 오디언스 A를 추가하려 한다
  Then 저장이 차단된다
  And "순환 참조가 감지되었습니다. 오디언스 간 순환 참조는 허용되지 않습니다." 오류 메시지가 표시된다
```

**AC-002-04**
```gherkin
Scenario: LiveOps 기능 참조 중인 오디언스 삭제 차단
  Given "신규 플레이어" 오디언스가 Live Event "온보딩 퀘스트"에서 사용 중이다
  When 관리자가 "신규 플레이어" 오디언스를 삭제하려 한다
  Then 삭제가 차단된다
  And "다음 기능에서 참조 중입니다: Live Event - 온보딩 퀘스트" 안내 메시지가 표시된다
```

**AC-002-05**
```gherkin
Scenario: 프로젝트 생성 시 사전 정의 오디언스 자동 생성
  Given 관리자가 GLO에서 새 프로젝트(게임)를 생성한다
  When 프로젝트 생성이 완료된다
  Then 오디언스 목록에 사전 정의된 8개 오디언스가 생성되어 있어야 한다
  And 각 오디언스는 명세된 필터 표현식이 적용된 상태여야 한다
```

**AC-002-06**
```gherkin
Scenario: 오디언스 복제
  Given 관리자가 "이탈 결제자" 오디언스의 상세 페이지에 있다
  When 관리자가 "복제" 버튼을 클릭한다
  Then "이탈 결제자 (복사본)" 이름의 새 오디언스가 생성된다
  And 원본과 동일한 필터 표현식이 복사된다
  And 새 오디언스는 독립적으로 수정 가능하다
```

#### 비즈니스 규칙

| ID | 규칙 | 예시 |
|----|------|------|
| BR-002-01 | 오디언스 이름은 프로젝트 내 고유해야 한다. | 동명 오디언스 중복 생성 불가 |
| BR-002-02 | 오디언스 중첩 깊이는 최대 5단계까지 허용한다. | A→B→C→D→E→F 6단계 차단 |
| BR-002-03 | 사전 정의 오디언스는 삭제 시 일반 오디언스와 동일한 참조 체크를 거친다. | 연동 기능 있으면 삭제 차단 |

#### 예외 처리

| 상황 | 처리 | 메시지 | 코드 |
|------|------|--------|------|
| 오디언스 이름 중복 | 저장 차단 | "이미 사용 중인 오디언스 이름입니다." | ERR-002-01 |
| 순환 참조 감지 | 저장 차단 | "순환 참조가 감지되었습니다." | ERR-002-02 |
| 참조 중인 오디언스 삭제 | 삭제 차단 | "참조 중인 기능 목록: {목록}" | ERR-002-03 |
| 중첩 깊이 초과 | 저장 차단 | "오디언스 중첩은 최대 5단계까지 가능합니다." | ERR-002-04 |

#### UI/UX 요구사항
- 오디언스 목록에는 사전 정의 오디언스임을 나타내는 뱃지를 표시한다.
- 오디언스 상세에서 해당 오디언스를 참조 중인 LiveOps 기능 목록을 표시한다.
- 관련 화면: SCR-001 (오디언스 목록), SCR-002 (오디언스 생성/편집 — 화면정의서 참조)

---

### 3.4 기능 상세: F-003 필터 표현식 시스템

#### 개요

오디언스 조건 정의를 위한 필터 표현식 DSL(Domain-Specific Language)을 제공한다. 비개발자를 위한 **폼 빌더 UI**를 기본 인터페이스로 제공하고, 복잡한 조건을 위한 **쿼리 직접 입력 모드**를 고급 옵션으로 병행 제공한다.

#### 사용자 스토리

**US-007**
```
As a 비개발자 게임 기획자(관리자),
I want to 드롭다운과 입력 필드로 필터 조건을 설정하기를,
So that 표현식 문법을 몰라도 원하는 세그먼트를 만들 수 있다.
```

**US-008**
```
As a 개발자/기술 운영자(관리자),
I want to 필터 표현식을 쿼리로 직접 입력하기를,
So that 폼 빌더로 표현할 수 없는 복잡한 복합 조건을 자유롭게 정의할 수 있다.
```

**US-009**
```
As a 게임 기획자(관리자),
I want to 필터 조건 입력 후 현재 해당 플레이어 수를 미리보기로 확인하기를,
So that 저장 전에 세그먼트 크기를 파악하고 캠페인 규모를 예측할 수 있다.
```

#### 상세 요구사항

**폼 빌더**

| ID | 요구사항 | 필수 |
|----|----------|------|
| REQ-003-01 | 폼 빌더는 속성 선택 → 연산자 선택 → 값 입력의 3단계 UI로 조건 1개를 구성한다. | Y |
| REQ-003-02 | 조건은 AND/OR 논리 연산자로 연결해 복합 조건을 구성할 수 있다. | Y |
| REQ-003-03 | 폼 빌더에서 조건 추가, 삭제, 순서 변경이 가능해야 한다. | Y |
| REQ-003-04 | 속성 선택 드롭다운은 Default / Computed / Custom 3가지 그룹으로 분류해 표시한다. | Y |
| REQ-003-05 | 시간 기반 조건(예: 마지막 접속 후 경과 시간)은 일(d), 시간(h), 분(m) 단위 입력 UI를 제공한다. | Y |
| REQ-003-06 | 폼 빌더에서 작성된 조건은 쿼리 표현식으로 실시간 변환되어 하단에 미리보기로 표시된다. | Y |

**쿼리 모드**

| ID | 요구사항 | 필수 |
|----|----------|------|
| REQ-003-07 | 쿼리 모드는 폼 빌더와 토글 전환이 가능해야 한다. | Y |
| REQ-003-08 | 쿼리 모드에서 DSL 지원 함수 목록은 아래 표에 명세한다. | Y |
| REQ-003-09 | 쿼리 모드에서 입력한 표현식은 저장 전 유효성 검사를 통과해야 한다. | Y |
| REQ-003-10 | 폼 빌더 → 쿼리 모드 전환 시 현재 조건이 쿼리로 변환되어 표시된다. 단, 쿼리 모드 → 폼 빌더 역변환은 지원하지 않는다. (복잡한 표현식의 폼 빌더 표현 불가) | Y |
| REQ-003-11 | 쿼리 모드에서 속성명 자동완성(Autocomplete) 기능을 제공한다. | Y |

**미리보기 (Preview)**

| ID | 요구사항 | 필수 |
|----|----------|------|
| REQ-003-12 | "미리보기" 버튼 클릭 시 현재 조건을 만족하는 플레이어 수를 30초 이내에 반환한다. | Y |
| REQ-003-13 | 미리보기 결과는 총 플레이어 수 대비 해당 오디언스 비율(%)도 함께 표시한다. | Y |
| REQ-003-14 | 미리보기 실행 중에는 로딩 인디케이터를 표시한다. | Y |

**DSL 지원 함수 명세**

| 분류 | 함수/연산자 | 설명 | 예시 |
|------|------------|------|------|
| 시간 | `Now()` | 현재 타임스탬프 반환 | `Now()` |
| 시간 | `Duration("Nd")` | N일을 나타내는 기간 반환 | `Duration("30d")`, `Duration("2h")` |
| 속성 조회 | `Properties("key", default)` | Default Property 값 조회 | `Properties("countryCode", "")` |
| 속성 조회 | `PropertiesComputed("key", default)` | Computed Property 값 조회 | `PropertiesComputed("purchaseCompletedCount", 0)` |
| 속성 조회 | `PropertiesCustom("key", default)` | Custom Property 값 조회 | `PropertiesCustom("player_level", 0)` |
| 버전 | `SemverMatch(version, range)` | 시맨틱 버전 범위 매칭 | `SemverMatch(appVersion, ">=2.0.0")` |
| 산술 | `+`, `-`, `*`, `/`, `%` | 사칙연산 및 나머지 | `Now() - createTime` |
| 비교 | `==`, `!=`, `<`, `<=`, `>`, `>=` | 비교 연산 | `countryCode == "KR"` |
| 논리 | `and`, `or`, `not` | 논리 연산 | `A and B`, `not C` |
| 문자열 | `matches`, `contains`, `startsWith`, `endsWith` | 문자열 패턴 매칭 | `countryCode matches "K.*"` |

#### 수용 조건 (Acceptance Criteria)

**AC-003-01**
```gherkin
Scenario: 폼 빌더로 복합 조건 오디언스 생성
  Given 관리자가 오디언스 생성 페이지의 폼 빌더 모드에 있다
  When 관리자가 조건1 "countryCode == KR", 논리연산자 "AND", 조건2 "platform == ios"를 설정한다
  Then 하단에 쿼리 미리보기로 `Properties("countryCode", "") == "KR" and Properties("platform", "") == "ios"` 가 표시된다
```

**AC-003-02**
```gherkin
Scenario: 쿼리 모드 유효성 검사 실패
  Given 관리자가 쿼리 모드에서 필터 표현식을 입력하고 있다
  When 관리자가 문법 오류가 있는 표현식 "Now( - createTime <= Duration(30d)"을 입력하고 저장을 시도한다
  Then 저장이 차단된다
  And 오류 위치와 함께 "표현식 문법 오류: 닫는 괄호가 누락되었습니다." 메시지가 표시된다
```

**AC-003-03**
```gherkin
Scenario: 미리보기 실행
  Given 관리자가 필터 조건을 설정한 상태다
  When 관리자가 "미리보기" 버튼을 클릭한다
  Then 30초 이내에 조건을 만족하는 플레이어 수가 표시된다
  And 전체 플레이어 대비 비율(%)이 함께 표시된다
  And 로딩 중에는 로딩 인디케이터가 표시된다
```

**AC-003-04**
```gherkin
Scenario: 폼 빌더에서 쿼리 모드로 전환
  Given 관리자가 폼 빌더에서 "countryCode == KR" 조건을 설정해 놓았다
  When 관리자가 "쿼리 모드로 전환" 버튼을 클릭한다
  Then 현재 조건이 쿼리 표현식으로 변환되어 쿼리 에디터에 표시된다
  And 쿼리 모드에서 추가 편집이 가능하다
```

**AC-003-05**
```gherkin
Scenario: 쿼리 모드에서 속성 자동완성
  Given 관리자가 쿼리 모드 에디터에 "PropertiesComputed(" 를 입력했다
  When 자동완성이 트리거된다
  Then 등록된 Computed Property 목록이 드롭다운으로 표시된다
  And 관리자가 항목을 선택하면 키 이름이 자동으로 입력된다
```

#### 비즈니스 규칙

| ID | 규칙 | 예시 |
|----|------|------|
| BR-003-01 | 유효성 검사를 통과하지 못한 필터 표현식은 저장할 수 없다. | 문법 오류 표현식 저장 불가 |
| BR-003-02 | 쿼리 모드에서 폼 빌더로의 역변환은 지원하지 않는다. 전환 시 "폼 빌더 모드로 돌아가면 현재 쿼리가 초기화됩니다." 경고를 표시한다. | 복잡한 쿼리 → 폼 빌더 전환 시 초기화 경고 |
| BR-003-03 | `Duration()` 함수는 초(s), 분(m), 시간(h), 일(d) 단위를 지원한다. 월(M) 단위는 지원하지 않는다. | Duration("30d") 허용, Duration("1M") 불허 |

#### UI/UX 요구사항
- 폼 빌더와 쿼리 모드는 동일 화면 내 탭 또는 토글 버튼으로 전환한다.
- 쿼리 에디터는 모노스페이스 폰트, 문법 하이라이팅, 줄번호를 지원한다.
- 관련 화면: SCR-002 (오디언스 생성/편집 화면 — 화면정의서 참조)

---

### 3.5 기능 상세: F-004 오디언스 실시간 갱신 및 멤버십 관리

#### 개요

오디언스의 멤버 목록을 주기적 또는 즉시 갱신한다. 플레이어의 속성 변화에 따라 오디언스 멤버십(소속 여부)이 자동으로 업데이트된다. LiveOps 기능(특히 진행 중 이벤트)에서 요구하는 **Sticky 멤버십** 옵션을 지원한다.

#### 사용자 스토리

**US-010**
```
As a 게임 기획자(관리자),
I want to 오디언스 멤버가 10분 이내에 자동 갱신되기를,
So that 캠페인 타겟이 항상 최신 플레이어 상태를 반영한다.
```

**US-011**
```
As a 게임 기획자(관리자),
I want to 이벤트 진행 중 플레이어가 조건을 이탈해도 참여를 유지(Sticky)하기를,
So that "신규 플레이어" 이벤트에 참여한 플레이어가 3일 후 조건을 벗어나도 이벤트를 완료할 수 있다.
```

#### 상세 요구사항

| ID | 요구사항 | 필수 |
|----|----------|------|
| REQ-004-01 | 오디언스 멤버십은 10분 주기로 자동 갱신된다. | Y |
| REQ-004-02 | 관리자는 특정 오디언스에 대해 즉시 갱신(Manual Refresh)을 요청할 수 있다. 즉시 갱신은 30초 이내에 완료된다. | Y |
| REQ-004-03 | 즉시 갱신은 분당 최대 10회로 제한한다(Rate Limit). | Y |
| REQ-004-04 | 오디언스 상세에는 마지막 갱신 시각과 다음 예정 갱신 시각을 표시한다. | Y |
| REQ-004-05 | Sticky 멤버십 옵션 활성화 시: 한 번 오디언스에 소속된 플레이어는 조건을 이탈해도 해당 오디언스 멤버십이 유지된다. | Y |
| REQ-004-06 | Sticky 멤버십은 오디언스 단위가 아닌, 각 LiveOps 기능(이벤트, Experiments) 연동 설정에서 개별 활성화한다. | Y |
| REQ-004-07 | 오디언스 멤버십 갱신 이력(갱신 시각, 이전/이후 멤버 수)은 최근 30일치를 조회할 수 있어야 한다. | Y |

#### 수용 조건 (Acceptance Criteria)

**AC-004-01**
```gherkin
Scenario: 10분 주기 자동 갱신
  Given "신규 플레이어(가입 3일 이내)" 오디언스가 존재한다
  And 4일 전 가입한 플레이어 P1이 현재 해당 오디언스 멤버다
  When 다음 자동 갱신 사이클이 실행된다(10분 이내)
  Then P1은 해당 오디언스에서 제거된다
  And 오디언스 멤버 수가 1 감소한다
```

**AC-004-02**
```gherkin
Scenario: 즉시 갱신 요청
  Given 관리자가 "이탈 결제자" 오디언스 상세 페이지에 있다
  When 관리자가 "즉시 갱신" 버튼을 클릭한다
  Then 30초 이내에 갱신이 완료된다
  And 갱신 완료 후 최신 멤버 수와 갱신 시각이 업데이트된다
```

**AC-004-03**
```gherkin
Scenario: 즉시 갱신 Rate Limit
  Given 관리자가 1분 이내에 즉시 갱신을 10회 요청했다
  When 관리자가 11번째 즉시 갱신을 요청한다
  Then 요청이 차단된다
  And "즉시 갱신은 분당 최대 10회 가능합니다. {N}초 후에 다시 시도해주세요." 메시지가 표시된다
```

**AC-004-04**
```gherkin
Scenario: Sticky 멤버십 동작
  Given Live Event "신규 환영 이벤트"가 "신규 플레이어" 오디언스를 대상으로 Sticky 멤버십 활성화 상태로 실행 중이다
  And 플레이어 P1이 2일 전 가입해 해당 이벤트에 참여 중이다
  When P1의 가입 후 4일이 경과해 "신규 플레이어" 오디언스 조건을 벗어난다
  Then P1은 "신규 플레이어" 오디언스에서 제거된다
  But P1은 "신규 환영 이벤트" 참여 자격을 유지한다
```

**AC-004-05**
```gherkin
Scenario: 멤버십 갱신 이력 조회
  Given 관리자가 오디언스 상세 페이지의 "갱신 이력" 탭에 있다
  When 관리자가 기간 필터로 "최근 7일"을 선택한다
  Then 7일 이내의 갱신 이력(갱신 시각, 이전 멤버 수, 이후 멤버 수)이 목록으로 표시된다
```

#### 비즈니스 규칙

| ID | 규칙 | 예시 |
|----|------|------|
| BR-004-01 | Sticky 멤버십은 해당 LiveOps 기능이 종료(비활성화)되면 자동으로 해제된다. | 이벤트 종료 후 Sticky 유지 안 됨 |
| BR-004-02 | 즉시 갱신 Rate Limit은 프로젝트(게임) 단위가 아닌 오디언스 단위로 적용한다. | 오디언스 A와 B는 각각 분당 10회 허용 |
| BR-004-03 | 갱신 이력은 최대 30일치만 보관한다. 30일 초과 이력은 자동 삭제된다. | 31일 전 갱신 이력 조회 불가 |

#### 예외 처리

| 상황 | 처리 | 메시지 | 코드 |
|------|------|--------|------|
| 즉시 갱신 Rate Limit 초과 | 요청 차단 | "즉시 갱신은 분당 최대 10회 가능합니다." | ERR-004-01 |
| 갱신 처리 30초 초과 | 타임아웃 처리 후 다음 주기 갱신으로 대기 | "갱신에 실패했습니다. 10분 후 자동 갱신 시 재시도됩니다." | ERR-004-02 |

#### UI/UX 요구사항
- 오디언스 상세에 마지막 갱신 시각과 "즉시 갱신" 버튼을 상단에 배치한다.
- Rate Limit 상태에서는 즉시 갱신 버튼을 비활성화하고 재시도 가능 시간을 카운트다운으로 표시한다.
- 관련 화면: SCR-003 (오디언스 상세 — 화면정의서 참조)

---

### 3.6 기능 상세: F-005 오디언스 대시보드 및 분석

#### 개요

오디언스별 멤버 수 추이, 오디언스 간 중복 분석, LiveOps 연동 현황을 시각화한다. 기획자가 세그먼트 구조를 파악하고 캠페인 영향 범위를 사전에 점검할 수 있게 한다.

#### 사용자 스토리

**US-012**
```
As a 게임 기획자(관리자),
I want to 오디언스별 멤버 수 추이를 시각화된 차트로 보기를,
So that 세그먼트 크기 변화 패턴(이탈 증가, 신규 감소 등)을 빠르게 파악할 수 있다.
```

**US-013**
```
As a 게임 기획자(관리자),
I want to 두 오디언스 간 멤버 중복 수를 확인하기를,
So that 동일 플레이어에게 복수의 캠페인이 겹치는지 사전에 점검할 수 있다.
```

#### 상세 요구사항

| ID | 요구사항 | 필수 |
|----|----------|------|
| REQ-005-01 | 오디언스 목록 페이지에 전체 오디언스 수, 전체 모니터링 플레이어 수, 마지막 갱신 시각을 요약 수치로 표시한다. | Y |
| REQ-005-02 | 각 오디언스 상세에서 최근 30일 멤버 수 추이를 선 그래프(Line Chart)로 표시한다. 데이터 포인트는 갱신 주기와 동일한 10분 간격이다. | Y |
| REQ-005-03 | 오디언스 비교 기능: 2개 오디언스를 선택해 멤버 수 추이를 하나의 차트에 겹쳐 비교할 수 있다. | Y |
| REQ-005-04 | 오디언스 중복 분석: 2개 오디언스를 선택했을 때 두 오디언스에 동시에 속한 플레이어 수와 비율을 표시한다. | Y |
| REQ-005-05 | 오디언스 상세에서 해당 오디언스가 연동된 LiveOps 기능(이벤트, Experiments, Feature Flags, Messages) 목록을 표시한다. | Y |

#### 수용 조건 (Acceptance Criteria)

**AC-005-01**
```gherkin
Scenario: 오디언스 멤버 추이 차트 조회
  Given 관리자가 "이탈 플레이어" 오디언스 상세에 있다
  When 관리자가 "추이" 탭을 클릭한다
  Then 최근 30일의 멤버 수 변화가 선 그래프로 표시된다
  And x축은 날짜, y축은 멤버 수를 나타낸다
```

**AC-005-02**
```gherkin
Scenario: 두 오디언스 중복 분석
  Given 관리자가 오디언스 목록에서 "활성 플레이어"와 "결제 경험자" 2개를 선택했다
  When "중복 분석" 버튼을 클릭한다
  Then 두 오디언스의 공통 멤버 수와 각 오디언스 대비 비율이 표시된다
  And 결과는 30초 이내에 반환된다
```

#### UI/UX 요구사항
- 추이 차트는 Recharts 라이브러리를 사용한다.
- 관련 화면: SCR-001 (오디언스 목록), SCR-003 (오디언스 상세 — 분석 대시보드 포함, 화면정의서 참조)

---

### 3.7 기능 상세: F-006 오디언스 타겟팅 연동

#### 개요

정의된 오디언스를 Live Events, Experiments, Feature Flags, Messages 4종 LiveOps 기능에서 타겟팅 단위로 사용한다. 오디언스는 각 기능에서 공통으로 재사용된다.

#### 사용자 스토리

**US-014**
```
As a 게임 기획자(관리자),
I want to Live Event 생성 시 타겟 오디언스를 선택하기를,
So that 특정 플레이어 그룹에게만 이벤트를 노출할 수 있다.
```

**US-015**
```
As a 게임 기획자(관리자),
I want to Feature Flag에서 변형(Variant)별로 다른 오디언스를 지정하기를,
So that VIP 플레이어에게는 UI 변형 A, 일반 플레이어에게는 UI 변형 B를 보여줄 수 있다.
```

**US-016**
```
As a 게임 기획자(관리자),
I want to 실험(Experiment) 참여 대상 오디언스를 지정하기를,
So that 특정 세그먼트에서만 A/B 테스트를 실행하고 결과를 비교할 수 있다.
```

#### 상세 요구사항

| ID | 요구사항 | 필수 |
|----|----------|------|
| REQ-006-01 | Live Events에서 타겟 오디언스를 선택할 수 있다. 오디언스 미선택 시 전체 플레이어가 대상이 된다. | Y |
| REQ-006-02 | Live Events는 오디언스 연동 시 Sticky 멤버십 옵션을 활성화/비활성화할 수 있다. | Y |
| REQ-006-03 | Experiments(A/B 테스트)에서 실험 대상 오디언스를 지정할 수 있다. | Y |
| REQ-006-04 | Experiments는 오디언스 연동 시 변형(Variant) 고정 옵션을 제공한다: 오디언스 소속이 변경되어도 한 번 할당된 변형을 유지한다. | Y |
| REQ-006-05 | Feature Flags에서 각 Variant(변형)별로 서로 다른 오디언스를 지정할 수 있다. | Y |
| REQ-006-06 | Feature Flags의 복수 Variant에 오디언스가 지정된 경우, 우선순위(1위 ~ N위)를 설정해 중복 해소 규칙을 정의한다. | Y |
| REQ-006-07 | Messages에서 수신 오디언스를 선택할 수 있다. | Y |
| REQ-006-08 | Messages에서 오디언스 내 플레이어의 Identity 속성(이름 등)을 메시지 본문에 변수로 삽입할 수 있다. | Y |

#### 수용 조건 (Acceptance Criteria)

**AC-006-01**
```gherkin
Scenario: Live Event에 오디언스 타겟팅 적용
  Given 관리자가 Live Event 생성의 타겟팅 단계에 있다
  When 관리자가 "신규 플레이어" 오디언스를 선택한다
  Then 이벤트 저장 후 "신규 플레이어" 오디언스 멤버에게만 이벤트가 노출된다
  And 이벤트가 활성화된 이후 "신규 플레이어" 오디언스에 신규 편입된 플레이어도 이벤트를 볼 수 있다
```

**AC-006-02**
```gherkin
Scenario: Feature Flag Variant별 오디언스 지정 및 우선순위 충돌 처리
  Given Feature Flag "dark_mode"에 Variant A("결제 경험자")와 Variant B("활성 플레이어")가 지정되어 있다
  And 결제 경험자이면서 활성 플레이어인 플레이어 P1이 존재한다
  When P1이 Feature Flag를 요청한다
  Then 우선순위가 높은 Variant가 반환된다
  And 우선순위는 관리자가 설정한 Variant 순서에 따른다
```

**AC-006-03**
```gherkin
Scenario: Messages Identity 속성 변수 삽입
  Given 관리자가 Messages 편집기에서 메시지 본문을 작성 중이다
  When 관리자가 본문에 "{{identity.displayName}}님, 복귀를 환영합니다!"를 입력한다
  Then 메시지 발송 시 각 플레이어의 displayName 값으로 치환되어 발송된다
```

#### 비즈니스 규칙

| ID | 규칙 | 예시 |
|----|------|------|
| BR-006-01 | Feature Flags에서 복수 Variant에 동일 플레이어가 포함된 오디언스가 지정될 경우, 우선순위 1위 Variant가 반환된다. | 결제 경험자(1위)와 활성 플레이어(2위)에 모두 속한 경우 1위 적용 |
| BR-006-02 | 오디언스가 삭제된 경우, 해당 오디언스를 참조하는 LiveOps 기능의 타겟팅은 "전체 플레이어"로 자동 변경되지 않고, 기능이 비활성화 상태로 전환된다. | 오디언스 삭제 불가 정책(ERR-002-03)으로 방지 |

#### UI/UX 요구사항
- 각 LiveOps 기능의 생성/편집 흐름 내에 오디언스 선택 단계를 포함한다.
- 오디언스 선택 드롭다운에서 오디언스 이름과 현재 멤버 수를 함께 표시한다.
- 관련 화면: 각 LiveOps 기능 화면 내 오디언스 선택 UI (세그멘테이션 화면정의서 SCR-001 오디언스 목록 참조)

---

### 3.8 기능 상세: F-007 이벤트 택소노미 관리

#### 개요

Computed Properties 자동 계산에 필요한 게임 내 행동 이벤트를 정의하고 관리한다. 이벤트 택소노미는 어떤 행동을 추적할지, 추적된 데이터로 어떤 Computed Property를 자동 계산할지를 설정한다.

#### 사용자 스토리

**US-017**
```
As a 게임 기획자(관리자),
I want to 추적할 게임 내 이벤트를 정의하기를,
So that SDK에서 해당 이벤트를 수신했을 때 자동으로 플레이어 속성을 계산할 수 있다.
```

**US-018**
```
As a 게임 기획자(관리자),
I want to 이벤트별로 어떤 Computed Property를 업데이트할지 규칙을 설정하기를,
So that 세션 횟수, 결제 금액 합계 등 집계 지표가 자동으로 관리된다.
```

#### 상세 요구사항

| ID | 요구사항 | 필수 |
|----|----------|------|
| REQ-007-01 | 관리자는 이벤트 이름, 설명, 관련 Computed Properties 목록을 정의해 이벤트를 등록할 수 있다. | Y |
| REQ-007-02 | 이벤트 이름은 영문 소문자, 숫자, 언더스코어만 허용하며, 프로젝트 내 고유해야 한다. | Y |
| REQ-007-03 | 이벤트 1개에 복수의 Computed Property 계산 규칙을 연결할 수 있다. | Y |
| REQ-007-04 | 이벤트가 수신될 때 업데이트할 Computed Property와 계산 유형(Count, SeenLast, ValueSum, ValueHigh, ValueLow)을 연결 설정한다. | Y |
| REQ-007-05 | ValueSum/ValueHigh/ValueLow 계산 유형은 이벤트 페이로드 내 어떤 속성값을 집계할지 지정해야 한다. | Y |
| REQ-007-06 | 서비스 가입 시 기본 이벤트 세트가 자동 생성된다: `session_start`, `purchase_completed` | Y |
| REQ-007-07 | 이벤트는 수정 및 삭제가 가능하다. 단, Computed Property가 연결된 이벤트 삭제 시 연결된 Computed Property 목록 안내와 확인을 요구한다. | Y |

#### 기본 이벤트 세트

| 이벤트명 | Computed Property | 계산 유형 | 집계 속성 |
|---------|------------------|---------|---------|
| `session_start` | `sessionCount` | Count | - |
| `session_start` | `sessionSeenLast` | SeenLast | - |
| `purchase_completed` | `purchaseCompletedCount` | Count | - |
| `purchase_completed` | `purchaseCompletedSeenLast` | SeenLast | - |
| `purchase_completed` | `purchaseValueSum` | ValueSum | `amount` |

#### 수용 조건 (Acceptance Criteria)

**AC-007-01**
```gherkin
Scenario: 이벤트 등록 및 Computed Property 연결
  Given 관리자가 이벤트 택소노미 관리 페이지에 있다
  When 관리자가 이벤트명 "level_up"을 등록하고, Computed Property "maxLevelReached" (ValueHigh, 페이로드 속성 "level")을 연결한다
  Then "level_up" 이벤트가 등록된다
  And 이후 SDK에서 "level_up" 이벤트 수신 시 "maxLevelReached" 값이 자동 갱신된다
```

**AC-007-02**
```gherkin
Scenario: 프로젝트 생성 시 기본 이벤트 자동 생성
  Given 관리자가 새 프로젝트를 생성한다
  When 프로젝트 생성이 완료된다
  Then 이벤트 택소노미에 session_start, purchase_completed 2개 이벤트가 기본 생성된다
  And 각 이벤트에 명세된 Computed Property 계산 규칙이 연결되어 있다
```

#### UI/UX 요구사항
- 이벤트 등록 폼에서 Computed Property 연결은 동적으로 추가/삭제 가능한 행(Row) 형태로 제공한다.
- 관련 화면: SCR-005 (이벤트 택소노미 관리 — 화면정의서 참조)

---

### 3.9 기능 상세: F-008 오디언스 임포트/익스포트 (Phase 2)

#### 개요

외부 BI 시스템에서 산출한 세그먼트를 GLO로 임포트하는 **Managed Audience** 기능과, 오디언스 멤버 목록을 CSV로 익스포트하는 기능을 제공한다.

> **Phase 2 기능**: MVP(Phase 1) 출시 범위에 포함되지 않는다.

#### 상세 요구사항 (Phase 2 사전 정의)

| ID | 요구사항 | 필수 |
|----|----------|------|
| REQ-008-01 | CSV 파일 업로드로 플레이어 ID 목록을 직접 오디언스로 등록하는 Managed Audience를 지원한다. | Phase 2 |
| REQ-008-02 | REST API를 통해 외부 시스템에서 Managed Audience 멤버 목록을 주기적으로 업데이트할 수 있다. | Phase 2 |
| REQ-008-03 | 오디언스 멤버 목록을 CSV 형태로 익스포트할 수 있다. | Phase 2 |

---

## 4. Non-Functional Requirements

### 4.1 성능

| 항목 | 요구사항 | 측정 기준 |
|------|----------|----------|
| 오디언스 조회 API 응답 시간 | 95th percentile 200ms 이내 | 서버 응답 시간 |
| 미리보기(Preview) 응답 시간 | 최대 30초 이내 | Preview 버튼 클릭 ~ 결과 표시 |
| 즉시 갱신 완료 시간 | 30초 이내 | 갱신 요청 ~ 멤버십 확정 |
| 정기 갱신 주기 | 10분 | 갱신 완료 ~ 다음 갱신 시작 |
| 관리자 화면 초기 로딩 | 95th percentile 3초 이내 | 페이지 첫 요청 ~ 인터랙션 가능 상태 |
| 지원 플레이어 규모 | 프로젝트당 최대 1,000만 명 | 오디언스 갱신 시 정상 동작 기준 |

### 4.2 보안

| 항목 | 요구사항 |
|------|----------|
| 인증 | 관리자 대시보드: 세션 기반 인증. REST API: API Key 기반 인증. |
| 권한 | 오디언스 CRUD는 프로젝트 편집 권한 보유자만 가능. 조회는 프로젝트 읽기 권한 보유자 가능. |
| 데이터 접근 격리 | 프로젝트(게임) 간 플레이어 데이터는 완전히 격리된다. 타 프로젝트 데이터 참조 불가. |
| API Rate Limit | SDK 이벤트 수신 API: 플레이어당 초당 100 이벤트. 관리자 REST API: 초당 1,000 요청. |
| 감사 로그 | 오디언스 생성, 수정, 삭제, Sticky 멤버십 변경 등 주요 관리 행위는 감사 로그에 기록. |

### 4.3 확장성

- Computed Properties 계산 파이프라인은 프로젝트당 초당 10,000개 이벤트 처리를 지원해야 한다.
- 오디언스 수 증가(프로젝트당 1,000개 오디언스)에도 갱신 주기(10분) 내에 모든 오디언스 갱신이 완료되어야 한다.
- Custom Properties 증가(최대 100개)는 오디언스 갱신 성능에 영향을 주지 않아야 한다.

### 4.4 가용성

| 항목 | 요구사항 |
|------|----------|
| SLA | 월간 가용성 99.9% (다운타임 월 43분 이내) |
| RTO (복구 목표 시간) | 1시간 |
| RPO (복구 목표 시점) | 1시간 (최대 1시간 분량 이벤트 데이터 손실 허용) |
| 정기 갱신 장애 시 | 갱신 실패 오디언스는 마지막 정상 갱신 멤버십 유지. 장애 복구 후 즉시 재갱신. |

### 4.5 사용성

- 비개발자(기획자/운영자)가 폼 빌더만으로 사전 정의 오디언스 외 커스텀 오디언스를 생성하는 데 최초 경험 기준 5분 이내 완료 가능해야 한다.
- 오류 메시지는 문제 원인과 해결 방법을 함께 제시한다.
- 관리자 대시보드는 한국어를 기본 언어로 제공한다.

---

## 5. Dependencies & Constraints

### 5.1 의존성

| 시스템/기능 | 설명 | 담당 | 상태 |
|------------|------|------|------|
| GLO SDK | 플레이어 이벤트 수집, Default Properties 자동 수집, Custom Properties 업데이트 API 제공 | 백엔드 팀 | 미확인 |
| Live Events 모듈 | 오디언스 타겟팅 연동, Sticky 멤버십 적용 | 백엔드 팀 | 미확인 |
| Experiments 모듈 | 오디언스 타겟팅 연동, 변형 고정 적용 | 백엔드 팀 | 미확인 |
| Feature Flags 모듈 | 오디언스별 Variant 지정, 우선순위 처리 | 백엔드 팀 | 미확인 |
| Messages 모듈 | 오디언스 기반 발송, Identity 속성 변수 치환 | 백엔드 팀 | 미확인 |

### 5.2 제약사항

**기술적 제약**
- 프론트엔드 기술 스택은 Next.js 16, React 19, TypeScript, Shadcn UI, Radix UI, Tailwind CSS 4로 고정한다. (CLAUDE.md)
- 차트 시각화는 Recharts 라이브러리를 사용한다.
- 필터 표현식 DSL은 Satori 호환 문법을 기반으로 하되, 필요 시 확장 가능하도록 파서를 자체 구현한다.

**일정 제약**
- Phase 1 (MVP) 출시 대상: F-001 ~ F-007 (F-008 제외)
- Phase 2 출시 대상: F-008 (Managed Audience 임포트/익스포트)

**리소스 제약**
- 인디~중소 게임사 타겟 특성 상, 무거운 인프라 비용 없이 플레이어 수 증가에 따라 선형 확장 가능한 아키텍처가 요구된다.

### 5.3 가정사항

- GLO SDK를 게임 클라이언트에 연동하면 Default Properties(countryCode, platform, createTime)가 자동으로 수집된다.
- 이벤트 택소노미에 등록되지 않은 이벤트는 Computed Properties 계산에 영향을 주지 않는다 (무시).
- 필터 표현식 미리보기(Preview)는 실시간 쿼리 실행 결과이므로, 갱신 후 실제 멤버 수와 미세하게 다를 수 있다.
- 멀티 게임 프로젝트 지원: 하나의 GLO 계정이 복수의 게임 프로젝트를 관리할 수 있으며, 프로젝트 간 데이터는 완전히 독립된다.

---

## 6. Release Plan

### 6.1 마일스톤

| Phase | 명칭 | 포함 기능 | 출시 기준 |
|-------|------|----------|---------|
| Phase 1 | MVP | F-001, F-002, F-003, F-004, F-005, F-006, F-007 | 핵심 기능 모두 동작, 사전 정의 오디언스 8개 제공, LiveOps 4종 연동 |
| Phase 2 | 확장 | F-008 (Managed Audience 임포트/익스포트) | 외부 BI 시스템 연동 안정적 동작 |

### 6.2 Out of Scope (이번 버전 제외)

MVP(Phase 1)에서 **제외**되는 항목:
- F-008: Managed Audience CSV 임포트 / REST API 기반 멤버 동기화
- 오디언스 멤버 개별 조회 (PII 데이터 직접 노출)
- 플레이어 ID 기반 오디언스 수동 추가/제거
- 세그먼트 기반 코호트 분석 리포트 (별도 분석 기능)

---

## 7. Open Questions

| ID | 질문 | 담당 | 상태 | 마감 |
|----|------|------|------|------|
| Q-007 | MVP(Phase 1) 출시 시 폼 빌더 UI만 제공할 것인가, 쿼리 모드도 함께 제공할 것인가? | planner | 결정됨 (PRD 반영: 폼 빌더 + 쿼리 모드 병행) | - |
| Q-008 | 10분 주기 갱신으로 인한 지연이 수용 가능한 수준인가? 실시간 개입(이벤트 기반 즉시 갱신 트리거)이 필요한가? | planner | 미해결 | - |
| Q-009 | 외부 BI 시스템(Managed Audience) 연동을 Phase 1에 포함할 것인가, Phase 2 이후로 미룰 것인가? | planner | 결정됨 (Phase 2로 이관) | - |
| Q-006 | 이벤트 택소노미의 범위를 어떻게 설정할 것인가? 핵심 행동만(session, purchase) vs 상세 행동(레벨업, 퀘스트 완료 등) 포함? | planner | 미해결 | - |
| Q-010 | Custom Properties 한도(100개)가 인디~중소 게임사 니즈를 충족하는가? 플랜별 차등 제공 검토 필요 여부. | planner | 미해결 | - |

---

## 8. Risks

| ID | 리스크 | 영향 | 발생 확률 | 대응 방안 |
|----|--------|------|----------|---------|
| R-001 | 1,000만 명 규모 플레이어 오디언스 갱신 시 10분 주기 내 완료 불가 | 높음 | 중간 | 갱신 파이프라인 병렬 처리 설계. 부하 테스트(Load Test)를 Beta 전에 필수 실행. |
| R-002 | 필터 표현식 DSL 파서 자체 구현 복잡도 및 버그 리스크 | 중간 | 중간 | Satori 공개 DSL 명세 기반 파서 구현. 표현식 유형별 unit test 100% 커버리지 확보. |
| R-003 | 비개발자 운영자가 폼 빌더만으로 원하는 조건을 표현하지 못하는 경우 | 중간 | 높음 | 폼 빌더 지원 조건 범위를 운영자 인터뷰 기반으로 사전 검증. 미지원 조건 유형 식별 후 폼 빌더 개선. |
| R-004 | Sticky 멤버십 + 오디언스 갱신 로직 충돌로 잘못된 멤버십 상태 발생 | 높음 | 낮음 | Sticky 멤버십 별도 저장소로 관리. 갱신 파이프라인에서 Sticky 멤버십 보존 로직 명시적 처리. |
| R-005 | 사전 정의 오디언스 8개 필터 표현식의 기본 이벤트 택소노미 의존성 (session_start, purchase_completed 이벤트가 SDK에서 수집되지 않으면 동작 불가) | 중간 | 중간 | SDK 연동 가이드에 기본 이벤트 수집 필수 명시. 이벤트 미수집 시 관리자 대시보드에 경고 표시. |

---

## Appendix

### A. 용어 정의

| 용어 | 정의 |
|------|------|
| 오디언스 (Audience) | 필터 표현식으로 정의된 플레이어 그룹. GLO의 모든 LiveOps 기능에서 공통 타겟팅 단위로 사용. |
| Default Properties | SDK 초기화 시 자동 수집되는 플레이어 속성. countryCode, platform, createTime, updateTime. 수동 수정 불가. |
| Computed Properties | 이벤트 발생 시 자동 계산되는 집계 속성. Count, SeenLast, ValueSum, ValueHigh, ValueLow 5가지 계산 유형 지원. |
| Custom Properties | 관리자가 정의하는 서비스 고유 속성. string 또는 numeric 타입. SDK/API를 통해 값 업데이트. |
| 이벤트 택소노미 | 추적할 게임 내 행동 이벤트 목록 및 각 이벤트에 연결된 Computed Properties 계산 규칙의 집합. |
| Sticky 멤버십 | LiveOps 기능(이벤트, Experiments)에서 활성화 가능한 옵션. 한 번 오디언스에 소속되어 기능에 참여한 플레이어는 이후 오디언스 조건을 이탈해도 참여 자격을 유지. |
| Managed Audience | 외부 BI 시스템이 산출한 플레이어 ID 목록을 CSV 업로드 또는 API를 통해 직접 오디언스로 등록하는 방식. (Phase 2) |
| 필터 표현식 DSL | 오디언스 조건을 정의하는 도메인 특화 언어. Now(), Duration(), Properties(), PropertiesComputed(), PropertiesCustom(), SemverMatch() 함수와 산술/비교/논리/문자열 연산자를 지원. |
| 폼 빌더 | 비개발자를 위한 드롭다운/입력 필드 기반 필터 조건 생성 UI. 내부적으로 DSL 표현식으로 변환. |
| 플레이어 | GLO SDK를 연동한 게임의 최종 사용자. |
| 관리자 | GLO 서비스를 통해 게임의 LiveOps를 운영하는 게임사 기획자/운영자/개발자. |
| LTV | Life Time Value. 플레이어 생애 가치. 유저 1인이 게임에서 창출하는 기대 총 수익. |

### B. 관련 문서

| 문서 | ID | 경로 |
|------|-----|------|
| 시장 분석 리서치 | RES-GLO-001 | docs/01-research/2026-03-05_RES_GLO_market-analysis_v1.0.md |
| 경쟁사 심층 분석 | RES-GLO-002 | docs/01-research/2026-03-09_RES_GLO_competitor-analysis_v1.0.md |
| Satori 세그멘테이션 분석 | RES-GLO-003 | docs/01-research/2026-03-10_RES_GLO_satori-segmentation_v1.0.md |
| 세그멘테이션 기획 킥오프 회의록 | MTG-GLO-003 | docs/08-meeting-note/2026-03-10_MTG_GLO_player-segmentation-kickoff_v1.0.md |
| 화면정의서 (예정) | UX-GLO-001 | docs/05-ux/ |
| 다이어그램 (예정) | DIA-GLO-001 | docs/06-diagrams/ |

### C. 다음 에이전트 핸드오프

#### → uiux-spec

```yaml
handoff:
  features:
    - id: "F-001"
      name: "플레이어 속성 관리"
      screens: ["속성 관리 (Default/Computed/Custom 탭)", "Custom Property 생성/편집 폼"]
    - id: "F-002"
      name: "오디언스 생성 및 관리"
      screens: ["오디언스 목록", "오디언스 생성/편집", "오디언스 상세"]
    - id: "F-003"
      name: "필터 표현식 시스템"
      screens: ["폼 빌더 UI", "쿼리 모드 에디터", "미리보기 결과"]
    - id: "F-004"
      name: "오디언스 갱신 및 멤버십"
      screens: ["오디언스 상세 (갱신 상태, 즉시 갱신 버튼, 갱신 이력)"]
    - id: "F-005"
      name: "오디언스 대시보드"
      screens: ["오디언스 분석 대시보드 (추이 차트, 중복 분석)"]
    - id: "F-006"
      name: "타겟팅 연동"
      screens: ["Live Event 타겟팅 설정 단계", "Feature Flag Variant 오디언스 지정"]
    - id: "F-007"
      name: "이벤트 택소노미"
      screens: ["이벤트 목록", "이벤트 생성/편집 (Computed Property 연결 UI)"]

  key_ux_requirements:
    - "폼 빌더: 조건 추가/삭제/재정렬 가능. 속성 그룹 분류(Default/Computed/Custom) 드롭다운."
    - "쿼리 에디터: 모노스페이스 폰트, 문법 하이라이팅, 자동완성."
    - "오디언스 목록: 사전 정의 오디언스 구분 뱃지 표시."
    - "즉시 갱신 버튼: Rate Limit 상태 시 카운트다운 비활성화."
```

#### → diagram

```yaml
handoff:
  user_flows:
    - name: "오디언스 생성 플로우"
      steps: ["오디언스 목록 진입", "신규 생성 클릭", "폼 빌더/쿼리 모드 선택", "조건 입력", "미리보기", "저장"]
    - name: "LiveOps 타겟팅 연동 플로우"
      steps: ["LiveOps 기능 생성", "타겟팅 단계 진입", "오디언스 선택", "Sticky 옵션 설정", "저장 및 활성화"]

  state_machines:
    - entity: "오디언스 갱신 상태"
      states: ["갱신 대기", "갱신 중", "갱신 완료", "갱신 실패"]
      transitions: ["주기 도달→갱신 중", "즉시 갱신 요청→갱신 중", "갱신 완료→갱신 완료", "타임아웃→갱신 실패"]
    - entity: "Sticky 멤버십"
      states: ["오디언스 소속 없음", "오디언스 소속", "Sticky 유지 (조건 이탈)"]
      transitions: ["오디언스 진입→소속", "Sticky 활성화 이후 조건 이탈→Sticky 유지", "기능 종료→소속 없음"]

  data_models:
    - entity: "Audience"
      attributes: ["id", "name", "description", "filter_expression", "member_count", "last_refreshed_at", "is_predefined"]
      relations: ["참조하는 LiveOps 기능 다수", "참조하는 다른 오디언스(중첩)"]
    - entity: "PlayerProperty"
      attributes: ["player_id", "property_type(default/computed/custom)", "key", "value", "updated_at"]
      relations: ["Player 1:N"]
    - entity: "EventTaxonomy"
      attributes: ["event_name", "description", "computed_property_rules[]"]
      relations: ["연결된 ComputedProperty 다수"]
```

### D. 변경 이력

| 버전 | 일자 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| v1.0 | 2026-03-10 | 초안 작성 (F-001~F-008 전체 기능 정의, 수용 기준 포함) | prd |
| v1.1 | 2026-03-26 | REV-GLO-003 리뷰 반영: 화면 ID 정합성, 변경 이력 추가, 미결사항 상태 갱신 | prd |
