---
id: "PRD-GLO-003"
title: "PRD: A/B 테스트(실험)"
project: "GLO"
version: "v1.0"
status: "draft"
created: "2026-03-24"
updated: "2026-03-24"
author: "prd"
reviewers: []
related_docs:
  - "PRD-GLO-001"
  - "PRD-GLO-002"
  - "RES-GLO-002"
  - "SPEC-GLO-001"
  - "UX-GLO-003"
  - "DIA-GLO-003"
tags:
  - "project:game-liveops"
  - "type:prd"
  - "topic:ab-testing"
---

# PRD: A/B 테스트(실험)

> 비기술 운영팀이 코드 작성 없이 실험을 생성·실행·분석하고, 승자 변형을 1클릭으로 전체 롤아웃할 수 있는 게임 LiveOps 실험 플랫폼을 정의한다.

## 문서 정보

| 항목 | 내용 |
|------|------|
| 문서 ID | PRD-GLO-003 |
| 버전 | v1.0 |
| 상태 | draft |
| 작성일 | 2026-03-24 |
| 작성자 | prd |
| 관련 문서 | PRD-GLO-001, PRD-GLO-002, RES-GLO-002, SPEC-GLO-001, UX-GLO-003, DIA-GLO-003 |

---

## 1. Overview

### 1.1 제품 비전

비기술 운영팀이 코드 작성 없이 A/B 테스트를 생성·실행·분석하는 실험 플랫폼을 제공한다. 원격 설정 변형, 이벤트 변형, Feature Flag 변형을 단일 인터페이스에서 정의하고, 통계적 유의성에 기반한 승자 자동 판별 및 1클릭 롤아웃으로 데이터 기반 의사결정을 가속한다.

### 1.2 배경 및 목적

**배경**

- 경쟁사 분석(RES-GLO-002, Section 3.3)에서 A/B 테스트는 7/7 플랫폼이 지원하는 Must-Have #4 기능이다. 변형 정의와 오디언스 타겟 롤아웃은 전 플랫폼 공통이며, 목표 지표 추적(5/7), 비공개 사전 테스트(3/7), 통계적 유의성 판단(3/7)은 차별화 요소다.
- PLO Phase 1(세그멘테이션, PRD-GLO-001)에서 구축한 오디언스 시스템(F-006)과 이벤트 택소노미(F-007)를 실험 타겟팅 및 목표 지표 추적에 직접 활용한다.
- PLO Phase 2(라이브 이벤트, PRD-GLO-002)에서 정립한 승인 워크플로우 패턴(EVENT_APPROVAL, version_snapshot)을 실험 승인에 재사용하여 운영 안전성을 확보한다.
- Heroic Labs Satori와 Unity Game Overrides의 "원격 설정 확장형 실험" 모델을 벤치마킹한다.

**목적**

- 이 PRD는 GLO 서비스의 **A/B 테스트(실험)** 기능 범위를 정의한다.
- 실험 CRUD, 변형 정의, 오디언스 타겟팅, 트래픽 분배, 승인 워크플로우, 통계 분석, 결과 대시보드, 승자 롤아웃을 명세한다.
- MVP(Phase 1) 출시에 필요한 최소 기능과 수용 기준을 확정한다.

### 1.3 성공 지표 (Success Metrics)

| 지표 | 현재 | 목표 | 측정 방법 |
|------|------|------|----------|
| 실험 생성 소요 시간 | - | 10분 이내 | 새 실험 생성 시작 ~ draft 저장 완료까지 소요 시간 |
| 통계적 승자 판별 정확도 | - | p-value < α 기준 100% 준수 | 판별 로직 단위 테스트 기준 |
| 승자 롤아웃 소요 시간 | - | 1분 이내 | "승자 롤아웃" 버튼 클릭 ~ 원격 설정 전체 반영 완료 |
| 변형 할당 API 응답 시간 | - | p99 50ms 이하 | SDK 변형 할당 API p99 응답 시간 |
| 동시 실험 지원 수 | - | 20개 이상 | 동시 running 상태 실험 수 × p99 할당 응답 측정 |

---

## 2. Target Users

### 2.1 사용자 페르소나

#### Primary Persona: 김지연 (게임 기획자/LiveOps 운영자)

PRD-GLO-001에서 정의된 동일 페르소나를 재사용한다.

| 항목 | 내용 |
|------|------|
| 소속 | 인디~중소 게임사 (팀 규모 5~30명) |
| 역할 | 게임 기획자 겸 LiveOps 운영 담당 |
| 기술 수준 | 비개발자. SQL 기초 이해 가능, 코드 작성 불가 |
| 주요 도구 | 스프레드시트, Notion, 간단한 BI 대시보드 |

**Goals**
- 난이도/보상/UI 설정을 코드 없이 직접 변형으로 정의하고 실험을 시작하고 싶다.
- 실험 결과를 통계 지식 없이도 "승자 판별됨" / "데이터 부족" 등 직관적인 레이블로 확인하고 싶다.
- 승자 변형을 확인한 즉시 전체 플레이어에게 1클릭으로 반영하고 싶다.

**Pain Points**
- 변형 테스트마다 개발자를 거쳐야 해서 결과 확인까지 수 일이 걸린다.
- 실험 결과가 유의미한지 스스로 판단하기 어렵다.
- 승자 변형을 반영하는 배포 작업이 별도로 필요해 시간이 지체된다.

#### Secondary Persona: 박현수 (개발자/기술 운영자)

PRD-GLO-001에서 정의된 동일 페르소나를 재사용한다.

| 항목 | 내용 |
|------|------|
| 소속 | 중소 게임사 서버 개발자 |
| 역할 | LiveOps 백엔드 연동 및 고급 실험 관리 |
| 기술 수준 | SQL, 프로그래밍 언어 숙련 |

**Goals**
- GLO SDK를 통해 플레이어별 변형 할당 정보를 조회하고 게임 서버에 반영하고 싶다.
- 실험 상태 변경(running, stopped) 시 웹훅으로 자동 알림을 수신하고 싶다.
- config_overrides JSON을 활용하여 복합 설정 변형을 정밀하게 제어하고 싶다.

**Pain Points**
- 실험 중 오디언스가 변경되었을 때 기존 할당 플레이어의 처리 방식이 불명확하다.
- 동일 오디언스에 복수 실험이 중복 적용되었을 때 충돌 여부를 사전에 파악하기 어렵다.

#### Tertiary Persona: 이수정 (팀 리드/승인 권한자)

PRD-GLO-002에서 정의된 동일 페르소나를 재사용한다.

| 항목 | 내용 |
|------|------|
| 소속 | 인디~중소 게임사 LiveOps 팀 리드 |
| 역할 | 실험 검토 및 승인/반려 담당 |
| 기술 수준 | 비개발자. 이벤트/실험 기획 경험 다수. |
| 주요 관심사 | 실험 배포 전 오류 방지, 데이터 품질 관리 |

**Goals**
- 승인 요청된 실험의 가설, 변형, 오디언스, 지표를 한눈에 검토하고 빠르게 승인 또는 반려하고 싶다.
- 반려 시 사유를 기록해 기획자가 수정 방향을 명확히 알 수 있게 하고 싶다.
- 자신이 생성한 실험은 직접 승인할 수 없는 체계로 품질 관리의 신뢰도를 높이고 싶다.

**Pain Points**
- 승인 시점 이후 실험 설정이 수정되어도 알 수 없다.
- 승인 요청이 왔는지 인터페이스 내에서 별도로 확인할 방법이 없다.

### 2.2 사용자 시나리오

#### SC-007: 난이도 A/B 테스트 생성 및 라이브 시작

> 김지연은 스테이지 기본 난이도를 "easy"와 "hard"로 비교하는 실험을 생성한다. 내부 QA 확인 후 이수정에게 승인을 요청하고, 승인된 실험이 실제 플레이어에게 노출된다.

**Steps**
1. 김지연이 실험 목록에서 "새 실험 만들기" 클릭 → 5단계 위저드 시작
2. Step 1: 실험명 "난이도 비교 테스트", 가설(What/Why/Expected) 입력, 기간 설정
3. Step 2: 컨트롤(기본값 `{"difficulty": "easy"}`) 자동 생성 확인 → 변형 A 추가(`{"difficulty": "hard"}`), 트래픽 각 50% 설정
4. Step 3: "활성 플레이어" 오디언스 선택 → 예상 대상 플레이어 수 확인
5. Step 4: Primary 지표 "stage_clear" (전환율) 선택, MDE 5% 입력 → 필요 샘플 수 자동 계산
6. Step 5: 전체 설정 확인 → "사전 테스트 시작" 클릭 → 상태 testing 전환
7. QA 팀이 내부 그룹에서 양 변형 정상 동작 확인
8. 김지연이 "승인 요청" 클릭 → 상태 pending_approval 전환
9. 이수정이 승인 요청 알림 수신 → 실험 상세 검토 → "승인" 클릭 → 상태 running 전환
10. 실제 플레이어가 MurmurHash3 기반으로 컨트롤/변형 A에 할당됨

#### SC-008: 승인 반려 후 수정 재요청

> 이수정은 승인 검토 중 변형 A의 config_overrides 설정이 불완전함을 발견하고 반려한다. 김지연은 반려 사유를 확인하고 설정을 수정한 뒤 재요청한다.

