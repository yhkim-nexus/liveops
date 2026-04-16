---
id: "MTG-GLO-004"
title: "회의록: 라이브 이벤트 기획 및 문서화 완료"
project: "GLO"
version: "v1.0"
status: "completed"
created: "2026-03-23"
updated: "2026-03-23"
author: "meeting-note"
session_type: "문서화"
participants:
  - "사용자"
  - "planner"
  - "prd"
  - "uiux-spec"
  - "diagram"
related_docs:
  - "PRD-GLO-002"
  - "UX-GLO-002"
  - "DIA-GLO-002"
  - "PRD-GLO-001"
  - "RES-GLO-002"
tags:
  - "project:game-liveops"
  - "type:meeting"
  - "topic:live-events"
---

# 회의록: 라이브 이벤트 기획 및 문서화 완료

> Game LiveOps Service 플레이어 세그멘테이션(Phase 2) 다음 기능인 라이브 이벤트 생성·스케줄링·승인·캘린더 기능의 기획과 병렬 문서화(PRD, UX, 다이어그램)를 완료하는 세션. 세그멘테이션 기반 오디언스 타겟팅, 상태 머신, 승인 워크플로우, 성과 대시보드를 중심으로 MVP 범위를 확정한다.

## 문서 정보

| 항목 | 내용 |
|------|------|
| ID | MTG-GLO-004 |
| 일시 | 2026-03-23 |
| 참석자 | 사용자, planner, prd, uiux-spec, diagram |
| 세션 유형 | 문서화 (Parallel Documentation) |
| 관련 문서 | PRD-GLO-002, UX-GLO-002, DIA-GLO-002, PRD-GLO-001, RES-GLO-002 |

---

## 1. 회의 목적

Game LiveOps Service의 Phase 2에 해당하는 라이브 이벤트 생성·스케줄링·승인·모니터링 기능을 기획하고, 이를 PRD, 화면정의서, 다이어그램으로 병렬 문서화하여 MVP 출시에 필요한 명세서를 완성한다. 특히 Phase 1의 세그멘테이션 아키텍처(Identity-Properties-Audience 3계층)를 Live Events에 적용하고, 운영 안전성을 위한 승인 워크플로우와 상태 머신을 설계한다.

---

## 2. 논의 내용

### 2.1 라이브 이벤트 기능의 위치와 중요도

**배경**
- RES-GLO-002의 경쟁사 분석에서 라이브 이벤트 관리는 7개 플랫폼 중 6개가 지원하는 Must-Have #3 기능으로 확인됨
- 이벤트 생성·스케줄링, 세그먼트 기반 타겟팅, 실시간 성과 데이터가 공통 요소
- Phase 1의 세그멘테이션 기반 오디언스 타겟팅 인프라(PRD-GLO-001 F-006)가 Live Events의 필수 의존성

**논의 내용**
- 라이브 이벤트는 세그멘테이션 다음으로 높은 우선순위를 가지는 기능 (이벤트 없이는 플레이어 타겟팅 자체가 의미가 없음)
- 경쟁사 벤치마킹: Satori의 이벤트 캘린더(1/2/4주 뷰), AccelByte의 시즌 패스 구조, Metaplay의 상태 기반 이벤트 관리
- 이벤트 오배포·실수로 인한 운영 사고를 방지하기 위해 승인 워크플로우(Approval Workflow)를 필수로 포함

**결론**
- 라이브 이벤트 관리를 GLO 서비스의 제2 우선순위 기능(P1)으로 확정
- 승인 워크플로우는 MVP 포함 필수(질서 있는 운영 보장)

### 2.2 이벤트 데이터 모델 및 상태 머신 설계

**배경**
- Phase 1에서 설계한 세그멘테이션 아키텍처(Identity-Properties-Audience)를 Live Events에 재적용
- 이벤트의 전 생명 주기(생성 → 승인 → 스케줄 → 활성화 → 일시정지/긴급종료 → 종료 → 보관)를 명확히 정의 필요

**논의 내용**

#### 2.2.1 이벤트 엔티티 및 관련 테이블

**LIVE_EVENT 중심 테이블 구조**

