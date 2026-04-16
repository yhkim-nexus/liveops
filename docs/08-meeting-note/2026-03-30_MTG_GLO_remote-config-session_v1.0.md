---
id: "MTG-GLO-009"
title: "회의록: Remote Config 기획 및 구현 세션"
project: "GLO"
version: "v1.0"
status: "completed"
created: "2026-03-30"
updated: "2026-03-30"
author: "meeting-note"
session_type: "기획·구현"
participants:
  - "사용자"
  - "planner"
related_docs:
  - "SES-GLO-009"
  - "PRD-GLO-008"
  - "PRD-GLO-005"
  - "UX-GLO-008"
  - "DIA-GLO-008"
  - "REV-GLO-006"
tags:
  - "project:game-liveops"
  - "type:meeting-note"
  - "topic:remote-config"
  - "topic:rbac"
  - "status:completed"
---

# 회의록: Remote Config 기획 및 구현 세션 (2026-03-30)

> 2026-03-30 Remote Config(Key-Value 원격 설정) 기능 기획 및 구현 완료 세션. 기획 문서 4개(SES-GLO-009, PRD-GLO-008, UX-GLO-008, DIA-GLO-008), 리뷰 리포트(REV-GLO-006, Conditional 판정) 산출. 프론트엔드 신규 파일 15개 생성, 수정 2개, 기능 완성도 100%. 전체 기능의 RBAC 권한 체계 통일(Viewer/Editor/Operator 3계층), 승인 워크플로우 추가(draft→pending_approval→active), 목록 페이지 UI 스타일 통일(레이블 영문화, 타겟 표기 변경, 결과 카운트 삭제), 승인 대기 페이지 단순화(테이블 단순화, 상세페이지 이동), 보류 항목 복제 버튼 제거, 승인/반려 버튼 스타일 통일 등 광범위한 개선을 통해 엔터프라이즈급 설정 관리 플랫폼으로 완성도를 높였다.

## 문서 정보

| 항목 | 내용 |
|------|------|
| ID | MTG-GLO-009 |
| 일시 | 2026-03-30 |
| 참석자 | 사용자, planner |
| 세션 유형 | 기획·구현 (Remote Config, RBAC 통일) |
| 관련 문서 | SES-GLO-009, PRD-GLO-008, PRD-GLO-005, UX-GLO-008, DIA-GLO-008, REV-GLO-006 |

---

## 1. 회의 목적

2026-03-30 Remote Config 기능의 기획 산출물 작성 및 구현 완료를 정리하고, 전체 관리 시스템의 RBAC 권한 체계를 통일한다. Key-Value 기반 원격 설정 관리 기능을 리서치부터 구현까지 완료하고, 이를 계기로 플레이어/세그멘테이션/실험/이벤트/푸시/Remote Config 전체 기능의 권한 모델을 일관되게 정렬하여 엔터프라이즈급 플랫폼 수준으로 도약한다.

---

## 2. 논의 내용

### 2.1 Remote Config 기능 기획 브레인스토밍

**배경**
- LiveOps 필수 기능 카테고리(D-005)에서 "원격 설정(Feature Flags/Remote Config)" 도출
- 경쟁사 7개 플랫폼 비교(D-004): Satori, Unity, AccelByte, Hive, Balancy, GameAnalytics, Metaplay 모두 지원
- 초기 설계: 조건부 딜리버리(conditional targeting) 없는 단순 Key-Value 모델

**논의 내용**

#### 2.1.1 사용 목적 및 범위
- **D-042**: 클라이언트 + 서버 양쪽 설정 통합 관리
  - 클라이언트: UI 토글, 난이도 조정, 메시지 변경 등 즉시 반영 필요한 설정
  - 서버: 비즈니스 로직(이벤트 보상, 확률) 설정
  - 목표: 양쪽 환경을 단일 콘솔에서 관리