**Steps**
1. 이수정이 pending_approval 상태 실험 검토 → 변형 A config_overrides 미완성 확인
2. "반려" 클릭 → 반려 사유 "변형 A의 difficulty 키 누락. 전체 config_overrides 재확인 요청" 입력 → 상태 draft 전환
3. 김지연이 반려 알림 수신 → 사유 확인 → 변형 A 설정 수정
4. 수정 완료 후 "사전 테스트 시작" → testing → "승인 요청" → pending_approval 재전환
5. 이수정이 재검토 후 승인 → 상태 running 전환

#### SC-009: 실험 종료 및 승자 롤아웃

> 실험이 min_sample_size를 달성하여 analyzing 상태로 전환된다. 김지연은 결과 대시보드에서 변형 A가 통계적으로 유의미하게 우수함을 확인하고 승자 롤아웃을 실행한다.

**Steps**
1. 시스템이 min_sample_size 달성 감지 → 실험 상태 analyzing 자동 전환
2. 결과 분석 완료 → 상태 completed 전환
3. 김지연이 결과 대시보드(SCR-016) 진입 → 히어로 영역에 "승자 판별됨" 표시 확인
4. 변형 비교 차트에서 변형 A의 stage_clear 전환율이 컨트롤 대비 12% 향상, p < 0.05 확인
5. "승자 롤아웃" 버튼 클릭 → 롤아웃 확인 모달: 변경될 설정값(`{"difficulty": "hard"}`), 영향 받는 플레이어 수 미리보기
6. "확인" 클릭 → 변형 A의 config_overrides가 원격 설정으로 전체 플레이어에 영구 적용
7. 실험 상태는 completed 유지 (이력 보존)

---

## 2.5 실험 대상 유형 분류

실험에서 변형(Variant)은 아래 4가지 유형으로 정의할 수 있다. 모든 유형은 `config_overrides` JSON 필드를 통해 표현된다.

| 유형 | 변형 내용 | config_overrides 예시 |
|------|----------|-----------------------|
| 원격 설정 변형 | Key-Value 파라미터 변경 | `{"difficulty": "hard", "reward_amount": 200}` |
| 이벤트 변형 | 이벤트 구성 변경 | `{"event_duration_days": 7, "reward_type": "gem"}` |
| Feature Flag 변형 | 기능 활성화/비활성화 | `{"new_ui_enabled": true, "tutorial_skip": false}` |
| 복합 변형 | 위 항목의 조합 | `{"difficulty": "hard", "new_ui_enabled": true, "reward_amount": 200}` |

컨트롤(Control)은 현재 기본 설정값을 나타내며, `config_overrides`는 빈 객체(`{}`) 또는 기본값으로 설정된다.

---

## 2.6 기존 시스템 연동 포인트

| 연동 대상 | 참조 문서 | 연동 방식 |
|----------|----------|----------|
| 오디언스 시스템 | PRD-GLO-001 F-006 | 실험 타겟 오디언스로 기존 오디언스 직접 선택. AUDIENCE 테이블 FK 참조 |
| 이벤트 택소노미 | PRD-GLO-001 F-007 | 목표 지표 선택 시 이벤트 택소노미에서 추적 이벤트/Computed Properties 활용 |
| 라이브 이벤트 | PRD-GLO-002 | 승인 워크플로우 패턴(version_snapshot, RBAC) 재사용. 이벤트 변형 실험에 활용 |

---

## 3. Features & Requirements

### 3.1 기능 목록

| ID | 기능명 | 설명 | 우선순위 | 범위 |
|----|--------|------|----------|------|
| F-017 | 실험 생성 및 관리 | 실험 CRUD, 5단계 위저드, 복제, 보관 | P0 | MVP |
| F-018 | 변형(Variant) 정의 | 컨트롤 + 최대 3개 변형, config_overrides JSON, 트래픽 % 슬라이더 | P0 | MVP |
| F-019 | 실험 오디언스 타겟팅 | PRD-GLO-001 F-006 연동, 예상 플레이어 수, 충돌 경고 | P0 | MVP |
| F-020 | 트래픽 분배 | MurmurHash3 결정적 할당, Sticky 할당, 오디언스 변경 처리 | P0 | MVP |
| F-021 | 실험 상태 머신 및 승인 워크플로우 | 9개 상태, RBAC 3역할, 자가 승인 금지, version_snapshot | P0 | MVP |
| F-022 | 목표 지표 설정 및 통계 분석 | Primary 1개 + Secondary 최대 3개, Chi-squared/Welch's t, Bonferroni 보정, 승자 판별 | P0 | MVP |
| F-023 | 결과 대시보드 및 승자 롤아웃 | 변형 비교 차트, 신뢰구간 시각화, 일별 추이, 1클릭 승자 롤아웃 | P0 | MVP |

**우선순위 기준**
- **P0 (필수)**: MVP에 반드시 포함. 없으면 서비스 핵심 가치 미달.
- **P1 (중요)**: 높은 운영 가치. MVP에 포함하되 일정 압박 시 간소화 가능.
- **P2 (선택)**: Phase 2 이후 개발. MVP 출시에 영향 없음.

---

### 3.2 기능 상세: F-017 실험 생성 및 관리

#### 개요

실험 기본 정보(이름, 설명, 가설, 기간)를 생성·조회·수정·복제·보관한다. 5단계 위저드(기본정보 → 변형 → 오디언스 → 지표 → 확인)를 통해 비기술 운영자가 코드 없이 실험을 완성할 수 있다.

#### 사용자 스토리

**US-031**
```
As a 게임 기획자(관리자),
I want to 실험명, 가설(What/Why/Expected), 기간을 입력해 새 실험을 만들기를,
So that 코드 배포 없이 실험을 즉시 준비할 수 있다.
```

**US-032**
```
As a 게임 기획자(관리자),
I want to 기존 실험을 복제해 새 실험으로 저장하기를,
So that 유사한 실험을 반복 생성할 때 처음부터 입력하지 않아도 된다.
```

**US-033**
```
As a 게임 기획자(관리자),
I want to draft 상태 실험을 삭제하고, 종료된 실험은 archived 처리하기를,
So that 실험 목록을 정리하면서도 운영 이력을 보존할 수 있다.
```

#### 상세 요구사항

| ID | 요구사항 | 필수 |
|----|----------|------|
| REQ-017-01 | 실험은 name(필수, 최대 100자), description(선택, 최대 500자), hypothesis_what/why/expected(필수), start_date, end_date, significance_level로 구성된다. | Y |
| REQ-017-02 | name은 프로젝트 내에서 고유해야 하며, 최대 100자다. | Y |
| REQ-017-03 | 가설은 What(무엇을 변경하는가), Why(왜 변경하는가), Expected(예상 결과) 3개 필드로 구성된다. | Y |
| REQ-017-04 | significance_level은 0.01, 0.05, 0.10 중 선택하며, 기본값은 0.05다. | Y |
| REQ-017-05 | 실험 목록은 status, 오디언스, 생성자별로 필터링할 수 있어야 한다. | Y |
| REQ-017-06 | 실험 목록은 생성일, 시작일, 상태 기준으로 정렬할 수 있어야 한다. | Y |
| REQ-017-07 | 실험 복제 기능을 제공한다. 복제 시 status는 draft로, 승인 정보는 초기화된다. 이름에 "(복사본)" 접미사가 자동 추가된다. | Y |
| REQ-017-08 | 삭제는 draft 상태에서만 가능하다. draft 외 상태의 실험은 archived 처리만 허용한다. | Y |
| REQ-017-09 | 실험 수정은 draft 상태에서만 자유롭게 가능하다. pending_approval 이상의 상태에서 수정 시 draft로 되돌아가며 재승인이 요구된다. | Y |
| REQ-017-10 | 5단계 위저드에서 각 단계는 이전 단계 완료 후 다음 단계로 진행할 수 있다. 단계 이동 시 입력 내용은 임시 저장된다. | Y |

#### 수용 조건 (Acceptance Criteria)

**AC-017-01**
```gherkin
Scenario: 실험 신규 생성 성공
  Given 관리자가 실험 목록 페이지에 있다
  When 관리자가 name "난이도 비교 테스트", 가설 3개 필드, 기간을 입력하고 "임시 저장"한다
  Then 실험이 status "draft"로 목록에 추가된다
  And 생성 시각이 기록된다
```

**AC-017-02**
```gherkin
Scenario: 실험 복제
  Given 관리자가 "난이도 비교 테스트" 실험 상세 페이지에 있다
  When 관리자가 "복제" 버튼을 클릭한다
  Then "난이도 비교 테스트 (복사본)" 이름의 새 실험이 draft 상태로 생성된다
  And 원본의 변형, 오디언스, 지표 설정이 동일하게 복사된다
  And 승인 정보(approved_by, approval_note)는 비어 있다
```

**AC-017-03**
```gherkin
Scenario: draft 외 상태 실험 삭제 차단
  Given "난이도 비교 테스트"의 status가 "running"이다
  When 관리자가 해당 실험을 삭제하려 한다
  Then 삭제가 차단된다
  And "실행 중인 실험은 삭제할 수 없습니다. 실험을 종료한 뒤 보관 처리하세요." 안내 메시지가 표시된다
```

**AC-017-04**
```gherkin
Scenario: pending_approval 상태에서 실험 수정 시 재승인 요구
  Given "난이도 비교 테스트"의 status가 "pending_approval"이다
  When 관리자가 변형 설정을 수정하고 저장한다
  Then 실험 상태가 "draft"로 되돌아간다
  And "실험이 수정되어 재승인이 필요합니다." 안내 메시지가 표시된다
```

