---
id: "MTG-GLO-006"
title: "일일 작업 세션: KPI 대시보드, RBAC, MVP 전체 셸 구축 및 구현"
project: "GLO"
version: "v1.0"
status: "completed"
created: "2026-03-26"
updated: "2026-03-26"
author: "meeting-note"
session_type: "구현"
participants:
  - "사용자"
  - "planner"
related_docs:
  - "RES-GLO-002"
  - "PRD-GLO-001"
  - "PRD-GLO-002"
  - "PRD-GLO-003"
  - "PRD-GLO-004"
  - "PRD-GLO-005"
  - "UX-GLO-001"
  - "UX-GLO-002"
  - "UX-GLO-003"
  - "DIA-GLO-001"
  - "DIA-GLO-002"
  - "DIA-GLO-003"
  - "SPEC-GLO-002"
  - "SPEC-GLO-003"
tags:
  - "project:game-liveops"
  - "type:meeting"
  - "topic:implementation"
  - "session:daily-work"
---

# 회의록: Game LiveOps 일일 작업 세션 (2026-03-26)

> 2026-03-26 전일 작업 내역을 정리한 회의록. KPI 대시보드 기획 및 구현, RBAC 설계 및 구현, MVP 전체 셸 구축, 라이브 이벤트/A/B 테스트/세그멘테이션 전면 재구축, 문서 리뷰 및 수정, UI/UX 개선이 완료되었으며, 총 13개 Phase와 11개 기획 산출물(2 PRD + 2 UX + 2 DIA + 2 Planning + 2 Spec + 1 Review), 15+ 페이지, 22+ API 엔드포인트, 5 feature 모듈을 산출했다.

## 문서 정보

| 항목 | 내용 |
|------|------|
| ID | MTG-GLO-006 |
| 일시 | 2026-03-26 |
| 참석자 | 사용자, planner |
| 세션 유형 | 일일 작업 세션 (구현/기획 병렬) |
| 관련 문서 | RES-GLO-002, PRD-GLO-001~005, UX-GLO-001~003, DIA-GLO-001~003, SPEC-GLO-002~003 |

---

## 1. 회의 목적

2026-03-26 일일 작업의 진행 상황을 정리하고, 다음 단계 작업 계획을 수립한다. KPI 대시보드와 RBAC 기능의 설계 및 구현 완료, MVP 전체 셸 구축, 라이브 이벤트/A/B 테스트/세그멘테이션 기능의 전면 재구축, 문서 품질 개선을 통해 Phase 2 기획 단계를 마무리하고 구현 준비 상태로 전환한다.

---

## 2. 논의 내용

### 2.1 Phase 1: 핵심 지표 대시보드(KPI Dashboard) 기획 및 구현

**배경**
- RES-GLO-002의 경쟁사 분석에서 Must-Have #6 "핵심 지표 대시보드" 기능 도출
- GameAnalytics, Satori 등 경쟁 서비스 벤치마킹

**논의 내용**
- 대시보드 설계 방식:
  - 스냅샷 대시보드 접근 방식 채택 (실시간 아님)
  - 사용자: LiveOps 운영팀 (기술 수준 낮음)
  - 지표 영역: DAU + 리텐션 + 수익 3가지 균형
  - 기간: 일간 중심 (주간/월간 선택 옵션)
  - 필터링: 전체만 (세그멘트별 필터링은 Phase 2)
  - 알림 기능: 미포함
  - 데이터: Mock 데이터 기반

- 설계 스펙 작성(SPEC-GLO-002) → 스펙 리뷰 통과

- 구현 계획: 9개 Task (TypeScript 타입, Mock 데이터, API Route, React Query, UI 컴포넌트, 페이지 조립)

- Subagent-Driven Development로 구현 완료:
  1. Next.js 16 프로젝트 초기화 (`apps/admin/`)
  2. TypeScript 타입 및 포맷 유틸리티 (TDD)
  3. Mock 데이터 + 4개 API Route Handlers
  4. React Query + Dashboard Hooks
  5. KpiMetricCard + KpiSummaryCards (TDD)
  6. PeriodToggle + ActivityTrendChart (TDD)
  7. RetentionCurveChart + RevenueTrendChart (TDD)
  8. Dashboard 페이지 조립
  9. 전체 37/37 테스트 통과 ✓