#### 2.1.2 Value 타입 및 구조
- **D-043**: 기본 타입만 지원 (string, number, boolean, JSON)
  - 이유: 과도한 복잡도 피함, 운영팀 이해도 고려
  - JSON 타입: 복잡한 설정 객체는 JSON 문자열로 표현

#### 2.1.3 조건부 딜리버리 요구사항
- **D-044**: 조건부 딜리버리(conditional targeting) 불필요
  - 분석 결과: 플레이어 세그멘테이션(PRD-GLO-001)이 이미 타겟팅 기능 제공
  - 설계: 전체 플레이어에게 동일 값 적용, 세그먼트별 다른 설정은 별도 Key 사용

#### 2.1.4 배포 및 버전 관리
- **D-045**: 배포 방식 — 초기에는 즉시 반영, 이후 승인 워크플로우 추가로 변경
  - MVP: 저장 시 즉시 활성화
  - 향후(Phase 2): 승인 대기(pending_approval) 상태 추가로 운영 안전성 강화

- **D-046**: 버전 관리 — 변경 이력(감사 로그) 수준만 관리
  - 완전한 버전 제어(v1, v2 롤백) 불필요
  - 이유: 실시간 단일 값 관리 모델, 감사 로그로 충분

#### 2.1.5 데이터 모델 설계
- **D-047**: 접근 방식 — 플랫 Key-Value 테이블 (dot notation 네임스페이스)
  - 구조: `game.difficulty.normal_mode`, `payment.daily_limit`, `event.bonus_rate` 등
  - 이유: 계층적 네임스페이싱로 조직화, 데이터베이스 단순성 유지

#### 2.1.6 편집 UI 설계
- **D-048**: 편집 UI — 별도 페이지 방식 (`/remote-config/new`, `/remote-config/[id]/edit`)
  - 대안 검토: 인라인 편집(테이블 내), 모달 편집, 별도 페이지
  - 채택 이유: 4가지 값 타입별 다른 입력 필드 필요(텍스트박스/숫자/체크박스/JSON 에디터) → 별도 페이지 적합

**결론**
- Remote Config 기능 요구사항 8개 결정 완료
- 기본 설계 확정: Key-Value 단순 모델, 조건부 딜리버리 미포함, 즉시 반영(MVP)

---

### 2.2 기획 산출물 작성

**논의 내용**

#### 2.2.1 기획 문서 생성
- **SES-GLO-009**: 기획 세션 문서 (~1,126줄)
  - 의사결정 기록: 8개 결정(D-042~D-049)
  - 기능 정의: 목록, 생성, 상세, 편집, 삭제, 상태 전이
  - 데이터 모델 정의

- **PRD-GLO-008**: PRD (~1,517줄)
  - 기능 명세: 9개 기능(F-xxx)
  - API 스펙: 7개 엔드포인트 정의
  - 상태 머신: draft→pending_approval→active

#### 2.2.2 UX/다이어그램 문서 생성
- **UX-GLO-008**: 화면 정의서 (~1,245줄)
  - 화면 6개: 목록, 생성, 상세, 편집, 승인 대기, 변경 이력
  - 타입별 입력 UI: String(텍스트), Number(숫자), Boolean(체크박스), JSON(코드 에디터)
  - 상태 배지, 필터/정렬/검색

- **DIA-GLO-008**: 다이어그램
  - Mermaid 5개 다이어그램:
    1. ERD: Config, ConfigVersion, ConfigApprovalLog 테이블
    2. CRUD 시퀀스: 클라이언트→Admin API→Config API
    3. 유저 플로우: 신규 설정 → 검토 → 활성화
    4. 컴포넌트 구조: ConfigTable, ConfigForm, ConfigStatusBadge 등
    5. API 라우팅: `/api/remote-config/*`