#### 비즈니스 규칙

| ID | 규칙 | 예시 |
|----|------|------|
| BR-017-01 | 실험 이름은 프로젝트 내에서 고유해야 한다. | 동명 실험 중복 생성 불가 |
| BR-017-02 | draft 외 상태의 실험은 삭제할 수 없으며, completed/stopped 상태 이후 archived 처리만 가능하다. | 운영 중 실험 실수 삭제 방지 |
| BR-017-03 | 실험 수정이 발생하면 기존 pending_approval 승인 요청은 자동으로 무효화된다. | 승인 후 몰래 수정 방지 |

#### 데이터 요구사항

| 필드 | 타입 | 필수 | 설명 | 유효성 |
|------|------|------|------|--------|
| id | String | Y | EXP-GLO-{NNN} 형식 | 시스템 자동 생성 |
| name | String | Y | 실험명 | 최대 100자, 프로젝트 내 고유 |
| description | String | N | 설명 | 최대 500자 |
| hypothesis_what | String | Y | 가설 — 무엇을 변경하는가 | 최대 500자 |
| hypothesis_why | String | Y | 가설 — 왜 변경하는가 | 최대 500자 |
| hypothesis_expected | String | Y | 가설 — 예상 결과 | 최대 500자 |
| status | Enum | Y | 실험 상태 | F-021 상태 머신 참조 |
| significance_level | Decimal | Y | 유의 수준 | 0.01, 0.05, 0.10 중 선택 |
| start_date | Datetime | Y | 실험 시작 예정일 | ISO 8601 UTC |
| end_date | Datetime | Y | 실험 종료 예정일 | ISO 8601 UTC, start_date 이후 |
| created_by | String | Y | 생성자 관리자 ID | FK → ADMIN 테이블 |
| created_at | Datetime | Y | 생성일시 | ISO 8601 UTC |
| updated_at | Datetime | Y | 수정일시 | ISO 8601 UTC |

#### 예외 처리

| 상황 | 처리 | 메시지 | 코드 |
|------|------|--------|------|
| 실험 이름 중복 | 저장 차단 | "이미 사용 중인 실험 이름입니다." | ERR-EXP-017-01 |
| draft 외 상태에서 삭제 시도 | 삭제 차단 | "해당 상태의 실험은 삭제할 수 없습니다." | ERR-EXP-017-02 |
| 종료일이 시작일보다 이전 | 저장 차단 | "종료일은 시작일 이후여야 합니다." | ERR-EXP-017-03 |

#### UI/UX 요구사항
- 실험 목록에는 실험명, 상태 배지, 오디언스, 변형 수, 시작일, 종료일, 생성자를 표시한다.
- status에 따라 색상 배지를 구분한다: draft(회색), testing(파랑), pending_approval(주황), running(초록), paused(노랑), stopped(빨강), analyzing(보라), completed(청록), archived(연회색).
- 관련 화면: SCR-013 (실험 목록), SCR-014 (실험 생성/편집 위저드)

---

### 3.3 기능 상세: F-018 변형(Variant) 정의

#### 개요

실험의 변형을 컨트롤(Control) 1개 + 실험 변형 최대 3개(총 최대 4그룹)로 정의한다. 각 변형은 `config_overrides` JSON으로 설정 오버라이드를 표현하며, 트래픽 % 슬라이더로 분배 비율을 지정한다.

#### 사용자 스토리

**US-034**
```
As a 게임 기획자(관리자),
I want to 컨트롤 그룹과 최대 3개 변형을 정의하고 각 변형에 config_overrides JSON을 입력하기를,
So that 원격 설정, 이벤트 구성, Feature Flag를 코드 없이 실험할 수 있다.
```

**US-035**
```
As a 게임 기획자(관리자),
I want to 변형별 트래픽 비율을 슬라이더로 조정하기를,
So that 특정 변형에 더 많거나 적은 플레이어를 할당할 수 있다.
```

#### 상세 요구사항

| ID | 요구사항 | 필수 |
|----|----------|------|
| REQ-018-01 | 컨트롤(Control) 변형은 실험 생성 시 자동으로 생성된다. is_control = true, config_overrides = {}. | Y |
| REQ-018-02 | 실험 변형은 최대 3개까지 추가 가능하다 (컨트롤 포함 총 최대 4그룹). | Y |
| REQ-018-03 | 각 변형은 이름(필수), 설명(선택), config_overrides JSON(선택), traffic_percentage(필수)로 구성된다. | Y |
| REQ-018-04 | config_overrides는 원격 설정 키 자동완성(기존 키 목록에서 선택)을 지원하며, JSON 형식으로 직접 편집도 가능하다. | Y |
| REQ-018-05 | 모든 변형의 traffic_percentage 합계는 정확히 100이어야 한다. 슬라이더 조정 시 나머지 변형 비율이 자동 조정된다. | Y |
| REQ-018-06 | 변형명은 변형 간 고유해야 하며, 최대 50자다. | Y |
| REQ-018-07 | config_overrides JSON 입력 시 문법 오류는 실시간으로 표시되며 저장이 차단된다. | Y |
| REQ-018-08 | 각 변형의 traffic_percentage는 소수점 둘째 자리까지 지정 가능하다. | N |

#### 수용 조건 (Acceptance Criteria)

**AC-018-01**
```gherkin
Scenario: 컨트롤 변형 자동 생성
  Given 관리자가 실험 생성 위저드 Step 2(변형 정의)에 진입한다
  When 페이지가 로드된다
  Then "컨트롤(Control)" 변형이 is_control = true, traffic_percentage = 100으로 자동 생성된다
  And config_overrides는 빈 객체({})로 초기화된다
```

**AC-018-02**
```gherkin
Scenario: 변형 추가 시 트래픽 자동 조정
  Given 컨트롤 변형이 traffic_percentage 100으로 존재한다
  When 관리자가 "변형 추가" 버튼을 클릭하여 변형 A를 추가한다
  Then 컨트롤과 변형 A의 traffic_percentage가 각각 50으로 자동 조정된다
```

**AC-018-03**
```gherkin
Scenario: 트래픽 합계 100% 미충족 시 저장 차단
  Given 컨트롤 40%, 변형 A 40%로 설정되어 있다 (합계 80%)
  When 관리자가 저장을 시도한다
  Then 저장이 차단된다
  And "변형 트래픽 비율의 합계는 100%여야 합니다." 에러 메시지가 표시된다 (ERR-EXP-001)
```

**AC-018-04**
```gherkin
Scenario: config_overrides JSON 문법 오류 감지
  Given 관리자가 변형 A의 config_overrides 입력 필드에 있다
  When 관리자가 유효하지 않은 JSON("{difficulty: hard}")을 입력한다
  Then 실시간으로 "올바른 JSON 형식이 아닙니다." 에러가 표시된다
  And 저장이 차단된다
```

#### 비즈니스 규칙

| ID | 규칙 | 예시 |
|----|------|------|
| BR-018-01 | 컨트롤 변형은 삭제할 수 없다. 실험에 항상 1개의 컨트롤이 존재해야 한다. | 컨트롤 삭제 시도 차단 |
| BR-018-02 | 실험 변형은 최대 3개까지만 추가할 수 있다. | 4번째 변형 추가 버튼 비활성화 |
| BR-018-03 | 모든 변형의 traffic_percentage 합계는 100이어야 하며, 저장 시 서버에서도 검증한다. | 합계 불일치 시 저장 차단 |
| BR-018-04 | running 또는 paused 상태의 실험에서 변형 설정 변경은 불가하다. 변경 시 draft로 되돌아가며 재승인이 필요하다. | 진행 중 변형 몰래 수정 방지 |

#### 데이터 요구사항

| 필드 | 타입 | 필수 | 설명 | 유효성 |
|------|------|------|------|--------|
| id | String | Y | V-{experiment_seq}-{NNN} 형식 | 시스템 자동 생성 |
| experiment_id | String | Y | EXPERIMENT FK | 유효한 실험 ID |
| name | String | Y | 변형명 | 최대 50자, 실험 내 고유 |
| description | String | N | 변형 설명 | 최대 200자 |
| is_control | Boolean | Y | 컨트롤 그룹 여부 | 실험당 1개만 true |
| traffic_percentage | Decimal | Y | 트래픽 배분 비율 | 0.00~100.00, 합계 100 |
| config_overrides | JSON | N | Key-Value 설정 오버라이드 | 유효한 JSON 형식 |
| sort_order | Integer | Y | 표시 순서 | 1부터 순차 |

#### 예외 처리

| 상황 | 처리 | 메시지 | 코드 |
|------|------|--------|------|
| 트래픽 합계 100% 미달 또는 초과 | 저장 차단, 슬라이더 자동 조정 가이드 | "변형 트래픽 비율의 합계는 100%여야 합니다." | ERR-EXP-001 |
| 변형 수 4개 초과 시도 | 추가 버튼 비활성화 | "변형은 최대 3개(컨트롤 포함 4그룹)까지 추가할 수 있습니다." | ERR-EXP-018-01 |
| JSON 문법 오류 | 실시간 오류 표시, 저장 차단 | "올바른 JSON 형식이 아닙니다." | ERR-EXP-018-02 |

#### UI/UX 요구사항
- 각 변형은 카드 형태로 표시하며, 컨트롤 변형은 "Control" 배지를 표시한다.
- 트래픽 슬라이더는 전체 변형 합계를 실시간으로 표시하며, 100%를 벗어나면 빨간색으로 강조한다.
- 관련 화면: SCR-014 (실험 생성/편집 위저드 Step 2)

