---
id: "SPEC-GLO-001"
title: "A/B 테스트 (실험) 기능 디자인 스펙"
project: "GLO"
version: "v1.0"
status: "draft"
created: "2026-03-24"
updated: "2026-03-24"
author: "planner"
reviewers: []
related_docs:
  - "PRD-GLO-001"
  - "PRD-GLO-002"
  - "RES-GLO-002"
tags:
  - "project:game-liveops"
  - "type:spec"
  - "topic:ab-testing"
---

# A/B 테스트 (실험) 기능 디자인 스펙

## 문서 정보

| 항목 | 내용 |
|------|------|
| 문서 ID | SPEC-GLO-001 |
| 버전 | v1.0 |
| 상태 | draft |
| 작성일 | 2026-03-24 |
| 작성자 | planner |
| 관련 문서 | PRD-GLO-001, PRD-GLO-002, RES-GLO-002 |

---

## 1. 개요

### 배경

경쟁사 분석(RES-GLO-002, Section 3.3)에서 A/B 테스트는 7/7 플랫폼이 지원하는 필수 기능(Must-Have #4)이다. 변형(Variant) 정의와 오디언스 타겟 롤아웃은 전 플랫폼 공통이며, 목표 지표 추적(5/7), 비공개 사전 테스트(3/7), 통계적 유의성 판단(3/7)은 차별화 요소이다.

### 설계 방향

**원격 설정 확장형** — A/B 테스트를 "조건부 원격 설정 + 트래픽 분배 + 지표 추적"으로 정의한다. Heroic Labs Satori와 Unity Game Overrides 모델을 참고한다.

### 핵심 결정 사항

| 항목 | 결정 |
|------|------|
| 주요 사용자 | LiveOps 운영팀 (비기술) |
| 실험 대상 | 복합 (원격 설정 + 이벤트 + Feature Flag + 조합) |
| 통계 수준 | 중급 (통계적 유의성 + 신뢰구간 + 승자 자동 판별) |
| 세그먼트 연동 | 기존 오디언스(PRD-GLO-001 F-006) 직접 활용 |
| 사전 테스트 | 필수 (내부 QA 그룹 적용 후 라이브 전환) |
| 승인 워크플로우 | 필수 (testing → pending_approval → running) |

---

## 2. 아키텍처

```
실험(Experiment)
  ├── 변형(Variant) 정의 ← 원격 설정 Key-Value 조합
  ├── 오디언스 타겟팅 ← PRD-GLO-001 F-006 재사용
  ├── 트래픽 분배 ← 해시 기반 결정적(deterministic) 할당
  ├── 목표 지표(Goal Metrics) ← 이벤트 택소노미 F-007 재사용
  └── 결과 분석 ← 전환율 + 통계적 유의성 + 신뢰구간
```

### 실험 대상 유형

| 유형 | 변형 내용 | 예시 |
|------|----------|------|
| 원격 설정 변형 | Key-Value 파라미터 변경 | 난이도 easy vs hard, 보상량 100 vs 200 |
| 이벤트 변형 | 이벤트 구성 변경 | 이벤트 기간 3일 vs 7일, 보상 종류 A vs B |
| Feature Flag 변형 | 기능 활성화/비활성화 | 신규 UI on vs off |
| 복합 변형 | 위 항목의 조합 | 난이도 + 보상 + UI 동시 변경 |

### 기존 시스템 연동

| 연동 대상 | 참조 문서 | 연동 방식 |
|----------|----------|----------|
| 오디언스 시스템 | PRD-GLO-001 F-006 | 실험 타겟 오디언스로 기존 오디언스 직접 선택 |
| 이벤트 택소노미 | PRD-GLO-001 F-007 | 목표 지표로 추적 이벤트/Computed Properties 활용 |
| 라이브 이벤트 | PRD-GLO-002 | 승인 워크플로우 패턴 재사용, 이벤트 변형 실험 |

---

## 3. 범위

### In Scope

- 실험 CRUD (생성, 조회, 수정, 삭제/보관)
- 변형(Variant) 정의 — 컨트롤 + 최대 3개 실험 변형
- 오디언스 타겟팅 — PRD-GLO-001 오디언스 재사용
- 트래픽 분배 — 해시 기반 결정적 할당, 독립 할당 (MVP)
- 사전 테스트 — 내부 QA 그룹 적용
- 승인 워크플로우 — 승인권자 검토 후 라이브 전환
- 목표 지표 설정 및 추적 — Primary 1개 + Secondary 최대 3개
- 통계적 유의성 + 신뢰구간 + 승자 자동 판별
- 결과 대시보드 — 변형 비교, 추이, 통계 시각화
- 승자 변형 전체 롤아웃

### Out of Scope

- 멀티 페이즈 순차 롤아웃 (Phase 2)
- 베이지안 통계 (Phase 2)
- 자동 중단 (Phase 2)
- MAB(Multi-Armed Bandit) 자동 최적화

---

## 4. 상태 머신

```
draft → testing → pending_approval → running → analyzing → completed
  │        │           │                │
  │        │           └── draft        ├── paused ──┐
  │        │           (반려 시)         │            │
  └── archived                      stopped ←───────┘
                                        │
                                        └── completed
```

| 상태 | 설명 | 가능한 전이 |
|------|------|-----------|
| `draft` | 실험 설정 중. 변형/오디언스/지표 미확정 가능 | → testing, archived |
| `testing` | 내부 QA 그룹에만 노출. 실제 플레이어 미노출 | → pending_approval, draft |
| `pending_approval` | 승인권자 검토 대기 | → running (승인), draft (반려) |
| `running` | 실제 플레이어에게 노출 중 | → paused, stopped, analyzing |
| `paused` | 일시 중단. 기존 할당 유지, 신규 할당 중단 | → running, stopped |
| `stopped` | 강제 종료. 모든 변형 해제, 컨트롤로 복귀 | → completed |
| `analyzing` | 실험 종료 후 결과 분석 중 | → completed |
| `completed` | 최종 완료. 승자 변형 롤아웃 가능 | (종료 상태) |
| `archived` | 삭제 대신 보관 처리 | (종료 상태) |

### 권한 및 역할 (RBAC)

| 역할 | 권한 |
|------|------|
| `experiment_creator` | 실험 생성/편집/삭제, draft → testing 전환, testing → pending_approval 전환 |
| `experiment_approver` | pending_approval → running (승인), pending_approval → draft (반려) |
| `experiment_operator` | running → paused, paused → running, running → stopped (Safety Lock 확인 필수) |

- **자가 승인 금지**: 실험 생성자(created_by)와 승인자(approved_by)는 동일 인물일 수 없다.
- **긴급 종료 권한**: `experiment_operator` 이상 역할만 running → stopped 전환 가능. Safety Lock 확인 모달 필수.
- PRD-GLO-002의 `event_approver` 역할 패턴과 일관된 체계.

### 상태 전이 규칙

| 전이 | 조건 | 트리거 | 권한 |
|------|------|--------|------|
| draft → testing | 변형 1개 이상 + 오디언스 선택 + 목표 지표 1개 이상 | 관리자 수동 | experiment_creator |
| testing → pending_approval | QA 확인 완료 | 관리자 수동 | experiment_creator |
| pending_approval → running | 승인권자 승인 (version_snapshot 저장) | 승인권자 수동 | experiment_approver |
| pending_approval → draft | 승인권자 반려 (반려 사유 필수) | 승인권자 수동 | experiment_approver |
| running → analyzing | end_date 도달 또는 min_sample_size 달성 | 자동/수동 | 시스템/experiment_operator |
| running → paused | 관리자 판단 | 관리자 수동 | experiment_operator |
| running → stopped | 긴급 종료 (Safety Lock 확인) | 관리자 수동 | experiment_operator |
| paused → running | 재개 | 관리자 수동 | experiment_operator |
| paused → stopped | 일시 중단 상태에서 종료 결정 (Safety Lock 확인) | 관리자 수동 | experiment_operator |
| analyzing → completed | 결과 분석 완료 | 자동 | 시스템 |

---

## 5. 실험 생성 워크플로우

운영팀 관점의 5단계 위저드:

```
Step 1: 기본 정보
  ↓
Step 2: 변형 정의
  ↓
Step 3: 오디언스 선택
  ↓
Step 4: 목표 지표
  ↓
Step 5: 확인 및 저장
  ↓
사전 테스트 (testing)
  ↓
승인 요청 (pending_approval)
  ↓
라이브 시작 (running)
```

### Step 1 — 기본 정보

- 실험명 (필수, 최대 100자)
- 설명 (선택, 최대 500자)
- 가설: What (무엇을 변경하는가), Why (왜 변경하는가), Expected (예상 결과)
- 실험 기간: 시작일/종료일, 최소 실험 기간 가이드

### Step 2 — 변형 정의

- 컨트롤(Control) 자동 생성 — 현재 기본 설정값
- "변형 추가" 버튼으로 최대 3개 변형 추가 (총 최대 4그룹)
- 각 변형에 Key-Value 설정 오버라이드 입력
  - 원격 설정 키 자동완성 (기존 키 목록에서 선택)
  - JSON 형식으로 복합 설정 가능
- 변형별 트래픽 % 슬라이더 (합계 100% 자동 조정)
- 변형별 이름 및 설명

### Step 3 — 오디언스 선택

- "전체 플레이어" 또는 기존 오디언스 선택 (드롭다운)
- 선택 시 예상 대상 플레이어 수 표시
- 동일 오디언스에 실행 중인 다른 실험이 있을 경우 충돌 경고 표시
- 오디언스 미리보기 (상위 조건 요약)

### Step 4 — 목표 지표

- Primary 지표 1개 필수 선택 (이벤트 택소노미 F-007에서 선택)
- Secondary 지표 최대 3개 (선택사항)
- 지표 타입 선택: 전환율(conversion_rate) / 평균값(average_value) / 횟수(count)
- MDE(최소 감지 효과, %) 입력 → 권장 최소 샘플 사이즈 자동 계산
- "이 실험은 약 N명의 플레이어가 필요하며, 현재 오디언스 크기 기준 약 N일이 소요될 것으로 예상됩니다" 가이드 메시지

### Step 5 — 확인 및 저장

- 전체 설정 요약 카드 (변형, 오디언스, 지표, 기간)
- "임시 저장(draft)" 또는 "사전 테스트 시작(testing)" 선택

---

## 6. 트래픽 분배

### 결정적 해시 기반 할당

```
bucket = MurmurHash3(experiment_id + ":" + player_id) % 10000
```

- **해시 알고리즘**: MurmurHash3 (균등 분포 특성과 속도 우수)
- **입력 형식**: `experiment_id + ":" + player_id` (구분자 포함하여 충돌 방지)
- 플레이어 ID와 실험 ID를 조합하여 해시 → 0~9999 버킷에 매핑
- 동일 플레이어는 동일 실험에서 항상 같은 변형을 받음 (결정적)
- 다른 실험에서는 다른 버킷에 배정됨 (실험 간 독립)

### 동일 오디언스 실험 중복 처리 (MVP)

- MVP에서는 트래픽 레이어 없이 **독립 할당** 방식 적용
- 동일 오디언스에 복수 실험이 실행 중일 수 있으며, 각 실험은 독립적으로 해시 기반 할당
- 실험 생성 시 동일 오디언스에 실행 중인 다른 실험이 있으면 **경고 표시** (차단하지 않음)
- 멀티 레이어(상호 배타적 실험 격리)는 Phase 2에서 지원

### Sticky 할당

- 실험 시작 시 EXPERIMENT_ASSIGNMENT 테이블에 할당 기록
- 실험 종료까지 변형 변경 불가
- paused 상태에서도 기존 할당 유지

### 실험 중 오디언스 변경 처리

- 실험이 `running` 또는 `paused` 상태일 때 참조 오디언스의 편집은 **허용**
- 이미 할당된 플레이어(EXPERIMENT_ASSIGNMENT에 기록된)는 오디언스에서 이탈하더라도 **할당 유지** (Sticky)
- 오디언스 변경으로 새로 진입한 플레이어는 해시 기반으로 변형에 할당
- 오디언스가 비활성화 또는 삭제된 경우, 실험은 자동으로 `paused` 상태로 전환되며 관리자에게 알림

---

## 7. 데이터 모델

### EXPERIMENT

| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | EXP-GLO-{NNN} 형식 |
| name | string | 실험명 (최대 100자) |
| description | string | 설명 (최대 500자) |
| hypothesis_what | string | 가설 — 무엇을 변경하는가 |
| hypothesis_why | string | 가설 — 왜 변경하는가 |
| hypothesis_expected | string | 가설 — 예상 결과 |
| status | enum | draft/testing/pending_approval/running/paused/stopped/analyzing/completed/archived |
| audience_id | string | AUDIENCE 테이블 FK (null = 전체 플레이어) |
| start_date | datetime | 실험 시작 예정일 |
| end_date | datetime | 실험 종료 예정일 |
| min_sample_size | integer | 최소 필요 샘플 수 |
| min_duration_days | integer | 최소 실험 기간 (일) |
| significance_level | decimal | 유의 수준 (기본 0.05) |
| created_by | string | 생성자 관리자 ID |
| approved_by | string | 승인자 관리자 ID |
| approval_note | string | 승인/반려 사유 |
| created_at | datetime | 생성일시 |
| updated_at | datetime | 수정일시 |

### EXPERIMENT_VARIANT

| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | V-{experiment_seq}-{NNN} 형식 |
| experiment_id | string | EXPERIMENT FK |
| name | string | 변형명 (Control, Variant A 등) |
| description | string | 변형 설명 |
| is_control | boolean | 컨트롤 그룹 여부 |
| traffic_percentage | decimal | 트래픽 배분 비율 (0~100) |
| config_overrides | JSON | Key-Value 설정 오버라이드 |
| sort_order | integer | 표시 순서 |

### EXPERIMENT_GOAL

| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 자동 생성 |
| experiment_id | string | EXPERIMENT FK |
| metric_name | string | 이벤트 택소노미 기반 지표명 |
| metric_type | enum | conversion_rate / average_value / count |
| is_primary | boolean | Primary 지표 여부 |
| minimum_detectable_effect | decimal | MDE (%) |

### EXPERIMENT_ASSIGNMENT

| 필드 | 타입 | 설명 |
|------|------|------|
| player_id | string | 플레이어 ID |
| experiment_id | string | EXPERIMENT FK |
| variant_id | string | EXPERIMENT_VARIANT FK |
| assigned_at | datetime | 할당 시각 |
| bucket | integer | 해시 버킷 (0~9999) |

### EXPERIMENT_RESULT (집계)

| 필드 | 타입 | 설명 |
|------|------|------|
| experiment_id | string | EXPERIMENT FK |
| variant_id | string | EXPERIMENT_VARIANT FK |
| goal_id | string | EXPERIMENT_GOAL FK |
| sample_size | integer | 표본 크기 |
| conversions | integer | 전환 수 (conversion_rate 타입) |
| conversion_rate | decimal | 전환율 |
| mean_value | decimal | 평균값 (average_value 타입) |
| std_deviation | decimal | 표준편차 |
| count_total | integer | 총 횟수 (count 타입) |
| p_value | decimal | p-value |
| confidence_interval_lower | decimal | 신뢰구간 하한 |
| confidence_interval_upper | decimal | 신뢰구간 상한 |
| relative_improvement | decimal | 컨트롤 대비 상대적 개선율 (%) |
| is_winner | boolean | 승자 변형 여부 |
| last_calculated_at | datetime | 마지막 계산 시각 |

### EXPERIMENT_APPROVAL

| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 자동 생성 |
| experiment_id | string | EXPERIMENT FK |
| version_snapshot | JSON | 승인 시점의 실험 전체 설정 스냅샷 (변형, 오디언스, 지표 포함) |
| requested_by | string | 승인 요청자 관리자 ID |
| requested_at | datetime | 승인 요청 시각 |
| processed_by | string | 처리자 관리자 ID |
| processed_at | datetime | 처리 시각 |
| decision | enum | approved / rejected |
| rejection_reason | string | 반려 사유 (반려 시 필수) |

승인 시점의 `version_snapshot`에 실험의 전체 설정(변형, 오디언스, 지표, 트래픽 분배)을 JSONB로 저장하여, 승인 후 설정 변조 감지 및 이력 추적에 활용한다. PRD-GLO-002의 `EVENT_APPROVAL` 패턴과 동일.

### EXPERIMENT_STATE_LOG

| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 자동 생성 |
| experiment_id | string | EXPERIMENT FK |
| from_status | enum | 이전 상태 |
| to_status | enum | 변경된 상태 |
| changed_by | string | 변경자 관리자 ID |
| reason | string | 변경 사유 |
| changed_at | datetime | 변경 시각 |

### 데이터 보존 정책

| 데이터 | 보존 기간 |
|--------|----------|
| EXPERIMENT, EXPERIMENT_VARIANT, EXPERIMENT_GOAL | 영구 보존 |
| EXPERIMENT_RESULT (집계) | 영구 보존 |
| EXPERIMENT_APPROVAL, EXPERIMENT_STATE_LOG | 영구 보존 (감사 목적) |
| EXPERIMENT_ASSIGNMENT | 실험 completed/archived 후 90일 보존, 이후 삭제 |

---

## 8. 통계 분석

### 검정 방법

| 지표 타입 | 검정 방법 | 적용 조건 |
|----------|----------|----------|
| conversion_rate | Chi-squared test (카이제곱 검정) | 이항 결과 (전환/비전환) |
| average_value | Welch's t-test (웰치의 t-검정) | 연속형 값 비교 |
| count | Welch's t-test | 연속형 값 비교. 중심극한정리에 의해 대표본(n≥30)에서 근사 정규 가정. 소표본 시 "데이터 부족" 표시 |

### 통계 파라미터

| 파라미터 | 기본값 | 변경 가능 |
|---------|-------|----------|
| 유의 수준 (α) | 0.05 | 예 (0.01, 0.05, 0.10) |
| 신뢰구간 | 95% | α에 연동 |
| 검정력 (1-β) | 0.80 | 아니오 (샘플 사이즈 계산용) |

### 최소 샘플 사이즈 계산

실험 생성 시 MDE와 기본 전환율을 입력하면 자동 계산:

```
n = (Zα/2 + Zβ)² × [p1(1-p1) + p2(1-p2)] / (p1-p2)²
```

운영팀에게는 "이 실험에는 약 N명의 플레이어가 필요합니다"로 표시.

### 다중 비교 보정

- 변형이 2개 이상(컨트롤 + 2개 이상 변형)인 경우, 각 변형을 컨트롤과 비교할 때 다중 비교 문제가 발생
- **MVP 방식**: Bonferroni 보정 적용 — 조정된 유의 수준 = α / (변형 수 - 1)
  - 예: 컨트롤 + 3개 변형 → 조정된 α = 0.05 / 3 ≈ 0.0167
- Secondary 지표에는 보정을 적용하지 않으며, "참고 지표" 라벨을 표시하여 탐색적 분석임을 명시
- 결과 대시보드에 보정 적용 여부와 조정된 유의 수준을 표시

### 승자 판별 로직

| 조건 | 결과 표시 |
|------|----------|
| p < 조정된 α 이고 primary metric 기준 최고 성과 | "승자 판별됨" (승자 변형 하이라이트) |
| 샘플 수 < min_sample_size | "데이터 부족" (수집 진행률 표시) |
| p ≥ 조정된 α | "유의미한 차이 없음" |

### 승자 롤아웃

실험 `completed` 상태에서 "승자 롤아웃" 버튼 활성화:
1. 승자 변형의 config_overrides를 원격 설정으로 영구 적용
2. 적용 범위: 해당 오디언스 전체 또는 전체 플레이어
3. 롤아웃 전 확인 모달: 변경될 설정값 미리보기, 영향 받는 플레이어 수 표시
4. 롤아웃 후 실험은 `completed` 상태 유지 (이력 보존)

---

## 9. 관리자 UI 화면

### 화면 목록

| 화면 ID | 화면명 | 주요 기능 |
|---------|--------|----------|
| SCR-EXP-001 | 실험 목록 | 전체 실험 리스트, 상태 필터, 검색, 정렬 |
| SCR-EXP-002 | 실험 생성/편집 위저드 | 5단계 스텝 폼 |
| SCR-EXP-003 | 실험 상세 | 현재 상태, 변형 설정, 실시간 진행 현황, 상태 전이 |
| SCR-EXP-004 | 결과 대시보드 | 변형별 지표 비교, 통계, 승자, 롤아웃 |
| SCR-EXP-005 | 승인 요청/검토 | 승인권자 전용, 설정 요약 + 승인/반려 |

### SCR-EXP-001 실험 목록

- 테이블 컬럼: 실험명, 상태 배지, 오디언스, 변형 수, 시작일, 종료일, 생성자
- 상태 필터: 전체, draft, testing, pending_approval, running, paused, completed, archived
- 검색: 실험명/설명 텍스트 검색
- 정렬: 생성일, 시작일, 상태
- CTA: "새 실험 만들기" 버튼

### SCR-EXP-002 실험 생성/편집 위저드

위 섹션 5의 5단계 워크플로우 참조. 각 단계는 좌측 스텝 인디케이터와 함께 표시.

### SCR-EXP-003 실험 상세

- 헤더: 실험명, 상태 배지, 상태 전이 버튼 (현재 상태에 따라 가능한 액션만 표시)
- 설정 요약 탭: 가설, 변형 테이블, 오디언스, 지표, 기간
- 실시간 현황 탭 (running 상태): 변형별 현재 할당 수, 누적 지표 스냅샷
- 상태 이력 탭: EXPERIMENT_STATE_LOG 타임라인

### SCR-EXP-004 결과 대시보드

- 히어로 영역: 실험 상태 배지 + 판별 상태 ("승자 판별됨" / "데이터 부족" / "유의미한 차이 없음")
- 변형 비교 바 차트: 각 변형의 전환율/평균값 시각 비교 (Recharts BarChart)
- 신뢰구간 시각화: 각 변형의 CI 범위 오버랩 차트 (Recharts ErrorBar)
- 상세 테이블: 변형명, 샘플 수, 전환율/평균값, 컨트롤 대비 차이(%), p-value, 95% CI
- 일별 추이 차트: 시간 경과에 따른 지표 변화 라인 차트 (Recharts LineChart)
- "승자 롤아웃" CTA: completed 상태에서만 활성화

### SCR-EXP-005 승인 요청/검토

- 실험 설정 전체 요약 (읽기 전용)
- 가설, 변형, 오디언스, 지표, 기간 카드
- 사전 테스트 결과 요약 (있을 경우)
- 승인/반려 버튼 + 코멘트 입력 필드
- 반려 시 사유 필수 입력

---

## 10. 에러 처리

| 에러 코드 | 상황 | 처리 |
|----------|------|------|
| ERR-EXP-001 | 트래픽 비율 합계가 100%가 아님 | 저장 차단, 슬라이더 자동 조정 가이드 |
| ERR-EXP-002 | 참조 오디언스가 삭제/비활성화됨 | 실험 running 전환 차단, 오디언스 재선택 요청 |
| ERR-EXP-003 | 동일 오디언스에 실행 중인 실험 존재 | 경고 표시 (차단하지 않음), 기존 실험 확인 안내 |
| ERR-EXP-004 | min_sample_size 미달 상태에서 수동 종료 | "데이터 부족" 경고 + 확인 모달 후 진행 가능 |
| ERR-EXP-005 | 목표 지표의 이벤트 택소노미 미정의 | 저장 차단, 이벤트 택소노미 설정 안내 링크 |

---

## 11. 관련 문서

| 문서 | 참조 내용 |
|------|----------|
| RES-GLO-002 (경쟁사 분석) | Section 3.3: A/B 테스트 기능 비교 |
| PRD-GLO-001 (세그멘테이션) | F-006: 오디언스 타겟팅 연동, F-007: 이벤트 택소노미 |
| PRD-GLO-002 (라이브 이벤트) | 상태 머신 패턴, 승인 워크플로우 패턴 |

---

## 변경 이력

| 버전 | 일자 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| v1.0 | 2026-03-24 | 초안 작성 - 실험 기능 디자인 스펙 (아키텍처, 상태 머신, 데이터 모델, 통계 분석, UI 화면, 에러 처리). 스펙 리뷰 반영: YAML front matter 추가, RBAC 정의, EXPERIMENT_APPROVAL 테이블 및 version_snapshot 추가, 오디언스 변경 처리 규칙 추가, Bonferroni 다중 비교 보정, 해시 알고리즘 명시, 데이터 보존 정책 추가 | planner |