#### 2.2.3 리뷰 결과
- **REV-GLO-006**: 교차 검토 리포트 (Conditional 판정)
  - Critical 이슈: 0건 ✓
  - Major 이슈: 5건 (API 경로 형태 불일치, key 제약조건 불명확, RBAC 삭제 권한 정의 누락, target enum 혼입, 변경 이력 칼럼명 불일치)
  - Minor 이슈: 5건
  - **판정**: Conditional — 문서 정합성 수정 필요 (A-038)

**결론**
- 기획 산출물 4개 완성: SES, PRD, UX, DIA
- 리뷰 결과 Conditional → Major 5건 수정 필요

---

### 2.3 프론트엔드 구현

**배경**
- UX-GLO-008, PRD-GLO-008 기준 구현
- 기술 스택: React 19, Next.js 16, TypeScript, TanStack Query, Tailwind CSS

**논의 내용**

#### 2.3.1 구현 범위
- **신규 파일 15개 생성**:
  - 페이지: RemoteConfigPage(목록), CreatePage(신규), DetailPage(상세), EditPage(편집), ApprovalsPage(승인 대기), ChangeLogPage(변경 이력)
  - 컴포넌트: RemoteConfigTable, RemoteConfigForm, RemoteConfigStatusBadge, RemoteConfigValueBadge, ChangeLogTable, ConfigTransitionModal 등
  - API: route.ts (5개 엔드포인트), hooks (useRemoteConfigs, useRemoteConfig, useCreateRemoteConfig, useUpdateRemoteConfig, useDeleteRemoteConfig, useTransitionRemoteConfig)
  - Types: RemoteConfig, ConfigStatus, ConfigValue, ConfigApprovalLog

- **수정 파일 2개**:
  - routes.ts: 사이드바 네비게이션에 Remote Config 추가 (실험과 푸시 사이)
  - layout.tsx: 서브탭 추가 ("설정 목록" / "승인 대기 + 뱃지 카운트")

#### 2.3.2 기능 구현 상세
- **목록 페이지**: 검색, 필터(상태), 정렬, 페이지네이션(20개씩)
- **타입별 입력 UI**:
  - String: TextInput
  - Number: NumberInput (min/max 검증)
  - Boolean: Checkbox
  - JSON: Monaco Editor (구문 강조, 유효성 검사)
- **변경 이력**: ChangeLogTable (날짜, 변경자, 이전값→신규값)
- **사이드바 네비게이션**: 기존 "실험" 아래 "Remote Config" 삽입
- **빌드 검증**: `npm run build` 성공, 모든 테스트 통과

**결론**
- 구현 100% 완료: 15개 파일 신규, 2개 수정
- 빌드 검증 성공

---

### 2.4 UI 스타일 통일

**배경**
- Remote Config 구현 후 기존 페이지들(플레이어, 세그먼트, 실험, 이벤트, 푸시)과의 스타일 불일치 확인
- 전체 시스템의 일관된 UX 제공 필요

**논의 내용**

#### 2.4.1 목록 페이지 제목
- **변경 전**: "Remote Config"
- **변경 후**: "Remote Config 목록"
- **근거**: 플레이어("플레이어 목록"), 세그먼트("세그먼트 목록"), 실험("실험 목록"), 이벤트("이벤트 목록"), 푸시("캠페인 목록")와 동일 패턴

#### 2.4.2 레이아웃 제목 추가
- 모든 관리 기능에 layout.tsx 추가 → h1 타이틀 "Remote Config" 표시
- **근거**: 실험, 이벤트, 푸시와 동일 패턴

#### 2.4.3 타입 뱃지 라벨 영문화
- **변경 전**: 한국어 (문자열, 숫자, 불린)
- **변경 후**: 영문 (String, Number, Boolean, JSON)
- **근거**: 기술 용어는 영문 유지 (shared/terminology.md), 일관성

#### 2.4.4 타겟 뱃지 표기 변경
- **변경 전**: "양쪽"
- **변경 후**: "클라이언트 · 서버"
- **근거**: 명확성, 실험 페이지의 "웹 · 모바일" 패턴과 동일

