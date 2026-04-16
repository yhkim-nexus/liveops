---
id: "MTG-GLO-003"
title: "회의록: 플레이어 세그멘테이션 기획 킥오프"
project: "GLO"
version: "v1.0"
status: "completed"
created: "2026-03-10"
updated: "2026-03-10"
author: "meeting-note"
session_type: "구체화"
participants:
  - "사용자"
  - "planner"
  - "researcher"
related_docs:
  - "RES-GLO-003"
  - "RES-GLO-002"
  - "RES-GLO-001"
  - "MTG-GLO-002"
tags:
  - "project:game-liveops"
  - "type:meeting"
  - "topic:player-segmentation"
---

# 회의록: 플레이어 세그멘테이션 기획 킥오프

> Game LiveOps Service 핵심 기능인 플레이어 세그멘테이션을 기획하기 위한 킥오프 회의. Heroic Labs Satori 공식 문서 기반 심층 분석과 경쟁사 비교 결과를 바탕으로 설계 방향을 확정한다.

## 문서 정보

| 항목 | 내용 |
|------|------|
| ID | MTG-GLO-003 |
| 일시 | 2026-03-10 |
| 참석자 | 사용자, planner, researcher |
| 세션 유형 | 구체화 (Feature Planning) |
| 관련 문서 | RES-GLO-003, RES-GLO-002, RES-GLO-001, MTG-GLO-002 |

---

## 1. 회의 목적

플레이어 세그멘테이션을 Game LiveOps Service의 핵심 기능으로 확정하고, Heroic Labs Satori 공식 문서 분석 결과를 기반으로 세그멘테이션 아키텍처, 속성 체계, 필터 언어를 설계하여 PRD 작성의 기초 자료를 마련한다.

---

## 2. 논의 내용

### 2.1 플레이어 세그멘테이션의 중요성 및 시장 현황

**배경**
- [[MTG-GLO-002]]에서 도출한 8개 핵심 기능 카테고리 중 세그멘테이션은 7/7 플랫폼 공통 필수 기능(100%)으로 확인됨
- 경쟁사 분석에서 세그멘테이션이 모든 LiveOps 기능(이벤트, A/B 테스트, Feature Flags, 메시징)의 기반 축으로 동작한다는 점이 강조됨

**논의 내용**
- 세그멘테이션은 단순 플레이어 분류를 넘어 Live Events, Experiments, Feature Flags, Messages 등 **모든 LiveOps 기능의 타겟팅 핵심 축**으로 기능
- 시장 리더(Satori, Unity UGS, AccelByte)는 모두 Identity → Properties → Audience 3계층 구조를 기반으로 설계
- 비기술 운영자(기획자, 마케터) 친화적 도구 요청이 높음 (폼 빌더 UI)

**결론**
- 플레이어 세그멘테이션을 GLO 서비스의 **핵심 기능(P0)**으로 확정
- 다른 모든 LiveOps 기능의 설계 시 세그멘테이션 아키텍처를 먼저 결정해야 함

### 2.2 Heroic Labs Satori 세그멘테이션 구조 분석

**배경**
- 사용자가 Heroic Labs Satori 공식 문서를 기반으로 세부 기능 조사 요청
- Researcher가 Satori v2.1.7 기준 16개 페이지 공식 문서 심층 분석 완료 (RES-GLO-003)

**논의 내용**

#### 2.2.1 Identity - Properties - Audience 3계층 구조

Satori의 세그멘테이션은 다음 3계층으로 구성:

1. **Identity (신원)**
   - 플레이어 한 명을 나타내는 기본 단위
   - 속성, 이벤트, 오디언스 소속 정보를 모두 포함

2. **Properties (속성)** - 세그멘테이션 조건의 원천 데이터
   - **Default Properties**: SDK가 자동 수집 (countryCode, platform, createTime, updateTime 등)
   - **Computed Properties**: 이벤트 전송 즉시 자동 계산
     - `{eventName}Count`: 누적 발생 횟수
     - `{eventName}SeenLast`: 마지막 발생 시각
     - `{eventName}ValueSum`: 값의 누적 합계
     - `{eventName}ValueHigh/Low`: 최고/최저값
   - **Custom Properties**: 게임사가 직접 정의 (VIP 등급, 길드명, 레벨 등)

