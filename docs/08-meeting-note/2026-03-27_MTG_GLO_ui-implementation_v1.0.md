---
id: "MTG-GLO-007"
title: "UI/UX 구현 대규모 확장: 실험·푸시·이벤트 워크플로우·플레이어 정지·역할 체계 개편"
project: "GLO"
version: "v1.2"
status: "completed"
created: "2026-03-27"
updated: "2026-03-27"
author: "meeting-note"
session_type: "구현"
participants:
  - "사용자"
  - "senior-frontend-developer"
related_docs:
  - "PRD-GLO-001"
  - "PRD-GLO-002"
  - "PRD-GLO-003"
  - "PRD-GLO-004"
  - "PRD-GLO-005"
  - "UX-GLO-001"
  - "UX-GLO-002"
  - "UX-GLO-003"
  - "UX-GLO-004"
  - "UX-GLO-005"
  - "DIA-GLO-001"
  - "DIA-GLO-002"
  - "DIA-GLO-003"
  - "DIA-GLO-004"
  - "DIA-GLO-005"
  - "MTG-GLO-006"
tags:
  - "project:game-liveops"
  - "type:meeting"
  - "topic:ui-implementation"
  - "session:daily-work"
---

# 회의록: LiveOps Admin Console UI/UX 대규모 확장 (2026-03-27)

> 2026-03-27 전일 작업 내역을 정리한 회의록. A/B 테스트 실험 모듈 신규 구현(9단계 상태 머신, 변이 관리, 통계 검정), 푸시 알림 캠페인 모듈 신규 구현(RFC 5545 RRULE 반복 스케줄, 도달 추정, 디바이스 프리뷰), 이벤트 워크플로우 대폭 확장(상태 전이 승인 게이트, 편집/복제, 우선순위 4단계), 플레이어 정지 시스템(기간제 정지, 디바이스/지갑 추적), 세그먼트 상세 탭 인터페이스(사용처/멤버 샘플/새로고침), 역할 체계 개편(editor 역할 추가, 4계층 RBAC), 감사 로그 체계 확립, 공통 UI 컴포넌트 6종 추가 등 44개 파일 변경(+3,807/-656줄)을 통해 MVP에서 엔터프라이즈급 LiveOps 플랫폼으로 도약했다.

## 문서 정보

| 항목 | 내용 |
|------|------|
| ID | MTG-GLO-007 |
| 일시 | 2026-03-27 |
| 참석자 | 사용자, senior-frontend-developer |
| 세션 유형 | 구현 (UI/UX 개선) |
| 관련 문서 | PRD-GLO-002~005, UX-GLO-002~005, DIA-GLO-002~005, MTG-GLO-006 |

---

## 1. 회의 목적

2026-03-27 UI/UX 구현 작업 완료 내역을 정리하고, 다음 단계 작업 계획을 수립한다. 기존 대시보드/이벤트/세그멘테이션/인증 개선에 더해, 실험(A/B 테스트) 모듈과 푸시 알림 모듈 신규 구현, 이벤트 워크플로우 전면 확장, 플레이어 정지 시스템, 역할 체계 개편 등 대규모 기능 추가를 통해 엔터프라이즈급 LiveOps 플랫폼으로 전환한다.

---

## 2. 논의 내용

### 2.1 대시보드(Dashboard) 개선

**배경**
- PRD-GLO-004, UX-GLO-004에서 정의된 KPI 대시보드 기능 구현 완료 상태
- 2026-03-26 MTG-GLO-006에서 Mock 데이터 기반 구현 완료, 본 세션에서 정확성 개선

**논의 내용**

#### 2.1.1 차트 구성 정리
- **KpiTrendChart 제거**: 사용하지 않는 차트 컴포넌트 정리하여 복잡도 감소
- **ActivityTrendChart 확장**:
  - 기존: DAU (Daily Active Users) 라인만 표시
  - 변경: NRU(신규 가입) 라인 추가 → 신규 사용자 획득 추세 실시간 모니터링 가능

#### 2.1.2 RevenueTrendChart 정밀도 개선
- **수치 정확성**: 결제 전환율을 소수점 2자리로 표시 (예: 12.34% vs 12.3%)
- **시각화 개선**:
  - Bar 차트의 Opacity 조정: 0.8 → 0.35 (배경 투명도 증가, 라인 강조)
  - Line Dot 스타일 개선: 시각적 명확도 향상

#### 2.1.3 Mock 데이터 현실화
기존 Mock 데이터를 실제 게임 서비스 수준으로 조정:

| 지표 | 기존 | 변경 | 근거 |
|------|------|------|------|
| DAU | 12,000 | 4,769 | 인디 게임 기준 현실적 수준 |
| 세션 | 35,000 | 14,000 | DAU와 세션/사용자 비율 일관성(~3) |
| NRU | - | 163 | DAU 3-4% 신규 가입율 반영 |
| Revenue | - | 현실화 | 월 평균 수익 추정 기반 |
| Payers | - | 현실화 | 전체 DAU의 1-2% 결제자 가정 |

**결론**
- 대시보드 정확성 개선 완료
- 차트 가독성 및 시각화 품질 향상

---

### 2.2 이벤트 관리(Events) 대폭 개선

**배경**
- PRD-GLO-002, UX-GLO-002, DIA-GLO-002에서 정의된 라이브 이벤트 기능 구현 완료
- D-030에서 확정된 이벤트 상태 머신 7단계 구현 필요
- 2026-03-26 구현 기반 본 세션에서 완성도 향상

**논의 내용**

