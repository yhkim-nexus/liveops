---
id: "DIA-GLO-007"
title: "다이어그램: 모바일 푸시 알림 발송"
project: "GLO"
version: "v1.0"
status: "draft"
created: "2026-03-27"
updated: "2026-03-27"
author: "diagram"
reviewers: []
related_docs:
  - "PRD-GLO-007"
  - "SES-GLO-008"
  - "DIA-GLO-002"
tags:
  - "project:game-liveops"
  - "type:diagram"
  - "topic:push-notification"
  - "status:draft"
  - "phase:planning"
---

# 다이어그램: 모바일 푸시 알림 발송

> Game LiveOps Service의 모바일 푸시 알림 발송 캠페인 관리 시스템을 시각화한 다이어그램 문서. 캠페인 데이터 모델(ERD), 캠페인 라이프사이클 상태 전이, 발송 시퀀스, 캠페인 생성 유저 플로우, 시스템 아키텍처를 Mermaid 다이어그램으로 나타낸다. PRD-GLO-007의 F-037~F-043 기능을 근거로 한다.

## 문서 정보

| 항목 | 내용 |
|------|------|
| 문서 ID | DIA-GLO-007 |
| 버전 | v1.0 |
| 상태 | draft |
| 작성일 | 2026-03-27 |
| 작성자 | diagram |
| 관련 PRD | PRD-GLO-007 |
| 참조 다이어그램 | DIA-GLO-002 |

---

## DIA-029: 푸시 알림 데이터 모델 (ERD)

### 설명

푸시 알림 발송 시스템의 핵심 데이터 모델을 나타낸다. PUSH_CAMPAIGN이 중심 엔티티이며, 오디언스 타겟팅(AUDIENCE), 발송 로그(PUSH_DELIVERY_LOG), A/B 테스트 변형(PUSH_AB_VARIANT), 메시지 템플릿(PUSH_TEMPLATE)이 연결된다. AUDIENCE 엔티티의 전체 정의는 DIA-GLO-001을 참조한다. `audienceId`가 NULL이고 `audienceType = all`인 경우 전체 플레이어를 대상으로 한다.