| 테이블 | 역할 | 주요 필드 |
|--------|------|----------|
| LIVE_EVENT | 이벤트 기본 정보 | id, name, description, event_type, priority, status, audience_id, created_by, created_at, updated_at |
| EVENT_SCHEDULE | 스케줄 정의 (단순/반복) | event_id, schedule_type, start_at, end_at, timezone, rrule |
| EVENT_PHASE | 다단계 페이즈 (확장 모델) | event_id, phase_type, phase_order, start_offset, duration, config |
| EVENT_APPROVAL | 승인 이력 추적 | event_id, requested_by, requested_at, reviewer_id, action(approve/reject), decision_at |
| EVENT_METRICS | 일별 성과 지표 | event_id, date, participation_count, revenue_impact, baseline_comparison |
| EVENT_STATE_LOG | 모든 상태 전이 기록 | event_id, from_status, to_status, transitioned_by, reason, transitioned_at |

**설계 근거**
- AUDIENCE 엔티티는 Phase 1의 세그멘테이션 테이블을 FK로 참조 (단일 audience_id)
- audience_id가 NULL인 경우 전체 플레이어 대상
- EVENT_STATE_LOG로 감시(audit trail) 기능 제공

#### 2.2.2 이벤트 상태 머신 (7단계)

| 상태 | 설명 | 진입 조건 | 가능한 다음 상태 | 플레이어 노출 |
|------|------|----------|-----------------|--------------|
| **draft** | 초안. 편집 중 | 새 이벤트 생성 | pending_approval, archived | 없음 |
| **pending_approval** | 승인 대기 | draft에서 승인 요청 | approved, rejected | 없음 |
| **approved** | 승인 완료. 스케줄 대기 | pending_approval에서 승인 | scheduled, rejected | 없음 |
| **scheduled** | 예정됨. 활성화 대기 | approved 상태이고 현재 시각 < start_at | active, cancelled | 없음 |
| **active** | 진행 중 | 현재 시각이 [start_at, end_at] 범위 내 | paused, killed, ended | 있음 |
| **paused** | 일시정지 | active에서 pause 명령 | active (재개), ended, killed | 없음 |
| **ended** | 자연 종료 또는 강제 종료 | end_at 시각 도달 또는 kill/ended 명령 | archived | 없음 |

**상태 전이 트리거**
- **자동**: scheduled → active (start_at 도달), active → ended (end_at 도달)
- **수동**: draft → pending_approval (승인 요청), approved → scheduled (명시적), active → paused (일시정지), active → killed (긴급 종료), paused → active (재개), ended → archived (30일 경과)

**미결 정의**: 각 상태별 관리자 액션 제한 규칙 명확화 필요 (Draft 편집 가능 vs Scheduled 읽기 전용 등)

#### 2.2.3 Sticky Membership 메커니즘

**개념**
- 이벤트가 active 상태로 진입하는 시점에 현재 오디언스 멤버십을 스냅샷(sticky_snapshot)으로 저장
- 이후 오디언스 갱신과 무관하게 스냅샷 기준으로 플레이어 이벤트 참여 자격 결정
- 이벤트 종료 후 30일 뒤 자동 삭제 (스토리지 비용 관리)

**시나리오 예시**
- 신규 플레이어 수용 기준: 가입 후 3일 이내
- 2026-03-20에 가입한 P1이 2026-03-23에 "신규 환영 이벤트"(active) 진입
- 스냅샷에 P1 포함, 이벤트가 2026-03-24까지 진행
- 2026-03-24 오디언스 갱신 시 P1이 4일 경과로 "신규 플레이어" 조건 이탈
- **하지만** sticky_snapshot에 기반해 P1은 계속 이벤트 참여 자격 유지

**비즈니스 규칙**
- 단일 audience FK만 지원 (다중 오디언스는 nested audience로 대체)
- sticky_membership 스냅샷은 이벤트가 active 상태로 전환되는 시점에 1회 생성 후 재생성 불가
- 스냅샷은 이벤트가 ended/archived 상태로 전환된 후 30일 뒤 자동 삭제

**결론**
- Sticky Membership으로 이벤트 무결성 보장
- 세그멘테이션 로직 중복 제거 (한 번 정의한 오디언스를 모든 기능에서 재사용)

### 2.3 이벤트 스케줄링 설계

**배경**
- MVP에서 지원할 스케줄 타입: 단순(One-time), 반복(Recurring)
- 타임존 지원으로 관리자가 로컬 시각 기준으로 입력, 내부는 UTC 저장

**논의 내용**

#### 2.3.1 단순 스케줄 (One-time)
- start_at, end_at 두 시점을 IANA timezone DB 기준으로 입력
- 내부 저장은 UTC로 통일
- 예: 2026-03-25 10:00 ~ 12:00 (Asia/Seoul)

