---
id: "DIA-GLO-002"
title: "다이어그램: 라이브 이벤트 생성 및 스케줄링"
project: "GLO"
version: "v1.0"
status: "draft"
created: "2026-03-23"
updated: "2026-03-23"
author: "diagram"
reviewers: []
related_docs:
  - "PRD-GLO-002"
  - "UX-GLO-002"
  - "DIA-GLO-001"
tags:
  - "project:game-liveops"
  - "type:diagram"
  - "topic:live-events"
---

# 다이어그램: 라이브 이벤트 생성 및 스케줄링

> Game LiveOps Service의 라이브 이벤트 생성·승인·스케줄링·런타임 타겟팅·메트릭 수집 전 과정을 시각화한 다이어그램 문서. DIA-GLO-001의 LIVE_EVENT 엔티티를 확장하여 이벤트 수명 주기(Lifecycle) 전반을 다룬다.

## 문서 정보

| 항목 | 내용 |
|------|------|
| 문서 ID | DIA-GLO-002 |
| 버전 | v1.0 |
| 상태 | draft |
| 작성일 | 2026-03-23 |
| 작성자 | diagram |
| 관련 PRD | PRD-GLO-002 |
| 관련 UX | UX-GLO-002 |
| 참조 다이어그램 | DIA-GLO-001 |

---

## DIA-010: ERD (Entity Relationship Diagram)

### 설명

DIA-GLO-001의 LIVE_EVENT 엔티티를 확장하여 라이브 이벤트 시스템 전체 데이터 모델을 나타낸다. LIVE_EVENT를 중심으로 스케줄(EVENT_SCHEDULE), 페이즈(EVENT_PHASE), 승인 이력(EVENT_APPROVAL), 일별 성과 지표(EVENT_METRICS), 상태 변경 로그(EVENT_STATE_LOG)가 연결된다. `audience_id`가 NULL인 경우 전체 플레이어를 대상으로 한다. AUDIENCE 엔티티는 DIA-GLO-001에서 정의된 엔티티를 참조한다.

```mermaid
erDiagram
    LIVE_EVENT ||--o| AUDIENCE : targeted_by
    LIVE_EVENT ||--|| EVENT_SCHEDULE : has
    LIVE_EVENT ||--o{ EVENT_PHASE : contains
    LIVE_EVENT ||--o{ EVENT_APPROVAL : reviewed_by
    LIVE_EVENT ||--o{ EVENT_METRICS : measured_by
    LIVE_EVENT ||--o{ EVENT_STATE_LOG : logged_by

    LIVE_EVENT {
        string id PK
        string environment_id FK
        string name
        text description
        string event_type
        string priority
        string status
        string audience_id FK
        boolean sticky_membership
        jsonb metadata
        int payload_schema_version
        string created_by
        datetime created_at
        datetime updated_at
    }

    EVENT_SCHEDULE {
        string id PK
        string event_id FK
        string schedule_type
        datetime start_at
        datetime end_at
        string timezone
        string rrule
        datetime created_at
        datetime updated_at
    }

    EVENT_PHASE {
        string id PK
        string event_id FK
        string phase_type
        int phase_order
        interval start_offset
        interval duration
        jsonb config
        datetime created_at
    }

    EVENT_APPROVAL {
        string id PK
        string event_id FK
        string requested_by
        datetime requested_at
        string reviewer_id
        datetime reviewed_at
        string decision
        text rejection_reason
        jsonb version_snapshot
    }

    EVENT_METRICS {
        string id PK
        string event_id FK
        date metric_date
        int impressions
        int participants
        decimal participation_rate
        decimal completion_rate
        decimal revenue
        decimal arpu
        decimal conversion_rate
        datetime computed_at
    }

    EVENT_STATE_LOG {
        string id PK
        string event_id FK
        string from_status
        string to_status
        string actor
        text reason
        datetime created_at
    }

    AUDIENCE {
        string id PK
        string name
        string status
        string environment_id FK
        datetime created_at
        datetime updated_at
    }
```