**결론**
- KPI 대시보드 기능 구현 완료
- 스펙 리뷰 패스, 테스트 100% 통과

### 2.2 Phase 2: 역할 기반 접근 제어(RBAC) 설계 및 구현

**배경**
- Must-Have #8 "RBAC" 기능 기획 시작
- 운영팀 구성원의 다양한 권한 레벨(관리자/운영/뷰어) 관리 필요

**논의 내용**
- RBAC 설계 방식:
  - 3역할 모델: Admin(전체 권한) / Operator(주요 권한) / Viewer(읽기 전용)
  - 계층적 권한 구조
  - Mock 인증: JWT + httpOnly 쿠키
  - Next.js Middleware 기반 라우트 보호
  - 관리자 관리 UI 포함
  - 감사 로그 포함

- 설계 스펙 작성(SPEC-GLO-003) → 스펙 리뷰 통과

- 구현 완료 (10개 Task):
  1. Auth types 정의
  2. JWT session manager
  3. Mock users 데이터
  4. Auth API (login/logout/verify)
  5. Next.js Middleware 라우트 보호
  6. Admin API (사용자 관리)
  7. useAuth hook
  8. RoleGate 컴포넌트
  9. GNB(Global Navigation Bar) 통합
  10. Login/403/Settings 페이지

**결론**
- RBAC 기능 구현 완료
- 스펙 리뷰 패스

### 2.3 Phase 3: MVP 전체 셸 구축 (아키텍처 설계)

**배경**
- CROSS Ramp Console (경쟁 서비스) 화면 8개 학습
- 자체 서비스의 UI/UX 패턴 정의 필요

**논의 내용**
- MVP 아키텍처 설계:
  - Phase 1: 사이드바 레이아웃 (GNB → Sidebar + Header + AppShell)
  - Phase 2: 플레이어 세그멘테이션 CRUD (목록/상세/생성 3개 페이지 + 5개 API)
  - Phase 3: 라이브 이벤트 CRUD (목록/상세/생성 3개 페이지 + 5개 API)
  - Phase 4: A/B 테스트 CRUD (목록/상세/생성 3개 페이지 + 5개 API)

- UI 패턴: 일관된 레이아웃, 테이블 + 폼 + 모달 조합

**결론**
- MVP 구현 계획 수립 완료
- 4단계 순차 구현 로드맵 확정

### 2.4 Phase 4: 기획 문서 생성

**논의 내용**
- KPI 대시보드 관련:
  - PRD-GLO-004: KPI 대시보드 PRD (기능 명세, 지표 정의, API 스펙)
  - UX-GLO-004: 화면 정의서 (대시보드 레이아웃, 차트, 필터 UI)
  - DIA-GLO-004: 다이어그램 (데이터 흐름, 컴포넌트 구조)

- RBAC 관련:
  - PRD-GLO-005: RBAC PRD (역할 정의, 권한 매트릭스, API 스펙)
  - UX-GLO-005: 화면 정의서 (로그인, 관리자 UI, 권한 표시)
  - DIA-GLO-005: 다이어그램 (권한 흐름, 미들웨어 아키텍처)

**결론**
- 6개 문서 병렬 생성 완료 (PRD 2 + UX 2 + DIA 2)

### 2.5 Phase 5: 라이브 이벤트 PRD 정합성 검증 및 전면 재구축

**배경**
- PRD-GLO-002 기준 현재 구현과의 불일치 확인
- 스펙 명확화 및 구현 정렬 필요