---

### 3.4 기능 상세: F-019 실험 오디언스 타겟팅

#### 개요

PRD-GLO-001 F-006에서 정의된 오디언스를 실험 대상으로 선택한다. "전체 플레이어" 또는 기존 오디언스 선택 시 예상 대상 플레이어 수를 표시하며, 동일 오디언스에서 실행 중인 다른 실험이 있으면 충돌 경고를 제공한다.

#### 사용자 스토리

**US-036**
```
As a 게임 기획자(관리자),
I want to 기존 오디언스를 실험 대상으로 선택하기를,
So that 세그먼트를 재정의하지 않고 기존에 만들어 둔 오디언스를 바로 활용할 수 있다.
```

**US-037**
```
As a 게임 기획자(관리자),
I want to 오디언스 선택 시 예상 대상 플레이어 수를 확인하기를,
So that 실험 규모와 소요 기간을 사전에 예측할 수 있다.
```

#### 상세 요구사항

| ID | 요구사항 | 필수 |
|----|----------|------|
| REQ-019-01 | 오디언스 선택은 "전체 플레이어"(audience_id NULL) 또는 기존 오디언스 드롭다운에서 선택한다. | Y |
| REQ-019-02 | 오디언스 선택 시 해당 오디언스의 현재 예상 플레이어 수를 표시한다. | Y |
| REQ-019-03 | 동일 오디언스에서 현재 running 또는 paused 상태인 실험이 있을 경우, 충돌 경고를 표시한다. 경고는 차단하지 않는다. | Y |
| REQ-019-04 | 오디언스 미리보기 기능을 제공하여 선택한 오디언스의 상위 필터 조건 요약을 표시한다. | Y |
| REQ-019-05 | 실험이 running 또는 paused 상태일 때 참조 오디언스가 비활성화 또는 삭제되면, 실험은 자동으로 paused 상태로 전환되며 관리자에게 알림을 발송한다. | Y |

#### 수용 조건 (Acceptance Criteria)

**AC-019-01**
```gherkin
Scenario: 오디언스 선택 시 예상 플레이어 수 표시
  Given 관리자가 실험 생성 위저드 Step 3(오디언스 선택)에 있다
  When 관리자가 "활성 플레이어" 오디언스를 선택한다
  Then 해당 오디언스의 현재 예상 플레이어 수(예: "약 12,500명")가 표시된다
  And 오디언스의 필터 조건 요약이 미리보기 영역에 표시된다
```

**AC-019-02**
```gherkin
Scenario: 동일 오디언스 충돌 경고 표시
  Given "활성 플레이어" 오디언스를 타겟으로 하는 실험 A가 running 상태다
  When 관리자가 새 실험에서 동일하게 "활성 플레이어" 오디언스를 선택한다
  Then "이 오디언스에서 실행 중인 실험이 있습니다: [실험 A 링크]. 결과 오염 가능성을 확인하세요." 경고가 표시된다
  And 경고는 차단하지 않으며 진행이 가능하다 (ERR-EXP-003)
```

**AC-019-03**
```gherkin
Scenario: 참조 오디언스 비활성화 시 실험 자동 paused 전환
  Given "난이도 비교 테스트" 실험이 running 상태이고 "활성 플레이어" 오디언스를 참조한다
  When "활성 플레이어" 오디언스가 비활성화된다
  Then "난이도 비교 테스트" 실험이 자동으로 paused 상태로 전환된다
  And 관리자에게 "참조 오디언스가 비활성화되어 실험이 일시정지되었습니다." 알림이 발송된다 (ERR-EXP-002)
```

#### 비즈니스 규칙

| ID | 규칙 | 예시 |
|----|------|------|
| BR-019-01 | 오디언스 선택 없이 "전체 플레이어"로 실험할 수 있다. 이 경우 audience_id는 NULL로 저장된다. | 전체 플레이어 대상 실험 |
| BR-019-02 | 동일 오디언스에 복수 실험이 동시에 running 상태일 수 있다. 시스템은 차단하지 않고 경고만 표시한다. 멀티 레이어(상호 배타적 격리)는 Phase 2에서 지원한다. | 독립 할당 방식 적용 |
| BR-019-03 | 이미 할당된 플레이어(EXPERIMENT_ASSIGNMENT 기록)는 오디언스에서 이탈하더라도 할당이 유지된다(Sticky). | 실험 중 오디언스 변경 처리 |

#### 예외 처리

| 상황 | 처리 | 메시지 | 코드 |
|------|------|--------|------|
| 참조 오디언스 삭제/비활성화 | 실험 running 전환 차단, 자동 paused 전환, 알림 발송 | "참조 오디언스가 삭제 또는 비활성화되었습니다. 오디언스를 재선택하세요." | ERR-EXP-002 |
| 동일 오디언스 중복 실험 존재 | 경고 표시 (차단 안 함), 기존 실험 확인 안내 | "이 오디언스에서 실행 중인 실험이 있습니다." | ERR-EXP-003 |

#### UI/UX 요구사항
- 오디언스 드롭다운에는 오디언스명, 플레이어 수 요약이 함께 표시된다.
- 충돌 경고는 드롭다운 아래 노란색 경고 배너로 표시하며, 해당 실험 링크를 포함한다.
- 관련 화면: SCR-014 (실험 생성/편집 위저드 Step 3)

---

### 3.5 기능 상세: F-020 트래픽 분배

#### 개요

MurmurHash3 기반 결정적(deterministic) 해시 할당으로 플레이어를 변형에 배정한다. 동일 플레이어는 동일 실험에서 항상 같은 변형을 받으며(Sticky), 실험 간 독립 할당을 보장한다.

#### 사용자 스토리

**US-038**
```
As a 개발자/기술 운영자(관리자),
I want to 플레이어가 동일 실험에서 항상 동일한 변형을 받기를,
So that 실험 중 변형이 바뀌어 결과가 오염되는 것을 방지할 수 있다.
```

**US-039**
```
As a 게임 기획자(관리자),
I want to 실험 중 오디언스가 변경되더라도 기존 할당 플레이어가 영향을 받지 않기를,
So that 오디언스 편집이 진행 중인 실험의 데이터 무결성을 해치지 않는다.
```

#### 상세 요구사항

| ID | 요구사항 | 필수 |
|----|----------|------|
| REQ-020-01 | 변형 할당은 `MurmurHash3(experiment_id + ":" + player_id) % 10000`으로 계산된 버킷(0~9999)을 기반으로 한다. | Y |
| REQ-020-02 | 동일 플레이어는 동일 실험에서 항상 동일한 버킷에 배정되며, 따라서 항상 동일한 변형을 받는다(결정적 할당). | Y |
| REQ-020-03 | 실험 시작(running 전환) 시 플레이어의 변형 할당 정보가 EXPERIMENT_ASSIGNMENT 테이블에 기록된다(Sticky 할당). | Y |
| REQ-020-04 | paused 상태에서도 기존 EXPERIMENT_ASSIGNMENT 할당은 유지된다. | Y |
| REQ-020-05 | 실험이 running 또는 paused 상태일 때 참조 오디언스 편집은 허용된다. 이미 할당된 플레이어는 Sticky 유지되고, 오디언스 변경으로 새로 진입한 플레이어는 해시 기반으로 신규 할당된다. | Y |
| REQ-020-06 | 오디언스가 비활성화 또는 삭제된 경우, 실험은 자동으로 paused 상태로 전환된다. | Y |
| REQ-020-07 | MVP에서는 트래픽 레이어 없이 독립 할당 방식을 적용한다. 동일 오디언스에 복수 실험이 동시에 실행될 수 있으며, 각 실험은 독립적으로 해시 기반 할당한다. | Y |

#### 수용 조건 (Acceptance Criteria)

**AC-020-01**
```gherkin
Scenario: 결정적 변형 할당 검증
  Given "난이도 비교 테스트" 실험이 running 상태다
  And 플레이어 "player-001"이 컨트롤에 할당되어 있다
  When 플레이어 "player-001"이 게임을 재시작하고 변형을 재조회한다
  Then 플레이어 "player-001"은 동일하게 컨트롤에 할당된다
  And EXPERIMENT_ASSIGNMENT 기록이 변경되지 않는다
```

**AC-020-02**
```gherkin
Scenario: 오디언스 변경 후 기존 할당 플레이어 Sticky 유지
  Given "난이도 비교 테스트" 실험이 running 상태이고 "활성 플레이어" 오디언스를 참조한다
  And 플레이어 "player-100"이 변형 A에 할당되어 있다
  When "활성 플레이어" 오디언스에서 플레이어 "player-100"이 제외되도록 오디언스 조건이 수정된다
  Then 플레이어 "player-100"의 EXPERIMENT_ASSIGNMENT 기록은 변형 A로 유지된다
```

#### 비즈니스 규칙

| ID | 규칙 | 예시 |
|----|------|------|
| BR-020-01 | 해시 계산 입력 형식은 `experiment_id + ":" + player_id`(구분자 포함)로 고정되어 충돌을 방지한다. | EXP-GLO-001:player-001 |
| BR-020-02 | 실험 종료(stopped/completed/archived) 후 EXPERIMENT_ASSIGNMENT 데이터는 90일 보존 후 자동 삭제된다. | 개인정보 보호 및 스토리지 관리 |
| BR-020-03 | 동일 오디언스에 복수 실험이 동시 실행될 수 있다. 각 실험은 독립 해시를 사용하므로 할당은 독립적이다. 멀티 레이어 격리는 Phase 2에서 지원한다. | 독립 할당 방식 |