```mermaid
erDiagram
    PUSH_CAMPAIGN ||--o| AUDIENCE : targeted_by
    PUSH_CAMPAIGN ||--o{ PUSH_DELIVERY_LOG : generates
    PUSH_CAMPAIGN ||--o{ PUSH_AB_VARIANT : splits_into
    PUSH_CAMPAIGN }o--o| PUSH_TEMPLATE : based_on
    PUSH_DELIVERY_LOG }|--|| PLAYER : delivered_to

    PUSH_CAMPAIGN {
        string id PK "캠페인 고유 ID (UUID)"
        string title "캠페인 제목 (관리용, 50자)"
        string body "알림 본문 (200자)"
        string imageUrl "이미지 URL (nullable)"
        string deepLink "딥링크 URL (nullable)"
        jsonb customData "커스텀 데이터 (4KB 제한, nullable)"
        string audienceType "발송 대상 유형 (all | audience | individual)"
        string audienceId FK "오디언스 ID (nullable, audienceType=audience 시 필수)"
        string platformFilter "플랫폼 필터 (all | ios | android)"
        string scheduleType "스케줄 유형 (immediate | scheduled | recurring)"
        datetime scheduledAt "예약 발송 일시 (nullable)"
        string rrule "반복 발송 규칙 (RFC 5545, nullable)"
        string timezone "타임존 (예: Asia/Seoul)"
        boolean localTimezoneEnabled "플레이어 현지 시간 기준 발송 여부"
        int frequencyLimit "최대 발송 횟수 / 일 (nullable)"
        time quietHoursStart "방해 금지 시작 시각 (nullable)"
        time quietHoursEnd "방해 금지 종료 시각 (nullable)"
        string priority "우선순위 (normal | high | critical)"
        string status "캠페인 상태"
        string approvalStatus "승인 상태 (pending | approved | rejected)"
        string approvedBy "승인자 ID (nullable)"
        string createdBy "작성자 ID"
        datetime createdAt "생성 일시"
        datetime updatedAt "수정 일시"
    }

    PUSH_TEMPLATE {
        string id PK "템플릿 고유 ID (UUID)"
        string name "템플릿 이름"
        string category "카테고리 (event | notice | reward | system)"
        string_array tags "태그 목록"
        string titleTemplate "제목 템플릿 (변수 포함, 예: {player_name}님)"
        string bodyTemplate "본문 템플릿 (변수 포함)"
        string_array variables "사용 변수 목록 (예: [player_name, event_name])"
        string createdBy "작성자 ID"
        datetime createdAt "생성 일시"
        datetime updatedAt "수정 일시"
    }

    PUSH_DELIVERY_LOG {
        string id PK "로그 고유 ID (UUID)"
        string campaignId FK "캠페인 ID"
        string playerId FK "플레이어 ID"
        string deviceToken "FCM/APNs 디바이스 토큰"
        string platform "플랫폼 (ios | android)"
        string status "발송 상태 (sent | delivered | opened | converted | failed)"
        string failureReason "실패 사유 (nullable)"
        datetime sentAt "발송 일시"
        datetime deliveredAt "도달 일시 (nullable)"
        datetime openedAt "오픈 일시 (nullable)"
        datetime convertedAt "전환 일시 (nullable)"
    }

    PUSH_AB_VARIANT {
        string id PK "변형 고유 ID (UUID)"
        string campaignId FK "캠페인 ID"
        string variantName "변형 이름 (예: A, B)"
        string title "변형 제목"
        string body "변형 본문"
        string imageUrl "변형 이미지 URL (nullable)"
        string deepLink "변형 딥링크 URL (nullable)"
        int trafficPercentage "트래픽 배분 비율 (%)"
        int sentCount "발송 수"
        int deliveredCount "도달 수"
        int openedCount "오픈 수"
        int convertedCount "전환 수"
    }

    PLAYER {
        string id PK
        string deviceToken "FCM/APNs 토큰"
        string platform "플랫폼 (ios | android)"
        boolean pushOptIn "푸시 수신 동의 여부"
        string timezone "플레이어 타임존"
        datetime createdAt "계정 생성일"
    }

    AUDIENCE {
        string id PK
        string name
        string status
        string environmentId FK
        datetime createdAt
        datetime updatedAt
    }
```

> **참고**
> - `PUSH_CAMPAIGN.status`: `draft` / `pending_approval` / `approved` / `scheduled` / `sending` / `sent` / `failed` / `cancelled`
> - `PUSH_CAMPAIGN.audienceType`: `all`(전체) / `audience`(오디언스 지정, AUDIENCE FK 필수) / `individual`(개별 플레이어 직접 지정)
> - `PUSH_CAMPAIGN.priority`: `normal`(일반) / `high`(높음) / `critical`(긴급, FCM high priority 설정)
> - `PUSH_DELIVERY_LOG.status`: `sent`(발송 완료) → `delivered`(단말 도달) → `opened`(알림 클릭) → `converted`(목표 행동 완료) / `failed`(발송 실패)
> - `PUSH_AB_VARIANT.trafficPercentage` 합계는 반드시 100이어야 한다
> - AUDIENCE, PLAYER 엔티티의 전체 정의는 DIA-GLO-001 참조

---

## DIA-030: 캠페인 라이프사이클 상태 다이어그램

### 설명

푸시 캠페인의 8가지 상태와 각 전이 조건을 나타낸다. Editor 역할은 `draft` 작성 및 승인 요청만 가능하며, Operator 이상 역할이 승인·반려를 처리한다. 발송 실패 시 재시도 3회 후 `failed` 상태로 전이되며, `failed` 캠페인은 새 초안으로 복제하여 재시도할 수 있다.