**논의 내용**
- 라이브 이벤트 기능 전면 재구축 (PRD-GLO-002 기준):
  1. event_type: 고정 enum → 자유 문자열 레이블로 변경
  2. Priority: 4단계 추가 (Low/Medium/High/Critical)
  3. 스케줄: 단순(one-time, start/end) + 반복(RFC 5545 rrule) 지원
  4. 상태 머신: 7단계
     - draft → pending_approval → approved → scheduled → active → paused/ended → archived
     - (cancelled 제거, ended로 통일)
  5. 승인 워크플로우: 승인요청 → 승인/반려 (2단계)
  6. 긴급 제어: Pause/Kill/Extend + 사유 입력 모달
  7. EVENT_STATE_LOG: 이벤트 상태 변경 이력 추적
  8. 목록 필터링/정렬/검색 기능
  9. 이벤트 복제 기능
  10. Metadata JSON 편집기
  11. stickyMembership: 이벤트 active 시 오디언스 스냅샷
  12. payloadSchemaVersion: 페이로드 버전 관리

**결론**
- 라이브 이벤트 기능 사양 명확화 완료
- PRD-GLO-002와의 동기화 확인

### 2.6 Phase 6: UX 스펙 정합성 (라이브 이벤트) 및 UI 재구축

**배경**
- UX-GLO-002 기준 현재 UI와의 불일치 확인
- 운영팀 사용성 중심 UI 재설계 필요

**논의 내용**
- 라이브 이벤트 UI 전면 재구축 (UX-GLO-002 기준):
  1. 생성 폼: 4탭 스텝 (기본정보 → 스케줄 → 타겟팅 → 검토)
  2. 관리 화면 서브탭:
     - 이벤트 목록 (필터/정렬/검색)
     - 승인 대기 (pending_approval 상태 이벤트만)
     - 캘린더 뷰
     - 타임라인 뷰
  3. 승인 대기 페이지: 승인/반려/검토 UI
  4. 편집 모드: `/events/[id]/edit` 페이지
  5. 행 호버 액션: CSS group opacity 패턴
  6. 상태 배지: UX 스펙 7색 (draft/pending/approved/scheduled/active/paused/ended)
  7. Empty/Loading 상태 화면

**결론**
- 라이브 이벤트 UI 사양 명확화 및 재구축 계획 수립

### 2.7 Phase 7: 캘린더 + 타임라인 뷰 구현

**논의 내용**
- F-014 기능 구현 (라이브 이벤트 관리 고급 뷰):
  - 캘린더 뷰: 1주/2주/4주/월 선택 가능, 이벤트 블록 표시, 호버 팝오버, 범례
  - 타임라인 뷰: 간트 차트, 오디언스별 레인(lane), 줌 전환, 이벤트 바 상세 정보

**결론**
- 캘린더/타임라인 고급 뷰 기능 설계 완료

### 2.8 Phase 8: A/B 테스트 전면 재구축

**배경**
- PRD-GLO-003, UX-GLO-003, DIA-GLO-003 기준 명세 재확인
- 상태 머신 및 UI 정렬

**논의 내용**
- A/B 테스트 기능 전면 재구축:
  1. 상태 머신: 9개 상태
     - draft → testing → pending_approval → running → paused → stopped → analyzing → completed → archived
  2. 가설 3필드: what/why/expected
  3. 5단계 위저드:
     - Step 1: 기본정보 (실험명, 설명, 가설 3필드)
     - Step 2: 변형 정의 (컨트롤 + 최대 3개 변형, 트래픽 %)
     - Step 3: 오디언스 선택 (기존 오디언스 재사용)
     - Step 4: 지표 설정 (Primary 1개 + Secondary 최대 3개, MDE, 유의수준)
     - Step 5: 검토 및 저장
  4. 목표 지표: Primary + Secondary 구분, MDE, 유의수준(α=0.05)
  5. 변형 결과: p-value, CI(95%), 승자 표시
  6. 상태 전이 액션: 8가지 (승인 요청, 승인/반려, 실행, 일시정지, 중단, 분석, 완료, 보관)
  7. 승인 워크플로우: 요청 → 검토 → 승인/반려
  8. 승인 대기 페이지

**결론**
- A/B 테스트 기능 사양 명확화 및 UI 정렬 완료

### 2.9 Phase 9: 세그멘테이션 전면 재구축

**배경**
- PRD-GLO-001, UX-GLO-001, DIA-GLO-001 기준 속성 시스템 및 UI 재설계
- 운영팀이 쉽게 오디언스를 정의할 수 있도록 개선

