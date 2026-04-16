---
id: "RES-GLO-003"
title: "리서치 리포트: Heroic Labs Satori 플레이어 세그멘테이션 분석"
project: "GLO"
version: "v1.0"
status: "draft"
created: "2026-03-10"
updated: "2026-03-10"
author: "researcher"
research_type: "competitor-feature"
related_docs:
  - "RES-GLO-001"
  - "RES-GLO-002"
tags:
  - "project:game-liveops"
  - "type:research"
  - "topic:player-segmentation"
  - "topic:heroic-labs-satori"
---

# 리서치 리포트: Heroic Labs Satori 플레이어 세그멘테이션 분석

## 문서 정보

| 항목 | 내용 |
|------|------|
| ID | RES-GLO-003 |
| 버전 | v1.0 |
| 작성일 | 2026-03-10 |
| 데이터 기준일 | 2026-03-10 (Satori v2.1.7 기준) |
| 리서치 유형 | 경쟁 기능 분석 (competitor-feature) |
| 조사 대상 | Heroic Labs Satori |
| 조사 URL | https://heroiclabs.com/docs/satori/ |

---

## 1. Executive Summary

Heroic Labs Satori는 게임 특화 LiveOps 플랫폼으로, **Identity - Properties - Audience** 3계층 구조를 기반으로 한 강력한 플레이어 세그멘테이션 엔진을 제공한다. 세그멘테이션은 단순 그룹 분류를 넘어 Live Events, Experiments, Feature Flags, Messages 등 모든 LiveOps 기능의 타겟팅 핵심 축으로 동작한다. 필터 표현식은 수학 함수와 시간 계산을 지원하는 DSL(도메인 특화 언어) 수준으로 정교하며, 오디언스는 지속적으로 자동 갱신되어 실시간에 가까운 세그멘테이션을 유지한다.

### Key Findings

- **Finding 1**: 세그멘테이션의 기반 단위는 `Audience`이며, 무제한 생성·중첩이 가능하고 모든 LiveOps 기능(Live Events, Experiments, Feature Flags, Messages)에서 공통으로 참조된다.
- **Finding 2**: 속성은 Default(기본), Computed(이벤트 기반 자동 계산), Custom(사용자 정의) 3종으로 분류되며, 이벤트 수신 즉시 Computed Properties가 갱신되어 세그멘테이션 조건으로 활용된다.
- **Finding 3**: 필터 표현식은 시간 함수(`Now()`, `Duration()`), 버전 매칭(`SemverMatch()`), 정규표현식 등을 지원하는 표현식 언어로 설계되어 있어 복잡한 행동 기반 조건도 단일 표현식으로 기술 가능하다.
- **Finding 4**: 오디언스는 기본 10분 주기로 자동 갱신되며, API를 통한 프로그래매틱 갱신도 지원한다. Satori 2.0부터 오디언스 폼 빌더 UI가 제공되어 쿼리 없이도 세그먼트 생성이 가능하다.
- **Finding 5**: Managed Audience 개념을 통해 외부 데이터 시스템(예: Databricks)에서 생성한 세그먼트를 Satori로 임포트할 수 있어 하이브리드 세그멘테이션을 지원한다.

### Recommendations

1. 세그멘테이션 조건 체계를 Default / Computed / Custom 3계층으로 설계하여 이벤트 기반 속성 자동 갱신 메커니즘을 핵심으로 채택할 것
2. 모든 LiveOps 기능(이벤트, 실험, 플래그, 메시지)에서 Audience를 공통 타겟팅 단위로 재사용하는 아키텍처를 채택할 것
3. 필터 DSL을 도입하여 시간 기반·행동 기반 복합 조건을 지원하되, 비기술 운영자를 위한 폼 빌더 UI를 병행 제공할 것

---

## 2. Satori 플랫폼 개요

### 2.1 Satori란

Satori는 Heroic Labs가 개발한 게임 전용 LiveOps 플랫폼이다. "게임 스튜디오가 플레이어 베이스에 대한 인사이트를 얻고 오디언스 및 수익 성장의 기회를 파악하도록 지원"하는 것이 핵심 목표다. Supercell, Bandai Namco, Wargaming 등 주요 게임사가 도입하여 운영 중이다.