> **참고**
> - `event_type`: `promotion` / `seasonal` / `competitive` / `special`
> - `priority`: `low` / `medium` / `high` / `critical`
> - `status`: `draft` / `pending_approval` / `scheduled` / `active` / `paused` / `ended` / `archived`
> - `EVENT_SCHEDULE.schedule_type`: `simple` / `recurring` (반복 시 `rrule` 필드에 RFC 5545 형식 저장)
> - `EVENT_PHASE.phase_type`: `main` / `warmup` / `cooldown` / `bonus` (MVP는 `main` 단일 페이즈)
> - `EVENT_APPROVAL.decision`: `pending` / `approved` / `rejected`
> - `AUDIENCE` 엔티티 전체 정의는 DIA-GLO-001 참조

---

## DIA-011: 이벤트 상태 머신 다이어그램

### 설명

라이브 이벤트의 7가지 상태(`draft` → `pending_approval` → `scheduled` → `active` → `paused` → `ended` → `archived`)와 각 전이 조건을 나타낸다. 시스템 자동 전이(스케줄러 기반)와 관리자 수동 전이를 구분하여 표시하며, 긴급 제어 흐름(Pause / Kill)을 별도 note로 강조한다. `draft → draft` 자기 전이는 편집 작업을 의미한다. Extend(종료 시각 연장)는 상태 전이를 수반하지 않으므로 note로만 표시한다.

```mermaid
stateDiagram-v2
    [*] --> draft : 이벤트 생성

    draft --> draft : 편집 (자기 전이)
    draft --> pending_approval : 승인 요청\n(필수 필드 검증 통과)

    pending_approval --> scheduled : 승인 완료\n(관리자 승인)
    pending_approval --> draft : 반려\n(사유 포함)

    scheduled --> active : start_at 도달\n[시스템 자동]

    active --> paused : 수동 일시정지\n(사유 입력 필수)
    paused --> active : 재개

    active --> ended : end_at 도달 [자동]\n또는 긴급 종료 [수동, 사유 필수]
    paused --> ended : 긴급 종료\n(사유 입력 필수)

    ended --> archived : 보관 처리

    archived --> [*]

    note right of active
        긴급 제어 흐름
        ─────────────────────
        Pause: active → paused
          자동 연장 없음
        Kill: active/paused → ended
          즉시 종료, 사유 필수
        Extend: end_at 연장
          (상태 전이 없음, active 유지)
    end note
```

---

## DIA-012: 이벤트 생성~승인~활성화 시퀀스 다이어그램

### 설명

관리자가 이벤트를 생성하고 승인을 요청한 후, 승인자가 검토하여 스케줄러에 등록되고 `start_at` 도달 시 이벤트가 자동 활성화되는 전체 시퀀스를 나타낸다. 승인 요청 시점에 `version_snapshot`이 함께 저장되어 이후 이벤트 내용 변경 이력을 추적할 수 있다. 활성화 직후 Audience 엔진을 통해 타겟 오디언스 멤버십이 조회(sticky 설정 시 스냅샷 생성)된다.