3. **Audience (오디언스)** - 세그먼트 단위
   - 필터 표현식으로 정의된 플레이어 그룹
   - 무제한 생성 가능, 중첩 허용
   - 모든 LiveOps 기능에서 공통으로 참조

#### 2.2.2 필터 표현식 DSL (Domain Specific Language)

Satori는 시간 함수, 버전 매칭, 정규표현식을 지원하는 표현식 언어를 제공:

| 함수 유형 | 예시 |
|----------|------|
| **시간 함수** | `Now()`, `Duration("30d")` |
| **속성 조회** | `Properties()`, `PropertiesComputed()`, `PropertiesCustom()` |
| **버전 매칭** | `SemverMatch(">=2.0.0", appVersion)` |
| **비교 연산** | `==`, `!=`, `<`, `>`, `<=`, `>=` |
| **논리 연산** | `&&` (and), `||` (or), `!` (not) |
| **문자열 연산** | `contains`, `startsWith`, `endsWith`, `matches` (정규식) |

**표현식 예시**
- 신규 플레이어 (2일 이내): `Now() - createTime <= Duration("2d")`
- 결제 경험자: `PropertiesComputed("purchaseCompletedCount", 0) > 0`
- 한국 플레이어: `Properties("countryCode", "") == "KR"`
- 이탈 결제자 (30일 미결제): `PropertiesComputed("purchaseCompletedCount", 0) > 0 and Now() - PropertiesComputed("purchaseCompletedSeenLast", 0) >= Duration("30d")`

#### 2.2.3 폼 빌더 UI (Satori 2.0+)

- 드롭다운 기반 시각적 편집기로 코드 없이 오디언스 생성 가능
- 비기술 운영자(기획자, 마케터)를 위한 기본 인터페이스
- 복잡한 조건은 쿼리 직접 입력 모드 병행

**결론**
- Satori의 3계층 속성 구조(Default/Computed/Custom)를 GLO 설계의 기본 참조로 채택
- 필터 DSL을 기반으로 복잡한 시간·행동 조건을 지원하되, 운영자 친화적 폼 빌더를 우선 제공

### 2.3 Audience를 모든 LiveOps 기능의 공통 타겟팅 단위로 설계

**배경**
- [[RES-GLO-003]]에서 Satori가 Live Events, Experiments, Feature Flags, Messages 모두에서 Audience를 공통 참조한다는 점이 핵심 설계 패턴으로 확인됨

**논의 내용**

| LiveOps 기능 | Audience 연동 방식 |
|--------------|-----------------|
| **Live Events** | 이벤트 대상 오디언스 지정, Sticky Membership으로 조건 이탈 시에도 이벤트 참여 유지 |
| **Experiments** | 실험 대상 오디언스 설정, 할당된 변형 고정 (오디언스 변경되어도 동일 변형 유지) |
| **Feature Flags** | 각 변형에 특정 오디언스 지정, 우선순위 관리로 중첩 오디언스 충돌 해결 |
| **Messages** | 메시지 수신 오디언스 지정, 다국어 + 속성 삽입으로 개인화 |

**핵심 발견**
- 단일 오디언스 정의를 여러 기능에서 재사용하면 **세그멘테이션 로직 중복 제거**
- Sticky Membership(조건 이탈 시에도 이벤트 참여 유지) 옵션으로 이벤트 무결성 보장
- 변형 고정(Variant Pinning) 메커니즘으로 A/B 테스트 신뢰성 확보

**결론**
- Audience를 GLO 서비스의 **유일한 타겟팅 단위**로 설계
- Live Events, Experiments, Feature Flags, Messages 모두 동일한 Audience 정의를 참조하도록 아키텍처 결정

### 2.4 실시간 갱신 메커니즘

**배경**
- 동적 세그멘테이션에서 오디언스 멤버십이 얼마나 빠르게 반영되는지가 캠페인 효과에 영향

**논의 내용**
- **자동 갱신**: 기본 10분 주기로 멤버십 재계산 (이벤트 수신 후 최대 10분 지연)
- **프로그래매틱 갱신**: Console API 통한 즉시 갱신 지원 (운영 이슈 대응 시 활용)
- **Managed Audience**: 외부 BI 시스템(Databricks 등)에서 생성한 세그먼트 임포트 가능