### 2.2 핵심 아키텍처

```
게임 클라이언트 / 서버
        │
        │ 이벤트 전송 (Client SDK / Server Runtime)
        ▼
┌─────────────────────────────────────────────┐
│                   Satori                    │
│                                             │
│  [이벤트 수신] ──► [Identity 프로필 갱신]    │
│                          │                  │
│                          ▼                  │
│                   [Properties 업데이트]      │
│                   - Default Properties      │
│                   - Computed Properties     │
│                   - Custom Properties       │
│                          │                  │
│                          ▼                  │
│                   [Audience 재계산]          │
│                   (필터 표현식 평가)          │
│                          │                  │
│          ┌───────────────┼───────────────┐  │
│          ▼               ▼               ▼  │
│    Live Events     Experiments     Feature  │
│                                    Flags    │
│          │               │               │  │
│          └───────────────┴───────────────┘  │
│                          │                  │
│                          ▼                  │
│                      Messages               │
└─────────────────────────────────────────────┘
        │
        ▼
   Data Lake (실시간 내보내기)
```

### 2.3 버전 현황

| 버전 | 출시 | 주요 변경 |
|------|------|----------|
| v2.1.7 | 2026-02-19 | Feature Flags/Experiments/Live Events 필터링 성능 향상 |
| v2.1.6 | 2025-12-18 | Audience 사용 현황 배지, Managed Audience 전용 리소스 타입 |
| v2.0 | 2024 | 오디언스 폼 빌더 UI, Timeline View, Remote Sync 도입 |

---

## 3. 세그멘테이션 핵심 개념

### 3.1 Identity (신원)

**Identity**는 Satori에서 플레이어 한 명을 나타내는 기본 단위다. 각 Identity는 다음 정보를 포함한다.

| 구성 요소 | 설명 |
|----------|------|
| Properties | 플레이어의 속성 집합 (Default / Computed / Custom) |
| Events | 플레이어의 행동 이벤트 시계열 기록 |
| Audiences | 해당 플레이어가 속한 오디언스 목록 |
| Feature Flags | 적용된 기능 플래그 |
| Experiments | 참여 중인 실험 |
| Live Events | 참여 중인 라이브 이벤트 |
| Messages | 수신한 메시지 |

Identity 상세 페이지에서는 **Future-date Testing** 기능을 제공하여, QA 목적으로 미래 날짜를 시뮬레이션해 시간 기반 세그멘테이션 로직을 검증할 수 있다.

### 3.2 Properties (속성) - 세그멘테이션의 기반

Properties는 세그멘테이션 필터 조건의 원천 데이터다. 3가지 유형으로 분류된다.

#### 3.2.1 Default Properties (기본 속성)

Satori SDK가 클라이언트에서 자동으로 수집하는 표준 속성이다.

| 속성명 | 타입 | 설명 |
|--------|------|------|
| `apiKeyName` | string | Identity 생성 시 사용된 API 키 이름 |
| `countryCode` | string | 지역 정보 기반 국가 코드 (예: "KR", "US") |
| `firstOpen` | numeric | Identity 최초 생성 타임스탬프 (에포크 초) |
| `platform` | string | 클라이언트 플랫폼 (예: "ios", "android", "pc") |
| `email` | string | 연결된 이메일 주소 |
| `createTime` | numeric | 계정 생성 시각 |
| `updateTime` | numeric | 마지막 업데이트 시각 |

#### 3.2.2 Computed Properties (계산된 속성)

게임 클라이언트가 Satori에 이벤트를 전송하면 **자동으로 계산·저장**되는 속성이다. 이벤트명을 기반으로 다음 4가지 통계가 자동 생성된다.

| 패턴 | 설명 | 예시 |
|------|------|------|
| `<eventName>Count` | 이벤트 누적 발생 횟수 | `purchaseCompletedCount` |
| `<eventName>SeenLast` | 이벤트 마지막 발생 시각 | `purchaseCompletedSeenLast` |
| `<eventName>ValueSum` | 이벤트 값의 누적 합계 (숫자 이벤트) | `purchaseCompletedValueSum` |
| `<eventName>ValueHigh` / `ValueLow` | 이벤트 값의 최고/최저값 | `purchaseCompletedValueHigh` |