#### 2.2.1 이벤트 상태 정리
- **D-030 적용**: 이벤트 상태에서 `cancelled` 완전 제거
- **영향 범위**:
  - EventStatus 타입 정의 수정 (6개 상태로 통일: draft → pending_approval → approved → scheduled → active → paused/ended → archived)
  - 캘린더 뷰 색상 맵 업데이트
  - 타임라인 뷰 상태 필터링 수정
  - EventStatusBadge 컴포넌트 업데이트
  - EventPopover 상태 표시 수정

#### 2.2.2 타임라인 뷰 대폭 개선
기존 문제: 이벤트 바 겹침, 표시 순서 불명확, 보이는 범위 밖 이벤트 포함

**해결 방식**:
- **겹침 문제 해결**: Absolute positioning + Row Stacking 방식 도입
  - 각 이벤트를 타임라인 레인(레이어)에 배치
  - 겹치는 이벤트는 자동으로 아래 레인으로 이동
- **동적 높이 계산**: 레인 수에 따라 타임라인 전체 높이 자동 조정
- **범위 필터링**: 뷰포트 밖 이벤트 제외하여 렌더링 성능 개선

#### 2.2.3 캘린더 뷰 개선
- **셀당 최대 이벤트 수**: 3개 → 5개로 증가 (더 많은 이벤트 표시)
- **셀 높이**: 90px → 140px로 확대 (더 큰 터치 영역, 가독성 개선)

#### 2.2.4 Mock 이벤트 데이터 대폭 추가
기존 이벤트 5개 → 16개+ 이벤트로 확대

**신규 추가 이벤트** (evt-010 ~ evt-016+):
- evt-010: "봄맞이 쿠폰 이벤트" (2026-03-27 ~ 2026-04-10)
- evt-011: "레벨업 챌린지" (2026-03-28 ~ 2026-04-27)
- evt-012: "친구 초대 보상" (2026-03-29 ~ 2026-04-30)
- evt-013: "매일 미니게임" (반복: 매일, 2026-03-30 시작)
- evt-014: "고래 전용 더블 드롭" (2026-03-31 ~ 2026-04-30)
- evt-015: "PvP 시즌 1" (2026-04-01 ~ 2026-04-30)
- evt-016: "보상 오류 점검" (2026-04-05 ~ 2026-04-06, 긴급 유지보수)

**목적**: 다양한 이벤트 시나리오 테스트, 타임라인/캘린더 렌더링 성능 검증

#### 2.2.5 EventPopover 개선
- `nativeButton={false}` 설정 추가 → 스타일 일관성 개선

**결론**
- 이벤트 관리 완전 정리 및 기능 완성
- 타임라인 렌더링 문제 해결로 사용성 대폭 개선
- Mock 데이터 확대로 테스트 커버리지 증가

---

### 2.3 세그멘테이션(Segmentation) 기능 확장

**배경**
- PRD-GLO-001, UX-GLO-001, DIA-GLO-001에서 정의된 플레이어 세그멘테이션 기능
- D-031에서 확정된 3계층 속성 시스템(Default/Computed/Custom) 구현 필요
- 운영자 사용성 향상 필수

**논의 내용**

#### 2.3.1 Audience Status Badge 개선
**기존**: AudienceStatusBadge 별도 컴포넌트
**변경**: 인라인 "In Use" / "Unused" 뱃지로 교체

- **기준**: usageCount (세그먼트가 Live Events, Experiments 등에서 사용된 횟수)
- **표시 방식**:
  - In Use: usageCount > 0 → 초록색 뱃지
  - Unused: usageCount = 0 → 회색 뱃지
- **목적**: 한눈에 세그먼트 활용도 파악 가능

#### 2.3.2 세그먼트 생성 페이지 개선
- **설명 필드**: Input 컴포넌트 → Textarea 컴포넌트 변경
  - 여러 줄 설명 입력 가능
  - 가독성 개선 (세그먼트 목적/정의 상세 기록 가능)
- **입력 제한**: 500자 제한 + 실시간 글자수 카운터 추가
  - 운영자 피드백: 세그먼트 정의 명확화 필수

#### 2.3.3 Properties 페이지 확장
- **신규 컬럼**: "파라미터" 컬럼 추가
  - Computed Properties의 계산 방식 투명화
  - 예: `last_purchase_days > 30` (파라미터: 30)
  - 예: `total_sessions >= threshold` (파라미터: threshold 값)

#### 2.3.4 Taxonomy 페이지 재설계
**기존**: computedProperties 목록만 표시
**변경**: computedRules 기반 규칙 상세 표시

- **구조 변경**:
  - Computed Properties → Computed Rules로 개념 확장
  - 각 규칙마다 3가지 정보 표시:
    - 이벤트 소스 (예: "purchase" 이벤트)
    - 속성명 (예: "total_purchase_amount")
    - 집계 방식 (예: "SUM", "COUNT", "MAX")
    - 파라미터 (예: 시간 윈도우 "last_30_days")

- **목적**:
  - 운영자가 "어떤 이벤트로부터 어떤 속성이 어떻게 계산되는지" 명확히 이해
  - Computed Properties 자동 계산 규칙의 투명성 확보

#### 2.3.5 ConditionBuilder 개선
- 폼 빌더 UI의 조건 작성 로직 정밀도 개선
- 복잡한 필터 조건 생성 가능성 향상

**결론**
- 세그멘테이션 기능 완전 확장 및 운영자 사용성 대폭 개선
- 3계층 속성 시스템(D-031) 완전 구현
- 자동화 규칙의 투명성 확보

---

### 2.4 인증/공통 기능 개선