#### UI/UX 요구사항
- 운영자에게는 트래픽 분배 로직의 기술적 세부사항을 노출하지 않는다.
- 실험 상세 화면(SCR-015)의 "실시간 현황" 탭에서 변형별 현재 할당 플레이어 수를 표시한다.

---

### 3.6 기능 상세: F-021 실험 상태 머신 및 승인 워크플로우

#### 개요

실험은 9개 상태로 관리된다(draft / testing / pending_approval / running / paused / stopped / analyzing / completed / archived). RBAC 3개 역할(experiment_creator / experiment_approver / experiment_operator)로 상태 전이 권한을 제어하며, 자가 승인을 금지한다. PRD-GLO-002의 EVENT_APPROVAL 패턴을 기반으로 EXPERIMENT_APPROVAL 테이블에 승인 이력을 관리한다.

#### 사용자 스토리

**US-040**
```
As a 팀 리드/승인 권한자(관리자),
I want to 승인 요청된 실험의 전체 설정을 검토한 뒤 승인 또는 반려 사유를 입력하기를,
So that 잘못된 실험 설정이 실제 플레이어에게 노출되는 것을 방지할 수 있다.
```

**US-041**
```
As a 팀 리드/승인 권한자(관리자),
I want to 내가 생성한 실험을 직접 승인할 수 없기를,
So that 자가 검증 없이 실험이 라이브되는 위험을 제거할 수 있다.
```

**US-042**
```
As a 게임 기획자(관리자),
I want to 실험을 내부 QA 그룹에서 사전 테스트(testing 상태)한 뒤 승인 요청하기를,
So that 실제 플레이어에게 노출하기 전에 변형 동작을 검증할 수 있다.
```

#### 상세 요구사항

| ID | 요구사항 | 필수 |
|----|----------|------|
| REQ-021-01 | 실험은 draft / testing / pending_approval / running / paused / stopped / analyzing / completed / archived 9개 상태를 가진다. | Y |
| REQ-021-02 | 상태 전이는 RBAC 역할(experiment_creator, experiment_approver, experiment_operator)에 따라 제어된다. | Y |
| REQ-021-03 | 실험 생성자(created_by)와 승인자(approved_by)는 동일 인물일 수 없다(자가 승인 금지). | Y |
| REQ-021-04 | pending_approval → running 전환 시 EXPERIMENT_APPROVAL 테이블에 version_snapshot(변형, 오디언스, 지표, 트래픽 분배 전체 설정)을 JSONB로 저장한다. | Y |
| REQ-021-05 | pending_approval → draft 반려 시 반려 사유(rejection_reason) 입력이 필수다. | Y |
| REQ-021-06 | running → stopped 전환(긴급 종료)은 experiment_operator 이상 역할만 가능하며, Safety Lock 확인 모달이 필수 표시된다. | Y |
| REQ-021-07 | 모든 상태 전이는 EXPERIMENT_STATE_LOG 테이블에 기록된다(from_status, to_status, changed_by, reason, changed_at). | Y |
| REQ-021-08 | running → analyzing 전환은 end_date 도달 또는 min_sample_size 달성 시 자동 전환되며, 수동 전환도 가능하다. | Y |

#### 수용 조건 (Acceptance Criteria)

**AC-021-01**
```gherkin
Scenario: 자가 승인 차단
  Given 관리자 "jiyeon.kim"이 "난이도 비교 테스트" 실험의 created_by다
  And 실험이 pending_approval 상태다
  When "jiyeon.kim"이 승인 버튼을 클릭한다
  Then 승인이 차단된다
  And "본인이 생성한 실험은 직접 승인할 수 없습니다. 다른 승인권자에게 요청하세요." 메시지가 표시된다
```

**AC-021-02**
```gherkin
Scenario: 승인 시 version_snapshot 저장
  Given "난이도 비교 테스트" 실험이 pending_approval 상태다
  When 승인권자가 "승인" 버튼을 클릭한다
  Then 실험 상태가 running으로 전환된다
  And EXPERIMENT_APPROVAL 테이블에 decision = "approved", version_snapshot(변형/오디언스/지표/트래픽 전체 설정)이 기록된다
```

**AC-021-03**
```gherkin
Scenario: 반려 시 사유 필수 입력
  Given "난이도 비교 테스트" 실험이 pending_approval 상태다
  When 승인권자가 사유 없이 "반려" 버튼을 클릭한다
  Then 반려가 차단된다
  And "반려 사유를 입력해 주세요." 메시지가 표시된다
```

**AC-021-04**
```gherkin
Scenario: 긴급 종료 Safety Lock 확인 모달
  Given "난이도 비교 테스트" 실험이 running 상태다
  When experiment_operator 역할 관리자가 "긴급 종료" 버튼을 클릭한다
  Then Safety Lock 확인 모달이 표시된다
  And 모달에 "이 실험을 즉시 종료하면 모든 변형이 해제되고 컨트롤로 복귀합니다. 계속하시겠습니까?" 경고가 표시된다
  And "확인" 클릭 후 실험 상태가 stopped으로 전환된다
```

**AC-021-05**
```gherkin
Scenario: 상태 전이 이력 기록
  Given "난이도 비교 테스트" 실험이 running 상태다
  When experiment_operator가 실험을 paused 상태로 전환한다
  Then EXPERIMENT_STATE_LOG에 from_status = "running", to_status = "paused", changed_by, changed_at이 기록된다
```

#### 비즈니스 규칙

| ID | 규칙 | 예시 |
|----|------|------|
| BR-021-01 | 자가 승인 금지: created_by와 approved_by는 동일 인물일 수 없다. | 기획자가 자신의 실험 직접 승인 불가 |
| BR-021-02 | testing → pending_approval 전환 조건: 변형 1개 이상 + 오디언스 선택 + 목표 지표 1개 이상. | 필수 설정 미완성 시 승인 요청 차단 |
| BR-021-03 | running → stopped(긴급 종료) 시 모든 변형이 해제되고 플레이어는 컨트롤로 복귀한다. | 운영 사고 즉시 대응 |
| BR-021-04 | version_snapshot은 승인 시점의 전체 실험 설정을 JSONB로 저장하여 승인 후 설정 변조 감지 및 이력 추적에 활용한다. PRD-GLO-002의 EVENT_APPROVAL 패턴과 동일. | 감사 목적 이력 보존 |

#### 상태 전이 규칙

| 전이 | 조건 | 권한 |
|------|------|------|
| draft → testing | 변형 1개 이상 + 오디언스 선택 + 목표 지표 1개 이상 | experiment_creator |
| testing → pending_approval | QA 확인 완료 (수동 트리거) | experiment_creator |
| pending_approval → running | 승인권자 승인 (version_snapshot 저장, 자가 승인 금지) | experiment_approver |
| pending_approval → draft | 승인권자 반려 (반려 사유 필수) | experiment_approver |
| running → analyzing | end_date 도달 또는 min_sample_size 달성 | 시스템 자동 / experiment_operator |
| running → paused | 관리자 판단 | experiment_operator |
| running → stopped | 긴급 종료 (Safety Lock 확인 필수) | experiment_operator |
| paused → running | 재개 | experiment_operator |
| paused → stopped | 일시 중단 상태에서 종료 결정 (Safety Lock 확인 필수) | experiment_operator |
| analyzing → completed | 결과 분석 완료 | 시스템 자동 |
| stopped → completed | 강제 종료 후 완료 처리 | 시스템 자동 |
| completed → archived | 보관 처리 | experiment_operator |
| draft → archived | 불필요 실험 보관 | experiment_creator |

#### 예외 처리

| 상황 | 처리 | 메시지 | 코드 |
|------|------|--------|------|
| 자가 승인 시도 | 승인 차단 | "본인이 생성한 실험은 직접 승인할 수 없습니다." | ERR-EXP-021-01 |
| 반려 사유 미입력 | 반려 차단 | "반려 사유를 입력해 주세요." | ERR-EXP-021-02 |
| 권한 없는 상태 전이 시도 | 전이 차단 | "해당 작업을 수행할 권한이 없습니다." | ERR-EXP-021-03 |

#### UI/UX 요구사항
- 실험 상세 화면(SCR-015) 헤더에는 현재 상태 배지와 현재 상태에서 가능한 액션 버튼만 표시한다.
- 승인 화면(SCR-017)에서 자가 승인 대상 실험의 승인 버튼은 비활성화 처리하고 사유를 툴팁으로 표시한다.
- 상태 이력 탭에는 EXPERIMENT_STATE_LOG를 타임라인 형태로 표시한다.
- 관련 화면: SCR-015 (실험 상세), SCR-017 (승인 요청/검토)

---

### 3.7 기능 상세: F-022 목표 지표 설정 및 통계 분석

#### 개요

Primary 지표 1개(필수)와 Secondary 지표 최대 3개(선택)를 이벤트 택소노미(PRD-GLO-001 F-007)에서 선택한다. Chi-squared(전환율)와 Welch's t-test(연속값)로 통계 분석하며, 복수 변형 시 Bonferroni 보정을 적용한다. MDE 기반 샘플 사이즈를 자동 계산하여 운영자에게 제공한다.

#### 사용자 스토리

**US-043**
```
As a 게임 기획자(관리자),
I want to Primary 지표 1개와 Secondary 지표를 선택하기를,
So that 실험의 성공 기준을 명확히 정의하고 부가 지표로 추가 인사이트를 얻을 수 있다.
```