- `sessionStartCount`: 세션 시작 횟수 (게임 실행 횟수)
- `purchaseCompletedCount`: 결제 완료 횟수
- `firstLevelCompletedSeenLast`: 첫 번째 레벨 완료 마지막 시각

#### 3.2.3 Custom Properties (사용자 정의 속성)

게임 특화 속성을 게임 개발자가 직접 정의한다. **Taxonomy 페이지**에서 먼저 속성을 등록한 후, 클라이언트 SDK를 통해 값을 전송한다.

| 타입 | 예시 용도 |
|------|----------|
| string | 플레이어 닉네임, 길드 이름, VIP 등급 |
| numeric | 보유 재화 수량, 현재 레벨, 총 플레이 시간 |

### 3.3 Audience (오디언스) - 세그먼트 단위

**Audience**는 필터 표현식으로 정의된 플레이어 그룹이다. Satori 세그멘테이션의 핵심 단위로, 모든 LiveOps 기능의 타겟팅에 공통으로 사용된다.

#### 주요 특성

| 특성 | 설명 |
|------|------|
| 무제한 생성 | 프로젝트 내 오디언스 수 제한 없음 |
| 중첩 허용 | 동일 플레이어가 여러 오디언스에 동시 소속 가능 |
| 자동 갱신 | 기본 10분 주기로 멤버십 재계산 |
| Include/Exclude | 특정 Identity ID를 수동으로 포함/제외 가능 |
| 임포트 지원 | 외부 시스템의 오디언스 세그먼트 가져오기 지원 |

#### 기본 제공 Audience

이벤트 전송 없이도 사용 가능한 시스템 기본 오디언스가 제공된다.

| 오디언스명 | 조건 |
|-----------|------|
| `New Players` | 최근 N일 이내 신규 가입 플레이어 |
| `Tier-1-Countries` | 1티어 국가 (미국, 영국, 일본 등) 플레이어 |
| `All-Spenders` | 1회 이상 결제 경험 플레이어 |
| `Lapsed-Spenders` | 과거 결제 후 일정 기간 이상 미결제 플레이어 |

---

## 4. 세그멘테이션 필터 시스템

### 4.1 필터 표현식 언어 (Filter Expression DSL)

Satori는 커스텀 표현식 언어를 사용하여 세그멘테이션 조건을 기술한다. 두 가지 편집 모드를 제공한다.

- **폼 뷰 (Form View)**: 드롭다운 UI로 조건을 선택하는 시각적 편집기 (비기술 운영자용)
- **쿼리 뷰 (Query View)**: 표현식 직접 입력 (고급 조건용)

### 4.2 지원 데이터 타입

| 타입 | 표현 예시 |
|------|----------|
| string | `"hello world"` |
| numeric | `123` 또는 `1_000_000` (자릿수 구분 가능) |
| boolean | `true` / `false` |
| array | `[1, 2, 3]` |
| map | `{"key": "value"}` |
| nil | 값 부재 표현 |

### 4.3 연산자

| 분류 | 연산자 | 설명 |
|------|--------|------|
| 산술 | `+`, `-`, `*`, `/`, `%`, `**` | 사칙연산, 나머지, 거듭제곱 |
| 비교 | `==`, `!=`, `<`, `<=`, `>`, `>=` | 동등·대소 비교 |
| 논리 | `&&` / `and`, `||` / `or`, `!` / `not` | AND, OR, NOT |
| 문자열 | `+`, `matches`, `contains`, `startsWith`, `endsWith` | 연결, 정규식, 포함, 접두/접미 |

### 4.4 내장 함수

| 함수 | 반환 타입 | 설명 | 예시 |
|------|----------|------|------|
| `Now()` | numeric | 현재 시각 (에포크 초) | `Now()` |
| `Duration(string)` | numeric | 기간을 초 단위로 변환 | `Duration("30d")`, `Duration("7d")` |
| `Properties(key, default)` | any | Default 속성 값 조회 | `Properties("countryCode", "")` |
| `PropertiesComputed(key, default)` | any | Computed 속성 값 조회 | `PropertiesComputed("sessionStartCount", 0)` |
| `PropertiesCustom(key, default)` | any | Custom 속성 값 조회 | `PropertiesCustom("vipTier", "none")` |
| `SemverMatch(range, version)` | boolean | 앱 버전 범위 매칭 | `SemverMatch(">=2.0.0", appVersion)` |