#### 2.3.2 반복 스케줄 (Recurring)
- RFC 5545 rrule 표준 기반
- FREQ(빈도), BYDAY(요일), BYMONTHDAY(월일) 등 조합 지원
- 예: FREQ=WEEKLY;BYDAY=FR (매주 금요일)
- UI는 드롭다운 기반 쉬운 선택지 제공 (매일, 매주, 매달 등)

#### 2.3.3 다단계 페이즈 모델 (확장 설계)
- MVP는 단일 main phase만 사용
- 미래(Phase 3+)를 위해 EVENT_PHASE 테이블 사전 설계
- 예: 핸드아웃 페이즈(이벤트 시작 전 1시간), 메인 페이즈(이벤트 진행), 후속 페이즈(종료 후 정산)

**결론**
- 단순/반복 스케줄 모두 MVP 포함
- 타임존 관리자 친화적 UX 제공
- 다단계 페이즈는 향후 확장을 위해 데이터 모델만 준비

### 2.4 승인 워크플로우 (Approval Workflow) 설계

**배경**
- 이벤트 오배포(e.g., 잘못된 오디언스 타겟팅, 중복 이벤트)로 인한 운영 사고 방지
- 기획자(요청), 승인자(검토), 개발자(모니터링) 3자 역할 분리

**논의 내용**

#### 2.4.1 승인 프로세스

| 단계 | 역할 | 액션 | 결과 |
|------|------|------|------|
| 1 | 기획자 | draft 상태의 이벤트를 pending_approval로 전환 (승인 요청) | pending_approval |
| 2 | 승인자 | 이벤트 설정 검토 (정책 위반 확인, 오디언스 유효성, 중복 확인) | - |
| 3 | 승인자 | 승인 또는 반려 | approved or rejected |
| 4 (승인 시) | 기획자 | approved 상태의 이벤트를 scheduled로 전환 (활성화 예약) | scheduled |
| 5 | 시스템 | 예정 시간 도달 시 scheduled → active 자동 전환 | active |

#### 2.4.2 승인 검토 체크리스트 (UI에 제시)
- 이벤트명 중복 여부
- 타겟 오디언스 멤버 수 (0인 경우 경고)
- 스케줄 충돌 여부 (동시 진행 이벤트 목록)
- Priority 타입 (critical, high, normal) 선택 여부
- 이벤트 설명 작성 여부 (최소 10자)

#### 2.4.3 알림 및 에스컬레이션
- pending_approval 상태 진입 시 승인자에게 이메일/푸시 알림
- 24시간 이상 미승인 시 자동 알림 (Phase 2 UX 확장 예정)

**결론**
- 2단계 승인(요청 → 승인) 구조로 MVP 시작
- 향후 다단계 승인(요청 → 1차 검토 → 최종 승인) 확장 가능

### 2.5 이벤트 목록 및 캘린더 뷰

**배경**
- 운영자가 한눈에 전체 이벤트 일정을 파악하고 조회/필터링/편집할 수 있는 UI 필요
- Satori(1/2/4주 뷰), AccelByte(월간 캘린더), Metaplay(타임라인 뷰) 참고

**논의 내용**

#### 2.5.1 이벤트 목록 뷰 (SCR-006)
- 테이블 형식: 이벤트명, 상태(뱃지), 타입, 우선순위, 시작시각, 종료시각, 타겟 오디언스명
- 필터: 상태(draft, pending_approval, scheduled, active, paused, ended), 타입(공지, 프로모션, 시즌이벤트 등), 우선순위
- 검색: 이벤트명 전문 검색
- 정렬: 시작시각, 우선순위, 상태

#### 2.5.2 캘린더 뷰 (SCR-009)
- 월간/주간 캘린더로 이벤트 시각화
- 색상 코딩: 상태별 색상 구분 (draft/회색, pending_approval/노랑, scheduled/파랑, active/초록, paused/주황, ended/어두운 회색)
- 클릭 시 이벤트 상세 팝업 또는 상세 페이지 진입

#### 2.5.3 타임라인 뷰 (SCR-010, Phase 2 UX 확장)
- 시간순 선형 뷰로 이벤트 겹침 시각화
- 리소스 할당 계획(향후) 시 유용

**결론**
- MVP: 이벤트 목록 + 캘린더 뷰 포함
- 타임라인 뷰는 UX 검토 후 Phase 2 확장 고려

### 2.6 이벤트 성과 대시보드 (Performance Dashboard)