**논의 내용**
- 플레이어 세그멘테이션 기능 전면 재구축:
  1. 속성 시스템: 3계층
     - Default: 자동 수집 (user_id, install_date, last_active_date 등)
     - Computed: 자동 계산 (구매 횟수, 활동 점수, 세그먼트 멤버십 등)
     - Custom: 사용자 정의 (게임 특화 속성)
  2. Audience 생성:
     - ConditionGroup (AND/OR 로직)
     - 쿼리 모드 토글 (폼 빌더 ↔ DSL)
  3. 사전정의 오디언스: 8개 (신규, 활성, 휴면, 이탈, 결제자 등)
  4. 화면:
     - SCR-004: 속성 관리 페이지 (3탭: Default/Computed/Custom)
     - SCR-005: 이벤트 택소노미 페이지 (측정 이벤트 관리)
     - 서브탭: 오디언스/속성/이벤트 택소노미
  5. In Use/Unused 상태 배지 (오디언스 사용 현황)

**결론**
- 세그멘테이션 기능 사양 명확화 및 UI 정렬 완료

### 2.10 Phase 10: 문서 리뷰 및 수정

**배경**
- REV-GLO-003 리뷰 리포트 작성 (라이브 이벤트/A/B/세그멘테이션)
- 문서 품질 개선

**논의 내용**
- REV-GLO-003 검토 결과: Conditional (Major 3, Minor 8)
- 문서 수정 적용:
  1. PRD-GLO-001 v1.1: 화면 ID 수정, 변경 이력 추가, 미결사항 상태 갱신
  2. DIA-GLO-001 v1.1: ERD에 EVENT_TAXONOMY, COMPUTED_PROPERTY_RULE 엔티티 추가
  3. SES-GLO-004 v1.1 (Planning): 문서 ID 자기참조, 액션아이템 상태 갱신

**결론**
- 리뷰 이슈 반영 및 문서 v1.1 버전 업그레이드 완료

### 2.11 Phase 11: RBAC 4역할 확장

**배경**
- 초기 3역할(Admin/Operator/Viewer) 모델의 세분화 필요
- 이벤트/실험 기획과 승인의 권한 분리 필요

**논의 내용**
- RBAC 4역할 모델로 확장:
  - Admin(4): 모든 권한 (설정, RBAC 관리, 감사 로그)
  - Operator(3): CRUD + 승인/반려 (이벤트/실험 승인 권한)
  - Editor(2): CRUD + 승인요청만 (이벤트/실험 작성, 승인은 불가)
  - Viewer(1): 읽기 전용

- 권한 규칙:
  - 이벤트/실험 승인 버튼: operator 이상만 표시
  - 기획자(Editor)는 작업 후 operator에 승인 요청

- RBAC PRD 권한 매트릭스 업데이트

**결론**
- 4역할 모델로 확장 완료 (D-026으로 기록)

### 2.12 Phase 12: 대시보드 KPI 카드 7개로 교체

**배경**
- 초기 4개 지표(DAU/MAU/D1리텐션/일매출)의 확대
- 실제 게임 운영에 필요한 지표 추가

**논의 내용**
- KPI 카드 7개로 변경:
  1. NRU (New Registered Users): 신규 가입 수
  2. DAU (Daily Active Users): 일일 활성 사용자
  3. MCU (Monthly Conversion Users): 월간 구매 사용자
  4. PU (Paying Users): 결제 사용자 수
  5. PUR (Paying User Ratio): PU/DAU %
  6. Revenue: 일일 매출
  7. ARPPU (Average Revenue Per Paying User): 구매 사용자당 평균 수익

- MCU에 "/DAU 31.3%" 부가 정보 표시 (전환율)

- 차트 가시성 개선:
  - 높이 증가
  - strokeWidth 증가
  - 연한 그리드

- 수익 트렌드: PUR ↔ conversionRate 일치 확인

- 회원 활동 트렌드: NRU 라인 추가

**결론**
- KPI 지표 확대 완료 (7개로 통일)
- 차트 가시성 개선 완료

### 2.13 Phase 13: UI/UX 개선

**논의 내용**
- 사이드바 메뉴 순서 정렬:
  - 대시보드 → 세그멘테이션 → 이벤트 → 실험 → 설정