### 4.5 세그멘테이션 조건 유형별 표현식 예시

#### 신규/이탈 기반 (시간 기반)

| 세그먼트 | 표현식 |
|---------|--------|
| 신규 플레이어 (2일 이내) | `Now() - createTime <= Duration("2d")` |
| 최근 활동 플레이어 (30일 이내) | `Now() - updateTime < Duration("30d")` |
| 단기 휴면 플레이어 (7~14일 미접속) | `Now() - updateTime > Duration("7d") and Now() - updateTime < Duration("14d")` |
| 장기 이탈 플레이어 (14일 이상 미접속) | `Now() - updateTime >= Duration("14d")` |

#### 결제/소비 기반 (행동 기반)

| 세그먼트 | 표현식 |
|---------|--------|
| 결제 경험 플레이어 | `PropertiesComputed("purchaseCompletedCount", 0) > 0` |
| 최근 7일 내 결제 플레이어 | `Now() - PropertiesComputed("purchaseCompletedSeenLast", 0) < Duration("7d")` |
| 고가치 플레이어 (누적 결제 $100 이상) | `PropertiesComputed("purchaseCompletedValueSum", 0) >= 10000` |
| 이탈 결제자 (결제 후 30일 미결제) | `PropertiesComputed("purchaseCompletedCount", 0) > 0 and Now() - PropertiesComputed("purchaseCompletedSeenLast", 0) >= Duration("30d")` |

#### 행동/참여도 기반 (이벤트 기반)

| 세그먼트 | 표현식 |
|---------|--------|
| 신규 & 레벨 완료자 | `Now() - PropertiesComputed("firstLevelCompletedSeenLast", 0) < Duration("7d")` |
| 경험 플레이어 (세션 100회 이상) | `PropertiesComputed("sessionStartCount", 0) >= 100` |
| 하드코어 플레이어 | `PropertiesComputed("sessionStartCount", 0) >= 500` |

#### 속성 기반 (인구통계/디바이스 기반)

| 세그먼트 | 표현식 |
|---------|--------|
| 한국 플레이어 | `countryCode == "KR"` |
| 특정 국가 복수 지정 | `countryCode == "KR" or countryCode == "JP"` |
| iOS 플레이어 | `platform == "ios"` |
| 최신 앱 버전 사용자 | `SemverMatch(">=3.0.0", Properties("appVersion", "0.0.0"))` |

#### 복합 조건

| 세그먼트 | 표현식 |
|---------|--------|
| 한국 신규 결제자 | `countryCode == "KR" and PropertiesComputed("purchaseCompletedCount", 0) == 1` |
| 복귀 유도 대상 | `PropertiesComputed("purchaseCompletedCount", 0) > 0 and Now() - updateTime > Duration("7d") and Now() - updateTime < Duration("30d")` |

### 4.6 Include / Exclude 수동 오버라이드

필터 표현식과 독립적으로, 특정 Identity ID를 직접 오디언스에 포함하거나 제외할 수 있다.

- **Include List**: QA 계정, 내부 테스터를 특정 오디언스에 강제 포함
- **Exclude List**: VIP 플레이어, 운영자 계정 등을 특정 캠페인에서 제외

---

## 5. Taxonomy (분류 체계) - 세그멘테이션 기반 정의

Taxonomy 페이지는 세그멘테이션의 원천 데이터인 이벤트와 속성을 관리하는 중앙 허브다.

### 5.1 이벤트(Events) 정의

| 필드 | 타입 | 설명 |
|------|------|------|
| Event Value | string / numeric | Computed Properties 통계 계산에 활용 |
| Event Metadata | 자유 형식 | 이벤트 맥락 정보 (UI 스타일 등) |

이벤트는 클라이언트/서버에서 명시적으로 전송해야 하며, SDK가 자동 수집하지 않는다. 이벤트가 전송되지 않으면 관련 Computed Properties가 비어 있어 오디언스 조건이 불완전해진다.