#### 2.4.5 테이블 헤더 한국어화
- **변경**: 키(Key), 값(Value), 타입(Type), 대상(Target), 태그(Tags), 수정일(Modified)
- **근거**: UI 패턴 통일 (다른 목록 페이지와 동일)

#### 2.4.6 버튼 텍스트 통일
- **변경 전**: "설정 추가"
- **변경 후**: "새 설정"
- **근거**: "새 실험", "새 이벤트", "새 푸시", "새 세그먼트", "새 플레이어" 패턴과 동일

#### 2.4.7 결과 카운트 삭제
- **변경**: 모든 목록 페이지에서 "전체 N개/명" 결과 카운트 제거
  - 플레이어 목록, 세그먼트 목록, 실험 목록, 이벤트 목록, 푸시 목록, Remote Config 목록
- **근거**: 페이지네이션으로 전체 개수 제시 불필요, UI 간결화

**결론**
- UI 스타일 통일 완료: 전체 6개 항목 개선
- 사용자 경험 일관성 강화

---

### 2.5 RBAC 권한 매트릭스 통일

**배경**
- Remote Config에 RBAC를 적용하면서 기존 기능들의 권한 체계 불일치 발견
- 플레이어/세그먼트/이벤트/실험/푸시: Viewer 권한으로 목록 조회 불가
- Remote Config만 Viewer 조회 가능 → 정책 통일 필요

**논의 내용**

#### 2.5.1 권한 체계 통일 (4계층 모델, D-026에서 확정)
- **조회(Read)**: Viewer+ → 모든 기능의 목록/상세 조회 가능
  - Viewer, Editor, Operator, Admin 모두 조회 가능
  - 실제 데이터 접근: 역할별 보임/숨김 필드 구분 (향후 Phase 2)

- **쓰기(Create/Update/Delete)**: Editor+ → 생성/편집/삭제
  - Editor, Operator, Admin만 가능
  - Viewer: 생성 버튼 숨김, `/new` 라우트 접근 불가(403)

- **승인(Approve/Reject)**: Operator+ → 승인 워크플로우
  - Operator, Admin만 가능
  - 승인 대기 페이지 접근, 승인/반려 버튼 활성화

- **시스템 설정**: Admin → `/settings` 전용
  - 관리자 관리, FCM/APNs 키, 감사 로그 설정 등

#### 2.5.2 적용 범위

**routes.ts 변경** (모든 기능 라우트 재설정)
```
/ (public)
/login (public)
/dashboard (minRole: "viewer")
/players (minRole: "viewer") ← 기존: "editor"
  /[id] (minRole: "viewer") ← 기존: "editor"
  /new (minRole: "editor")
/segments (minRole: "viewer") ← 기존: "editor"
  /[id] (minRole: "viewer") ← 기존: "editor"
  /new (minRole: "editor")
/events (minRole: "viewer") ← 기존: "editor"
  /[id] (minRole: "viewer") ← 기존: "editor"
  /new (minRole: "editor")
  /approvals (minRole: "operator") ← 기존: "operator"
/experiments (minRole: "viewer") ← 기존: "editor"
  /[id] (minRole: "viewer") ← 기존: "editor"
  /new (minRole: "editor")
  /approvals (minRole: "operator") ← 기존: "operator"
/push (minRole: "viewer") ← 기존: "editor"
  /[id] (minRole: "viewer") ← 기존: "editor"
  /new (minRole: "editor")
  /approvals (minRole: "operator") ← 기존: "operator"
/remote-config (minRole: "viewer") (신규)
  /[id] (minRole: "viewer") (신규)
  /new (minRole: "editor") (신규)
  /approvals (minRole: "operator") (신규)
/settings (minRole: "admin")
  /admins (minRole: "admin")
  /audit-log (minRole: "admin")
```

NAV_ITEMS minRole 변경: `minRole: "editor"` → `minRole: "viewer"` (네비게이션은 모두에게 표시)

