---
id: "DIA-GLO-001"
title: "다이어그램: 플레이어 세그멘테이션"
project: "GLO"
version: "v1.1"
status: "draft"
created: "2026-03-10"
updated: "2026-03-26"
author: "diagram"
reviewers: []
related_docs:
  - "PRD-GLO-001"
  - "UX-GLO-001"
  - "RES-GLO-003"
  - "MTG-GLO-003"
tags:
  - "project:game-liveops"
  - "type:diagram"
  - "topic:player-segmentation"
---

# 다이어그램: 플레이어 세그멘테이션

> Game LiveOps Service의 플레이어 세그멘테이션 시스템 전체 구조, 데이터 흐름, 엔티티 관계, 주요 시퀀스, 상태 전이, 필터 처리 흐름을 시각화한 다이어그램 문서.

## 문서 정보

| 항목 | 내용 |
|------|------|
| 문서 ID | DIA-GLO-001 |
| 버전 | v1.0 |
| 상태 | draft |
| 작성일 | 2026-03-10 |
| 작성자 | diagram |
| 관련 PRD | PRD-GLO-001 |
| 관련 UX | UX-GLO-001 |
| 참조 리서치 | RES-GLO-003 |

---

## DIA-001: 시스템 아키텍처

### 설명

플레이어 세그멘테이션 시스템의 전체 컴포넌트 구성과 계층별 역할을 나타낸다. 게임 클라이언트/서버로부터 이벤트를 수집하여 Identity 프로필을 구성하고, Properties를 갱신하며, Audience를 계산하여 LiveOps 모듈에 타겟팅 정보를 제공하는 흐름을 보여준다. 외부 BI 시스템을 통한 Managed Audience 주입 경로도 포함한다.

> **화면 매핑**: 폼 빌더 → SCR-002, Audience 관리 → SCR-001/SCR-003, Analytics → SCR-003, 속성 관리 → SCR-004, 이벤트 택소노미 → SCR-005

```mermaid
flowchart TB
    subgraph External["외부 시스템"]
        GC[게임 클라이언트]
        GS[게임 서버]
        BI[외부 BI / 데이터 플랫폼]
    end

    subgraph Ingestion["이벤트 수집 계층"]
        EI[이벤트 수집기\nEvent Ingestion]
        MA[Managed Audience\n임포터]
    end

    subgraph Core["LiveOps 핵심 엔진"]
        direction TB
        ID[Identity 엔진\n플레이어 프로필 관리]
        PE[Properties 엔진\nDefault / Computed / Custom]
        AE[Audience 엔진\n필터 평가 · 멤버십 계산]
    end

    subgraph LiveOps["LiveOps 모듈"]
        LE[Live Events]
        EX[Experiments\nA/B Test]
        FF[Feature Flags]
        MSG[Messages]
    end

    subgraph Admin["관리자 대시보드"]
        FB[폼 빌더\nFilter Builder]
        AP[Audience 관리]
        AN[Analytics / 미리보기]
    end

    GC -->|이벤트 전송| EI
    GS -->|이벤트 전송| EI
    BI -->|CSV / API| MA

    EI --> ID
    MA --> AE

    ID --> PE
    PE -->|속성 갱신| AE

    AE -->|타겟 Audience| LE
    AE -->|타겟 Audience| EX
    AE -->|타겟 Audience| FF
    AE -->|타겟 Audience| MSG

    Admin -->|Audience 정의 저장| AE
    FB -->|필터 표현식 DSL| AP
    AP --> AE
    AE -->|멤버십 통계| AN

    style External fill:#e3f2fd
    style Ingestion fill:#fff3e0
    style Core fill:#e8f5e9
    style LiveOps fill:#f3e5f5
    style Admin fill:#fce4ec
```

---

## DIA-002: 데이터 흐름 다이어그램

### 설명

이벤트 전송부터 LiveOps 타겟팅 적용까지의 end-to-end 데이터 흐름을 나타낸다. Properties 3종(Default / Computed / Custom)의 갱신 경로, Audience 재계산 주기(10분 배치 또는 즉시), 외부 BI를 통한 Managed Audience 주입 경로를 모두 포함한다.