### 5.2 스키마 검증기 (Validators)

이벤트, Feature Flags, Experiments, Live Events의 값에 대한 JSON 스키마 검증기를 등록하여 데이터 무결성을 보장한다.

---

## 6. 세그멘테이션 연동 기능

### 6.1 Live Events (라이브 이벤트)

시간 제한 이벤트를 특정 오디언스에게 타겟 제공하는 기능이다.

#### Audience 연동 방식

| 설정 | 설명 |
|------|------|
| 대상 오디언스 선택 | 이벤트 생성 시 기존 오디언스 지정 또는 신규 생성 |
| 오디언스 제외 | 특정 오디언스를 이벤트에서 제외 |
| Sticky Membership | 플레이어가 오디언스 조건을 벗어나도 이벤트 종료 시까지 참여 유지 |
| Explicit Join | 플레이어의 명시적 참여 동의 요구 |

#### 이벤트 템플릿 유형

| 템플릿 | 설명 |
|--------|------|
| Dynamic Pricing | 오디언스별 동적 가격 전략 테스트 |
| Timed Offer | 기간 제한 특가 오퍼 |
| Solo Timed Event | 싱글플레이 시간 제한 이벤트 |
| Offer Wall | 오퍼 월 (여러 아이템 번들 제시) |
| Blank Template | 자유 형식 커스텀 이벤트 |

#### 스케줄링

- 시작/종료 시각 지정
- CRON 표현식으로 반복 이벤트 설정
- 메시지 스케줄 연동으로 이벤트 시작/종료 시 알림 자동 발송

### 6.2 Experiments (A/B 테스트)

특정 오디언스를 대상으로 복수의 변형(Variant)을 테스트하여 최적안을 도출하는 기능이다.

#### Audience 연동 방식

| 특성 | 설명 |
|------|------|
| 오디언스 기반 할당 | 오디언스 멤버십에 따라 실험에 자동 참여 |
| 변형 고정 | 실험 중 오디언스 소속이 변경되어도 기존 변형 유지 |
| 오디언스 제외 | 특정 오디언스를 실험에서 제외 가능 |
| 분할 비율 설정 | 각 변형의 노출 비율 설정 (예: 50/50) |

#### 실험 구성

```
Experiment
├── Target Audience: "첫 레벨 완료 7일 이내"
├── Metric: "purchaseCompletedCount" (측정 지표)
├── Variants
│   ├── Variant A: { "offer": "booster_item" }
│   └── Variant B: { "offer": "coin_pack" }
└── Phases
    └── Phase 1: Variant A 50% / Variant B 50%
```

#### 페이즈(Phase) 구조

실험은 복수의 페이즈로 운영되며, 각 페이즈에서 변형별 활성 상태와 분할 비율을 독립적으로 설정할 수 있다.

### 6.3 Feature Flags (기능 플래그)

오디언스별로 다른 게임 설정값을 서버에서 원격 제어하는 기능이다.

#### Audience 연동 방식

| 특성 | 설명 |
|------|------|
| Variant 기반 타겟팅 | 각 Variant에 특정 오디언스를 지정 |
| 우선순위 관리 | 복수 오디언스 중첩 시 우선순위에 따라 적용 Variant 결정 |
| 기본값 설정 | 어떤 오디언스에도 속하지 않는 플레이어에게 적용될 기본값 |

#### 활용 예시

```
Feature Flag: "daily_reward_multiplier"
├── Default Value: 1.0
├── Variant for "VIP Players": 2.0
├── Variant for "New Players": 1.5
└── Variant for "Lapsed Spenders": 1.5 (복귀 유도)
```

#### Hiro 통합

Hiro(Heroic Labs의 게임 시스템 프레임워크)와 연동 시 Economy, Achievements, Energy, Inventory 등 게임 시스템별 전용 Feature Flag 에디터가 제공된다.

### 6.4 Messages (메시징)

오디언스 기반으로 플레이어에게 메시지를 전송하는 기능이다.

#### Audience 연동 방식

메시지 스케줄 생성 시 대상 오디언스를 지정하여 해당 세그먼트 플레이어에게만 메시지를 전달한다.

#### 메시지 템플릿 구성