- 콘텐츠 영역 여백 추가:
  - AppShell px-6 py-6 (좌우/상하 여백)

- 설정 레이아웃 통일:
  - 세그멘테이션 패턴 재사용

- 로그아웃 시 UI 개선:
  - 사이드바/헤더 잔존 버그 수정

- 로그인 화면 퀵 로그인:
  - 4개 버튼 (Admin/Operator/Editor/Viewer)

- 감사 로그 Mock 데이터:
  - 25건 추가

- 세그멘테이션 목록 테이블:
  - 컬럼 UX 스펙 정렬

- 전체 목록 페이지:
  - 페이지네이션 추가 (10건/페이지)

- 메뉴명 변경:
  - "세그먼트" → "세그멘테이션"

**결론**
- 전체 UI/UX 개선 완료 (접근성 및 사용성 향상)

---

## 3. 결정 사항

| ID | 결정 내용 | 근거 | 비고 |
|----|----------|------|------|
| D-026 | RBAC 4역할 모델로 확장 (Admin/Operator/Editor/Viewer) | 기획 권한과 승인 권한의 분리 필요, 게임사 조직 구조 고려 | Editor 역할 추가로 세분화 |
| D-027 | KPI 대시보드 7개 지표로 통일 (NRU/DAU/MCU/PU/PUR/Revenue/ARPPU) | 게임 운영 필수 지표 확대, 구매 전환 추적 강화 | MCU에 전환율(%) 부가정보 표시 |
| D-028 | 라이브 이벤트 event_type 자유 문자열 레이블로 변경 | 고정 enum보다 유연성 높음, 게임사별 이벤트 분류 자유 | 운영팀 커스텀 레이블 지원 |
| D-029 | 라이브 이벤트 Priority 4단계 추가 (Low/Medium/High/Critical) | 이벤트 우선순위 관리 필수, 운영 계획 수립 시 필요 | 상태 머신과 분리 |
| D-030 | 라이브 이벤트 상태 머신 7단계 (cancelled 제거, ended로 통일) | 상태 단순화, 이벤트 종료 상태 명확화 | 긴급 제어(Kill) 사용 시에만 즉시 종료 |
| D-031 | 세그멘테이션 3계층 속성 시스템 확정 (Default/Computed/Custom) | 자동화와 유연성 동시 확보, Satori 검증 패턴 | Computed는 이벤트 기반 자동 계산 |
| D-032 | UI/UX 통일: 메뉴 순서, 여백, 로그아웃 UI 개선 | 사용자 경험 향상, 일관된 디자인 | 페이지네이션 추가로 대량 데이터 표시 최적화 |

---

## 4. 액션 아이템

| ID | 항목 | 담당 | 기한 | 상태 |
|----|------|------|------|------|
| A-023 | MVP 사이드바 레이아웃 전환 (GNB → Sidebar + Header + AppShell) | senior-frontend-developer | TBD | pending |
| A-024 | 플레이어 세그멘테이션 CRUD (목록/상세/생성 3개 페이지 + 5개 API) | senior-frontend-developer | TBD | pending |
| A-025 | 라이브 이벤트 CRUD 전면 재구축 (PRD-GLO-002 정합성) | senior-frontend-developer | TBD | pending |
| A-026 | 라이브 이벤트 캘린더/타임라인 뷰 구현 (F-014) | senior-frontend-developer | TBD | pending |
| A-027 | A/B 테스트 CRUD 전면 재구축 (PRD-GLO-003 정합성) | senior-frontend-developer | TBD | pending |
| A-028 | 세그멘테이션 CRUD 전면 재구축 (PRD-GLO-001 정합성) | senior-frontend-developer | TBD | pending |
| A-029 | RBAC 4역할 모델 구현 (Editor 역할 추가) | senior-frontend-developer | TBD | pending |
| A-030 | KPI 대시보드 7개 지표 카드 교체 및 차트 가시성 개선 | senior-frontend-developer | TBD | pending |
| A-031 | 전체 목록 페이지 페이지네이션 추가 (10건/페이지) | senior-frontend-developer | TBD | pending |

---