**고려사항**
- 10분 지연이 발생할 수 있으므로, 실시간 타겟팅이 필요한 기능은 별도 처리 경로 검토 필요
- Sticky Membership을 활용하면 이벤트 진행 중 오디언스 변경이 경험에 미치는 영향 최소화 가능

**결론**
- 10분 주기 자동 갱신을 기본으로 설정
- 실시간 개입이 필요한 기능(예: 이벤트 긴급 중단)은 API 기반 즉시 갱신 지원

---

## 3. 결정 사항

| ID | 결정 내용 | 근거 | 비고 |
|----|----------|------|------|
| D-007 | 플레이어 세그멘테이션을 GLO 서비스의 핵심 기능(P0)으로 확정 | 경쟁사 7개 플랫폼 모두 필수 기능(7/7), 모든 LiveOps 기능의 기반 축 | RES-GLO-002, RES-GLO-003 기반 |
| D-008 | Satori의 Identity-Properties-Audience 3계층 속성 구조를 설계 기준으로 채택 | Default(자동수집) / Computed(이벤트 기반 자동계산) / Custom(사용자정의) 체계로 확장성과 자동화를 동시에 확보 | RES-GLO-003에서 검증된 패턴 |
| D-009 | Audience를 모든 LiveOps 기능(Live Events, Experiments, Feature Flags, Messages)의 유일한 공통 타겟팅 단위로 설계 | 단일 오디언스 정의의 재사용으로 로직 중복 제거, 운영 일관성 확보 | Satori 아키텍처 패턴 |
| D-010 | 필터 표현식 DSL을 기본으로 채택하되, 비기술 운영자용 폼 빌더 UI를 주요 인터페이스로 제공 | 폼 빌더로 코드 없이 세그먼트 생성, 쿼리 모드는 고급 조건용 옵션으로 제공 (Satori 2.0+ 패턴) | RES-GLO-003 권장사항 |

---

## 4. 액션 아이템

| ID | 항목 | 담당 | 기한 | 상태 |
|----|------|------|------|------|
| A-008 | 플레이어 세그멘테이션 PRD 작성 (세그멘테이션 기능 명세, 속성 체계, 필터 언어 스펙) | prd | - | 대기 |
| A-009 | 세그멘테이션 관리 화면 정의서 작성 (폼 빌더 UI, Audience 관리, 속성 관리 화면 설계) | uiux-spec | - | 대기 |
| A-010 | 세그멘테이션 데이터 흐름 다이어그램 작성 (Identity 프로필 갱신 → Properties 계산 → Audience 재계산 → LiveOps 타겟팅 플로우) | diagram | - | 대기 |
| A-011 | 이벤트 택소노미 정의 (측정할 핵심 행동 이벤트 목록 정의, Computed Properties 자동 계산 규칙 수립) | planner | - | 대기 |
| A-012 | MVP(Phase 1)에 포함될 초기 세그먼트 목록 확정 (신규/활성/휴면/이탈/결제자 등 기본 8개 세그먼트 정의) | planner | - | 대기 |

---

## 5. 미결 사항

| ID | 이슈 | 필요한 정보/결정 | 담당 |
|----|------|-----------------|------|
| Q-006 | 이벤트 택소노미의 범위를 어떻게 설정할 것인가? (핵심 행동만 vs 상세 행동 포함) | Computed Properties 설계 원칙 및 게임 특성에 따른 이벤트 카테고리 확정 필요 | planner |
| Q-007 | MVP(Phase 1) 출시 시 폼 빌더 UI만 제공할 것인가, 또는 쿼리 모드도 함께 제공할 것인가? | 초기 운영 편의성 vs 개발 리소스 투입 결정 | planner |
| Q-008 | 10분 주기 갱신으로 인한 지연이 수용 가능한 수준인가? (실시간 개입 필요 여부) | 전략적 캠페인 특성 및 기대 사용 사례에 따른 요구사항 정의 필요 | 사용자 |
| Q-009 | 외부 BI 시스템(Managed Audience)과의 연동을 Phase 1에 포함할 것인가, Phase 2 이후로 미룰 것인가? | 초기 타겟 사용자 규모 및 고급 기능 요청 빈도 판단 필요 | planner |

---