```mermaid
sequenceDiagram
    autonumber

    actor Admin as 관리자
    actor Approver as 승인자
    participant Dashboard as 대시보드
    participant API as LiveOps API
    participant DB as Database
    participant Scheduler as 스케줄러
    participant AudienceEngine as Audience 엔진

    Admin->>Dashboard: 이벤트 생성 메뉴 진입
    Dashboard-->>Admin: 이벤트 생성 폼 렌더링

    Admin->>Dashboard: 기본 정보 입력\n(name, event_type, priority)
    Admin->>Dashboard: 스케줄링 설정\n(start_at, end_at, timezone, rrule)
    Admin->>Dashboard: 오디언스 선택\n(특정 Audience 또는 전체 플레이어)

    Dashboard->>API: POST /events\n{ name, type, priority, schedule, audience_id }
    activate API

    API->>DB: LIVE_EVENT 저장 (status: draft)
    API->>DB: EVENT_SCHEDULE 저장
    DB-->>API: event_id 반환

    API-->>Dashboard: 201 Created { event_id }
    deactivate API

    Dashboard-->>Admin: 이벤트 초안 저장 완료

    Admin->>Dashboard: 승인 요청 클릭
    Dashboard->>API: POST /events/{id}/approval-request
    activate API

    API->>DB: EVENT_APPROVAL 생성\n(decision: pending, version_snapshot 포함)
    API->>DB: LIVE_EVENT.status → pending_approval
    API->>DB: EVENT_STATE_LOG 기록\n(draft → pending_approval)

    API-->>Dashboard: 승인 요청 완료
    deactivate API

    Dashboard-->>Admin: 승인 대기 상태 안내

    Approver->>Dashboard: 승인 대기 이벤트 목록 확인
    Approver->>Dashboard: 이벤트 상세 검토 후 승인 클릭
    Dashboard->>API: POST /events/{id}/approve
    activate API

    API->>DB: EVENT_APPROVAL.decision → approved
    API->>DB: LIVE_EVENT.status → scheduled
    API->>DB: EVENT_STATE_LOG 기록\n(pending_approval → scheduled)

    API->>Scheduler: 스케줄 등록\n{ event_id, start_at }
    Scheduler-->>API: 등록 완료

    API-->>Dashboard: 승인 완료 { status: scheduled }
    deactivate API

    Dashboard-->>Approver: 스케줄 등록 완료 안내

    Note over Scheduler, API: start_at 도달 시 자동 트리거

    Scheduler->>API: 활성화 트리거 { event_id }
    activate API

    API->>DB: LIVE_EVENT.status → active
    API->>DB: EVENT_STATE_LOG 기록\n(scheduled → active)

    API->>AudienceEngine: 타겟 오디언스 멤버십 조회\n(sticky_membership=true 시 스냅샷 생성)
    AudienceEngine-->>API: 오디언스 멤버 목록 반환

    API-->>Scheduler: 활성화 완료
    deactivate API
```

---

## DIA-013: 이벤트 런타임 타겟팅 시퀀스 다이어그램

### 설명

게임 클라이언트가 SDK Gateway를 통해 활성 이벤트 목록을 요청할 때, Redis 캐시 조회(TTL 1분) → 캐시 미스 시 LiveOps API 호출 → Audience 엔진을 통한 플레이어 오디언스 멤버십 확인 → 이벤트 필터링 → 캐시 저장 순서로 처리되는 흐름을 나타낸다. `audience_id = NULL`인 이벤트는 전체 플레이어에게 반환되며, 오디언스 지정 이벤트는 해당 멤버십 보유 여부로 필터링된다.

```mermaid
sequenceDiagram
    autonumber

    participant GC as 게임 클라이언트
    participant GW as SDK Gateway
    participant Cache as Cache (Redis)
    participant API as LiveOps API
    participant AudienceEngine as Audience 엔진
    participant DB as Database

    GC->>GW: GET /player/{id}/active-events

    GW->>Cache: 캐시 조회\n(key: player:{id}:active-events)

    alt 캐시 히트 (TTL 1분 이내)
        Cache-->>GW: 캐시된 이벤트 목록 반환
        GW-->>GC: 활성 이벤트 목록 (캐시)
    else 캐시 미스
        Cache-->>GW: 캐시 없음

        GW->>API: 활성 이벤트 조회 요청\n{ player_id }
        activate API

        API->>DB: status = active 이벤트 목록 조회
        DB-->>API: 활성 이벤트 목록

        API->>AudienceEngine: 플레이어 오디언스 멤버십 확인\n{ player_id }
        activate AudienceEngine

        AudienceEngine->>DB: AUDIENCE_MEMBERSHIP 조회\n(identity_id = player_id)
        DB-->>AudienceEngine: 소속 audience_id 목록
        AudienceEngine-->>API: 소속 오디언스 목록 반환
        deactivate AudienceEngine

        Note over API: 이벤트 필터링 규칙
        Note over API: audience_id = NULL → 전체 포함
        Note over API: audience_id 지정 → 소속 오디언스 매칭 시 포함

        API->>Cache: 필터링 결과 캐시 저장\n(TTL 1분)
        Cache-->>API: 저장 완료

        API-->>GW: 활성 이벤트 목록\n(metadata 포함)
        deactivate API

        GW-->>GC: 활성 이벤트 목록 (신규 조회)
    end
```