## 5. 미결 사항

| ID | 이슈 | 필요한 정보/결정 | 담당 |
|----|------|-----------------|------|
| Q-018 | 캘린더/타임라인 뷰의 성능 최적화 | 대량 이벤트(1000+) 렌더링 성능 테스트, 가상 스크롤 적용 여부 | senior-frontend-developer |
| Q-019 | A/B 테스트 분석 페이지의 통계 계산 백엔드 | 실시간 p-value, CI, Bonferroni 보정 계산 필요, 성능 요구사항 정의 | backend |
| Q-020 | Computed Property 자동 계산 규칙의 스케일링 | 매일 100만+ 플레이어의 세그멘테이션 재계산 필요, 배치 처리 vs 실시간 | backend |
| Q-021 | stickyMembership 스냅샷 저장소의 장기 보관 정책 | 30일 후 자동 삭제, 감시 로그 보관 기간, 복구 가능성 검토 | backend |

---

## 6. 다음 회의 안건

- [ ] MVP 사이드바 레이아웃 구현 진행 상황 점검
- [ ] 플레이어 세그멘테이션 CRUD 구현 스펙 확정
- [ ] 라이브 이벤트 CRUD 전면 재구축 구현 계획 검토
- [ ] A/B 테스트 구현 일정 및 우선순위 조정
- [ ] 백엔드 API 스펙 최종 확정 및 계약 문서(API Contract) 작성
- [ ] 성능 테스트 계획 (캘린더/타임라인, 세그멘테이션 재계산)

---

## 7. 산출물 요약

### 기획 문서 (11개)

| 타입 | 개수 | 항목 |
|------|------|------|
| PRD | 2 | PRD-GLO-004 (KPI 대시보드), PRD-GLO-005 (RBAC) |
| UX | 2 | UX-GLO-004 (KPI 대시보드), UX-GLO-005 (RBAC) |
| DIA | 2 | DIA-GLO-004 (KPI 대시보드), DIA-GLO-005 (RBAC) |
| Planning | 2 | SES-GLO-004 v1.1 (세그멘테이션/라이브 이벤트 갱신) |
| Spec | 2 | SPEC-GLO-002 (KPI 대시보드), SPEC-GLO-003 (RBAC) |
| Review | 1 | REV-GLO-003 (라이브 이벤트/A/B/세그멘테이션 검토) |

### 구현 산출물

| 항목 | 규모 | 상태 |
|------|------|------|
| 페이지 | 15+ | 완료 (Dashboard, Settings, Events, Experiments, Segmentation 등) |
| API 엔드포인트 | 22+ | 설계 완료, 구현 진행 중 |
| Feature 모듈 | 5 | Dashboard, RBAC, Events, Experiments, Segmentation |
| 테스트 | 37/37 (Dashboard) | KPI 대시보드 100% 통과 |

### 기술 스택

| 레이어 | 기술 |
|--------|------|
| Frontend | Next.js 16, React 19, TypeScript |
| UI | Shadcn UI, Radix UI, Tailwind CSS 4 |
| 상태 관리 | React Query, React Hook Form |
| 인증 | JWT + httpOnly Cookie + Next.js Middleware |
| 데이터 | Mock 데이터 (OpenAPI 스펙 문서화 예정) |

---

## 8. 서비스 컨텍스트 요약

> 이 섹션은 다른 에이전트가 참조할 수 있도록 현재까지 확정된 내용을 요약합니다.