```mermaid
stateDiagram-v2
    [*] --> draft : 캠페인 생성

    draft --> draft : 편집 (자기 전이)
    draft --> pending_approval : 승인 요청\n(필수 필드 검증 통과)

    pending_approval --> approved : 승인\n(Operator 이상)
    pending_approval --> draft : 반려\n(사유 필수)

    approved --> scheduled : 예약 등록\n(scheduledAt 설정)
    approved --> sending : 즉시 발송\n(scheduleType = immediate)

    scheduled --> sending : 예약 시간 도달\n[스케줄러 자동 트리거]
    scheduled --> cancelled : 발송 취소\n(sending 전까지 가능)

    sending --> sent : 발송 완료\n[전체 배치 처리 완료]
    sending --> failed : 발송 실패\n[재시도 3회 후]

    sent --> [*]
    cancelled --> [*]
    failed --> draft : 새 초안으로 복제\n(retry_as_new)

    note right of sending
        발송 처리 흐름
        ─────────────────────────
        배치 크기: 1,000건/배치
        목표 처리량: 10만 건/분
        재시도: 최대 3회 (지수 백오프)
        부분 실패: PUSH_DELIVERY_LOG
          에 failureReason 기록 후 계속
    end note

    note right of approved
        승인 완료 후 분기
        ─────────────────────────
        immediate → sending 즉시 전이
        scheduled → scheduledAt 등록
        recurring → rrule 기반 반복 등록
    end note
```

> **참고**
> - `draft → pending_approval`: 제목, 본문, audienceType, scheduleType 필수 필드 검증 통과 시 전이 가능
> - `pending_approval → approved`: Operator 이상 역할 필수 (Editor 본인 승인 불가)
> - `scheduled → cancelled`: `sending` 진입 전(발송 시작 전)까지만 취소 가능
> - `failed → draft`: 기존 캠페인 데이터를 복제하여 새 초안 생성, 원본은 `failed` 상태 유지
> - `recurring` 스케줄 유형은 `sent` 전이 없이 rrule에 따라 `scheduled → sending → scheduled` 사이클 반복

---

## DIA-031: 푸시 발송 시퀀스 다이어그램

### 설명

관리자가 캠페인을 생성·승인 요청하고, 승인자가 승인한 후, 스케줄러가 Message Queue에 배치를 삽입하고, Push Worker Pool이 FCM/APNs를 통해 단말로 발송하며, 플레이어 오픈·전환 이벤트가 수집되어 분석 대시보드에 집계되는 end-to-end 발송 흐름을 나타낸다.