**배경**
- D-032에서 확정된 "UI/UX 통일" 항목 완전 구현
- 전체 시스템의 일관성 및 사용성 향상

**논의 내용**

#### 2.4.1 계정 정보 업데이트
- **Admin 계정 이메일**:
  - 기존: `yhkim@to.nexus`
  - 변경: `admin@liveops.dev` (회사 공식 이메일)
  - **배경**: 프로젝트 공식화, 프로덕션 배포 대비

#### 2.4.2 LoginForm 개선
- **버튼 크기 증가**: `h-10` → `h-12` (높이 40px → 48px)
  - 모바일/터치 환경 고려
  - 접근성 개선 (더 큰 터치 영역)

#### 2.4.3 GNB(Global Navigation Bar) 메뉴 순서 변경
**기존 순서**:
1. 대시보드
2. 라이브 이벤트
3. 실험
4. 세그멘테이션
5. 플레이어
6. 설정

**변경 후 순서**:
1. 대시보드
2. **플레이어** (이동)
3. 세그멘테이션
4. 라이브 이벤트
5. 실험
6. 설정

**근거**:
- LiveOps 작업 흐름: 플레이어 분석 → 세그멘테이션 정의 → 이벤트/실험 실행
- 논리적 순서로 메뉴 배치하여 사용자 학습곡선 단축

#### 2.4.4 Mock Users 정리
- **기존**: 테스트용 계정 12명
- **변경**: 4명으로 축소 (필수 역할별만 유지)

**유지 계정**:
- Admin (관리자)
- Operator (운영자)
- Editor (편집자)
- Viewer (뷰어)

**목적**: 불필요한 테스트 계정 제거, 관리 복잡도 감소

#### 2.4.5 플레이어 페이지 접근성 개선
- **aria-label 추가**: 스크린 리더 지원
- **scope="col" 추가**: 테이블 헤더 명확화 (접근성 표준)

**결론**
- UI/UX 통일 완전 구현 (D-032 완료)
- 계정 체계 정리 및 접근성 향상

---

### 2.5 페이지네이션 통일

**배경**
- MVP 전체 리스트 페이지에서 페이지네이션 UI 불일관 발생
- 사용성 개선 필요

**논의 내용**

#### 2.5.1 PAGE_SIZE 통일
**변경 전**: 페이지당 항목 수 20개 (불일관)
**변경 후**: 페이지당 항목 수 10개 (통일)

**영향 페이지**:
- 이벤트 목록 (Events Page)
- 실험 목록 (Experiments Page)
- 세그먼트 목록 (Segments Page)
- 관리자 목록 (Admins Page)
- 감사 로그 (Audit Log Page)

**근거**:
- 한 화면에 10개 항목이 최적 가독성 제공
- 스크롤 부하 감소

#### 2.5.2 페이지네이션 표시 조건 개선
**변경 전**: `totalPages > 1` (2페이지 이상일 때만 표시)
**변경 후**: `filteredItems.length > 0` (항상 표시)

**목적**:
- 사용자가 현재 페이지 위치 명확히 인식
- 필터 적용 후 결과 없을 때도 페이지네이션 UI 일관성 유지

**결론**
- 페이지네이션 UI 완전 통일
- 사용자 경험 일관성 확보

---

### 2.6 실험(A/B 테스트) 모듈 신규 구현

**배경**
- PRD-GLO-003, UX-GLO-003, DIA-GLO-003에서 정의된 A/B 테스트 기능
- 게임 라이브옵스의 핵심 기능으로, 원격 설정 변경의 효과를 과학적으로 검증

**논의 내용**

#### 2.6.1 실험 상태 머신 (9단계)
- `draft` → `testing` → `pending_approval` → `running` → `paused`/`stopped` → `analyzing` → `completed` → `archived`
- 각 상태 전환에 대한 TransitionAction 정의: `start_testing`, `request_approval`, `approve`, `reject`, `pause`, `resume`, `stop`, `archive`
- 상태 전환 시 actor, reason, timestamp 기록하는 ExperimentStateLog 도입

#### 2.6.2 실험 유형 (4종)
| 유형 | 설명 |
|------|------|
| `remote_config` | 원격 설정 변경 검증 |
| `feature_flag` | 기능 플래그 토글 검증 |
| `event_variant` | 이벤트 기반 변이 검증 |
| `composite` | 위 유형 조합 |

#### 2.6.3 변이(Variant) 관리
- Control + 최대 3개 Variant (총 4개)
- 각 변이: 이름, 설명, 트래픽 배분율(%), 설정 오버라이드(key-value)
- **트래픽 합계 100% 실시간 검증**
- 설정값 타입 지원: boolean, numeric, string

#### 2.6.4 목표(Goal) 및 통계 검정
- 주 목표 1개(필수) + 보조 목표 최대 3개
- 지표 유형: `conversion_rate`, `average_value`, `count`
- MDE(Minimum Detectable Effect) % 설정
- 유의수준 선택: 0.01/0.05/0.10 (99%/95%/90% 신뢰도)
- 결과 표시: 샘플 크기, 전환율, p-value, 95% 신뢰구간, 상대적 개선율, Winner 표시

#### 2.6.5 생성 폼 (5단계 위저드)
1. **기본 정보**: 이름(128자), 가설(What/Why/Expected), 실험 유형, 일정
2. **변이 정의**: Control + Variants, 트래픽 배분, 설정 오버라이드
3. **대상 선택**: 전체 플레이어 / 특정 세그먼트
4. **목표 설정**: 주/보조 목표, MDE, 유의수준
5. **검토**: 요약 카드 + 실시간 유효성 체크리스트