**US-044**
```
As a 게임 기획자(관리자),
I want to MDE(최소 감지 효과)를 입력하면 권장 샘플 사이즈와 예상 소요 기간을 확인하기를,
So that 실험 기간을 통계적으로 근거 있게 설정할 수 있다.
```

**US-045**
```
As a 게임 기획자(관리자),
I want to 실험 결과를 "승자 판별됨" / "데이터 부족" / "유의미한 차이 없음" 중 하나로 직관적으로 확인하기를,
So that 통계 지식 없이도 실험 결과를 이해하고 의사결정할 수 있다.
```

#### 상세 요구사항

| ID | 요구사항 | 필수 |
|----|----------|------|
| REQ-022-01 | Primary 지표는 1개 필수 선택이며, 이벤트 택소노미(F-007)에서 선택한다. | Y |
| REQ-022-02 | Secondary 지표는 최대 3개까지 선택 가능하며, 선택사항이다. Secondary 지표에는 "참고 지표" 라벨을 표시하여 탐색적 분석임을 명시한다. | Y |
| REQ-022-03 | 지표 타입은 conversion_rate(전환율), average_value(평균값), count(횟수) 중 선택한다. | Y |
| REQ-022-04 | conversion_rate 타입은 Chi-squared test를, average_value 및 count 타입은 Welch's t-test를 적용한다. | Y |
| REQ-022-05 | 변형이 2개 이상(컨트롤 + 2개 이상 변형)인 경우, Primary 지표에 Bonferroni 보정을 적용한다. 조정된 유의 수준 = α / (변형 수 - 1). 결과 대시보드에 보정 적용 여부와 조정된 유의 수준을 표시한다. | Y |
| REQ-022-06 | 통계 집계는 1시간 주기로 실행되며, 최종 분석(analyzing 상태 진입 후)은 5분 이내에 완료된다. | Y |
| REQ-022-07 | MDE(최소 감지 효과, %) 입력 시 권장 최소 샘플 사이즈와 예상 소요 기간을 자동 계산하여 표시한다. | Y |
| REQ-022-08 | 샘플 수가 min_sample_size 미만인 경우 "데이터 부족" 상태를 표시하며 수집 진행률을 표시한다. | Y |
| REQ-022-09 | 승자 판별 로직: p < 조정된 α 이고 Primary 지표 기준 최고 성과 변형을 "승자 판별됨"으로 표시한다. p ≥ 조정된 α인 경우 "유의미한 차이 없음"으로 표시한다. | Y |

#### 수용 조건 (Acceptance Criteria)

**AC-022-01**
```gherkin
Scenario: Primary 지표 미선택 시 저장 차단
  Given 관리자가 실험 생성 위저드 Step 4(목표 지표)에 있다
  When 관리자가 Primary 지표를 선택하지 않고 다음 단계로 이동하려 한다
  Then 이동이 차단된다
  And "Primary 지표를 반드시 선택해야 합니다." 메시지가 표시된다 (ERR-EXP-005)
```

**AC-022-02**
```gherkin
Scenario: MDE 입력 시 샘플 사이즈 자동 계산
  Given 관리자가 Step 4(목표 지표)에서 conversion_rate 타입 Primary 지표를 선택했다
  When 관리자가 MDE 5%를 입력한다
  Then "이 실험에는 약 N명의 플레이어가 필요하며, 현재 오디언스 크기 기준 약 N일이 소요될 것으로 예상됩니다." 가이드 메시지가 표시된다
```

**AC-022-03**
```gherkin
Scenario: Bonferroni 보정 적용 표시
  Given 실험에 컨트롤 + 변형 A + 변형 B 총 3개 그룹이 있다
  And significance_level = 0.05다
  When 결과 대시보드가 표시된다
  Then "다중 비교 보정 적용됨: 조정된 유의 수준 α = 0.025 (0.05 / 2)" 안내가 표시된다
```

**AC-022-04**
```gherkin
Scenario: 승자 판별됨 표시
  Given "난이도 비교 테스트" 실험이 completed 상태다
  And 변형 A의 stage_clear 전환율이 컨트롤 대비 p < 0.05로 유의미하게 높다
  When 결과 대시보드가 표시된다
  Then 히어로 영역에 "승자 판별됨" 라벨이 표시된다
  And 변형 A가 승자 변형으로 하이라이트 처리된다
```

**AC-022-05**
```gherkin
Scenario: 데이터 부족 표시
  Given "난이도 비교 테스트" 실험이 running 상태다
  And 현재 수집된 샘플 수가 min_sample_size의 40%다
  When 결과 대시보드가 표시된다
  Then 히어로 영역에 "데이터 부족" 라벨이 표시된다
  And 진행률 바에 "40% 수집 완료"가 표시된다
```

#### 비즈니스 규칙

| ID | 규칙 | 예시 |
|----|------|------|
| BR-022-01 | Primary 지표는 승자 판별의 유일한 기준이다. Secondary 지표는 참고용으로만 활용하며 Bonferroni 보정을 적용하지 않는다. | 주요 의사결정은 Primary 지표 기준 |
| BR-022-02 | count 타입 지표에 Welch's t-test 적용 시, 소표본(n < 30)인 경우 "데이터 부족" 상태로 표시하며 p-value를 계산하지 않는다. | 중심극한정리 적용 가능 표본 크기 확보 |
| BR-022-03 | 목표 지표의 이벤트가 이벤트 택소노미(F-007)에 미정의된 경우 저장을 차단하며, 이벤트 택소노미 설정 안내 링크를 제공한다. | ERR-EXP-005 |
| BR-022-04 | 통계 집계 결과(EXPERIMENT_RESULT)는 1시간마다 갱신된다. 운영자에게 마지막 계산 시각(last_calculated_at)을 표시한다. | 실시간 집계 대신 배치 처리 |

#### 예외 처리

| 상황 | 처리 | 메시지 | 코드 |
|------|------|--------|------|
| Primary 지표 미선택 | 저장 차단 | "Primary 지표를 반드시 선택해야 합니다." | ERR-EXP-005 |
| 이벤트 택소노미 미정의 지표 선택 | 저장 차단, 설정 안내 링크 제공 | "선택한 지표의 이벤트가 이벤트 택소노미에 등록되지 않았습니다." | ERR-EXP-005 |
| min_sample_size 미달 상태에서 수동 종료 | "데이터 부족" 경고 + 확인 모달 후 진행 가능 | "최소 샘플 수에 도달하지 않았습니다. 결과가 통계적으로 신뢰할 수 없을 수 있습니다. 계속하시겠습니까?" | ERR-EXP-004 |

#### UI/UX 요구사항
- Step 4(목표 지표)에서 MDE 입력 필드 옆에 "MDE란?" 툴팁으로 최소 감지 효과 설명을 제공한다.
- Secondary 지표 선택 영역에는 "참고 지표 — 승자 판별에 사용되지 않습니다." 안내 문구를 표시한다.
- 관련 화면: SCR-014 (실험 생성/편집 위저드 Step 4), SCR-016 (결과 대시보드)

---

### 3.8 기능 상세: F-023 결과 대시보드 및 승자 롤아웃

#### 개요

실험 결과를 변형 비교 차트, 신뢰구간 시각화, 일별 추이 차트로 시각화한다. completed 상태에서 승자 변형의 `config_overrides`를 원격 설정으로 영구 적용하는 1클릭 롤아웃 기능을 제공한다.

#### 사용자 스토리

**US-046**
```
As a 게임 기획자(관리자),
I want to 변형별 지표 비교, 신뢰구간, 일별 추이를 시각적으로 확인하기를,
So that 실험 결과를 데이터에 근거하여 직관적으로 이해할 수 있다.
```

**US-047**
```
As a 게임 기획자(관리자),
I want to 승자 변형을 1클릭으로 전체 플레이어에게 롤아웃하기를,
So that 코드 배포 없이 실험 결과를 즉시 서비스에 반영할 수 있다.
```

#### 상세 요구사항

| ID | 요구사항 | 필수 |
|----|----------|------|
| REQ-023-01 | 결과 대시보드 히어로 영역에 실험 상태 배지와 판별 상태("승자 판별됨" / "데이터 부족" / "유의미한 차이 없음")를 표시한다. | Y |
| REQ-023-02 | 변형 비교 바 차트로 각 변형의 전환율/평균값을 시각 비교한다 (Recharts BarChart). | Y |
| REQ-023-03 | 신뢰구간 시각화로 각 변형의 CI 범위 오버랩을 표시한다 (Recharts ErrorBar). | Y |
| REQ-023-04 | 상세 테이블에 변형명, 샘플 수, 전환율/평균값, 컨트롤 대비 차이(%), p-value, 95% CI를 표시한다. | Y |
| REQ-023-05 | 일별 추이 차트로 시간 경과에 따른 지표 변화를 라인 차트로 표시한다 (Recharts LineChart). | Y |
| REQ-023-06 | "승자 롤아웃" 버튼은 completed 상태에서 승자 변형이 판별된 경우에만 활성화된다. | Y |
| REQ-023-07 | 승자 롤아웃 실행 전 확인 모달에 변경될 설정값(config_overrides) 미리보기와 영향 받는 플레이어 수를 표시한다. | Y |
| REQ-023-08 | 승자 롤아웃 후 승자 변형의 config_overrides가 원격 설정으로 영구 적용되며, 실험은 completed 상태를 유지한다. | Y |
| REQ-023-09 | 결과 대시보드에 Bonferroni 보정 적용 여부와 조정된 유의 수준을 표시한다. | Y |
| REQ-023-10 | 결과 대시보드에 마지막 통계 집계 시각(last_calculated_at)을 표시한다. | Y |