```yaml
service:
  name: "Game LiveOps Service"
  target_user: "비기술 게임 운영팀 (LiveOps Manager, Community Manager)"
  core_value: "데이터 기반 게임 운영 자동화"

current_phase: "Phase 2 - MVP 구현 단계 진입"

confirmed_features:
  # Phase 1 (기획 완료, 구현 중)
  - id: "F-001"
    name: "플레이어 세그멘테이션 (Identity-Properties-Audience, 3계층)"
    priority: "P0"
    status: "implementation-in-progress"
    screens: ["SCR-001", "SCR-002", "SCR-003", "SCR-004", "SCR-005"]

  - id: "F-002"
    name: "라이브 이벤트 생성/관리/승인 (7단계 상태, 반복 스케줄, 긴급 제어)"
    priority: "P1"
    status: "implementation-ready"
    screens: ["SCR-006", "SCR-007", "SCR-008", "SCR-009", "SCR-010", "SCR-011", "SCR-012"]

  # Phase 2 (기획 완료)
  - id: "F-003"
    name: "A/B 테스트(실험, 9단계 상태, 5단계 위저드, 중급 통계)"
    priority: "P1"
    status: "implementation-ready"
    screens: ["SCR-013", "SCR-014", "SCR-015", "SCR-016", "SCR-017"]

  - id: "F-004"
    name: "KPI 대시보드 (7개 지표, 스냅샷, 일간 중심)"
    priority: "P0"
    status: "implementation-complete"
    screens: ["Dashboard"]

  - id: "F-005"
    name: "역할 기반 접근 제어 (RBAC, 4역할 계층)"
    priority: "P1"
    status: "implementation-complete"
    screens: ["Login", "Settings", "AdminPanel"]

key_decisions:
  - "D-019: A/B 테스트를 원격 설정 확장형으로 설계"
  - "D-020: 주요 사용자 = 비기술 운영팀, 5단계 위저드 UI"
  - "D-021: 복합 실험 대상 지원 (원격 설정 + 이벤트 + Feature Flag)"
  - "D-022: 중급 통계 수준 (Chi-squared, Welch's t-test, Bonferroni)"
  - "D-023: 기존 오디언스 시스템 직접 활용"
  - "D-026: RBAC 4역할 모델 (Admin/Operator/Editor/Viewer)"
  - "D-027: KPI 대시보드 7개 지표 (NRU/DAU/MCU/PU/PUR/Revenue/ARPPU)"
  - "D-028: 라이브 이벤트 event_type 자유 문자열"
  - "D-029: 라이브 이벤트 Priority 4단계"
  - "D-030: 라이브 이벤트 상태 머신 7단계"
  - "D-031: 세그멘테이션 3계층 속성 시스템"
  - "D-032: UI/UX 통일 (메뉴, 여백, 로그아웃)"

implementation_status:
  dashboard: "complete (37/37 tests passing)"
  rbac: "complete (10 tasks)"
  segmentation: "ready-for-implementation (PRD/UX/DIA complete)"
  live_events: "ready-for-implementation (PRD/UX/DIA v1.1 complete)"
  ab_testing: "ready-for-implementation (PRD/UX/DIA complete)"

constraints:
  - "원격 설정 시스템이 먼저 구축되어야 함 (A/B 테스트 의존성)"
  - "MVP는 독립 할당 방식만 지원 (멀티 레이어 Phase 2 이후)"
  - "캘린더/타임라인 성능 테스트 필수"
  - "Computed Property 자동 계산 규칙 스케일링 검토"
  - "stickyMembership 저장소 장기 정책 필요"

next_milestones:
  - "MVP 사이드바 레이아웃 구현 완료 (Deadline: TBD)"
  - "세그멘테이션/라이브 이벤트/A/B 테스트 CRUD 구현 완료 (Deadline: TBD)"
  - "백엔드 API 컨트랙트 문서 완성 (Deadline: TBD)"
  - "성능 테스트 및 최적화 (Deadline: TBD)"
  - "Phase 2 전체 통합 테스트 (Deadline: TBD)"
```

---

## 변경 이력

| 버전 | 일자 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| v1.0 | 2026-03-26 | 초안 작성 - 일일 작업 세션 회의록. 13개 Phase(KPI 대시보드 기획·구현, RBAC 설계·구현, MVP 셸 구축, 라이브 이벤트·A/B·세그멘테이션 전면 재구축, 문서 리뷰·수정, UI/UX 개선) 완료. 6개 기획 문서 생성(PRD/UX/DIA 각 2개), 7개 결정사항(D-026~D-032), 9개 액션아이템(A-023~A-031), 4개 미결사항(Q-018~Q-021) 기록. 기술 스택: Next.js 16, React 19, TypeScript, Shadcn UI. 구현 산출: 15+ 페이지, 22+ API, 5 feature 모듈 | meeting-note |