**배경**
- 이벤트 운영자가 실시간/사후 성과를 추적해야 함
- Satori, AccelByte 모두 참여율, 매출 영향 지표 제공

**논의 내용**

#### 2.6.1 성과 지표
| 지표 | 정의 | 계산 방식 | 수집 시점 |
|------|------|----------|----------|
| **Participation Rate** | 이벤트 노출된 플레이어 중 참여한 비율 | 참여자 / 오디언스 멤버 | 이벤트 진행 중 실시간 |
| **Revenue Impact** | 이벤트 기간 중 증분 매출 | (이벤트 기간 매출) - (기준선 예상 매출) | 일일 정산 |
| **Engagement** | 플레이어의 이벤트 상호작용 정도 | 클릭, 클레임, 완료 횟수 | 실시간 |
| **Baseline Comparison** | 비교군 대비 성과 | 타겟 오디언스 성과 vs 비타겟 오디언스 성과 | 일일 정산 |

#### 2.6.2 성과 대시보드 화면 (SCR-011, Phase 2 UX 확장)
- 이벤트별 상세 페이지에 성과 탭 추가
- 기간별 그래프(일일 참여율, 누적 매출)
- 기준선 대비 비교 차트
- CSV 내보내기 기능

**미결사항**: 기준선 계산 방식(인접 기간 평균 vs 작년 동기 등) 확정 필요

**결론**
- 성과 대시보드는 Phase 2 UX 스펙 작성 시 상세 설계
- MVP는 이벤트 진행 중 참여율만 실시간 제공

### 2.7 긴급 제어 기능 (Emergency Controls)

**배경**
- 진행 중 이벤트에 오류 발견 시 즉시 대응 필요
- 예: 잘못된 오디언스 타겟팅, 성과 극악화

**논의 내용**

#### 2.7.1 Pause (일시정지)
- active 이벤트를 일시정지 (paused 상태로 전환)
- 모든 플레이어에게 이벤트 숨김
- 원인 및 예상 재개 시간을 내부 메모로 기록
- **조건**: 관리자 권한 필수

#### 2.7.2 Kill (긴급 종료)
- active 또는 paused 이벤트를 즉시 종료 (ended 상태로 전환)
- 되돌릴 수 없음 (archive 후 삭제 불가)
- 긴급 종료 사유 필수 입력
- **조건**: 관리자 권한 필수, 감사 로그에 기록

#### 2.7.3 Extend (종료 연장)
- active 이벤트의 end_at 시각을 연장
- 최대 연장 가능 시간: 원 계획 기간의 100% (e.g., 2시간 이벤트 → 최대 2시간 추가)
- 연장 사유 기록
- **조건**: 관리자 권한 필수

**UI**: 긴급 제어 모달 (SCR-012)에서 3가지 버튼 제공

**결론**
- 3가지 긴급 제어 모두 MVP 포함 (운영 안전성 필수)

### 2.8 교차 검증: PRD-UX-Diagram 일관성

**배경**
- Phase 1 세그멘테이션 문서화(PRD-GLO-001, UX-GLO-001, DIA-GLO-001) 완료 경험 기반
- Phase 2 Live Events도 3개 문서의 기능 정의, 화면 설계, 데이터/흐름 모델을 정렬

**논의 내용**

#### 2.8.1 기능 ID 매핑 (PRD ↔ UX)
| 기능 | PRD ID | 화면 ID | 설명 |
|------|--------|---------|------|
| 이벤트 CRUD | F-009 | SCR-006, SCR-007 | 목록/생성/편집 |
| 스케줄링 | F-010 | SCR-007 | 단순/반복 스케줄 |
| 승인 워크플로우 | F-011 | SCR-008 | 승인 요청/승인 |
| 오디언스 타겟팅 | F-012 | SCR-007 | 세그멘테이션 연동 |
| 상태 관리 | F-013 | SCR-011, SCR-012 | 상태 전이 + 긴급 제어 |
| 캘린더/타임라인 | F-014 | SCR-009, SCR-010 | 시각적 스케줄 |
| 성과 대시보드 | F-015 | SCR-011 | 지표 조회 |
| 웹훅/알림 | F-016 | (공통 설정) | Phase 2 UX 확장 |

#### 2.8.2 데이터 모델 일관성 (PRD ↔ DIA)
- DIA-GLO-002의 ERD에서 LIVE_EVENT를 중심으로 8개 관련 테이블 정의
- EVENT_STATE_LOG로 모든 상태 전이 감시(audit trail)
- AUDIENCE FK로 Phase 1 세그멘테이션과 연결