**목록 페이지 6개 변경** (6개 기능: 플레이어, 세그먼트, 실험, 이벤트, 푸시, Remote Config)
- 생성 버튼: `can("editor")` 가드 추가
- 호버 액션(복제, 편집): `can("editor")` 가드 추가
- 승인/보관/기타 상태 전이: `can("operator")` 가드 추가

**상세 페이지 4개 변경** (4개 기능: 실험, 이벤트, 푸시, Remote Config)
- 편집 버튼: `can("editor")` 가드
- 삭제 버튼: `can("editor")` 가드
- 상태 전이(승인 요청): `can("editor")` 가드
- 승인/반려: `can("operator")` 가드

**PRD-GLO-005 업데이트** (v1.0 → v1.1)
- 전체 권한 매트릭스 갱신
- 기능별 권한 상세 정의

**결론**
- RBAC 정책 통일 완료
- 4계층 모델(Viewer/Editor/Operator/Admin) 전체 기능에 일관 적용
- 6개 목록 + 4개 상세 = 10개 페이지 가드 추가

---

### 2.6 승인 워크플로우 추가

**배경**
- D-045: 초기 즉시 반영 방식에서 승인 워크플로우로 변경 결정
- 운영 안전성 강화: 중요 설정의 검토 후 활성화

**논의 내용**

#### 2.6.1 상태 머신
- **상태 흐름**: `draft` → `pending_approval` → `active`
- **reject 경로**: `pending_approval` → `draft` (재편집 후 재요청)

#### 2.6.2 타입 정의
```typescript
type ConfigStatus = 'draft' | 'pending_approval' | 'active';
type ConfigTransitionAction = 'request_approval' | 'approve' | 'reject' | 'update';
```

#### 2.6.3 Mock 데이터 확장
- 신규 status 필드 추가 (13 active, 2 pending_approval, 1 draft)

#### 2.6.4 구현 컴포넌트
- **RemoteConfigStatusBadge**: draft(회색), pending_approval(주황), active(초록) 색상 표시
- **ConfigTransitionModal**: 승인 요청/승인/반려 시 사유 입력 모달
- **useTransitionRemoteConfig()**: 상태 전이 뮤테이션 훅

#### 2.6.5 API 엔드포인트
- POST `/api/remote-config/[id]/transition`
  - Body: `{ action: 'request_approval' | 'approve' | 'reject', reason?: string }`
  - Response: 업데이트된 Config + Transition Log

#### 2.6.6 레이아웃 및 탭
- layout.tsx에 서브탭 추가:
  - "설정 목록" (모두에게 표시)
  - "승인 대기" (상태별 카운트 뱃지)
    - pending_approval 상태 항목만 표시
    - Operator+ 권한만 접근

#### 2.6.7 목록 페이지 확장
- 상태 칼럼 추가 (Status)
- 상태 필터 추가 (All, Draft, Pending Approval, Active)

#### 2.6.8 상세 페이지 상태별 버튼
- **Draft 상태**:
  - "승인 요청" 버튼 (가드: editor+)
  - "편집" 링크 (가드: editor+)
  - "삭제" 버튼 (가드: editor+)

- **Pending_Approval 상태**:
  - "승인" 버튼 (가드: operator+)
  - "반려" 버튼 (가드: operator+)
  - "편집" 비활성화 또는 숨김

- **Active 상태**:
  - "편집" 링크 (가드: editor+, 편집 후 자동으로 draft로 복귀)
  - "삭제" 버튼 비활성화 또는 숨김

#### 2.6.9 라우트 보호
- `/remote-config/approvals` → `minRole: "operator"` (403 처리)

**결론**
- 승인 워크플로우 구현 완료
- 상태 머신, UI, API, 권한 체계 일관 적용
- 운영 안전성 강화

---

### 2.7 승인 대기 페이지 단순화