#### 2.6.6 승인 워크플로우
- 전용 승인 페이지 (`/experiments/approvals`)
- 분할 뷰: 좌측 대기 목록 + 우측 상세 패널
- 승인: 사유 불필요, 즉시 running 전환
- 반려: 사유 필수(10자 이상), draft로 복귀
- **operator 이상 권한 필수** (`can("operator")` 체크)

#### 2.6.7 상세 페이지 (3탭)
- **Settings**: 가설, 변이 테이블, 목표, 대상, 일정, 메타 정보
- **Results**: 변이별 결과 테이블 (running/analyzing/completed 시 노출)
- **History**: 상태 전환 감사 로그

#### 2.6.8 API 엔드포인트
| 엔드포인트 | 메서드 | 기능 |
|-----------|--------|------|
| `/api/experiments` | GET/POST | 목록 조회(필터/검색/정렬), 생성 |
| `/api/experiments/[id]` | GET/PUT/DELETE | 조회, 수정, 삭제(draft만) |
| `/api/experiments/[id]/duplicate` | POST | 복제(draft로, "(복사본)" 접미) |
| `/api/experiments/[id]/transition` | GET/POST | 상태 전환 로그 조회, 상태 전환 실행 |

**결론**
- 실험 모듈 전체 구현 완료 (목록/생성/상세/편집/승인/복제)
- 9단계 상태 머신 + 통계 검정 결과 표시
- Mock 데이터 12건으로 전 상태 시나리오 커버

---

### 2.7 푸시 알림(Push Notifications) 모듈 신규 구현

**배경**
- PRD-GLO-005, UX-GLO-005, DIA-GLO-005에서 정의된 푸시 알림 캠페인 관리 기능
- 세그먼트 기반 타겟팅과 반복 스케줄 지원 필요

**논의 내용**

#### 2.7.1 캠페인 상태 (8단계)
- `draft` → `pending_approval` → `approved` → `scheduled` → `sending` → `sent` / `failed` / `cancelled`
- 상태 전환: submit, approve, reject(사유 5자 이상), cancel

#### 2.7.2 메시지 구성
- **제목**: 50자 제한 + 실시간 글자수 카운터
- **본문**: 200자 제한 + 실시간 글자수 카운터
- **딥링크 URL**: 앱 내 특정 화면으로 이동
- **이미지 URL**: 리치 푸시 알림 이미지
- **커스텀 데이터**: JSON 형태 앱 메타데이터
- **디바이스 프리뷰**: iOS/Android 목업 프리뷰 컴포넌트

#### 2.7.3 대상 및 도달 추정
- **대상 유형**: 전체(`all`), 세그먼트(`audience`), 개별 플레이어(`individual`)
- **플랫폼 필터**: 전체, iOS(42%), Android(58%)
- **실시간 도달 추정** (POST `/api/push/campaigns/estimate-reach`):
  - 기본 도달: 전체 52,000명
  - 세그먼트별 기본값: active 31,500 / whale 1,250 / dormant 8,900 / payers 4,300
  - 플랫폼 배율 적용 후 최종 도달 수 표시

#### 2.7.4 스케줄링 (RFC 5545 RRULE)
- **즉시 발송**: 승인 후 즉시
- **예약 발송**: 특정 일시 지정
- **반복 발송**: RRULE 기반
  - `FREQ=DAILY;BYHOUR=10;BYMINUTE=0` (매일 10시)
  - `FREQ=WEEKLY;BYDAY=MO,WE,FR;BYHOUR=10;BYMINUTE=0` (주 3회)
  - `FREQ=MONTHLY` (월간)
- **타임존 지원**: Asia/Seoul, America/New_York, Europe/London, UTC 등
- **플레이어 타임존 적용**: `usePlayerTimezone` 플래그

#### 2.7.5 생성 폼 (5단계 위저드)
1. **메시지**: 제목, 본문, 딥링크, 이미지, 커스텀 데이터
2. **대상**: 대상 유형, 세그먼트 선택, 플랫폼 필터
3. **스케줄**: 발송 유형, 일시/RRULE, 타임존
4. **옵션**: 우선순위(normal/critical), 만료 설정
5. **검토**: 전체 요약 + 도달 추정 표시

#### 2.7.6 승인 워크플로우
- 전용 승인 페이지 (`/push/campaigns/approvals`)
- 분할 뷰 + 대기 건수 뱃지
- 반려 시 사유 필수(5자 이상), draft로 복귀
- operator 이상 권한 필수

#### 2.7.7 발송 지표
- `sentCount`, `deliveredCount`, `openedCount`, `failedCount`
- 상세 페이지에서 발송 후 지표 확인 가능

#### 2.7.8 API 엔드포인트
| 엔드포인트 | 메서드 | 기능 |
|-----------|--------|------|
| `/api/push/campaigns` | GET/POST | 목록 조회, 생성 |
| `/api/push/campaigns/[id]` | GET/PATCH/DELETE | 조회, 수정, 삭제(draft만) |
| `/api/push/campaigns/[id]/submit` | POST | 승인 요청 |
| `/api/push/campaigns/[id]/approve` | POST | 승인 |
| `/api/push/campaigns/[id]/reject` | POST | 반려(사유 필수) |
| `/api/push/campaigns/[id]/cancel` | POST | 취소 |
| `/api/push/campaigns/estimate-reach` | POST | 도달 추정 |
| `/api/push/settings` | GET/PATCH | 푸시 설정 조회/수정 |