```mermaid
flowchart LR
    subgraph Source["이벤트 소스"]
        GC([게임 클라이언트])
        GS([게임 서버])
        BI([외부 BI])
    end

    subgraph Processing["데이터 처리"]
        EQ[(이벤트 큐)]
        IP[Identity\n프로필 갱신]
        DP[Default Properties\n자동 수집]
        CP[Computed Properties\n이벤트 기반 계산]
        CUS[Custom Properties\n수동 설정]
    end

    subgraph Audience["Audience 계산"]
        FE[필터 표현식\n평가 엔진]
        AM[(Audience\nMembership DB)]
        RE{재계산 트리거}
    end

    subgraph Targeting["LiveOps 타겟팅"]
        LE[Live Events]
        EX[Experiments]
        FF[Feature Flags]
        MSG[Messages]
    end

    GC -->|SDK 이벤트| EQ
    GS -->|서버 이벤트| EQ
    BI -->|Managed Audience| AM

    EQ --> IP
    IP --> DP
    IP --> CP

    DP -->|countryCode\nplatform\ncreateTime\nupdateTime| RE
    CP -->|Count\nSeenLast\nValueSum\nValueHigh/Low| RE
    CUS -->|string / numeric| RE

    RE -->|즉시 트리거| FE
    RE -->|10분 배치| FE

    FE -->|매칭 결과| AM

    AM -->|Audience 멤버십| LE
    AM -->|Audience 멤버십| EX
    AM -->|Audience 멤버십| FF
    AM -->|Audience 멤버십| MSG

    style Source fill:#e3f2fd
    style Processing fill:#fff9c4
    style Audience fill:#e8f5e9
    style Targeting fill:#f3e5f5
```

---

## DIA-003: ERD (Entity Relationship Diagram)

### 설명

플레이어 세그멘테이션 시스템의 핵심 엔티티와 관계를 나타낸다. Identity를 중심으로 Default / Computed / Custom Properties가 연결되고, Audience는 AudienceFilter로 정의되며 AudienceMembership을 통해 Identity와 연결된다. LiveEvent, Experiment, FeatureFlag, Message는 모두 Audience를 타겟팅 단위로 참조한다.

```mermaid
erDiagram
    IDENTITY ||--|| DEFAULT_PROPERTY : has
    IDENTITY ||--o{ COMPUTED_PROPERTY : has
    IDENTITY ||--o{ CUSTOM_PROPERTY : has
    IDENTITY ||--o{ EVENT : generates
    IDENTITY ||--o{ AUDIENCE_MEMBERSHIP : belongs_to

    IDENTITY {
        string id PK
        string user_id
        string environment_id FK
        datetime created_at
        datetime updated_at
    }

    DEFAULT_PROPERTY {
        string id PK
        string identity_id FK
        string country_code
        string platform
        datetime create_time
        datetime update_time
    }

    COMPUTED_PROPERTY {
        string id PK
        string identity_id FK
        string event_name
        int count
        datetime seen_last
        decimal value_sum
        decimal value_high
        decimal value_low
        datetime computed_at
    }

    CUSTOM_PROPERTY {
        string id PK
        string identity_id FK
        string key
        string value_type
        string string_value
        decimal numeric_value
        datetime updated_at
    }

    EVENT {
        string id PK
        string identity_id FK
        string event_name
        json payload
        datetime received_at
    }

    AUDIENCE ||--o{ AUDIENCE_FILTER : defined_by
    AUDIENCE ||--o{ AUDIENCE_MEMBERSHIP : contains
    AUDIENCE ||--o{ AUDIENCE_OVERRIDE : has

    AUDIENCE {
        string id PK
        string name
        string description
        string status
        string environment_id FK
        datetime created_at
        datetime updated_at
        datetime last_computed_at
    }

    AUDIENCE_FILTER {
        string id PK
        string audience_id FK
        string expression_dsl
        string expression_ast
        int version
        datetime created_at
    }

    AUDIENCE_MEMBERSHIP {
        string id PK
        string audience_id FK
        string identity_id FK
        string membership_type
        datetime joined_at
        datetime expires_at
    }

    AUDIENCE_OVERRIDE {
        string id PK
        string audience_id FK
        string identity_id FK
        string override_type
        string reason
        datetime created_at
    }

    AUDIENCE ||--o{ LIVE_EVENT : targeted_by
    AUDIENCE ||--o{ EXPERIMENT : targeted_by
    AUDIENCE ||--o{ FEATURE_FLAG : targeted_by
    AUDIENCE ||--o{ MESSAGE : targeted_by

    LIVE_EVENT {
        string id PK
        string audience_id FK
        string name
        string status
        datetime start_at
        datetime end_at
    }

    EXPERIMENT {
        string id PK
        string audience_id FK
        string name
        string status
        float rollout_percentage
    }

    FEATURE_FLAG {
        string id PK
        string audience_id FK
        string key
        boolean enabled
        json variants
    }

    MESSAGE {
        string id PK
        string audience_id FK
        string channel
        string content
        datetime scheduled_at
    }

    EVENT_TAXONOMY {
        string event_name PK
        string display_name
        string description
        string category
        jsonb parameters_schema
        timestamp created_at
        timestamp updated_at
    }
    COMPUTED_PROPERTY_RULE {
        string id PK
        string property_key FK
        string event_name FK
        string aggregation_type
        string parameter_name
        timestamp created_at
    }
    EVENT_TAXONOMY ||--o{ COMPUTED_PROPERTY_RULE : "triggers"
    COMPUTED_PROPERTY_RULE }o--|| COMPUTED_PROPERTY : "updates"
```