## 6. 다음 회의 안건

- [ ] 플레이어 세그멘테이션 PRD 초안 리뷰
- [ ] 이벤트 택소노미 정의 확정 (핵심 이벤트 목록)
- [ ] MVP(Phase 1) 초기 세그먼트 8개 상세 조건 확정
- [ ] 폼 빌더 UI vs 쿼리 모드 제공 우선순위 결정
- [ ] UX 스펙 및 다이어그램 설계 방향 논의

---

## 7. 서비스 컨텍스트 요약

> 이 섹션은 다른 에이전트가 참조할 수 있도록 현재까지 확정된 내용을 요약합니다.

```yaml
service:
  name: "Game LiveOps Service"
  target_user: "중소 모바일 게임사, 기획자/마케터"
  core_value: "기획자가 바로 쓸 수 있는 노코드 Game LiveOps 플랫폼"

current_phase: "planning"

confirmed_features:
  - id: "F-001"
    name: "플레이어 세그멘테이션"
    priority: "P0"
    status: "designing"

segmentation_architecture:
  identity: "플레이어 신원 관리"
  properties:
    - type: "Default"
      description: "SDK 자동 수집 (국가, 플랫폼, 생성시각 등)"
      examples: ["countryCode", "platform", "createTime", "updateTime"]
    - type: "Computed"
      description: "이벤트 기반 자동 계산"
      examples: ["sessionStartCount", "purchaseCompletedCount", "purchaseCompletedValueSum"]
    - type: "Custom"
      description: "게임사 정의 속성"
      examples: ["vipTier", "guildName", "characterLevel"]
  audience: "필터 표현식으로 정의된 플레이어 그룹, 모든 LiveOps 기능의 공통 타겟팅 단위"

segmentation_interface:
  primary: "Form Builder UI (비기술 운영자용)"
  advanced: "Filter Expression DSL (복잡한 조건)"

core_capabilities:
  - "Identity-Properties-Audience 3계층 구조"
  - "Default/Computed/Custom 속성 3분류"
  - "시간·행동·속성 기반 복합 필터 표현식"
  - "Live Events, Experiments, Feature Flags, Messages와 통합 Audience 참조"
  - "Sticky Membership으로 이벤트 참여 일관성 보장"
  - "10분 주기 자동 갱신 + API 기반 즉시 갱신 지원"

key_decisions:
  - "D-001: 시장조사부터 시작"
  - "D-002: 프로젝트 코드 GLO"
  - "D-003: 시장조사 필수 포함항목 4가지 확정"
  - "D-004: 7개 플랫폼 심층 분석 완료"
  - "D-005: 8개 핵심 기능 카테고리 확정"
  - "D-006: 필수/권장/선택 3단계 우선순위 분류"
  - "D-007: 플레이어 세그멘테이션을 P0 핵심 기능으로 확정"
  - "D-008: Identity-Properties-Audience 3계층 구조 채택"
  - "D-009: Audience를 공통 타겟팅 단위로 설계"
  - "D-010: 필터 DSL + 폼 빌더 UI 병행"

constraints:
  - "비개발자(기획자/운영자) 친화적 도구 필수"
  - "무료 티어 포함 가격 모델 필요"
  - "운영자 중심 UX를 핵심 차별화로 설정"
  - "이벤트 미전송 시 세그멘테이션 오류 가능성 → 모니터링 체계 구축 필요"

research_summary:
  reference_platform: "Heroic Labs Satori v2.1.7"
  analysis_documents: ["RES-GLO-003 (16페이지)", "RES-GLO-002", "RES-GLO-001"]
  segmentation_adoption: "7/7 경쟁 플랫폼 필수 기능 (100%)"
  key_insights:
    - "세그멘테이션은 단순 분류가 아닌 모든 LiveOps 기능의 기반 축"
    - "이벤트 설계 품질이 Computed Properties 자동 계산 정확도 직결"
    - "폼 빌더 UI로 비기술 운영자 진입장벽 제거 가능"
    - "Sticky Membership + 변형 고정으로 캠페인 무결성 보장"
```

---

## 변경 이력

| 버전 | 일자 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| v1.0 | 2026-03-10 | 초안 작성 - 플레이어 세그멘테이션 기획 킥오프 회의 기록 | meeting-note |