**결론**
- 푸시 알림 캠페인 모듈 전체 구현 완료
- RFC 5545 RRULE 반복 스케줄 지원
- Mock 데이터 15건으로 전 상태 시나리오 커버

---

### 2.8 이벤트 워크플로우 대폭 확장

**배경**
- 기존 2.2절의 이벤트 기능을 대폭 확장
- 승인 게이트, 편집, 복제, 우선순위, RFC 5545 RRULE 스케줄 추가

**논의 내용**

#### 2.8.1 상태 전이 승인 게이트
- **TransitionAction 정의**: `request_approval`, `approve`, `reject`, `pause`, `resume`, `kill`, `extend`, `archive`
- **EventStateLogEntry 도입**: 모든 상태 전환에 actor, reason, timestamp 기록
- **승인 페이지**: `/events/approvals` 전용 페이지, 대기 건수 뱃지 표시
- **반려 시 사유 필수**

#### 2.8.2 이벤트 편집 기능
- `/events/[id]/edit` 편집 페이지 신규 추가
- 기본 정보, 스케줄, 타겟팅 탭 구성
- 저장 시 draft로 상태 리셋 경고

#### 2.8.3 이벤트 복제
- POST `/api/events/[id]/duplicate` 엔드포인트
- draft 상태로 복제, "(복사본)" 접미 추가

#### 2.8.4 우선순위 4단계
| 우선순위 | 레이블 |
|---------|--------|
| `low` | 낮음 |
| `medium` | 보통 |
| `high` | 높음 |
| `critical` | 긴급 |

#### 2.8.5 고급 스케줄링
- **scheduleType**: `once`(단발) / `recurring`(반복)
- **rrule**: RFC 5545 반복 규칙 지원
- **rruleDurationMinutes**: 반복 인스턴스별 지속 시간
- **displayTimezone**: IANA 타임존 표시 (Asia/Seoul 등)

#### 2.8.6 이벤트 타겟팅
- **audienceId / audienceName**: 세그먼트 연결
- **stickyMembership**: 멤버십 고정 플래그 (기본 false)

#### 2.8.7 레이아웃 탭 네비게이션
- `/events` 레이아웃에 탭 추가: 이벤트 목록, 승인 대기(뱃지), 캘린더, 타임라인

#### 2.8.8 API 엔드포인트 추가
| 엔드포인트 | 메서드 | 기능 |
|-----------|--------|------|
| `/api/events/[id]/transition` | POST | 상태 전이 실행 |
| `/api/events/[id]/duplicate` | POST | 이벤트 복제 |

**결론**
- 이벤트 관리가 단순 CRUD에서 승인 기반 워크플로우 시스템으로 진화
- RFC 5545 RRULE 반복 스케줄로 정기 이벤트 자동화 가능

---

### 2.9 플레이어 관리 강화

**배경**
- 기존 플레이어 조회 기능에 정지/차단 관리, 디바이스 추적, 지갑 주소 지원 추가

**논의 내용**

#### 2.9.1 정지(Suspension) 시스템
- **banned vs suspended 분리**: 영구 차단과 기간제 정지를 명확히 구분
- **정지 필드**:
  - `suspendReason`: 정지 사유
  - `suspendedAt`: 정지 시작 시각
  - `suspendedUntil`: 정지 만료 시각 (ISO 8601)
- **정지 기간 옵션**: 1일, 3일, 7일, 30일
- **API 엔드포인트**:
  - POST `/api/players/[id]/suspend` (사유 + 기간)
  - POST `/api/players/[id]/unsuspend` (즉시 해제)

#### 2.9.2 차단(Ban) 정보 확장
- `banReason`: 차단 사유 기록
- `bannedAt`: 차단 시각 기록

#### 2.9.3 디바이스 추적
- `lastDeviceModel`: 마지막 접속 기기 모델 (예: "iPhone 14 Pro", "Samsung Galaxy S23")
- `lastDeviceOS`: 마지막 접속 OS (예: "iOS 17.4", "Android 14")
- `logicVersion`: 게임 클라이언트 버전 번호

#### 2.9.4 Wallet Address
- `walletAddress` 필드 추가 (블록체인 게임 대응)
- 기존 `email` 필드 대체

#### 2.9.5 세그먼트 멤버십
- `audiences` 배열: 플레이어가 속한 세그먼트 목록 표시
- 상세 페이지에서 소속 세그먼트 확인 가능

#### 2.9.6 플레이어 관리 다이얼로그
- 상세 페이지에서 차단/정지/닉네임 변경 다이얼로그 제공
- 확인 절차 포함

**결론**
- 플레이어 관리가 조회 전용에서 운영 도구로 진화
- 정지/차단 이원화로 유연한 제재 운영 가능

---

### 2.10 세그먼트 상세 페이지 확장

**배경**
- 기존 세그먼트 상세 페이지에 탭 인터페이스, 사용처 추적, 멤버 샘플 기능 추가

**논의 내용**

#### 2.10.1 탭 인터페이스 (3탭)
- **Conditions**: 세그먼트 필터 조건 표시 (ConditionBadge 활용)
- **Usages**: 세그먼트 사용처 표시 (이벤트, 실험, 기능 플래그, 메시지에서 참조 여부)
- **Members**: 멤버 샘플 미리보기

#### 2.10.2 사용처 추적 API
- GET `/api/segments/[id]/usages`
- 사용 유형: `live_event`, `experiment`, `feature_flag`, `message`
- 세그먼트 삭제 전 의존성 확인 가능