**배경**
- 기존 4개 기능(이벤트, 실험, 푸시, Remote Config)의 승인 대기 페이지 구현 방식 불일치
- 이벤트/실험 페이지: 좌측 테이블 + 우측 상세 패널 (인라인 승인/반려)
- UX 일관성 및 구현 복잡도 개선 필요

**논의 내용**

#### 2.7.1 변경 대상
- EventApprovalsPage
- ExperimentApprovalsPage
- PushApprovalsPage (신규)
- RemoteConfigApprovalsPage (신규)

#### 2.7.2 변경 방식
- **변경 전**: 좌측 테이블(pending_approval 항목 목록) + 우측 상세 패널(선택된 항목 상세 + 인라인 승인/반려 버튼)
- **변경 후**: 단순 테이블만 표시
  - 테이블 항목: ID, 제목, 생성자, 생성일, 요청일
  - 행 클릭 → 해당 항목의 상세 페이지로 이동 (`/events/[id]`, `/experiments/[id]` 등)
  - 승인/반려는 각 상세 페이지에서 처리

#### 2.7.3 이점
- 구현 단순화: 상세 로직 중복 제거
- UX 일관성: 모든 항목 조회/편집/승인 경로 통일
- 유지보수 용이성: 페이지별 독립적 상태 관리

**결론**
- 승인 대기 페이지 단순화 완료
- 4개 페이지 모두 동일 패턴 적용

---

### 2.8 승인 대기 항목 복제 버튼 제거

**배경**
- pending_approval 상태인 항목에 대해 복제 기능 제공은 운영상 혼동 야기 가능
- 미승인 항목의 변형 생성은 승인 후 처리하는 것이 원칙

**논의 내용**

#### 2.8.1 변경 대상
- ExperimentDetailPage (pending_approval 상태에서 복제 버튼 숨김)
- ExperimentListPage (pending_approval 호버 액션에서 복제 제거)
- EventDetailPage (pending_approval 상태에서 복제 버튼 숨김)
- EventListPage (pending_approval 호버 액션에서 복제 숨김)

#### 2.8.2 구현
```typescript
// 상세 페이지
{experiment.status !== 'pending_approval' && (
  <Button onClick={handleDuplicate}>복제</Button>
)}

// 목록 페이지 호버 액션
{item.status !== 'pending_approval' && (
  <DropdownMenuItem onClick={() => handleDuplicate(item.id)}>
    복제
  </DropdownMenuItem>
)}
```

**결론**
- 복제 버튼 제거 완료
- 미승인 항목에 대한 변형 생성 방지

---

### 2.9 승인/반려 버튼 스타일 통일

**배경**
- Remote Config 상세 페이지의 승인/반려 버튼이 다른 기능(이벤트, 실험, 푸시)과 스타일 불일치
- 전체 시스템의 일관된 액션 버튼 스타일 필요

**논의 내용**

#### 2.9.1 변경 대상
- RemoteConfigDetailPage의 승인/반려 버튼
- EventDetailPage (기존 스타일 기준)
- ExperimentDetailPage (기존 스타일 기준)
- PushDetailPage (기존 스타일 기준)

#### 2.9.2 스타일 통일
- **승인 버튼**:
  - `size="sm"` + `variant="default"` (Primary 색상, 흰색 텍스트)
  - 라벨: "승인"
  - 순서: 왼쪽

- **반려 버튼**:
  - `size="sm"` + `variant="destructive"` (Red, 흰색 텍스트)
  - 라벨: "반려"
  - 순서: 오른쪽

#### 2.9.3 구현
```typescript
<div className="flex gap-2">
  <Button
    size="sm"
    variant="default"
    onClick={handleApprove}
  >
    승인
  </Button>
  <Button
    size="sm"
    variant="destructive"
    onClick={handleReject}
  >
    반려
  </Button>
</div>
```

**결론**
- 승인/반려 버튼 스타일 통일 완료
- 모든 기능의 워크플로우 액션 버튼 동일 스타일 적용