| 구성 요소 | 설명 |
|----------|------|
| 이름, 제목, 콘텐츠 | 평문 / HTML / JSON 형식 지원 |
| 이미지 URL | 썸네일 또는 배너 이미지 |
| JSON 메타데이터 | 게임 클라이언트에서 처리할 추가 데이터 |
| 다국어 지원 | 플레이어의 `language` 속성에 따라 자동 선택 |
| 속성 삽입 | `{{ propertiesCustom.name }}` 형식으로 개인화 |

#### 전송 채널

| 채널 | 설명 |
|------|------|
| 게임 내 메시지 박스 | 인게임 알림함에 저장 |
| 푸시 알림 | APNS(iOS), FCM(Android) 연동 |
| 이메일 | OneSignal 등 외부 서비스 연동 |

#### 스케줄 유형

- **시간 기반**: 지정 시각에 발송
- **라이브 이벤트 기반**: 이벤트 시작/종료 시 자동 발송

---

## 7. 실시간 세그먼트 업데이트 방식

### 7.1 자동 갱신 (Scheduled Refresh)

오디언스는 **기본 10분 주기**로 멤버십을 재계산한다. 이벤트가 수신되어 Computed Properties가 갱신되면 다음 갱신 사이클에서 해당 플레이어의 오디언스 소속이 변경된다.

### 7.2 프로그래매틱 갱신 (Programmatic Refresh)

Console API를 통해 특정 오디언스를 즉시 재계산하도록 트리거할 수 있다. 운영 이슈 대응이나 캠페인 즉시 실행 시 활용한다.

### 7.3 갱신 지연 고려사항

- 이벤트 전송 후 오디언스 멤버십 반영까지 최대 10분 지연이 발생할 수 있다.
- 실험(Experiment) 참여 후 오디언스 소속이 변경되어도 **기존 변형이 고정**되어 실험 무결성이 유지된다.
- Live Events의 **Sticky Membership** 옵션을 활성화하면 이벤트 종료 전까지 오디언스 조건 이탈에도 참여가 유지된다.

### 7.4 Managed Audience (외부 세그먼트 임포트)

Satori v2.1.6부터 **Managed Audience** 타입이 전용 리소스로 분리되었다. 외부 데이터 플랫폼(Databricks 등)에서 생성한 세그먼트를 Satori로 가져와 LiveOps 기능에 연동할 수 있다.

```
외부 데이터 플랫폼 (Databricks, BigQuery 등)
        │
        │ Console API
        ▼
Managed Audience (Satori)
        │
        ├── Live Events 타겟팅
        ├── Experiments 대상
        ├── Feature Flags 변형
        └── Messages 수신
```

Console API 엔드포인트를 통해 Managed Audience의 Include/Exclude 목록을 프로그래매틱으로 업데이트할 수 있다.

---

## 8. API 및 대시보드 기능

### 8.1 Console API

Satori Console API는 서버 간 통신(Server-to-Server)을 위한 REST API다.

| 항목 | 내용 |
|------|------|
| 기본 URL | `https://api.satori.io/v1/console/` |
| 인증 | HTTP Basic Auth (`Server Key` : 빈 비밀번호) |
| 형식 | `Authorization: Basic <base64(server_key:)>` |
| 스펙 | OpenAPI / Swagger (`satori-yaml.yaml`) |

주요 API 기능:

- Managed Audience의 Include/Exclude 목록 업데이트
- Feature Flags, Live Events, Experiments 목록 조회 (필터링·페이지네이션 지원, v2.1.7)
- Identity 관리 (조회, 삭제)

### 8.2 클라이언트 SDK

세그멘테이션의 기반 데이터인 이벤트와 속성을 전송하기 위한 SDK를 제공한다.

| 플랫폼 | SDK |
|--------|-----|
| Unity / .NET | Satori Unity SDK |
| JavaScript | Satori JS SDK |
| Java / Android | Satori Java SDK |
| Godot | Satori Godot SDK |
| Dart (Flutter) | Satori Dart SDK |
| Swift (iOS) | Satori Swift SDK |
| Defold | Satori Defold SDK |

서버 런타임도 지원한다: TypeScript, Go, Lua

### 8.3 Satori 대시보드 주요 기능