#### 2.8.3 시나리오 검증 (PRD ↔ UX ↔ DIA)
**시나리오**: "기획자가 신규 플레이어 대상 이벤트를 생성·승인·시작하고 성과를 추적"

1. **PRD 시나리오**
   - F-009: 기획자가 "신규 환영 이벤트" 생성 (draft)
   - F-010: start_at=2026-03-25 10:00, end_at=12:00 설정 (Asia/Seoul)
   - F-012: 오디언스 "신규 플레이어" 선택 + sticky_membership 옵션 활성화
   - F-011: 승인 요청 → pending_approval

2. **UX 시나리오 (SCR-007)**
   - 기획자가 폼 입력: 이벤트명, 설명, 타입(공지), 우선순위(high)
   - 스케줄 섹션: 날짜/시간 피커 (Asia/Seoul 자동 선택)
   - 타겟팅 탭: 오디언스 드롭다운에서 "신규 플레이어" 선택
   - Sticky Membership 체크박스 활성화
   - "승인 요청" 버튼 클릭

3. **DIA 시나리오 (데이터 흐름)**
   - LIVE_EVENT 레코드 생성 (status=draft)
   - EVENT_SCHEDULE 레코드 생성 (schedule_type=one-time, start_at=UTC 변환, end_at=UTC 변환, timezone=Asia/Seoul)
   - EVENT_APPROVAL 레코드 생성 (requested_at=now, reviewer_id=NULL → 승인자 배정 대기)
   - EVENT_STATE_LOG 기록 (draft → pending_approval)

4. **승인자 검토 (SCR-008)**
   - 체크리스트 확인: 오디언스 멤버 3,200명, 스케줄 충돌 없음, 설명 작성됨
   - "승인" 버튼 클릭

5. **DIA 업데이트**
   - EVENT_APPROVAL 레코드 업데이트 (reviewer_id=승인자, action=approve, decision_at=now)
   - EVENT_STATE_LOG 기록 (pending_approval → approved)

6. **자동 활성화**
   - 2026-03-25 10:00(Asia/Seoul) 도달 시 scheduled → active 자동 전환
   - EVENT_PHASE 테이블에 main phase 레코드 생성
   - STICKY_SNAPSHOT 생성 (3,200명의 "신규 플레이어" 멤버 캡처)
   - EVENT_STATE_LOG 기록 (scheduled → active)
   - EVENT_METRICS 초기화 (date=2026-03-25, participation_count=0)

7. **성과 추적 (SCR-011)**
   - 이벤트 상세 페이지 → 성과 탭
   - 실시간 참여율 그래프: 3,200명 중 약 1,200명(37.5%) 참여 상태
   - 기준선 대비: +12% 성과

8. **종료**
   - 2026-03-25 12:00 도달 시 active → ended 자동 전환
   - EVENT_METRICS 최종 집계
   - EVENT_STATE_LOG 기록 (active → ended)
   - 30일 후 sticky_snapshot 자동 삭제

**검증 결과**: PRD, UX, DIA 일관성 확인 완료

**결론**
- 3개 문서 간 기능 ID, 화면 매핑, 데이터 모델 정렬 완료
- 시나리오 기반 end-to-end 검증으로 누락 사항 확인 및 수정

---

## 3. 결정 사항