---

## DIA-014: 데이터 흐름 다이어그램 (메트릭 수집)

### 설명

게임 클라이언트·서버·SDK Gateway에서 발생하는 원시 데이터가 이벤트 수집기를 거쳐 일별 배치로 집계되고, EVENT_METRICS 테이블에 저장된 후 성과 대시보드에 표시되는 end-to-end 데이터 흐름을 나타낸다. 성과 대시보드는 참여 지표(노출·참여율·완료율)와 수익 지표(수익·ARPU·전환율)를 함께 제공하며, 기준선 비교 엔진을 통해 이전 이벤트 또는 전체 평균과의 비교를 지원한다.

```mermaid
flowchart TB
    subgraph Source["이벤트 소스"]
        GC([게임 클라이언트\n참여 이벤트])
        GS([게임 서버\n결제 · 진행도])
        SDK([SDK Gateway\n노출 로그])
    end

    subgraph Processing["데이터 처리"]
        EI[이벤트 수집기]
        AGG[메트릭 집계 엔진\n일별 배치]
    end

    subgraph Storage["저장소"]
        DB[(EVENT_METRICS\n테이블)]
    end

    subgraph Presentation["성과 대시보드"]
        direction TB
        ENG[기준선 비교 엔진\n이전 이벤트 · 전체 평균]
        subgraph Metrics["지표 패널"]
            PM[참여 지표\n노출 · 참여율 · 완료율]
            RM[수익 지표\n수익 · ARPU · 전환율]
        end
    end

    GC -->|참여 이벤트 스트림| EI
    GS -->|결제 · 진행도 이벤트| EI
    SDK -->|노출 로그| EI

    EI -->|원시 이벤트| AGG
    AGG -->|집계 결과 저장| DB

    DB -->|metric_date 기준 조회| ENG
    ENG -->|비교 기준값 제공| PM
    ENG -->|비교 기준값 제공| RM

    DB -->|일별 지표| PM
    DB -->|일별 지표| RM

    style Source fill:#e3f2fd
    style Processing fill:#fff3e0
    style Storage fill:#e8f5e9
    style Presentation fill:#f3e5f5
    style Metrics fill:#fce4ec
```

**집계 지표 설명**

| 지표 | 필드 | 설명 |
| --- | --- | --- |
| 노출 | impressions | SDK Gateway 노출 로그 집계 |
| 참여율 | participation_rate | 참여자 수 / 노출 수 |
| 완료율 | completion_rate | 이벤트 완료자 수 / 참여자 수 |
| 수익 | revenue | 이벤트 기간 결제 금액 합계 |
| ARPU | arpu | 수익 / 참여자 수 |
| 전환율 | conversion_rate | 결제 완료자 수 / 참여자 수 |


---

## 변경 이력

| 버전 | 일자 | 변경 내용 | 작성자 |
|------|------|-----------|--------|
| v1.0 | 2026-03-23 | 초안 작성 - 5종 다이어그램 (ERD, 상태 머신, 생성~활성화 시퀀스, 런타임 타겟팅 시퀀스, 메트릭 데이터 흐름) | diagram |