---

## DIA-004: 오디언스 생성 시퀀스 다이어그램

### 설명

관리자가 대시보드에서 오디언스를 생성하는 전체 시퀀스를 나타낸다. 폼 빌더에서 필터 조건을 구성하고 DSL 표현식을 생성한 후, 미리보기로 예상 대상 인원을 확인하고, 저장 시 초기 멤버십 계산이 트리거되는 흐름을 포함한다.

```mermaid
sequenceDiagram
    autonumber

    actor Admin as 관리자
    participant Dashboard as 대시보드
    participant FormBuilder as 폼 빌더
    participant API as LiveOps API
    participant AudienceEngine as Audience 엔진
    participant DB as Database

    Admin->>Dashboard: 오디언스 생성 메뉴 진입
    Dashboard-->>Admin: 빈 오디언스 폼 렌더링

    Admin->>FormBuilder: 필터 조건 입력\n(속성 선택 · 연산자 · 값)
    activate FormBuilder

    loop 조건 추가/수정
        Admin->>FormBuilder: 조건 추가 또는 AND/OR 연결
        FormBuilder-->>Admin: 조건 목록 실시간 업데이트
    end

    FormBuilder->>API: POST /audience/preview\n{ expression_ast }
    activate API

    API->>AudienceEngine: DSL 표현식 생성\n(AST → DSL 변환)
    AudienceEngine->>DB: 현재 Properties 기준\n플레이어 매칭 쿼리
    DB-->>AudienceEngine: 매칭 Identity 목록
    AudienceEngine-->>API: 예상 대상 인원 / 샘플 목록
    API-->>Dashboard: 미리보기 결과 반환
    deactivate API

    Dashboard-->>Admin: 예상 대상 인원 표시\n(예: 12,540명)
    deactivate FormBuilder

    Admin->>Dashboard: 오디언스 이름 입력 후 저장 클릭
    Dashboard->>API: POST /audience\n{ name, expression_dsl, expression_ast }
    activate API

    API->>DB: Audience 레코드 생성\n(status: active)
    DB-->>API: audience_id 반환

    API->>AudienceEngine: 초기 멤버십 계산 요청\n(audience_id)
    activate AudienceEngine

    AudienceEngine->>DB: 전체 Identity 대상\n필터 표현식 평가
    DB-->>AudienceEngine: 매칭 Identity 목록
    AudienceEngine->>DB: AudienceMembership 일괄 저장
    AudienceEngine-->>API: 초기 계산 완료\n(membership_count)
    deactivate AudienceEngine

    API-->>Dashboard: 201 Created\n{ audience_id, membership_count }
    deactivate API

    Dashboard-->>Admin: 오디언스 생성 완료\n상세 화면으로 이동
```

---

## DIA-005: 오디언스 멤버십 갱신 시퀀스 다이어그램

### 설명