| ID | 결정 내용 | 근거 | 비고 |
|----|----------|------|------|
| D-011 | 라이브 이벤트 관리를 GLO 서비스 제2 우선순위 기능(P1)으로 확정 | RES-GLO-002에서 6/7 경쟁 플랫폼 필수 기능 확인, Phase 1 세그멘테이션과의 직접 의존성 | MVP Phase 2 포함 |
| D-012 | 이벤트 상태 머신을 7단계(draft→pending_approval→approved→scheduled→active→paused/ended→archived)로 정의 | 이벤트 전 생명 주기 명확화, 상태별 관리자/시스템 액션 구분 | EVENT_STATE_LOG로 감시 |
| D-013 | Sticky Membership 메커니즘 도입 (이벤트 active 진입 시 오디언스 스냅샷 생성, 30일 후 자동 삭제) | 세그멘테이션 로직 중복 제거 + 이벤트 무결성 보장, Satori 검증된 패턴 | Phase 1 세그멘테이션 기반 |
| D-014 | 2단계 승인 워크플로우(기획자 요청 → 승인자 검토/승인/반려) 구현 | 이벤트 오배포 방지, 운영 안전성 확보 | 향후 다단계 승인으로 확장 가능 |
| D-015 | 단순 스케줄(one-time) + 반복 스케줄(RFC 5545 rrule) 모두 MVP 포함, 타임존 관리자 친화적 UI 제공 | 운영자 편의성, 경쟁사 표준 기능 | 내부 저장은 UTC로 통일 |
| D-016 | 3가지 긴급 제어 기능(Pause/Kill/Extend) MVP 포함 | 진행 중 이벤트 운영 이슈 즉시 대응 필수 | 관리자 권한 필수, 감사 로그 기록 |
| D-017 | 성과 대시보드는 Phase 2 UX 스펙 작성 시 상세 설계, MVP는 이벤트 진행 중 참여율만 실시간 제공 | 개발 리소스 조정, Phase 1 우선 집중 | Phase 2 확장 로드맵 반영 |
| D-018 | PRD-GLO-002, UX-GLO-002, DIA-GLO-002 3개 문서 교차 검증 완료 및 일관성 확보 | 기능 ID 매핑, 화면-기능 정렬, 데이터 모델 검증 | 시나리오 기반 end-to-end 검증 |

---

## 4. 액션 아이템

| ID | 항목 | 담당 | 기한 | 상태 |
|----|------|------|------|------|
| A-013 | PRD-GLO-002 상세 수정: 승인 검토 체크리스트 UI 목록화, 기준선 계산 방식 정의 (인접 기간 vs 작년 동기) | prd | - | 진행중 |
| A-014 | UX-GLO-002 Part 2 작성: 성과 대시보드(SCR-011) 상세 화면, 타임라인 뷰(SCR-010) 레이아웃 | uiux-spec | - | 대기 |
| A-015 | DIA-GLO-002 추가 다이어그램: 상태 머신 시각화(State Diagram), 승인 워크플로우 시퀀스(Sequence Diagram) | diagram | - | 진행중 |
| A-016 | 라이브 이벤트 성과 대시보드 성과 지표 정의 확정 (참여율 계산 공식, 매출 영향 산정 방식, 기준선 비교 로직) | planner | - | 대기 |
| A-017 | 긴급 제어(Pause/Kill/Extend) 시 필요한 권한 레벨 정의 및 감사 로그 스키마 설계 | prd | - | 대기 |
| A-018 | SDK 이벤트 응답 캐싱 정책 수립 (캐시 TTL 1분, 상태 변경 반영 지연 최소화) | 백엔드 개발팀 | - | 대기 |

---

## 5. 미결 사항

| ID | 이슈 | 필요한 정보/결정 | 담당 |
|----|------|-----------------|------|
| Q-010 | 성과 대시보드의 기준선 계산 방식을 어떻게 할 것인가? (인접 기간 평균 vs 작년 동기 vs 커스텀) | 운영 데이터 특성 및 마케팅팀 요구사항 수집 필요 | planner |
| Q-011 | 다단계 페이즈(핸드아웃 / 메인 / 후속) 구현 시점을 Phase 2(예정) vs Phase 3+ 중 어디로 할 것인가? | MVP 출시 후 운영 요청 빈도 판단 필요 | planner |
| Q-012 | 이벤트 생성/편집 시 Draft 상태에서 몇 번까지 편집 가능할 것인가? (무제한 vs 최대 N회 vs 시간 제한) | 운영자 UX vs 데이터 일관성 트레이드오프 | uiux-spec |
| Q-013 | Sticky Membership 스냅샷 저장소의 확장성: 큰 오디언스(예: 100만+ 멤버)의 경우 성능 영향은? | 데이터 저장소 설계 및 인덱싱 전략 필요 | 백엔드 아키텍처 팀 |
| Q-014 | 이벤트 오디언스가 삭제되는 경우 처리 방식은? (이벤트 자동 비활성화 vs 경고만 vs 전체 플레이어 대상 전환) | 일관된 정책 필요 | planner |
| Q-015 | 웹훅(Webhook) 및 알림(Notification) 기능을 MVP에 포함할 것인가, Phase 2 UX 확장으로 미룰 것인가? | 초기 운영자 요청 빈도 판단 | planner |

---

## 6. 다음 회의 안건