```mermaid
sequenceDiagram
    autonumber

    actor Admin as 관리자 (Editor)
    actor Approver as 승인자 (Operator+)
    participant Console as Admin Console
    participant API as Push Campaign Service
    participant DB as Database
    participant AudienceSvc as Audience Service
    participant Scheduler as 스케줄러
    participant MQ as Message Queue
    participant Worker as Push Worker Pool
    participant FCM as FCM / APNs
    participant Device as 플레이어 단말

    Note over Admin, DB: 캠페인 생성 단계

    Admin->>Console: 캠페인 생성 위저드 진입
    Console-->>Admin: Step 1~5 위저드 폼 렌더링

    Admin->>Console: 메시지 작성 (제목/본문/이미지/딥링크)
    Admin->>Console: 오디언스 설정 (audienceType, audienceId)
    Admin->>Console: 스케줄링 설정 (scheduleType, scheduledAt)
    Admin->>Console: 옵션 설정 (빈도제한, 방해금지, 우선순위)

    Console->>API: POST /push-campaigns\n{ title, body, audienceType, scheduleType, ... }
    activate API

    API->>AudienceSvc: 예상 도달 수 조회\n{ audienceId, platformFilter }
    AudienceSvc-->>API: 예상 도달 플레이어 수 반환

    API->>DB: PUSH_CAMPAIGN 저장 (status: draft)
    DB-->>API: campaignId 반환

    API-->>Console: 201 Created { campaignId, estimatedReach }
    deactivate API

    Console-->>Admin: 초안 저장 완료, 예상 도달 수 표시

    Note over Admin, DB: 승인 요청 단계

    Admin->>Console: 승인 요청 클릭
    Console->>API: POST /push-campaigns/{id}/submit
    activate API

    API->>DB: PUSH_CAMPAIGN.status → pending_approval
    DB-->>API: 저장 완료

    API-->>Console: 승인 요청 완료
    deactivate API

    Console-->>Admin: 승인 대기 상태 안내

    Note over Approver, DB: 승인 단계

    Approver->>Console: 승인 대기 캠페인 목록 확인
    Approver->>Console: 캠페인 상세 검토 후 승인 클릭
    Console->>API: POST /push-campaigns/{id}/approve
    activate API

    API->>DB: PUSH_CAMPAIGN.status → approved\nPUSH_CAMPAIGN.approvalStatus → approved\nPUSH_CAMPAIGN.approvedBy 기록

    alt scheduleType = immediate
        API->>MQ: 즉시 발송 잡 삽입\n{ campaignId, batchSize: 1000 }
        API->>DB: PUSH_CAMPAIGN.status → sending
    else scheduleType = scheduled / recurring
        API->>Scheduler: 예약 등록\n{ campaignId, scheduledAt, rrule }
        Scheduler-->>API: 등록 완료
        API->>DB: PUSH_CAMPAIGN.status → scheduled
    end

    API-->>Console: 승인 완료 { status }
    deactivate API

    Note over Scheduler, FCM: 발송 처리 단계

    Scheduler->>MQ: 예약 시간 도달, 발송 잡 삽입\n{ campaignId, batchSize: 1000 }
    MQ->>API: status → sending 업데이트 요청
    API->>DB: PUSH_CAMPAIGN.status → sending

    loop 배치 처리 (1,000건/배치)
        Worker->>MQ: 배치 잡 수신
        Worker->>DB: 발송 대상 플레이어 토큰 조회\n(pushOptIn = true, 빈도제한/방해금지 검증)
        DB-->>Worker: 플레이어 디바이스 토큰 목록

        Worker->>FCM: FCM/APNs 배치 발송 요청\n{ tokens[], title, body, data }
        activate FCM
        FCM-->>Worker: 발송 결과 콜백\n{ success[], failure[] }
        deactivate FCM

        Worker->>DB: PUSH_DELIVERY_LOG 저장\n(status: sent / failed, failureReason)
    end

    Worker->>API: 전체 배치 처리 완료
    API->>DB: PUSH_CAMPAIGN.status → sent

    Note over Device, DB: 이벤트 추적 단계

    Device->>API: 알림 클릭 이벤트\nPOST /push-events/open\n{ campaignId, playerId }
    API->>DB: PUSH_DELIVERY_LOG.status → opened\nopenedAt 기록

    Device->>API: 목표 행동 완료 이벤트\nPOST /push-events/convert\n{ campaignId, playerId }
    API->>DB: PUSH_DELIVERY_LOG.status → converted\nconvertedAt 기록

    Note over Admin, DB: 분석 조회 단계

    Admin->>Console: 발송 분석 대시보드 조회
    Console->>API: GET /push-campaigns/{id}/analytics
    API->>DB: PUSH_DELIVERY_LOG 집계\n(sent / delivered / opened / converted 수)
    DB-->>API: 집계 결과 반환
    API-->>Console: 발송률 / 도달률 / 오픈율 / 전환율
    Console-->>Admin: 분석 대시보드 렌더링
```

> **참고**
> - Push Worker Pool은 N대로 수평 확장, 목표 처리량 10만 건/분 (PRD-GLO-007 NFR)
> - 빈도 제한(frequencyLimit) 및 방해 금지 시간(quietHoursStart~End)은 Worker가 토큰 조회 시 필터링
> - FCM 실패(invalid token, unregistered 등)는 PUSH_DELIVERY_LOG에 failureReason 기록 후 다음 배치 계속 진행
> - `localTimezoneEnabled = true`인 경우 플레이어 타임존 기준으로 발송 시각을 조정하여 배치 분산 처리

---

## DIA-032: 캠페인 생성 유저 플로우 (플로우차트)

### 설명

관리자가 캠페인 목록 페이지에서 "새 캠페인"을 클릭하여 5단계 위저드를 통해 캠페인을 작성하고 발송까지 완료하는 전체 유저 플로우를 나타낸다. 각 단계의 유효성 검증 분기와 역할별 처리 경로(Editor/Operator+)를 포함한다.