| 기능 | 설명 |
|------|------|
| Overview | 진행 중인 Live Events / Experiments 현황 (1/2/4주 단위) |
| Timeline View | 실험, 라이브 이벤트, 메시지를 시간축으로 통합 관리 |
| Audience Usage Badge | 오디언스별 In Use / Unused 상태 표시 |
| Usage & References 탭 | 특정 오디언스가 어떤 Live Events/Experiments/Feature Flags에서 사용 중인지 확인 |
| Retention Graph | Day 1 ~ Day 30 플레이어 유지율 시각화 |
| Category Labels | 리소스 분류 및 글로벌 필터링 |
| Future-date Testing | QA용 미래 날짜 시뮬레이션 |

---

## 9. Satori 세그멘테이션의 차별화 포인트

| 특징 | 설명 |
|------|------|
| 이벤트 기반 속성 자동 계산 | 이벤트 전송만으로 Count/Sum/Max/Min/SeenLast 통계가 자동 생성됨 |
| 표현식 DSL | 시간 함수, 버전 매칭, 정규표현식을 지원하는 강력한 필터 언어 |
| 무제한 중첩 오디언스 | 동일 플레이어가 복수 오디언스에 소속되어 다양한 LiveOps에 참여 가능 |
| 단일 오디언스, 다기능 재사용 | 하나의 오디언스 정의를 Live Events, Experiments, Feature Flags, Messages에서 공통으로 참조 |
| Managed Audience | 외부 BI/데이터 플랫폼의 세그먼트를 임포트하여 하이브리드 운영 가능 |
| Sticky Membership | 이벤트 참여 후 조건 이탈 시에도 일관된 경험 유지 |
| 폼 빌더 UI | 쿼리 없이 드롭다운으로 오디언스 생성 (Satori 2.0+) |
| Future-date Testing | 시간 기반 세그멘테이션 로직을 미래 날짜로 QA 가능 |

---

## 10. 시사점 및 기획 방향 제안

### 10.1 GLO 서비스에 적용할 세그멘테이션 아키텍처

#### 속성 3계층 구조 채택

```
플레이어 속성 구조
├── Default Properties (자동 수집)
│   ├── countryCode
│   ├── platform
│   ├── createTime
│   └── updateTime
├── Computed Properties (이벤트 기반 자동 계산)
│   ├── sessionStartCount
│   ├── purchaseCompletedCount
│   ├── purchaseCompletedValueSum
│   ├── levelCompletedCount
│   └── {eventName}SeenLast
└── Custom Properties (게임 특화)
    ├── vipTier (string)
    ├── guildName (string)
    ├── totalPlayMinutes (numeric)
    └── characterLevel (numeric)
```

#### 핵심 세그먼트 정의 (GLO 서비스 초기 설계)

| 세그먼트명 | 조건 | 활용 |
|-----------|------|------|
| 신규 플레이어 | 가입 3일 이내 | 온보딩 이벤트 |
| 활성 플레이어 | 최근 7일 내 접속 | 정기 이벤트 |
| 휴면 플레이어 | 7~30일 미접속 | 복귀 유도 캠페인 |
| 이탈 플레이어 | 30일 이상 미접속 | 재활성화 메시지 |
| 결제 경험자 | 결제 1회 이상 | 구매 촉진 이벤트 |
| 이탈 결제자 | 결제 후 30일 이상 미결제 | VIP 복귀 오퍼 |
| 하드코어 | 세션 500회 이상 | 고급 콘텐츠 조기 접근 |
| 한국 플레이어 | countryCode == "KR" | 지역 특화 이벤트 |

### 10.2 기획 방향 제안

1. **Audience를 LiveOps 타겟팅의 유일한 단위로 설계**: Live Events, Experiments, Feature Flags, Messages 모두 Audience를 공통 참조하도록 설계하여 세그멘테이션 로직의 중복을 제거한다.

2. **이벤트 택소노미를 초기에 명확히 정의**: Computed Properties의 품질은 이벤트 설계에 직결되므로, 서비스 초기에 측정할 핵심 행동 이벤트를 체계적으로 정의해야 한다.