#### 2.10.3 멤버 샘플 API
- GET `/api/segments/[id]/members`
- 세그먼트 조건에 매칭되는 멤버 샘플 반환
- 페이지네이션 지원

#### 2.10.4 세그먼트 새로고침
- POST `/api/segments/[id]/refresh`
- memberCount 재계산 + 마지막 새로고침 시각 업데이트
- `formatTimeAgo()` 유틸리티로 "N분/시간/일 전" 표시

#### 2.10.5 세그먼트 레이아웃 탭 네비게이션
- `/segments` 레이아웃에 탭 추가: Audiences, Properties Management, Event Taxonomy

#### 2.10.6 세그먼트 복제
- POST `/api/segments/[id]/duplicate`
- draft 상태로 복제

**결론**
- 세그먼트 상세 페이지가 단순 조회에서 운영 도구로 진화
- 사용처 추적으로 세그먼트 의존성 파악 가능

---

### 2.11 역할 체계 개편 및 감사 로그

**배경**
- 기존 3역할(admin/operator/viewer)에서 editor 역할 추가
- 전체 시스템에 감사 로그 체계 확립

**논의 내용**

#### 2.11.1 4계층 RBAC
| 역할 | 레벨 | 한글명 | 권한 |
|------|------|--------|------|
| `admin` | 4 | 관리자 | 전체 접근, 관리자 관리 |
| `operator` | 3 | 운영자 | 이벤트/실험/푸시 승인, 플레이어 제재 |
| `editor` | 2 | 에디터 | 콘텐츠 생성/편집, 승인 요청 |
| `viewer` | 1 | 뷰어 | 읽기 전용 |

#### 2.11.2 미들웨어 역할 검증
- `getRequiredRole()`: 라우트별 최소 필요 역할 반환
- `hasMinimumRole()`: 사용자 역할 레벨 비교
- 권한 부족 시 403 Forbidden 반환
- 요청 헤더에 사용자 정보 주입: `x-user-id`, `x-user-email`, `x-user-name`, `x-user-role`
- 루트 경로 `/` → `/dashboard` 리다이렉트

#### 2.11.3 감사 로그 체계
- **AuditLogEntry 타입**: action, actor, target, timestamp, IP 주소
- **추적 액션**: login, logout, role_changed, user_created, user_suspended, user_activated
- **추적 대상**: admin_user, session, role
- 설정 > 감사 로그 페이지에서 조회

#### 2.11.4 AdminUser 관리
- `AdminUser` 타입에 `status` 필드 추가 (`active` | `suspended`)
- 관리자 생성, 역할 변경, 상태 변경 지원
- 마지막 로그인 시각 추적

**결론**
- editor 역할 추가로 콘텐츠 생성과 승인을 분리하여 운영 안정성 확보
- 감사 로그로 모든 관리 활동 추적 가능

---

### 2.12 공통 UI 컴포넌트 추가

**배경**
- 새 모듈(실험/푸시) 및 기존 기능 확장에 필요한 Shadcn/Radix 기반 UI 컴포넌트 6종 추가

**논의 내용**

#### 2.12.1 신규 컴포넌트 목록
| 컴포넌트 | 파일 | 용도 |
|---------|------|------|
| Dialog | `components/ui/dialog.tsx` | 확인/반려 사유 입력, 삭제 확인 등 모달 |
| Textarea | `components/ui/textarea.tsx` | 세그먼트 설명, 가설 입력, 사유 입력 |
| Switch | `components/ui/switch.tsx` | 토글 설정 (stickyMembership, usePlayerTimezone) |
| Tabs | `components/ui/tabs.tsx` | 상세 페이지 탭 (실험 Settings/Results/History 등) |
| Popover | `components/ui/popover.tsx` | 이벤트 캘린더/타임라인 팝오버 |
| PaginationBar | `components/ui/pagination-bar.tsx` | 통일된 페이지네이션 UI |

**결론**
- 6종 공통 컴포넌트로 전체 UI 일관성 확보
- Shadcn UI + Radix UI 패턴 준수

---

## 3. 결정 사항