```mermaid
flowchart TD
    Start([캠페인 목록 페이지]) --> A[새 캠페인 버튼 클릭]
    A --> B[Step 1: 메시지 작성\n제목 / 본문 / 이미지 / 딥링크]

    B --> C{유효성 검증\n제목·본문 필수}
    C -->|실패| B
    C -->|통과| D[Step 2: 오디언스 선택\n전체 / 오디언스 / 개별]

    D --> E[수신 동의 · 플랫폼 필터 설정]
    E --> F[예상 도달 수 조회]
    F --> G{예상 도달 수\n0명?}
    G -->|Yes| H[경고 표시: 발송 대상 없음\n오디언스 재설정 권고]
    H --> D
    G -->|No| I[Step 3: 스케줄링\n즉시 / 예약 / 반복]

    I --> J{scheduleType}
    J -->|immediate| K[발송 시각 없음]
    J -->|scheduled| L[scheduledAt 입력\n타임존 선택]
    J -->|recurring| M[rrule 설정\n반복 주기 · 종료 조건]
    K --> N[Step 4: 옵션 설정]
    L --> N
    M --> N

    N --> O[빈도 제한 설정\n일 최대 발송 횟수]
    O --> P[방해 금지 시간 설정\nquietHoursStart ~ End]
    P --> Q[우선순위 선택\nnormal / high / critical]
    Q --> R[Step 5: 검토 및 제출\n전체 설정 확인]

    R --> S{역할 확인}
    S -->|Editor| T[초안 저장\nstatus: draft]
    S -->|Operator+| U[승인 요청 또는\n초안 저장 선택]

    T --> V[승인 요청 클릭\nstatus: pending_approval]
    U --> V

    V --> W{승인자 검토}
    W -->|반려| X[반려 사유 표시\n초안으로 복귀]
    X --> B
    W -->|승인| Y{scheduleType}

    Y -->|immediate| Z[즉시 발송 시작\nstatus: sending]
    Y -->|scheduled / recurring| AA[예약 등록 완료\nstatus: scheduled]

    Z --> AB[발송 완료\nstatus: sent]
    AA --> AC[예약 시간 대기]
    AC --> AB

    AB --> End([분석 대시보드 이동])

    style Start fill:#e1f5fe
    style End fill:#c8e6c9
    style G fill:#fff9c4
    style C fill:#fff9c4
    style S fill:#fff9c4
    style W fill:#fff9c4
    style Y fill:#fff9c4
    style J fill:#fff9c4
    style H fill:#ffccbc
    style X fill:#ffccbc
```

> **참고**
> - 위저드 각 Step은 이전 단계로 자유롭게 이동 가능 (Back 버튼)
> - Step 2 오디언스 선택 시 예상 도달 수를 실시간으로 표시 (F-038)
> - 예상 도달 수 0명 경고는 비차단(non-blocking) 경고로, 강제 진행은 가능하나 권고하지 않음
> - Editor 역할은 승인 요청만 가능하며, 직접 승인 불가 (F-037 수용 기준)
> - Operator 이상은 위저드 완료 즉시 승인 요청 또는 초안 저장 중 선택 가능

---

## DIA-033: 푸시 알림 시스템 아키텍처

### 설명

모바일 푸시 알림 발송 시스템의 전체 컴포넌트 구성과 데이터 흐름을 나타낸다. Admin Console에서 시작하는 캠페인 관리 흐름, Message Queue를 통한 비동기 발송 처리, FCM/APNs를 통한 단말 발송, Analytics Service를 통한 지표 집계로 구성된다. Rate Limiter와 Audience Service는 모든 발송 경로에 관여하는 횡단 관심사(cross-cutting concern)로 표시한다.