3. **폼 빌더 UI를 운영자 기본 도구로 채택**: 게임 기획자/마케터가 코드 없이 세그먼트를 생성할 수 있도록 폼 빌더를 기본 UI로 제공하고, 고급 쿼리 모드는 옵션으로 제공한다.

4. **Sticky Membership과 오디언스 갱신 주기를 이벤트 유형에 맞게 설정**: 결제 유도 이벤트는 Sticky Membership을 적용하여 참여 도중 조건 변경이 경험에 영향을 주지 않도록 한다.

5. **외부 데이터 연동 경로 확보**: 자체 BI 시스템이나 데이터 웨어하우스에서 생성한 고급 세그먼트를 임포트할 수 있는 Managed Audience 상당의 기능을 장기 로드맵에 포함한다.

### 10.3 리스크 요인

| 리스크 | 가능성 | 영향도 | 대응 방안 |
|--------|--------|--------|----------|
| 이벤트 미전송으로 인한 세그멘테이션 오류 | 높음 | 높음 | 이벤트 전송 모니터링 및 알림 체계 구축 |
| 오디언스 갱신 지연 (최대 10분) | 중간 | 중간 | 실시간 타겟팅이 필요한 기능은 별도 처리 경로 설계 |
| 복잡한 필터 표현식으로 인한 운영 오류 | 중간 | 높음 | 폼 빌더 UI 우선 제공, 표현식 검증 로직 추가 |
| 오디언스 중첩으로 인한 복수 LiveOps 노출 | 낮음 | 중간 | 우선순위 규칙 및 제외 목록 정책 수립 |

---

## 11. 출처

| No. | 출처 | URL | 접근일 |
|-----|------|-----|--------|
| 1 | Satori Overview - Heroic Labs Docs | https://heroiclabs.com/docs/satori/concepts/introduction/overview/ | 2026-03-10 |
| 2 | Audiences - Heroic Labs Docs | https://heroiclabs.com/docs/satori/concepts/audiences/ | 2026-03-10 |
| 3 | Filter Expressions - Heroic Labs Docs | https://heroiclabs.com/docs/satori/concepts/audiences/filtering/ | 2026-03-10 |
| 4 | Properties - Heroic Labs Docs | https://heroiclabs.com/docs/satori/concepts/identities/properties/ | 2026-03-10 |
| 5 | Events - Heroic Labs Docs | https://heroiclabs.com/docs/satori/concepts/identities/events/ | 2026-03-10 |
| 6 | Taxonomy - Heroic Labs Docs | https://heroiclabs.com/docs/satori/concepts/taxonomy/ | 2026-03-10 |
| 7 | Live Events - Heroic Labs Docs | https://heroiclabs.com/docs/satori/concepts/live-events/ | 2026-03-10 |
| 8 | Experiments - Heroic Labs Docs | https://heroiclabs.com/docs/satori/concepts/experiments/ | 2026-03-10 |
| 9 | Feature Flags - Heroic Labs Docs | https://heroiclabs.com/docs/satori/concepts/feature-flags/ | 2026-03-10 |
| 10 | Messages - Heroic Labs Docs | https://heroiclabs.com/docs/satori/concepts/messages/ | 2026-03-10 |
| 11 | Metrics - Heroic Labs Docs | https://heroiclabs.com/docs/satori/concepts/metrics/ | 2026-03-10 |
| 12 | Experimenting with Audiences - Heroic Labs Docs | https://heroiclabs.com/docs/satori/guides/experimenting-with-audiences/index.html | 2026-03-10 |
| 13 | Console API - Heroic Labs Docs | https://heroiclabs.com/docs/satori/console/ | 2026-03-10 |
| 14 | Release Notes - Heroic Labs Docs | https://heroiclabs.com/docs/satori/concepts/introduction/release-notes/ | 2026-03-10 |
| 15 | Satori Segmentation Engine - Heroic Labs | https://heroiclabs.com/satori/segmentation/ | 2026-03-10 |
| 16 | Announcing Satori 2.0 - Heroic Labs Blog | https://heroiclabs.com/blog/announcing-satori-20/ | 2026-03-10 |

---

## 변경 이력

| 버전 | 일자 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| v1.0 | 2026-03-10 | 초안 작성 (Satori v2.1.7 기준 전체 세그멘테이션 분석) | researcher |