| ID | 결정 내용 | 근거 | 비고 |
|----|----------|------|------|
| D-033 | KPI 대시보드 Mock 데이터 현실화 (DAU 4,769, 세션 14,000, NRU 163) | 인디 게임 기준 실제 서비스 수준 반영 필요 | 구현 완료 |
| D-034 | 이벤트 상태에서 `cancelled` 완전 제거 (D-030 강화) | 상태 단순화, 6개 상태로 통일 | 구현 완료 |
| D-035 | 이벤트 타임라인 겹침 문제 해결 (Absolute Positioning + Row Stacking) | 렌더링 정확성 및 성능 개선 | 구현 완료 |
| D-036 | 세그먼트 설명 필드 Input → Textarea 변경 (500자 제한) | 운영자가 세그먼트 정의 상세히 기록 가능 | 구현 완료 |
| D-037 | Computed Rules 기반 Taxonomy 페이지 재설계 (이벤트→속성 매핑 투명화) | 자동 계산 규칙의 명확성 확보 | 구현 완료 |
| D-038 | GNB 메뉴 순서 변경 (플레이어를 세그멘테이션 앞으로) | 논리적 작업 흐름 반영 | 구현 완료 |
| D-039 | PAGE_SIZE 전체 리스트 페이지 20→10으로 통일 | 가독성 및 스크롤 부하 최적화 | 구현 완료 |
| D-040 | 페이지네이션 표시 조건 `totalPages > 1` → `filteredItems.length > 0` 변경 | UI 일관성 유지 | 구현 완료 |
| D-041 | 실험 모듈 9단계 상태 머신 도입 (draft→testing→pending_approval→running→analyzing→completed) | 실험 생명주기 전 단계 추적 필요 | 구현 완료 |
| D-042 | 실험 변이 최대 4개 (Control+3), 트래픽 합계 100% 실시간 검증 | 과도한 변이 분산 방지, 통계적 유의성 확보 | 구현 완료 |
| D-043 | 푸시 알림 RFC 5545 RRULE 반복 스케줄 지원 | 정기 알림 자동화 (매일/주간/월간) | 구현 완료 |
| D-044 | 푸시 도달 추정 API 실시간 제공 (세그먼트×플랫폼 배율) | 발송 전 영향 범위 사전 파악 | 구현 완료 |
| D-045 | 이벤트 상태 전이에 TransitionAction + StateLog 감사 추적 도입 | 승인 기반 워크플로우 투명성 확보 | 구현 완료 |
| D-046 | 이벤트 우선순위 4단계 (low/medium/high/critical) 도입 | 긴급 이벤트와 일반 이벤트 구분 필요 | 구현 완료 |
| D-047 | 플레이어 정지(suspended)와 차단(banned) 이원화 | 기간제 제재와 영구 제재를 분리하여 유연한 운영 | 구현 완료 |
| D-048 | 플레이어 walletAddress 필드 추가 (블록체인 게임 대응) | Web3 게임 플레이어 식별 지원 | 구현 완료 |
| D-049 | editor 역할 추가 (4계층 RBAC: admin→operator→editor→viewer) | 콘텐츠 생성과 승인 권한 분리 필요 | 구현 완료 |
| D-050 | 미들웨어 역할 기반 라우트 보호 + 사용자 정보 헤더 주입 | 서버 사이드 권한 검증 기반 확립 | 구현 완료 |
| D-051 | 세그먼트 상세 페이지 3탭 (Conditions/Usages/Members) 인터페이스 | 세그먼트 영향도 파악 및 멤버 확인 필요 | 구현 완료 |
| D-052 | 공통 UI 컴포넌트 6종 추가 (Dialog, Textarea, Switch, Tabs, Popover, PaginationBar) | 신규 모듈 UI 일관성 확보 | 구현 완료 |

---

## 4. 액션 아이템

| ID | 항목 | 담당 | 기한 | 상태 |
|----|------|------|------|------|
| A-024 | Mock 이벤트 추가 이벤트 evt-010 ~ evt-016 상세 스펙 검토 및 문서화 | planner | 2026-03-28 | 대기 |
| A-025 | Computed Rules 기반 세그멘테이션 기획 문서 업데이트 (PRD-GLO-001 v1.2) | prd | 2026-03-29 | 대기 |
| A-026 | UI/UX 스펙 최종 검토 및 UX-GLO-002~005 v1.1 버전 업데이트 | uiux-spec | 2026-03-29 | 대기 |
| A-027 | 전체 UI/UX 개선 사항 정리 및 코드 리뷰 (PR 작성) | senior-frontend-developer | 2026-03-28 | 대기 |
| A-028 | 구현 완료 후 전체 기능 통합 테스트 (E2E 테스트) | senior-frontend-developer | 2026-03-29 | 대기 |
| A-029 | 실험 모듈 PRD 문서 작성 (PRD-GLO-003 v1.1 — 9단계 상태 머신, 통계 검정 스펙 반영) | prd | 2026-03-29 | 대기 |
| A-030 | 푸시 알림 모듈 PRD 문서 작성 (PRD-GLO-005 v1.1 — RRULE 스케줄, 도달 추정 스펙 반영) | prd | 2026-03-29 | 대기 |
| A-031 | 이벤트 워크플로우 확장 반영 UX 스펙 업데이트 (UX-GLO-002 v1.2 — 승인 게이트, 우선순위) | uiux-spec | 2026-03-30 | 대기 |
| A-032 | 플레이어 정지 시스템 UX 스펙 반영 (UX-GLO-004 v1.1 — 정지/차단 이원화 UI) | uiux-spec | 2026-03-30 | 대기 |
| A-033 | 역할 체계 4계층 RBAC 다이어그램 업데이트 (DIA-GLO-005 v1.1) | diagram | 2026-03-29 | 대기 |
| A-034 | 감사 로그 정책 문서 작성 (추적 범위, 보존 기간, 접근 권한 정의) | policy | 2026-03-30 | 대기 |
| A-035 | Mock 데이터 → 실제 API 연동 마이그레이션 계획 수립 | planner | 2026-03-31 | 대기 |

---

## 5. 미결 사항

| ID | 이슈 | 필요한 정보/결정 | 담당 |
|----|------|-----------------|------|
| Q-001 | Computed Rules의 집계 방식(SUM/COUNT/MAX 등) 상세 정의 필요 | 규칙 엔진 스펙 확정 | planner/prd |
| Q-002 | 타임라인 레인 렌더링 최대 깊이 제한 (겹치는 이벤트 5개 이상 시 어떻게 처리할지) | 예외 처리 로직 정의 | prd/uiux-spec |
| Q-003 | Mock 이벤트 evt-010 ~ evt-016의 프로덕션 환경 실제 데이터 수집 시기 | 데이터 마이그레이션 계획 | planner |
| Q-004 | GNB 메뉴 순서 변경에 따른 온보딩 문서/튜토리얼 업데이트 필요 | 문서 작성 계획 | planner |
| Q-005 | 실험 통계 검정 서버 측 구현 (현재 Mock 결과만 표시) | 통계 엔진 백엔드 스펙 확정 | planner/prd |
| Q-006 | 푸시 알림 실제 발송 인프라 연동 (FCM/APNs) 시기 | 인프라 구축 계획 | planner |
| Q-007 | RRULE 반복 스케줄의 종료 조건 정의 (COUNT/UNTIL 미설정 시 무한 반복 처리) | 정책 결정 | planner/policy |
| Q-008 | 플레이어 정지 만료 자동 해제 서버 스케줄러 구현 필요 | 백엔드 아키텍처 결정 | planner |
| Q-009 | 감사 로그 보존 기간 및 접근 권한 정책 확정 | 컴플라이언스 요구사항 확인 | policy |
| Q-010 | walletAddress 기반 플레이어 인증 플로우 설계 | Web3 인증 스펙 확정 | planner/prd |