#### 수용 조건 (Acceptance Criteria)

**AC-023-01**
```gherkin
Scenario: 승자 롤아웃 확인 모달 표시
  Given "난이도 비교 테스트" 실험이 completed 상태이고 변형 A가 승자로 판별되었다
  When 관리자가 "승자 롤아웃" 버튼을 클릭한다
  Then 확인 모달이 표시된다
  And 모달에 "변경될 설정: {difficulty: hard}", "영향 받는 플레이어: 약 N명"이 표시된다
```

**AC-023-02**
```gherkin
Scenario: 승자 롤아웃 실행 후 원격 설정 적용 및 실험 이력 보존
  Given 승자 롤아웃 확인 모달이 표시되어 있다
  When 관리자가 "확인" 버튼을 클릭한다
  Then 변형 A의 config_overrides({difficulty: hard})가 원격 설정으로 전체 플레이어에 영구 적용된다
  And 실험 상태는 completed를 유지한다
  And 1분 이내에 변경 사항이 반영된다
```

**AC-023-03**
```gherkin
Scenario: 승자 미판별 시 롤아웃 버튼 비활성화
  Given "난이도 비교 테스트" 실험이 completed 상태이고 판별 상태가 "유의미한 차이 없음"이다
  When 관리자가 결과 대시보드를 조회한다
  Then "승자 롤아웃" 버튼이 비활성화 처리된다
  And "통계적으로 유의미한 승자가 판별되지 않았습니다." 안내가 표시된다
```

#### 비즈니스 규칙

| ID | 규칙 | 예시 |
|----|------|------|
| BR-023-01 | 승자 롤아웃은 completed 상태이며 "승자 판별됨" 판별 결과인 경우에만 가능하다. | 데이터 부족, 차이 없음 상태에서는 롤아웃 불가 |
| BR-023-02 | 승자 롤아웃 후 실험 상태는 completed를 유지하며, 이력이 보존된다. 롤아웃 사실은 EXPERIMENT_STATE_LOG에 별도 기록된다. | 운영 이력 추적 |
| BR-023-03 | 롤아웃 적용 범위는 해당 오디언스 전체 또는 전체 플레이어 중 선택한다. 기본값은 해당 오디언스 전체다. | 점진적 롤아웃은 Phase 2에서 지원 |

#### 예외 처리

| 상황 | 처리 | 메시지 | 코드 |
|------|------|--------|------|
| 승자 미판별 상태에서 롤아웃 시도 | 롤아웃 버튼 비활성화 | "통계적으로 유의미한 승자가 판별되지 않았습니다." | ERR-EXP-023-01 |
| 원격 설정 반영 실패 | 재시도 안내 | "롤아웃 적용 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." | ERR-EXP-023-02 |

#### UI/UX 요구사항
- 승자 변형은 결과 테이블에서 트로피 아이콘과 녹색 배경으로 하이라이트 처리한다.
- "승자 롤아웃" 버튼은 결과 대시보드 우측 상단 고정 영역에 위치하며, 비활성화 시 회색으로 표시하고 마우스오버 시 비활성화 사유를 툴팁으로 제공한다.
- 관련 화면: SCR-016 (결과 대시보드)

---

## 4. Non-Functional Requirements

### 4.1 성능

| 항목 | 요구사항 | 측정 기준 |
|------|----------|----------|
| 변형 할당 API 응답 시간 | p99 50ms 이하 | SDK 변형 할당 API p99 응답 시간 |
| 동시 실험 지원 수 | 20개 이상 | 동시 running 상태 실험 수 × p99 할당 응답 측정 |
| 통계 집계 주기 | 1시간 | 배치 집계 실행 주기 |
| 최종 분석 완료 시간 | 5분 이내 | analyzing 상태 진입 ~ completed 전환 |
| 승자 롤아웃 반영 시간 | 1분 이내 | "확인" 클릭 ~ 원격 설정 전체 반영 완료 |

### 4.2 보안 및 권한

| 항목 | 요구사항 |
|------|----------|
| 인증 | 관리자 인증 필수 (세션 기반 또는 토큰 기반) |
| RBAC | experiment_creator / experiment_approver / experiment_operator 3개 역할 체계 |
| 자가 승인 금지 | API 레벨에서도 created_by와 approved_by 동일 여부 서버 검증 |
| version_snapshot | 승인 시점 전체 설정 JSONB 저장으로 변조 감지 |
| 감사 로그 | EXPERIMENT_APPROVAL, EXPERIMENT_STATE_LOG 영구 보존 |

### 4.3 데이터 보존 정책

| 데이터 | 보존 기간 |
|--------|----------|
| EXPERIMENT, EXPERIMENT_VARIANT, EXPERIMENT_GOAL | 영구 보존 |
| EXPERIMENT_RESULT (집계) | 영구 보존 |
| EXPERIMENT_APPROVAL, EXPERIMENT_STATE_LOG | 영구 보존 (감사 목적) |
| EXPERIMENT_ASSIGNMENT | 실험 completed/archived 후 90일 보존, 이후 자동 삭제 |

### 4.4 확장성

- 멀티 레이어 트래픽 격리(상호 배타적 실험 분리)는 Phase 2에서 지원한다.
- 베이지안 통계 분석 엔진은 Phase 2에서 지원한다.
- 자동 중단(조기 종료) 기능은 Phase 2에서 지원한다.

### 4.5 가용성

| 항목 | 요구사항 |
|------|----------|
| SLA | 99.9% |
| 장애 시 기본 동작 | 변형 할당 API 불가 시 컨트롤 변형을 기본값으로 반환 |

---

## 5. Data Model

디자인 스펙(SPEC-GLO-001, Section 7) 기준 전체 데이터 모델이다.

### EXPERIMENT

| 필드 | 타입 | 설명 |
|------|------|------|
| id | String | EXP-GLO-{NNN} 형식 |
| name | String | 실험명 (최대 100자) |
| description | String | 설명 (최대 500자) |
| hypothesis_what | String | 가설 — 무엇을 변경하는가 |
| hypothesis_why | String | 가설 — 왜 변경하는가 |
| hypothesis_expected | String | 가설 — 예상 결과 |
| status | Enum | draft/testing/pending_approval/running/paused/stopped/analyzing/completed/archived |
| audience_id | String | AUDIENCE 테이블 FK (null = 전체 플레이어) |
| start_date | Datetime | 실험 시작 예정일 |
| end_date | Datetime | 실험 종료 예정일 |
| min_sample_size | Integer | 최소 필요 샘플 수 |
| min_duration_days | Integer | 최소 실험 기간 (일) |
| significance_level | Decimal | 유의 수준 (기본 0.05) |
| created_by | String | 생성자 관리자 ID |
| approved_by | String | 승인자 관리자 ID |
| approval_note | String | 승인/반려 사유 |
| created_at | Datetime | 생성일시 |
| updated_at | Datetime | 수정일시 |

### EXPERIMENT_VARIANT

| 필드 | 타입 | 설명 |
|------|------|------|
| id | String | V-{experiment_seq}-{NNN} 형식 |
| experiment_id | String | EXPERIMENT FK |
| name | String | 변형명 (Control, Variant A 등) |
| description | String | 변형 설명 |
| is_control | Boolean | 컨트롤 그룹 여부 |
| traffic_percentage | Decimal | 트래픽 배분 비율 (0~100) |
| config_overrides | JSON | Key-Value 설정 오버라이드 |
| sort_order | Integer | 표시 순서 |

### EXPERIMENT_GOAL

| 필드 | 타입 | 설명 |
|------|------|------|
| id | String | 자동 생성 |
| experiment_id | String | EXPERIMENT FK |
| metric_name | String | 이벤트 택소노미 기반 지표명 |
| metric_type | Enum | conversion_rate / average_value / count |
| is_primary | Boolean | Primary 지표 여부 |
| minimum_detectable_effect | Decimal | MDE (%) |

### EXPERIMENT_ASSIGNMENT

| 필드 | 타입 | 설명 |
|------|------|------|
| player_id | String | 플레이어 ID |
| experiment_id | String | EXPERIMENT FK |
| variant_id | String | EXPERIMENT_VARIANT FK |
| assigned_at | Datetime | 할당 시각 |
| bucket | Integer | 해시 버킷 (0~9999) |

### EXPERIMENT_RESULT (집계)

| 필드 | 타입 | 설명 |
|------|------|------|
| experiment_id | String | EXPERIMENT FK |
| variant_id | String | EXPERIMENT_VARIANT FK |
| goal_id | String | EXPERIMENT_GOAL FK |
| sample_size | Integer | 표본 크기 |
| conversions | Integer | 전환 수 (conversion_rate 타입) |
| conversion_rate | Decimal | 전환율 |
| mean_value | Decimal | 평균값 (average_value 타입) |
| std_deviation | Decimal | 표준편차 |
| count_total | Integer | 총 횟수 (count 타입) |
| p_value | Decimal | p-value |
| confidence_interval_lower | Decimal | 신뢰구간 하한 |
| confidence_interval_upper | Decimal | 신뢰구간 상한 |
| relative_improvement | Decimal | 컨트롤 대비 상대적 개선율 (%) |
| is_winner | Boolean | 승자 변형 여부 |
| last_calculated_at | Datetime | 마지막 계산 시각 |