---

## 3. 결정 사항

| ID | 결정 내용 | 근거 | 비고 |
|----|----------|------|------|
| D-042 | Remote Config 사용 목적 — 클라이언트 + 서버 양쪽 설정 통합 관리 | 실제 운영상 양쪽 환경 설정 필요, 단일 콘솔 관리 효율성 | SES-GLO-009 |
| D-043 | Value 타입 — 기본 타입만 지원 (string, number, boolean, JSON) | 복잡도 관리, 운영팀 이해도 고려 | SES-GLO-009 |
| D-044 | 조건부 딜리버리 — 불필요, 전체 플레이어에게 동일 값 적용 | 세그멘테이션(PRD-GLO-001)이 이미 타겟팅 제공 | SES-GLO-009 |
| D-045 | 배포 방식 — 초기 즉시 반영, 이후 승인 워크플로우 추가로 변경 | MVP 빠른 출시, Phase 2에서 운영 안전성 강화 | SES-GLO-009 |
| D-046 | 버전 관리 — 변경 이력(감사 로그) 수준만 관리 | 단일 값 모델에서 완전 버전 제어 불필요 | SES-GLO-009 |
| D-047 | 접근 방식 — 플랫 Key-Value 테이블 (dot notation 네임스페이스) | 계층적 조직화 + 데이터베이스 단순성 | SES-GLO-009 |
| D-048 | 편집 UI — 별도 페이지 방식 (/remote-config/new, /remote-config/[id]/edit) | 타입별 다른 입력 필드 필요 | SES-GLO-009 |
| D-049 | RBAC 권한 매트릭스 통일 — 조회(Viewer+), 쓰기(Editor+), 승인(Operator+) | 모든 기능에 일관된 권한 정책 필요 | PRD-GLO-005 v1.1 |

---

## 4. 액션 아이템

| ID | 항목 | 담당 | 기한 | 상태 |
|----|------|------|------|------|
| A-040 | REV-GLO-006 Major 이슈 5건 문서 정합성 수정 (API 경로 형태, key 제약조건, RBAC 삭제 권한, target enum 혼입, 변경 이력 칼럼명) | prd + uiux-spec | 2026-04-02 | 진행 중 |
| A-041 | Remote Config 클라이언트 SDK 연동 설계 (scope: 다음 스프린트) | planner + senior-frontend-developer | 2026-04-09 | 대기 |
| A-042 | meta.yml 최종 업데이트 확인 (결정 8개, 액션 3개, 질문 3개 반영) | meeting-note | 2026-03-31 | 대기 |

---

## 5. 미결 사항

| ID | 이슈 | 필요한 정보/결정 | 담당 |
|----|------|-----------------|------|
| Q-031 | 클라이언트 SDK에서 Remote Config 값 조회 시 폴링 vs 웹소켓 방식 선택 필요 | SDK 설계 세션, 성능 벤치마크 | planner |
| Q-032 | 설정값 규모가 1000개 이상일 때 성능 최적화 필요 여부 검토 | 캐싱 전략, DB 인덱싱, 클라이언트 배치 로드 | senior-frontend-developer |
| Q-033 | 승인 워크플로우 예외 — 긴급 변경 시 승인 우회 정책 필요 여부 | 보안 정책, 감사 로그 강화 | planner |

---

## 6. 다음 회의 안건

- [ ] Remote Config 클라이언트 SDK 연동 설계
- [ ] 설정값 성능 최적화 검토 (캐싱, 배치 로드)
- [ ] 긴급 변경 우회 정책 결정
- [ ] REV-GLO-006 Major 이슈 수정 내용 검토
- [ ] Phase 2 기획 아이템 (세그먼트 필터 고급 기능, 푸시 A/B 실험 등)

---

## 7. 서비스 컨텍스트 요약

> 이 섹션은 다른 에이전트가 참조할 수 있도록 현재까지 확정된 내용을 요약합니다.