---

## 6. 다음 회의 안건

- [ ] Computed Rules 엔진 스펙 최종 확정 (D-037 세부사항)
- [ ] 타임라인 겹침 이벤트 예외 처리 방안 논의 (Q-002)
- [ ] Mock → 실제 API 연동 마이그레이션 계획 수립 (A-035)
- [ ] 실험 통계 검정 백엔드 스펙 논의 (Q-005)
- [ ] 푸시 알림 인프라(FCM/APNs) 연동 계획 (Q-006)
- [ ] RRULE 반복 스케줄 종료 조건 정책 확정 (Q-007)
- [ ] 플레이어 정지 자동 해제 스케줄러 아키텍처 논의 (Q-008)
- [ ] 감사 로그 보존 정책 확정 (Q-009)
- [ ] 전체 기능 통합 테스트 결과 리뷰
- [ ] 프로덕션 배포 준비 상태 확인

---

## 7. 서비스 컨텍스트 요약

```yaml
service:
  name: "Game LiveOps Console"
  target_user: "게임 라이브옵스 운영팀 (비기술)"
  core_value: "원격 설정 기반 게임 운영 자동화, 고급 플레이어 세그멘테이션, A/B 테스트, 푸시 알림"

current_phase: "Phase 1 구현 완료 → 백엔드 연동 준비"

confirmed_features:
  - id: "F-001"
    name: "KPI 대시보드 (DAU/NRU/세션/수익/리텐션)"
    priority: "P0"
    status: "구현 완료"

  - id: "F-002"
    name: "플레이어 세그멘테이션 (3계층 속성, 사용처 추적, 멤버 샘플)"
    priority: "P0"
    status: "구현 완료"

  - id: "F-003"
    name: "라이브 이벤트 관리 (승인 게이트, RRULE 반복, 우선순위 4단계)"
    priority: "P0"
    status: "구현 완료"

  - id: "F-004"
    name: "A/B 테스트 (9단계 상태 머신, 변이 관리, 통계 검정)"
    priority: "P1"
    status: "구현 완료"

  - id: "F-005"
    name: "푸시 알림 캠페인 (RFC 5545 RRULE, 도달 추정, 디바이스 프리뷰)"
    priority: "P1"
    status: "구현 완료"

  - id: "F-006"
    name: "플레이어 관리 (정지/차단 이원화, 디바이스 추적, 지갑 주소)"
    priority: "P1"
    status: "구현 완료"

  - id: "F-007"
    name: "역할 기반 접근 제어 (4계층 RBAC: admin/operator/editor/viewer)"
    priority: "P1"
    status: "구현 완료"

  - id: "F-008"
    name: "감사 로그 (관리 활동 추적, 역할 변경, 로그인/로그아웃)"
    priority: "P2"
    status: "구현 완료"

key_decisions:
  - "D-030: 이벤트 상태 머신 (cancelled 제거)"
  - "D-031: 세그멘테이션 3계층 속성 시스템"
  - "D-032: UI/UX 통일"
  - "D-033~040: 대시보드/이벤트/세그먼트/GNB/페이지네이션 개선"
  - "D-041~042: 실험 모듈 9단계 상태 머신, 변이 관리"
  - "D-043~044: 푸시 RRULE 스케줄, 도달 추정"
  - "D-045~046: 이벤트 TransitionAction 감사 추적, 우선순위 4단계"
  - "D-047~048: 플레이어 정지/차단 이원화, walletAddress"
  - "D-049~050: editor 역할, 미들웨어 역할 보호"
  - "D-051~052: 세그먼트 3탭, 공통 UI 6종"

constraints:
  - "전체 Mock 데이터 기반 (프로덕션 API 미연동)"
  - "실험 통계 검정 서버 측 구현 미완 (Mock 결과만 표시)"
  - "푸시 발송 인프라(FCM/APNs) 미연동"
  - "RRULE 반복 스케줄 종료 조건 미정의"
  - "플레이어 정지 자동 해제 스케줄러 미구현"
  - "감사 로그 보존 기간/접근 정책 미확정"
  - "walletAddress 기반 인증 플로우 미설계"

next_phase: "Phase 2 (백엔드 API 연동, 원격 설정, 분석 대시보드, 게임 경제)"
```

---

## 변경 이력

| 버전 | 일자 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| v1.0 | 2026-03-27 | 초안 작성 (UI/UX 구현 개선 세션 정리) | meeting-note |
| v1.1 | 2026-03-27 | 제목/front matter 업데이트 | meeting-note |
| v1.2 | 2026-03-27 | 실험·푸시·이벤트 워크플로우·플레이어 정지·역할 체계·감사 로그·UI 컴포넌트 등 7개 섹션 추가 (2.6~2.12), 결정사항 D-041~052, 액션 A-029~035, 미결 Q-005~010 추가 | meeting-note |