### EXPERIMENT_APPROVAL

| 필드 | 타입 | 설명 |
|------|------|------|
| id | String | 자동 생성 |
| experiment_id | String | EXPERIMENT FK |
| version_snapshot | JSON | 승인 시점의 실험 전체 설정 스냅샷 (변형, 오디언스, 지표 포함) |
| requested_by | String | 승인 요청자 관리자 ID |
| requested_at | Datetime | 승인 요청 시각 |
| processed_by | String | 처리자 관리자 ID |
| processed_at | Datetime | 처리 시각 |
| decision | Enum | approved / rejected |
| rejection_reason | String | 반려 사유 (반려 시 필수) |

### EXPERIMENT_STATE_LOG

| 필드 | 타입 | 설명 |
|------|------|------|
| id | String | 자동 생성 |
| experiment_id | String | EXPERIMENT FK |
| from_status | Enum | 이전 상태 |
| to_status | Enum | 변경된 상태 |
| changed_by | String | 변경자 관리자 ID |
| reason | String | 변경 사유 |
| changed_at | Datetime | 변경 시각 |

---

## 6. Dependencies & Constraints

### 6.1 의존성

| 시스템 | 설명 | 담당 | 우선순위 | 상태 |
|--------|------|------|----------|------|
| 오디언스 시스템 (PRD-GLO-001 F-006) | 실험 타겟 오디언스 선택 및 플레이어 수 조회 | GLO 팀 | P0 | 개발 완료 |
| 이벤트 택소노미 (PRD-GLO-001 F-007) | 목표 지표 선택 및 이벤트 수집 | GLO 팀 | P0 | 개발 완료 |
| 원격 설정(Remote Config) 시스템 | config_overrides 적용 및 승자 롤아웃 반영 | GLO 팀 | P0 | 미기획 (Q-016) |
| GLO SDK | 변형 할당 API, 이벤트 수집 API | GLO 팀 | P0 | 개발 중 |
| 라이브 이벤트 승인 패턴 (PRD-GLO-002) | EXPERIMENT_APPROVAL, version_snapshot 패턴 재사용 | GLO 팀 | P0 | 개발 완료 |

### 6.2 제약사항

**기술적 제약**
- MurmurHash3 기반 결정적 할당으로 SDK 클라이언트와 서버 간 할당 일관성을 보장해야 한다.
- EXPERIMENT_ASSIGNMENT 테이블은 데이터 규모가 클 수 있으므로(플레이어 수 × 동시 실험 수) 90일 보존 후 삭제 정책을 준수해야 한다.
- 통계 분석 엔진(Chi-squared, Welch's t-test, Bonferroni 보정)은 서버 사이드에서 처리한다.

**일정 제약**
- MVP는 F-017~F-023 전체를 포함한다.
- 원격 설정 시스템(Q-016)이 확정되지 않으면 승자 롤아웃(F-023) 구현이 지연될 수 있다.

**리소스 제약**
- 멀티 레이어 트래픽 격리, 베이지안 통계, 자동 중단, MAB는 MVP 범위에서 제외한다.

### 6.3 가정사항

- 원격 설정 시스템은 config_overrides의 key-value를 수신하여 플레이어별로 적용할 수 있는 API를 제공한다.
- GLO SDK는 실험 시작 시 변형 할당 API를 호출하여 플레이어별 변형 정보를 수신하고 게임에 반영한다.
- 이벤트 택소노미(F-007)에 등록된 이벤트만 목표 지표로 선택할 수 있다.

---

## 7. Release Plan

### 7.1 마일스톤

| Phase | 범위 | 기능 | 예상 일정 |
|-------|------|------|----------|
| MVP | 전체 | F-017, F-018, F-019, F-020, F-021, F-022, F-023 | TBD (원격 설정 시스템 확정 후) |
| Phase 2 | 확장 | 멀티 레이어 트래픽 격리, 베이지안 통계, 자동 중단, MAB | TBD |

### 7.2 Out of Scope

이번 버전에서 **제외**:
- 멀티 페이즈 순차 롤아웃
- 베이지안 통계 엔진
- 자동 중단(통계적 조기 종료)
- MAB(Multi-Armed Bandit) 자동 최적화
- 멀티 레이어 트래픽 격리(상호 배타적 실험 분리)

---

## 8. Open Questions

| ID | 질문 | 담당 | 상태 |
|----|------|------|------|
| Q-016 | 원격 설정(Remote Config) 시스템 기획이 확정되지 않았다. 승자 롤아웃 API 스펙은 원격 설정 시스템 설계 완료 후 확정 가능하다. | GLO 팀 | 미해결 |
| Q-017 | 실험 생성 시 min_duration_days(최소 실험 기간)의 기본값과 운영자 변경 가능 여부를 결정해야 한다. | 기획팀 | 미해결 |
| Q-018 | 승자 롤아웃 적용 범위(해당 오디언스 전체 vs 전체 플레이어) 기본값을 확정해야 한다. | 기획팀 | 미해결 |

---

## 9. Risks

| ID | 리스크 | 영향 | 확률 | 대응 |
|----|--------|------|------|------|
| R-007 | 원격 설정 시스템 미확정으로 인한 승자 롤아웃 구현 지연 | 높음 | 중간 | Q-016 조기 해결. 원격 설정 API 인터페이스를 사전 합의하여 병렬 개발 추진 |
| R-008 | 동일 오디언스에 복수 실험 실행 시 결과 오염 우려 | 중간 | 높음 | 충돌 경고 UI 강화. Phase 2 멀티 레이어 우선순위 상향 |
| R-009 | EXPERIMENT_ASSIGNMENT 테이블 데이터 폭발적 증가 | 중간 | 중간 | 90일 보존 정책 엄격 적용. 파티셔닝 전략 사전 설계 |
| R-010 | 통계적 오해로 인한 잘못된 의사결정(false positive/negative) | 높음 | 낮음 | 결과 대시보드에 통계적 한계 안내 문구 제공. 데이터 부족 상태를 명확히 표시 |

---

## Appendix

### A. 용어 정의

| 용어 | 정의 |
|------|------|
| 실험(Experiment) | 변형 간 성과를 통계적으로 비교하는 A/B 테스트 단위 |
| 변형(Variant) | 실험에서 비교되는 설정 조합. 컨트롤 포함 최대 4개 |
| 컨트롤(Control) | 현재 기본 설정값을 나타내는 기준 변형 (is_control = true) |
| 오디언스(Audience) | 실험 대상 플레이어 그룹. PRD-GLO-001 F-006 정의 참조 |
| 트래픽 분배(Traffic Allocation) | 오디언스 내 플레이어를 각 변형에 배정하는 비율 설정 |
| MDE(Minimum Detectable Effect) | 통계적으로 감지 가능한 최소 효과 크기 (%) |
| Sticky 할당 | 실험 기간 중 플레이어의 변형 배정이 변경되지 않는 특성 |
| config_overrides | 변형이 적용하는 Key-Value 설정 오버라이드 JSON |
| p-value | 귀무가설이 참일 때 관측된 결과 이상이 발생할 확률. 낮을수록 유의미 |
| Bonferroni 보정 | 복수 변형 비교 시 다중 비교 문제를 보정하기 위해 유의 수준을 조정하는 방법 |
| version_snapshot | 승인 시점의 실험 전체 설정을 JSONB로 저장한 이력 레코드 |

### B. PRD → Screen 매핑

```yaml
feature_screen_mapping:
  F-017:  # 실험 생성 및 관리
    screens:
      - SCR-013  # 실험 목록
      - SCR-014  # 실험 생성/편집 위저드

  F-018:  # 변형(Variant) 정의
    screens:
      - SCR-014  # 실험 생성/편집 위저드 Step 2

  F-019:  # 실험 오디언스 타겟팅
    screens:
      - SCR-014  # 실험 생성/편집 위저드 Step 3

  F-020:  # 트래픽 분배
    screens: []  # 내부 로직. 관련 UI: SCR-015 실시간 현황 탭

  F-021:  # 실험 상태 머신 및 승인 워크플로우
    screens:
      - SCR-015  # 실험 상세
      - SCR-017  # 승인 요청/검토

  F-022:  # 목표 지표 설정 및 통계 분석
    screens:
      - SCR-014  # 실험 생성/편집 위저드 Step 4
      - SCR-016  # 결과 대시보드

  F-023:  # 결과 대시보드 및 승자 롤아웃
    screens:
      - SCR-016  # 결과 대시보드
```

### C. 관련 문서

| 문서 | 경로 |
|------|------|
| 세그멘테이션 PRD | docs/03-prd/2026-03-10_PRD_GLO_player-segmentation_v1.0.md |
| 라이브 이벤트 PRD | docs/03-prd/2026-03-23_PRD_GLO_live-events_v1.0.md |
| A/B 테스트 디자인 스펙 | docs/superpowers/specs/2026-03-24-ab-testing-design.md |
| 화면정의서 | docs/05-ux/ |
| 다이어그램 | docs/06-diagrams/ |
| 정책 | docs/04-policy/ |

### D. 변경 이력

| 버전 | 일자 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| v1.0 | 2026-03-24 | 초안 작성 — 실험 기능 PRD (F-017~F-023, 데이터 모델, 상태 머신, 통계 분석, 승인 워크플로우). SPEC-GLO-001 디자인 스펙 기반. PRD-GLO-001/002 패턴 재사용 | prd |