```yaml
service:
  name: "Game LiveOps 관리 플랫폼"
  version: "MVP Phase 1 + Phase 2 후반"

current_phase: "구현 (MVP 마무리)"

# Core Features (확정됨)
confirmed_features:
  - id: "F-001"
    name: "플레이어 세그멘테이션"
    status: "구현 완료"
    phase: "P0"

  - id: "F-002"
    name: "라이브 이벤트 관리"
    status: "구현 완료"
    phase: "P0"

  - id: "F-003"
    name: "A/B 테스트 (실험)"
    status: "구현 완료"
    phase: "P0"

  - id: "F-004"
    name: "KPI 대시보드"
    status: "구현 완료"
    phase: "P1"

  - id: "F-005"
    name: "RBAC (역할 기반 접근 제어)"
    status: "구현 완료"
    phase: "P0"

  - id: "F-006"
    name: "모바일 푸시 알림 발송"
    status: "구현 완료"
    phase: "P1"

  - id: "F-007"
    name: "Remote Config (Key-Value 설정)"
    status: "구현 완료"
    phase: "P1"

# Key Decisions (마지막 세션에서 추가됨)
key_decisions:
  - "D-042: Remote Config 클라이언트 + 서버 양쪽 설정 통합 관리"
  - "D-043: Value 타입 — 문자열, 숫자, 불린, JSON 4가지만 지원"
  - "D-044: 조건부 딜리버리 불필요 (세그멘테이션으로 충분)"
  - "D-045: 배포 방식 — MVP(즉시 반영) → Phase 2(승인 워크플로우)"
  - "D-046: 버전 관리 — 감사 로그 수준"
  - "D-047: 플랫 Key-Value (dot notation 네임스페이싱)"
  - "D-048: 편집 UI 별도 페이지 방식"
  - "D-049: RBAC 통일 — Viewer(조회) / Editor(쓰기) / Operator(승인) / Admin(설정)"

# Architecture
architecture:
  frontend:
    framework: "Next.js 16"
    ui_framework: "React 19 + Shadcn UI"
    state_management: "TanStack Query"
    styling: "Tailwind CSS 4"

  pages:
    dashboard: "KPI 지표 7개 (NRU/DAU/MCU/PU/PUR/Revenue/ARPPU)"
    players: "목록/상세/생성"
    segments: "목록/상세/생성"
    events: "목록/상세/생성/캘린더/타임라인/승인 대기"
    experiments: "목록/상세/생성/승인 대기"
    push: "목록/상세/생성/승인 대기"
    remote_config: "목록/상세/생성/승인 대기/변경 이력"
    settings: "관리자/감사 로그"

  rbac:
    roles: ["Viewer", "Editor", "Operator", "Admin"]
    permission_levels:
      read: "Viewer+"
      create_update_delete: "Editor+"
      approve_reject: "Operator+"
      admin_settings: "Admin"

# Constraints
constraints:
  - "Remote Config: Key-Value 단순 모델 (네임스페이싱)"
  - "조건부 딜리버리: 미지원 (세그멘테이션 활용)"
  - "모바일 푸시: FCM/APNs 기본, 리치 푸시는 이미지만 (Phase 2: 커스텀 액션)"
  - "A/B 테스트: 중급 통계 수준 (Chi-squared, Welch's t-test)"
  - "이벤트 상태: 7단계 (cancelled 제거)"
  - "모든 목록: Pagination 20개씩"

# Open Issues
open_issues:
  - "Q-031: 클라이언트 SDK 폴링 vs 웹소켓 선택"
  - "Q-032: 설정값 1000개+ 성능 최적화"
  - "Q-033: 긴급 변경 승인 우회 정책"
```

---

## 변경 이력

| 버전 | 일자 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| v1.0 | 2026-03-30 | 초안 작성 (Remote Config 기획·구현 완료, RBAC 통일, UI 스타일 정리) | meeting-note |