- [ ] PRD-GLO-002 상세 수정 검토 (D-013 승인 검토 체크리스트, D-016 기준선 정의)
- [ ] UX-GLO-002 Part 2 화면 설계 리뷰 (성과 대시보드, 타임라인 뷰)
- [ ] DIA-GLO-002 추가 다이어그램 검토 (상태 머신, 승인 워크플로우 시퀀스)
- [ ] Phase 1 검토 일정 확정 및 reviewer 에이전트 스폰 계획
- [ ] Phase 3 로드맵 수립 (A/B 테스트, Feature Flags, Messages 우선순위)

---

## 7. 서비스 컨텍스트 요약

> 이 섹션은 다른 에이전트가 참조할 수 있도록 현재까지 확정된 내용을 요약합니다.

```yaml
service:
  name: "Game LiveOps Service"
  target_user: "중소 모바일 게임사, 기획자/마케터/운영자"
  core_value: "기획자가 바로 쓸 수 있는 노코드 Game LiveOps 플랫폼"

current_phase: "planning"
  active_phases:
    - name: "Phase 1: 플레이어 세그멘테이션"
      status: "documentation-complete"
      documents: ["PRD-GLO-001", "UX-GLO-001", "DIA-GLO-001"]
    - name: "Phase 2: 라이브 이벤트 관리"
      status: "documentation-complete"
      documents: ["PRD-GLO-002", "UX-GLO-002", "DIA-GLO-002"]

confirmed_features:
  - id: "F-009"
    name: "라이브 이벤트 CRUD"
    priority: "P1"
    status: "designed"
    depends_on: ["F-001 (세그멘테이션)"]

  - id: "F-010"
    name: "이벤트 스케줄링 (단순/반복)"
    priority: "P1"
    status: "designed"

  - id: "F-011"
    name: "승인 워크플로우"
    priority: "P1"
    status: "designed"
    governance: "2단계 (요청 → 검토/승인)"

  - id: "F-012"
    name: "오디언스 타겟팅 (세그멘테이션 연동)"
    priority: "P1"
    status: "designed"
    model: "Sticky Membership 스냅샷 기반"

  - id: "F-013"
    name: "이벤트 상태 관리 + 긴급 제어"
    priority: "P1"
    status: "designed"
    controls: ["Pause (일시정지)", "Kill (긴급종료)", "Extend (종료연장)"]

  - id: "F-014"
    name: "캘린더/타임라인 뷰"
    priority: "P1"
    status: "designed"
    views: ["월간 캘린더", "주간 캘린더", "타임라인 (Phase 2 UX 확장)"]

  - id: "F-015"
    name: "성과 대시보드"
    priority: "P1"
    status: "designed"
    metrics: ["Participation Rate", "Revenue Impact", "Engagement", "Baseline Comparison"]
    mvp_scope: "참여율만 실시간, 상세 대시보드는 Phase 2 확장"

  - id: "F-016"
    name: "웹훅/알림"
    priority: "P1"
    status: "backlog"
    planned_phase: "Phase 2 UX 확장"

event_state_machine:
  states:
    - draft: "초안, 편집 중"
    - pending_approval: "승인 대기"
    - approved: "승인 완료, 스케줄 대기"
    - scheduled: "예정됨, 활성화 대기"
    - active: "진행 중, 플레이어 노출"
    - paused: "일시정지"
    - ended: "자연/강제 종료"

  audit: "EVENT_STATE_LOG로 모든 상태 전이 기록"

approval_workflow:
  process: "2단계 (기획자 요청 → 승인자 검토/승인/반려)"
  checklist:
    - "이벤트명 중복 확인"
    - "타겟 오디언스 멤버 수 (0 경고)"
    - "스케줄 충돌 확인"
    - "Priority 선택 여부"
    - "설명 작성 여부"
  audit: "EVENT_APPROVAL 테이블로 모든 승인 이력 기록"

event_targeting:
  model: "Sticky Membership 스냅샷 기반"
  snapshot_timing: "이벤트 active 진입 시점에 1회 생성"
  snapshot_retention: "이벤트 ended/archived 후 30일 뒤 자동 삭제"
  audience_integration: "Phase 1 세그멘테이션의 AUDIENCE 테이블 FK 참조"
  nested_audience: "다중 오디언스는 nested audience로 구성"

scheduling:
  types: ["One-time (단순)", "Recurring (RFC 5545 rrule)"]
  timezone: "IANA timezone DB 지원, 관리자 로컬 시각 입력, 내부 저장은 UTC"
  phase_model: "다단계 페이즈 준비 (MVP=단일 main phase), Phase 3+ 확장"

emergency_controls:
  pause: "active 이벤트 일시정지, 모든 플레이어에게 숨김, 재개 가능"
  kill: "active/paused 이벤트 긴급 종료, 되돌릴 수 없음, 사유 필수"
  extend: "active 이벤트 end_at 연장, 최대 원 계획 기간의 100%, 사유 기록"

performance_dashboard:
  metrics:
    - "Participation Rate (이벤트 기간 중 실시간)"
    - "Revenue Impact (일일 정산)"
    - "Engagement (상호작용 횟수)"
    - "Baseline Comparison (타겟 vs 비타겟 오디언스)"
  mvp_scope: "참여율만 실시간 제공"
  phase_2_expansion: "상세 대시보드, 그래프, CSV 내보내기"

data_model:
  tables:
    - "LIVE_EVENT (중심 엔티티)"
    - "EVENT_SCHEDULE (스케줄)"
    - "EVENT_PHASE (다단계 페이즈, MVP=단일)"
    - "EVENT_APPROVAL (승인 이력)"
    - "EVENT_METRICS (성과 지표)"
    - "EVENT_STATE_LOG (상태 전이 감시)"
  audit: "EVENT_STATE_LOG와 EVENT_APPROVAL로 전체 감시(audit trail) 확보"

documentation:
  phase_2:
    - id: "PRD-GLO-002"
      title: "라이브 이벤트 생성 및 스케줄링 PRD"
      status: "draft"
      version: "v1.0"
    - id: "UX-GLO-002"
      title: "라이브 이벤트 화면 정의서"
      status: "draft"
      version: "v1.0"
      note: "Part 2 (성과 대시보드, 타임라인) 작성 예정"
    - id: "DIA-GLO-002"
      title: "라이브 이벤트 다이어그램"
      status: "draft"
      version: "v1.0"
      note: "상태 머신, 승인 워크플로우 시퀀스 추가 예정"

key_decisions:
  - "D-001: 시장조사부터 시작"
  - "D-002: 프로젝트 코드 GLO"
  - "D-003: 시장조사 필수 포함항목 4가지"
  - "D-004: 7개 플랫폼 심층 분석 완료"
  - "D-005: 8개 핵심 기능 카테고리"
  - "D-006: 필수/권장/선택 3단계 우선순위"
  - "D-007: 플레이어 세그멘테이션 P0"
  - "D-008: Identity-Properties-Audience 3계층 구조"
  - "D-009: Audience 공통 타겟팅 단위"
  - "D-010: 필터 DSL + 폼 빌더 UI"
  - "D-011: 라이브 이벤트 P1"
  - "D-012: 7단계 상태 머신"
  - "D-013: Sticky Membership 스냅샷"
  - "D-014: 2단계 승인 워크플로우"
  - "D-015: 단순/반복 스케줄 + 타임존"
  - "D-016: 3가지 긴급 제어 MVP 포함"
  - "D-017: 성과 대시보드 Phase 2 확장"
  - "D-018: 3개 문서 교차 검증 완료"

constraints:
  - "비개발자(기획자/운영자) 친화적 도구 필수"
  - "승인 워크플로우로 이벤트 오배포 방지"
  - "세그멘테이션 로직 중복 제거 (Sticky Membership 활용)"
  - "이벤트 진행 중 긴급 대응 가능성 보장 (Pause/Kill/Extend)"
  - "감시(Audit Trail) 기능 필수 (EVENT_STATE_LOG, EVENT_APPROVAL)"
  - "Sticky Membership 스냅샷 성능 및 저장소 확장성 검토 필요"

roadmap:
  phase_1_review:
    status: "pending"
    target_completion: "2026-04-XX"
    activities:
      - "PRD-GLO-001, UX-GLO-001, DIA-GLO-001 reviewer 검토"
      - "Feedback 반영 및 문서 개선"
      - "최종 승인"

  phase_2_review:
    status: "pending"
    target_completion: "2026-05-XX"
    activities:
      - "PRD-GLO-002, UX-GLO-002, DIA-GLO-002 reviewer 검토"
      - "A-013~A-015 액션 아이템 완료 검증"
      - "최종 승인"

  phase_3_planning:
    status: "pending"
    features:
      - "A/B 테스트 (Experiments)"
      - "Feature Flags"
      - "Messages (푸시/이메일)"
      - "Advanced Analytics"
      - "Webhook/Notification"
```

---

## 변경 이력

| 버전 | 일자 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| v1.0 | 2026-03-23 | 초안 작성 - 라이브 이벤트 기획 및 문서화 완료 회의 기록 | meeting-note |