게임 이벤트 수신 후 Computed Properties가 갱신되고, 주기적 배치(10분) 또는 즉시 트리거로 Audience 멤버십이 재계산되어 LiveOps 모듈에 반영되는 흐름을 나타낸다. 멤버십 변경(신규 진입 / 이탈) 시 알림 이벤트가 발행된다.

```mermaid
sequenceDiagram
    autonumber

    participant GC as 게임 클라이언트/서버
    participant EI as 이벤트 수집기
    participant ID as Identity 엔진
    participant PE as Properties 엔진
    participant Scheduler as 배치 스케줄러\n(10분 주기)
    participant AE as Audience 엔진
    participant DB as Database
    participant LiveOps as LiveOps 모듈

    GC->>EI: 이벤트 전송\n{ identity_id, event_name, payload }
    activate EI

    EI->>ID: Identity 조회 / 생성
    ID->>DB: Identity 프로필 갱신\n(update_time)
    DB-->>ID: 완료
    ID-->>EI: identity_id 확인
    deactivate EI

    EI->>PE: Computed Properties 갱신 요청\n{ identity_id, event_name }
    activate PE

    PE->>DB: 기존 Computed Property 조회
    DB-->>PE: 현재 Count / SeenLast / ValueSum 등

    PE->>DB: Computed Property 업데이트\n(count +1, seen_last 갱신 등)
    DB-->>PE: 완료
    PE-->>EI: 갱신 완료

    deactivate PE

    alt 관리자 수동 즉시 갱신 요청(REQ-004-02) 또는 오디언스 필터 조건 변경 시
        PE->>AE: 즉시 재계산 트리거\n{ identity_id, changed_properties }
        activate AE
        AE->>DB: 해당 Identity 관련 Audience 필터 조회
        DB-->>AE: Audience 목록 + 필터 표현식
        AE->>DB: 필터 표현식 평가 (단일 Identity)
        DB-->>AE: 매칭 Audience 목록
        AE->>DB: AudienceMembership 업데이트
        DB-->>AE: 완료
        AE-->>LiveOps: 멤버십 변경 이벤트 발행\n(joined / left audience_id)
        deactivate AE
    end

    loop 10분마다
        Scheduler->>AE: 배치 재계산 시작
        activate AE
        AE->>DB: 갱신 대상 Identity 목록 조회\n(last_event_time > last_computed_at)
        DB-->>AE: 대상 Identity 배치

        loop 각 Identity 처리
            AE->>DB: 필터 표현식 평가
            DB-->>AE: 매칭 결과
            AE->>DB: AudienceMembership diff 저장
        end

        AE->>DB: Audience.last_computed_at 갱신
        AE-->>LiveOps: 배치 멤버십 변경 이벤트 발행
        AE-->>Scheduler: 배치 완료 리포트
        deactivate AE
    end

    LiveOps->>DB: 타겟 Audience 멤버십 조회
    DB-->>LiveOps: 현재 멤버 Identity 목록
```

---

## DIA-006: 상태 다이어그램

### 설명

Audience 엔티티의 상태 전환(`draft` → `active` → `paused` → `archived`)과 플레이어의 Audience 멤버십 상태 전환(`not_member` → `member` → `sticky_member` → `excluded`)을 나타낸다. Include/Exclude 수동 오버라이드를 통한 강제 전환 경로를 포함한다.

> **참고**: SES-GLO-004에서는 active/expired/sticky 3상태로 기술되었으나, PRD F-004의 상세 요구사항을 반영하여 not_member/member/sticky_member/excluded 4상태로 확장 정의함