```mermaid
flowchart TB
    subgraph ClientLayer["Client Layer"]
        Console[Admin Console\n캠페인 관리 UI]
    end

    subgraph GatewayLayer["API Gateway Layer"]
        GW[API Gateway\n인증 · RBAC 권한 검증]
    end

    subgraph ServiceLayer["Service Layer"]
        CampaignSvc[Push Campaign Service\n캠페인 CRUD · 승인 · 상태 관리]
        AudienceSvc[Audience Service\n타겟 오디언스 조회\nPRD-GLO-001 연동]
        TemplateSvc[Template Service\n템플릿 CRUD · 변수 치환]
        Scheduler[Scheduler\ncron 기반 예약 · 반복 발송 트리거]
        RateLimiter[Rate Limiter\n빈도 제한 · 방해 금지 시간 검증]
        AnalyticsSvc[Analytics Service\n발송 · 도달 · 오픈 · 전환 집계]
    end

    subgraph QueueLayer["Async Processing Layer"]
        MQ[(Message Queue\nRedis / RabbitMQ\n발송 작업 큐)]
        WorkerPool[Push Worker Pool\n병렬 발송 워커 N대\n1,000건 / 배치]
    end

    subgraph ExternalLayer["External Push Gateway"]
        FCM[FCM\nFirebase Cloud Messaging\nAndroid 푸시]
        APNs[APNs\nApple Push Notification service\niOS 푸시]
    end

    subgraph DataLayer["Data Layer"]
        DB[(PostgreSQL\nPUSH_CAMPAIGN\nPUSH_DELIVERY_LOG\nPUSH_AB_VARIANT\nPUSH_TEMPLATE)]
        Cache[(Redis Cache\n예상 도달 수\n발송 상태)]
    end

    subgraph DeviceLayer["Device Layer"]
        Android([Android 단말])
        iOS([iOS 단말])
    end

    Console --> GW
    GW --> CampaignSvc
    GW --> TemplateSvc
    GW --> AnalyticsSvc

    CampaignSvc --> AudienceSvc
    CampaignSvc --> RateLimiter
    CampaignSvc --> DB
    CampaignSvc --> Cache
    CampaignSvc --> Scheduler
    CampaignSvc --> MQ

    Scheduler --> MQ
    TemplateSvc --> DB

    MQ --> WorkerPool
    WorkerPool --> RateLimiter
    WorkerPool --> DB
    WorkerPool --> FCM
    WorkerPool --> APNs

    FCM --> Android
    APNs --> iOS

    Android -->|오픈 · 전환 이벤트| GW
    iOS -->|오픈 · 전환 이벤트| GW

    GW --> AnalyticsSvc
    AnalyticsSvc --> DB
    AnalyticsSvc --> Cache

    style ClientLayer fill:#e3f2fd
    style GatewayLayer fill:#fff3e0
    style ServiceLayer fill:#e8f5e9
    style QueueLayer fill:#f3e5f5
    style ExternalLayer fill:#fce4ec
    style DataLayer fill:#e0f2f1
    style DeviceLayer fill:#fff8e1
```

**컴포넌트 역할 요약**

| 컴포넌트 | 역할 | 비고 |
|----------|------|------|
| Admin Console | 캠페인 생성·관리 웹 UI | Next.js 기반 관리자 대시보드 |
| API Gateway | 인증/인가, RBAC 역할 검증 | JWT 기반, Editor/Operator/Admin 역할 구분 |
| Push Campaign Service | 캠페인 CRUD, 상태 전이, 승인 처리 | DIA-030 상태 머신 구현 |
| Audience Service | 타겟 오디언스 플레이어 목록 조회 | PRD-GLO-001 세그멘테이션 인프라 재사용 |
| Template Service | 메시지 템플릿 관리, 변수 치환 처리 | F-040 |
| Scheduler | cron 기반 예약·반복 발송 트리거 | rrule(RFC 5545) 파싱 |
| Rate Limiter | 빈도 제한(일 최대 N회), 방해 금지 시간 검증 | F-042, Redis 기반 카운터 |
| Message Queue | 발송 작업 비동기 큐잉 | Redis / RabbitMQ |
| Push Worker Pool | FCM/APNs API 호출, 배치 병렬 처리 | 수평 확장, 목표 10만 건/분 |
| FCM | Android 푸시 발송 게이트웨이 | Firebase Cloud Messaging |
| APNs | iOS 푸시 발송 게이트웨이 | Apple Push Notification service |
| Analytics Service | 발송/도달/오픈/전환 이벤트 집계 | F-041 |
| PostgreSQL | 캠페인·발송 로그·A/B 변형·템플릿 영속 저장 | - |
| Redis Cache | 예상 도달 수, 발송 상태 캐싱 | TTL 기반 |

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
|------|------|-----------|--------|
| v1.0 | 2026-03-27 | 초안 작성 - 5종 다이어그램 (ERD, 캠페인 라이프사이클 상태 머신, 발송 시퀀스, 캠페인 생성 유저 플로우, 시스템 아키텍처) | diagram |