```mermaid
stateDiagram-v2
    [*] --> draft : Audience 생성

    state "Audience 상태" as AudienceState {
        draft : draft\n초안 (비활성)
        active : active\n활성 (멤버십 계산 중)
        paused : paused\n일시 정지
        archived : archived\n보관

        draft --> active : 활성화
        active --> paused : 일시 정지
        paused --> active : 재개
        active --> archived : 보관 처리
        paused --> archived : 보관 처리
        draft --> archived : 삭제 없이 보관
    }

    draft --> [*]
    archived --> [*]

    state "플레이어 멤버십 상태" as MembershipState {
        not_member : not_member\n비멤버
        member : member\n일반 멤버\n(필터 조건 충족)
        sticky_member : sticky_member\n스티키 멤버\n(수동 Include)
        excluded : excluded\n제외\n(수동 Exclude)

        not_member --> member : 필터 조건 충족\n(재계산 시)
        member --> not_member : 필터 조건 미충족\n(재계산 시)
        not_member --> sticky_member : 관리자 수동 Include
        member --> sticky_member : 관리자 수동 Include
        sticky_member --> not_member : Include 해제\n+ 필터 미충족
        sticky_member --> member : Include 해제\n+ 필터 충족
        not_member --> excluded : 관리자 수동 Exclude
        member --> excluded : 관리자 수동 Exclude
        sticky_member --> excluded : Exclude가 Include 우선
        excluded --> not_member : Exclude 해제\n+ 필터 미충족
        excluded --> member : Exclude 해제\n+ 필터 충족
    }
```

---

## DIA-007: 필터 표현식 처리 흐름

### 설명

관리자가 폼 빌더 UI 또는 쿼리 직접 입력으로 필터 조건을 정의하면, 이를 AST(Abstract Syntax Tree)로 변환하고 DSL 표현식을 생성하여 평가 엔진에서 플레이어 매칭을 수행하는 흐름을 나타낸다. 문법 오류 발생 시의 에러 처리 경로도 포함한다.

```mermaid
flowchart TD
    Start([관리자 입력]) --> InputType{입력 방식}

    InputType -->|폼 빌더 UI| FB[폼 빌더 조건 구성\n속성 · 연산자 · 값 선택]
    InputType -->|직접 쿼리 입력| RQ[쿼리 텍스트 입력\nRaw Expression]

    FB --> AST1[UI 조건 → AST 변환\nCondition Node 생성]
    RQ --> PARSE[쿼리 파서\nLexer + Parser]

    PARSE --> SyntaxCheck{문법 검증}
    SyntaxCheck -->|오류| ERR1[에러 메시지 표시\n오류 위치 하이라이트]
    ERR1 --> RQ

    SyntaxCheck -->|정상| AST2[파싱된 AST]

    AST1 --> DSL[DSL 표현식 생성\nJSON or Text 직렬화]
    AST2 --> DSL

    DSL --> Validate{표현식 유효성 검사\n참조 속성 존재 여부}
    Validate -->|속성 미존재| ERR2[유효성 오류 표시\n미존재 속성 안내]
    ERR2 --> FB

    Validate -->|유효| Preview{미리보기 요청?}

    Preview -->|Yes| Eval1[평가 엔진\n현재 Properties DB 기준 평가]
    Eval1 --> Match1[매칭 Identity 집합 추출]
    Match1 --> Result1[미리보기 결과 반환\n예상 인원 · 샘플 목록]
    Result1 --> SaveDecision{저장 확정?}

    Preview -->|No, 바로 저장| SaveDecision

    SaveDecision -->|취소| FB
    SaveDecision -->|저장| Store[Audience + Filter 저장\nstatus: active]

    Store --> InitEval[초기 멤버십 계산 트리거]
    InitEval --> Eval2[평가 엔진\n전체 Identity 배치 평가]
    Eval2 --> Match2[매칭 Identity → AudienceMembership 저장]
    Match2 --> Done([Audience 활성화 완료])

    style Start fill:#e1f5fe
    style Done fill:#c8e6c9
    style ERR1 fill:#ffcdd2
    style ERR2 fill:#ffcdd2
    style InputType fill:#fff9c4
    style SyntaxCheck fill:#fff9c4
    style Validate fill:#fff9c4
    style Preview fill:#fff9c4
    style SaveDecision fill:#fff9c4
```

---

## 변경 이력

| 버전 | 일자 | 변경 내용 | 작성자 |
|------|------|-----------|--------|
| v1.0 | 2026-03-10 | 초안 작성 - 7종 다이어그램 (아키텍처, 데이터 흐름, ERD, 시퀀스 2종, 상태, 필터 흐름) | diagram |
| v1.1 | 2026-03-26 | REV-GLO-003 리뷰 반영: ERD에 EVENT_TAXONOMY/COMPUTED_PROPERTY_RULE 추가, 화면 매핑 보완, 즉시 재계산 조건 명시, 멤버십 상태 차이 설명 추가 | diagram |
