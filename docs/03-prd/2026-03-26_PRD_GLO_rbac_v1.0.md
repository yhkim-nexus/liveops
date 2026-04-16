---
id: "PRD-GLO-005"
title: "PRD: 역할 기반 접근 제어 (RBAC)"
project: "GLO"
version: "v1.1"
status: "draft"
created: "2026-03-26"
updated: "2026-03-30"
author: "prd"
reviewers: []
related_docs:
  - "PRD-GLO-001"
  - "PRD-GLO-002"
  - "PRD-GLO-003"
  - "PRD-GLO-007"
  - "PRD-GLO-008"
  - "RES-GLO-002"
  - "SPEC-GLO-003"
  - "UX-GLO-005"
  - "DIA-GLO-005"
tags:
  - "project:game-liveops"
  - "type:prd"
  - "topic:rbac"
---

# PRD: 역할 기반 접근 제어 (RBAC)

> 관리자 권한을 역할 기반으로 분리하여 LiveOps 대시보드의 운영 보안을 확보하고, 관리자 액션을 감사 로그로 추적하는 시스템을 정의한다.

## 문서 정보

| 항목 | 내용 |
|------|------|
| 문서 ID | PRD-GLO-005 |
| 버전 | v1.1 |
| 상태 | draft |
| 작성일 | 2026-03-26 |
| 수정일 | 2026-03-30 |
| 작성자 | prd |
| 관련 문서 | PRD-GLO-001, PRD-GLO-002, PRD-GLO-003, RES-GLO-002, SPEC-GLO-003, UX-GLO-005, DIA-GLO-005 |

---

## 1. Overview

### 1.1 제품 비전

관리자 권한을 Admin/Operator/Editor/Viewer 4개 역할로 분리하여 LiveOps 대시보드의 운영 보안을 확보한다. Next.js Middleware 기반 라우트 보호로 역할별 접근 범위를 제어하고, Mock 인증 체계로 세션을 관리하며, 모든 관리자 액션을 감사 로그로 기록하여 운영 투명성을 보장한다.

### 1.2 배경 및 목적

**배경**

- 경쟁사 분석(RES-GLO-002, Section 3.8)에서 역할 기반 접근 제어(RBAC)는 Must-Have #8로 분류되었다. 5/7 경쟁 플랫폼이 RBAC를 지원하며, 감사 로그(4/7), SSO 연동(3/7) 순으로 지원한다.
- 기존 PRD-GLO-002(라이브 이벤트)에서 `event_approver` 역할이 승인 워크플로우(F-011, REQ-011-03)에 이미 정의되어 있고, PRD-GLO-003(A/B 테스트)에서 `experiment_creator`, `experiment_approver`, `experiment_operator` 역할이 사용 중이다. 이들을 통합하는 RBAC 시스템이 필요하다.
- Metaplay의 커스텀 역할 + 세분화 권한 모델과 Hive Console의 운영자 친화적 UI를 벤치마킹한다.

**목적**

- 이 PRD는 GLO 서비스의 **역할 기반 접근 제어(RBAC)** 기능 범위를 정의한다.
- Mock 인증(로그인/로그아웃/세션 관리), 4역할 계층 모델, Middleware 라우트 보호, 관리자 관리(목록/초대/역할 변경/계정 정지), 감사 로그, GNB 역할 기반 네비게이션을 명세한다.
- MVP(Phase 1) 출시에 필요한 최소 기능과 수용 기준을 확정한다.

### 1.3 성공 지표 (Success Metrics)

| 지표 | 현재 | 목표 | 측정 방법 |
|------|------|------|----------|
| 역할 검사 정확도 | - | 100% | 모든 라우트에서 역할 미달 시 403 반환 확인 |
| Middleware 오버헤드 | - | 50ms 이내 | 세션 검증 + 역할 검사 소요 시간 p99 측정 |
| 감사 로그 기록 | - | 100% | 모든 관리자 액션(로그인/로그아웃/역할 변경/계정 생성 등)이 로그에 기록됨 |
| 로그인 응답 시간 | - | 500ms 이내 | Mock API 기준 POST /api/auth/login 응답 시간 |
| Mock 계정 동작 | - | 4개 역할 모두 정상 | 각 Mock 계정으로 로그인 후 권한 범위 정상 작동 확인 |

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
- 자신의 역할(Operator)에 맞는 기능만 사이드바에 표시되어 혼란 없이 작업하고 싶다.
- 이벤트 생성, 실험 관리 등 운영 기능에는 접근하되, 시스템 설정이나 관리자 관리 같은 고위험 기능에는 접근이 차단되길 원한다.
- 로그인 후 세션이 안정적으로 유지되어 반복 로그인 없이 작업에 집중하고 싶다.

**Pain Points**
- 현재 모든 관리자가 동일한 권한을 가져 실수로 설정을 변경할 위험이 있다.
- 누가 어떤 작업을 했는지 추적이 불가능하다.
- 역할에 무관하게 모든 메뉴가 노출되어 불필요한 기능이 화면을 차지한다.

#### Secondary Persona: 시스템 관리자 (Admin)

| 항목 | 내용 |
|------|------|
| 소속 | 인디~중소 게임사 기술 운영 또는 팀 리더 |
| 역할 | LiveOps 대시보드 관리자 계정 관리, 역할 부여 |
| 기술 수준 | 기술 이해도 높음. 시스템 설정 관리 경험 보유 |
| 주요 관심사 | 팀원별 적절한 권한 부여, 보안 사고 예방 |

**Goals**
- 팀원에게 업무 범위에 맞는 역할을 부여하고 변경하고 싶다.
- 새로운 관리자를 초대하고, 퇴사/이동 시 계정을 정지하고 싶다.
- 관리자 목록과 역할 현황을 한눈에 파악하고 싶다.

**Pain Points**
- 관리자 계정 생성/변경을 코드나 DB 직접 수정으로 처리해야 한다.
- 역할 변경 이력이 남지 않아 감사 시 대응이 어렵다.

#### Tertiary Persona: 이수정 (팀 리드/감사 권한자)

PRD-GLO-002에서 정의된 동일 페르소나를 재사용한다.

| 항목 | 내용 |
|------|------|
| 소속 | 인디~중소 게임사 LiveOps 팀 리드 |
| 역할 | 이벤트/실험 검토 및 승인/반려, 감사 로그 조회 |
| 기술 수준 | 비개발자. 이벤트/실험 기획 경험 다수 |
| 주요 관심사 | 관리자 활동 추적, 보안 이상 징후 모니터링 |

**Goals**
- 감사 로그를 통해 관리자 로그인/로그아웃, 역할 변경, 계정 생성 이력을 조회하고 싶다.
- 비정상적인 활동(예: 빈번한 역할 변경, 미인가 접근 시도)을 파악하고 싶다.
- 팀 내 관리자 역할 현황을 정기적으로 검토하고 싶다.

**Pain Points**
- 관리자 활동 이력을 확인할 방법이 없다.
- 역할 변경 요청이 구두로 처리되어 기록이 남지 않는다.

### 2.2 사용자 시나리오

#### SC-010: Mock 계정 로그인 및 역할별 접근

> 김지연은 Operator 계정으로 로그인하여 대시보드와 이벤트 메뉴에 접근하지만, 설정 메뉴는 사이드바에 표시되지 않는다.

**Steps**
1. 김지연이 `/login` 페이지에서 `operator@liveops.dev` / `oper123` 입력
2. 로그인 성공 → 세션 쿠키 발급 → `/dashboard`로 리다이렉트
3. 사이드바에 대시보드, 이벤트, 실험, 세그먼트 메뉴 표시 (설정 메뉴 미표시)
4. 김지연이 URL 직접 입력으로 `/settings/admins` 접근 시도
5. Middleware가 역할 부족 감지 → `/forbidden` (403 페이지)로 리다이렉트
6. 감사 로그에 `login` 액션 기록

#### SC-011: 관리자 초대 및 역할 부여

> 시스템 관리자가 신규 팀원을 Viewer 역할로 초대하고, 이후 Operator로 역할을 변경한다.

**Steps**
1. 시스템 관리자가 Admin 계정(`admin@liveops.dev` / `admin123`)으로 로그인
2. 사이드바에서 설정 → 관리자 관리 메뉴 클릭 → `/settings/admins`
3. "관리자 초대" 버튼 클릭 → `/settings/admins/invite`
4. 이메일 `newuser@company.com`, 이름 "최신입", 역할 "Viewer" 입력 후 초대
5. 관리자 목록에 "최신입" (Viewer, active) 추가 확인
6. "최신입" 행의 액션 드롭다운에서 역할 변경 → "Operator" 선택
7. 역할 변경 확인 → 감사 로그에 `user_created`, `role_changed` 기록

#### SC-012: 감사 로그 조회

> 이수정이 Admin 계정으로 감사 로그를 조회하여 최근 관리자 활동을 확인한다.

**Steps**
1. 이수정이 Admin 계정으로 로그인 → `/settings/audit-log` 접근
2. 감사 로그 테이블에 최신 50건의 관리자 액션 표시
3. 액션 필터를 "역할변경"으로 변경 → 역할 변경 이력만 필터링
4. 특정 로그 항목에서 실행자, 대상, 변경 전/후 역할 확인

---

## 2.3 기존 시스템 연동 포인트

| 연동 대상 | 참조 문서 | RBAC 매핑 |
|----------|----------|----------|
| `event_approver` (이벤트 승인) | PRD-GLO-002 F-011, REQ-011-03 | Operator 역할에 포함 |
| 이벤트 CRUD | PRD-GLO-002 | Editor 이상 (project edit permission) |
| 이벤트 조회 | PRD-GLO-002 | Editor 이상 (project read permission) |
| 긴급 제어 Pause/Kill/Extend | PRD-GLO-002 A-017 | Operator 이상 |
| `experiment_creator` | PRD-GLO-003 SPEC-GLO-001 | Operator 역할에 포함 |
| `experiment_approver` | PRD-GLO-003 SPEC-GLO-001 | Operator 역할에 포함 |
| `experiment_operator` | PRD-GLO-003 SPEC-GLO-001 | Operator 역할에 포함 |
| KPI 대시보드 | SPEC-GLO-002 | Viewer 이상 (읽기 전용) |

---

## 3. Features & Requirements

### 3.1 기능 목록

| ID | 기능명 | 설명 | 우선순위 | 범위 |
|----|--------|------|----------|------|
| F-028 | Mock 인증 | 이메일/비밀번호 기반 로그인, 로그아웃, JWT 세션 쿠키 관리 | P0 | MVP |
| F-029 | 역할 모델 | Admin/Operator/Editor/Viewer 4역할 계층, 역할 수준 비교 로직 | P0 | MVP |
| F-030 | Middleware 라우트 보호 | 경로별 최소 역할 검사, 세션 검증, 미인증/권한 부족 리다이렉트 | P0 | MVP |
| F-031 | 관리자 관리 | 관리자 목록 조회, 초대, 역할 변경, 계정 정지/활성화 (Admin 전용) | P0 | MVP |
| F-032 | 감사 로그 | 로그인/로그아웃/역할 변경/계정 생성/정지/활성화 기록 및 조회 | P0 | MVP |
| F-033 | GNB 역할 기반 네비게이션 | 사이드바 메뉴를 관리자 역할에 따라 필터링 | P0 | MVP |

**우선순위 기준**
- **P0 (필수)**: MVP에 반드시 포함. 없으면 서비스 운영 보안 미확보.
- **P1 (중요)**: 높은 운영 가치. MVP에 포함하되 일정 압박 시 간소화 가능.
- **P2 (선택)**: Phase 2 이후 개발. MVP 출시에 영향 없음.

---

### 3.2 기능 상세: F-028 Mock 인증

#### 개요

이메일/비밀번호 기반 Mock 인증 시스템을 제공한다. 로그인 성공 시 JWT 세션 토큰을 httpOnly 쿠키로 발급하고, 로그아웃 시 세션을 삭제한다. 실제 SSO 연동은 후속 버전에서 구현하며, 본 버전에서는 4개의 미리 정의된 Mock 계정으로 동작한다.

#### 사용자 스토리

**US-040**
```
As a 관리자,
I want to 이메일과 비밀번호를 입력해 로그인하기를,
So that 내 역할에 맞는 대시보드 기능에 접근할 수 있다.
```

**US-041**
```
As a 관리자,
I want to 로그아웃 버튼을 클릭해 세션을 종료하기를,
So that 공용 기기에서 안전하게 작업을 마칠 수 있다.
```

#### 상세 요구사항

| ID | 요구사항 | 필수 |
|----|----------|------|
| REQ-028-01 | 로그인 폼은 이메일(필수, email 형식 검증)과 비밀번호(필수, 최소 4자) 필드로 구성된다. | Y |
| REQ-028-02 | `POST /api/auth/login` 호출 시 Mock 계정 데이터와 대조하여 인증한다. | Y |
| REQ-028-03 | 인증 성공 시 jose 라이브러리로 JWT 토큰을 생성하고, `session_token` httpOnly 쿠키(secure, sameSite: lax, path: /)로 설정한다. | Y |
| REQ-028-04 | 세션 만료 시간은 24시간(고정)이다. | Y |
| REQ-028-05 | `POST /api/auth/logout` 호출 시 세션 쿠키를 삭제하고 `/login`으로 리다이렉트한다. | Y |
| REQ-028-06 | `GET /api/auth/me` 호출 시 현재 세션의 관리자 정보(id, email, name, role)를 반환한다. 세션이 없거나 만료 시 401을 반환한다. | Y |
| REQ-028-07 | Mock 계정 4개를 제공한다: admin@liveops.dev/admin123 (Admin, 김관리), operator@liveops.dev/oper123 (Operator, 이운영), editor@liveops.dev/editor123 (Editor, 최편집), viewer@liveops.dev/view123 (Viewer, 박조회). | Y |
| REQ-028-08 | 로그인 실패 시 "이메일 또는 비밀번호가 올바르지 않습니다" 에러 메시지를 표시한다. 구체적인 실패 사유(이메일 없음, 비밀번호 불일치)를 구분하지 않는다. | Y |
| REQ-028-09 | 정지(suspended) 상태 계정은 로그인이 차단된다. "계정이 정지되었습니다. 관리자에게 문의하세요." 메시지를 표시한다. | Y |

#### 수용 조건 (Acceptance Criteria)

**AC-028-01**
```gherkin
Scenario: Mock 계정 로그인 성공
  Given 관리자가 로그인 페이지(/login)에 있다
  When 관리자가 "operator@liveops.dev" / "oper123"을 입력하고 로그인 버튼을 클릭한다
  Then 세션 쿠키(session_token)가 httpOnly로 설정된다
  And /dashboard로 리다이렉트된다
  And 감사 로그에 login 액션이 기록된다
```

**AC-028-02**
```gherkin
Scenario: 잘못된 비밀번호로 로그인 실패
  Given 관리자가 로그인 페이지에 있다
  When 관리자가 "operator@liveops.dev" / "wrong123"을 입력하고 로그인 버튼을 클릭한다
  Then "이메일 또는 비밀번호가 올바르지 않습니다" 에러 메시지가 표시된다
  And 세션 쿠키가 생성되지 않는다
```

**AC-028-03**
```gherkin
Scenario: 로그아웃
  Given 관리자가 로그인된 상태로 대시보드에 있다
  When 관리자가 GNB의 로그아웃 버튼을 클릭한다
  Then 세션 쿠키가 삭제된다
  And /login으로 리다이렉트된다
  And 감사 로그에 logout 액션이 기록된다
```

**AC-028-04**
```gherkin
Scenario: 정지된 계정 로그인 차단
  Given "viewer@liveops.dev" 계정이 suspended 상태이다
  When 관리자가 해당 계정으로 로그인을 시도한다
  Then "계정이 정지되었습니다. 관리자에게 문의하세요." 메시지가 표시된다
  And 로그인이 차단된다
```

#### 비즈니스 규칙

| ID | 규칙 | 예시 |
|----|------|------|
| BR-028-01 | 로그인 실패 시 이메일 존재 여부와 비밀번호 불일치를 구분하지 않는 통합 에러 메시지를 반환한다. | 계정 정보 유출 방지 |
| BR-028-02 | 정지(suspended) 상태 계정은 로그인이 불가하다. | 퇴사/이동 관리자 접근 차단 |
| BR-028-03 | 세션 만료 시 자동으로 로그인 페이지로 리다이렉트한다. | 24시간 미활동 후 재인증 요구 |

#### 데이터 요구사항

| 필드 | 타입 | 필수 | 설명 | 유효성 |
|------|------|------|------|--------|
| email | String | Y | 관리자 이메일 | email 형식 |
| password | String | Y | 비밀번호 | 최소 4자 |
| session_token | JWT | Y | 세션 토큰 (쿠키) | jose 라이브러리로 생성, 24시간 만료 |

#### 예외 처리

| 상황 | 처리 | 메시지 | 코드 |
|------|------|--------|------|
| 이메일/비밀번호 불일치 | 로그인 차단 | "이메일 또는 비밀번호가 올바르지 않습니다" | ERR-AUTH-028-01 |
| 정지된 계정 로그인 | 로그인 차단 | "계정이 정지되었습니다. 관리자에게 문의하세요." | ERR-AUTH-028-02 |
| 세션 만료 | 쿠키 삭제 + 리다이렉트 | 자동으로 /login 리다이렉트 | ERR-AUTH-028-03 |
| 이메일 형식 오류 | 폼 검증 차단 | "올바른 이메일 형식을 입력하세요." | ERR-AUTH-028-04 |

#### UI/UX 요구사항
- 로그인 페이지(SCR-RBAC-002)는 중앙 정렬된 간결한 폼으로 구성한다.
- 로그인 버튼 클릭 시 로딩 스피너를 표시한다.
- 에러 메시지는 폼 하단에 빨간색 텍스트로 표시한다.
- React Hook Form + Zod로 클라이언트 측 유효성 검증을 수행한다.

---

### 3.3 기능 상세: F-029 역할 모델

#### 개요

Admin/Operator/Editor/Viewer 4개 역할을 계층적으로 정의한다. 상위 역할은 하위 역할의 모든 권한을 자동 포함하며, 역할 검사는 `roleLevel >= requiredLevel` 비교로 수행한다. 클라이언트 측에서는 `useAuth` 훅의 `can(minimumRole)` 메서드와 `RoleGate` 컴포넌트를 제공한다.

#### 사용자 스토리

**US-042**
```
As a 시스템 관리자,
I want to Admin/Operator/Editor/Viewer 4개 역할 체계로 관리자 권한을 분리하기를,
So that 각 관리자가 업무 범위에 맞는 기능만 사용할 수 있다.
```

#### 상세 요구사항

| ID | 요구사항 | 필수 |
|----|----------|------|
| REQ-029-01 | 역할은 Admin(level 4), Operator(level 3), Editor(level 2), Viewer(level 1) 4개로 정의한다. | Y |
| REQ-029-02 | 역할 계층은 상위 포함 방식이다. Admin은 Operator와 Viewer의 모든 권한을, Operator는 Viewer의 모든 권한을 포함한다. | Y |
| REQ-029-03 | 역할 검사는 `ROLE_LEVELS[userRole] >= ROLE_LEVELS[requiredRole]` 비교로 수행한다. | Y |
| REQ-029-04 | `useAuth` 훅에 `can(minimumRole: Role): boolean` 메서드를 제공한다. | Y |
| REQ-029-05 | `RoleGate` 컴포넌트는 `role` prop 이상의 역할을 가진 관리자에게만 자식 요소를 렌더링한다. `fallback` prop으로 권한 부족 시 대체 UI를 지정할 수 있다. | Y |
| REQ-029-06 | 기존 `event_approver`, `experiment_creator`, `experiment_approver`, `experiment_operator` 역할은 Operator에 매핑한다. | Y |
| REQ-029-07 | Role 타입은 `"admin" | "operator" | "editor" | "viewer"` 리터럴 유니언으로 정의한다. | Y |

#### 수용 조건 (Acceptance Criteria)

**AC-029-01**
```gherkin
Scenario: 역할 계층 검사 — Operator가 Viewer 기능 접근
  Given 관리자의 역할이 Operator(level 2)이다
  When Viewer(level 1) 이상이 필요한 기능에 접근한다
  Then 접근이 허용된다 (2 >= 1)
```

**AC-029-02**
```gherkin
Scenario: 역할 계층 검사 — Viewer가 Operator 기능 접근 차단
  Given 관리자의 역할이 Viewer(level 1)이다
  When Operator(level 2) 이상이 필요한 기능에 접근한다
  Then 접근이 차단된다 (1 < 2)
```

**AC-029-03**
```gherkin
Scenario: RoleGate 컴포넌트 렌더링 제어
  Given 관리자의 역할이 Viewer이다
  When RoleGate role="operator" 내부의 버튼이 렌더링을 시도한다
  Then 버튼 대신 fallback UI가 표시된다
```

#### 비즈니스 규칙

| ID | 규칙 | 예시 |
|----|------|------|
| BR-029-01 | 역할은 반드시 4개(Admin/Operator/Editor/Viewer)이며, 커스텀 역할 생성은 후속 버전에서 지원한다. | v2.0 로드맵 |
| BR-029-02 | 상위 역할은 하위 역할의 모든 권한을 자동 포함한다. 개별 권한 제외는 불가하다. | Admin이 Viewer 전용 모드로 동작 불가 |

#### 역할별 권한 매트릭스

> **v1.1 업데이트 (2026-03-30)**: Viewer 역할이 모든 기능의 목록/상세를 읽기 전용으로 조회할 수 있도록 변경되었다. 쓰기 작업(생성/편집/삭제)은 Editor 이상, 승인/반려는 Operator 이상으로 유지한다. Remote Config 기능이 추가되었다.

| 기능 영역 | 세부 권한 | Admin | Operator | Editor | Viewer |
|----------|----------|:-----:|:--------:|:------:|:------:|
| **대시보드** | KPI 대시보드 조회 | ✅ | ✅ | ✅ | ✅ |
| | 기간 토글 (7D/30D/90D) | ✅ | ✅ | ✅ | ✅ |
| **플레이어** | 플레이어 목록/상세 조회 | ✅ | ✅ | ✅ | ✅ |
| **세그멘테이션** | 오디언스 목록/상세 조회 | ✅ | ✅ | ✅ | ✅ |
| | 오디언스 생성/편집/삭제 | ✅ | ✅ | ✅ | ❌ |
| | 오디언스 복제 | ✅ | ✅ | ✅ | ❌ |
| | 속성 관리 (Custom CRUD) | ✅ | ✅ | ✅ | ❌ |
| | 이벤트 택소노미 관리 | ✅ | ✅ | ✅ | ❌ |
| **라이브 이벤트** | 이벤트 목록/상세 조회 | ✅ | ✅ | ✅ | ✅ |
| | 캘린더/타임라인 뷰 | ✅ | ✅ | ✅ | ✅ |
| | 이벤트 생성/편집/삭제 | ✅ | ✅ | ✅ | ❌ |
| | 이벤트 복제 | ✅ | ✅ | ✅ | ❌ |
| | 승인 요청 (draft → pending_approval) | ✅ | ✅ | ✅ | ❌ |
| | 승인/반려 (event_approver) | ✅ | ✅ | ❌ | ❌ |
| | 긴급 제어 (Pause/Kill/Extend) | ✅ | ✅ | ❌ | ❌ |
| | 보관 (ended → archived) | ✅ | ✅ | ✅ | ❌ |
| **A/B 테스트** | 실험 목록/상세 조회 | ✅ | ✅ | ✅ | ✅ |
| | 결과 대시보드 조회 | ✅ | ✅ | ✅ | ✅ |
| | 실험 생성/편집/삭제 | ✅ | ✅ | ✅ | ❌ |
| | 실험 복제 | ✅ | ✅ | ✅ | ❌ |
| | 사전 테스트 시작 | ✅ | ✅ | ✅ | ❌ |
| | 승인 요청 | ✅ | ✅ | ✅ | ❌ |
| | 승인/반려 | ✅ | ✅ | ❌ | ❌ |
| | 일시 중단/재개/종료 | ✅ | ✅ | ❌ | ❌ |
| **Remote Config** | 설정 목록/상세 조회 | ✅ | ✅ | ✅ | ✅ |
| | 설정 생성/편집/삭제 | ✅ | ✅ | ✅ | ❌ |
| | 승인 요청 (draft → pending_approval) | ✅ | ✅ | ✅ | ❌ |
| | 승인/반려 | ✅ | ✅ | ❌ | ❌ |
| **푸시 알림** | 캠페인 목록/상세 조회 | ✅ | ✅ | ✅ | ✅ |
| | 캠페인 생성/편집/삭제 | ✅ | ✅ | ✅ | ❌ |
| | 캠페인 복제 | ✅ | ✅ | ✅ | ❌ |
| | 승인 요청 | ✅ | ✅ | ✅ | ❌ |
| | 승인/반려 | ✅ | ✅ | ❌ | ❌ |
| | 발송 취소 | ✅ | ✅ | ❌ | ❌ |
| **설정** | 관리자 목록 조회 | ✅ | ❌ | ❌ | ❌ |
| | 관리자 초대 | ✅ | ❌ | ❌ | ❌ |
| | 역할 변경 | ✅ | ❌ | ❌ | ❌ |
| | 계정 정지/활성화 | ✅ | ❌ | ❌ | ❌ |
| | 감사 로그 조회 | ✅ | ❌ | ❌ | ❌ |
| **네비게이션** | 대시보드 메뉴 | ✅ | ✅ | ✅ | ✅ |
| | 플레이어 메뉴 | ✅ | ✅ | ✅ | ✅ |
| | 세그먼트 메뉴 | ✅ | ✅ | ✅ | ✅ |
| | 이벤트 메뉴 | ✅ | ✅ | ✅ | ✅ |
| | 실험 메뉴 | ✅ | ✅ | ✅ | ✅ |
| | Remote Config 메뉴 | ✅ | ✅ | ✅ | ✅ |
| | 푸시 알림 메뉴 | ✅ | ✅ | ✅ | ✅ |
| | 설정 메뉴 | ✅ | ❌ | ❌ | ❌ |
| **라우트 보호** | `/dashboard` | ✅ (viewer+) | ✅ | ✅ | ✅ |
| | `/players/*` | ✅ (viewer+) | ✅ | ✅ | ✅ |
| | `/segments` (목록/상세) | ✅ (viewer+) | ✅ | ✅ | ✅ |
| | `/segments/new` | ✅ (editor+) | ✅ | ✅ | ❌ → 403 |
| | `/events` (목록/상세) | ✅ (viewer+) | ✅ | ✅ | ✅ |
| | `/events/new` | ✅ (editor+) | ✅ | ✅ | ❌ → 403 |
| | `/events/approvals` | ✅ (operator+) | ✅ | ❌ → 403 | ❌ → 403 |
| | `/experiments` (목록/상세) | ✅ (viewer+) | ✅ | ✅ | ✅ |
| | `/experiments/new` | ✅ (editor+) | ✅ | ✅ | ❌ → 403 |
| | `/experiments/approvals` | ✅ (operator+) | ✅ | ❌ → 403 | ❌ → 403 |
| | `/remote-config` (목록/상세) | ✅ (viewer+) | ✅ | ✅ | ✅ |
| | `/remote-config/new` | ✅ (editor+) | ✅ | ✅ | ❌ → 403 |
| | `/remote-config/approvals` | ✅ (operator+) | ✅ | ❌ → 403 | ❌ → 403 |
| | `/push/campaigns` (목록/상세) | ✅ (viewer+) | ✅ | ✅ | ✅ |
| | `/push/campaigns/new` | ✅ (editor+) | ✅ | ✅ | ❌ → 403 |
| | `/push/campaigns/approvals` | ✅ (operator+) | ✅ | ❌ → 403 | ❌ → 403 |
| | `/settings/*` | ✅ (admin) | ❌ → 403 | ❌ → 403 | ❌ → 403 |
| | `/api/*` (조회) | ✅ | ✅ | ✅ | ✅ |
| | `/api/admin/*` | ✅ | ❌ → 403 | ❌ → 403 | ❌ → 401/403 |

> **범례**: ✅ = 접근 허용, ❌ = 접근 차단, 403 = Forbidden 페이지/응답, 401 = Unauthorized 응답
>
> **권한 원칙**: 조회(Read)는 Viewer 이상, 쓰기(Create/Update/Delete)는 Editor 이상, 승인(Approve/Reject)은 Operator 이상, 시스템 설정은 Admin 전용

#### 데이터 요구사항

| 필드 | 타입 | 필수 | 설명 | 유효성 |
|------|------|------|------|--------|
| role | Enum("admin", "operator", "editor", "viewer") | Y | 관리자 역할 | 4개 값 중 하나 |
| level | Number(1-4) | Y | 역할 수준 | admin=4, operator=3, editor=2, viewer=1 |

#### 예외 처리

| 상황 | 처리 | 메시지 | 코드 |
|------|------|--------|------|
| 정의되지 않은 역할 값 | 접근 차단 | "유효하지 않은 역할입니다." | ERR-ROLE-029-01 |

#### UI/UX 요구사항
- 역할은 Badge 컴포넌트로 시각 구분한다: Admin(빨강), Operator(파랑), Editor(회색 outline), Viewer(회색 outline).
- `RoleGate`의 기본 fallback은 빈 요소(null)이며, 명시적으로 지정 가능하다.

---

### 3.4 기능 상세: F-030 Middleware 라우트 보호

#### 개요

Next.js Middleware에서 모든 요청에 대해 세션 검증과 역할 기반 라우트 접근 검사를 수행한다. 공개 경로를 제외한 모든 페이지/API 요청에 대해 인증 여부와 최소 역할 조건을 확인하고, 미충족 시 적절한 리다이렉트 또는 에러 응답을 반환한다.

#### 사용자 스토리

**US-043**
```
As a 시스템 관리자,
I want to 라우트별로 최소 역할 조건을 설정하기를,
So that 권한 없는 관리자가 민감한 페이지에 접근하는 것을 차단할 수 있다.
```

**US-044**
```
As a 관리자,
I want to 세션이 만료되면 자동으로 로그인 페이지로 이동하기를,
So that 만료된 세션으로 잘못된 작업을 하는 상황을 방지할 수 있다.
```

#### 상세 요구사항

| ID | 요구사항 | 필수 |
|----|----------|------|
| REQ-030-01 | Middleware는 요청 경로가 공개 경로(`/login`, `/api/auth/*`)인지 확인하고, 공개 경로는 검사 없이 통과시킨다. | Y |
| REQ-030-02 | 공개 경로가 아닌 경우, `session_token` 쿠키 존재 여부를 확인한다. 쿠키가 없으면 페이지 요청은 `/login`으로 리다이렉트, API 요청은 401 JSON을 반환한다. | Y |
| REQ-030-03 | 세션 토큰의 유효성(만료 여부)을 검사한다. 만료된 경우 쿠키를 삭제하고 `/login`으로 리다이렉트 또는 401을 반환한다. | Y |
| REQ-030-04 | 라우트별 최소 역할을 정의한다: `/dashboard`=viewer, `/events/*`=editor, `/experiments/*`=editor, `/segments/*`=editor, `/settings/*`=admin, `/api/dashboard/*`=viewer, `/api/events/*`=editor, `/api/admin/*`=admin. | Y |
| REQ-030-05 | 관리자 역할 수준이 라우트 최소 역할 수준 미만인 경우, 페이지 요청은 403 페이지로, API 요청은 403 JSON을 반환한다. | Y |
| REQ-030-06 | Middleware 통과 시 요청 헤더에 `x-user-id`, `x-user-role`을 주입하여 다운스트림 핸들러에서 활용할 수 있게 한다. | Y |
| REQ-030-07 | Middleware 전체 처리 시간(세션 검증 + 역할 검사)은 p99 50ms 이내여야 한다. | Y |

#### 수용 조건 (Acceptance Criteria)

**AC-030-01**
```gherkin
Scenario: 미인증 관리자의 보호된 페이지 접근
  Given 관리자가 로그인하지 않은 상태이다 (세션 쿠키 없음)
  When 관리자가 /dashboard에 접근한다
  Then /login으로 리다이렉트된다
```

**AC-030-02**
```gherkin
Scenario: Viewer가 Operator 전용 페이지 접근
  Given 관리자가 Viewer(level 1) 역할로 로그인되어 있다
  When 관리자가 /events에 접근한다
  Then 403 페이지("접근 권한이 없습니다")가 표시된다
```

**AC-030-03**
```gherkin
Scenario: 만료된 세션으로 접근
  Given 관리자의 세션 토큰이 만료되었다
  When 관리자가 /dashboard에 접근한다
  Then 세션 쿠키가 삭제된다
  And /login으로 리다이렉트된다
```

**AC-030-04**
```gherkin
Scenario: API 요청에 대한 인증 실패
  Given 세션 쿠키 없이 API를 호출한다
  When GET /api/admin/users를 요청한다
  Then 401 JSON 응답이 반환된다: {"error": "인증이 필요합니다", "code": "UNAUTHORIZED"}
```

**AC-030-05**
```gherkin
Scenario: API 요청에 대한 권한 부족
  Given 관리자가 Viewer 역할로 로그인되어 있다
  When GET /api/admin/users를 요청한다
  Then 403 JSON 응답이 반환된다: {"error": "접근 권한이 부족합니다", "code": "FORBIDDEN"}
```

#### 비즈니스 규칙

| ID | 규칙 | 예시 |
|----|------|------|
| BR-030-01 | 공개 경로(`/login`, `/api/auth/*`)는 인증 없이 접근 가능하다. | 로그인 페이지는 누구나 접근 |
| BR-030-02 | 페이지 요청과 API 요청의 실패 응답 형식이 다르다. 페이지는 리다이렉트/403 페이지, API는 JSON 에러. | RESTful API 규약 준수 |
| BR-030-03 | 이미 로그인한 관리자가 `/login`에 접근하면 `/dashboard`로 리다이렉트한다. | 불필요한 재로그인 방지 |

#### 데이터 요구사항

| 필드 | 타입 | 필수 | 설명 | 유효성 |
|------|------|------|------|--------|
| session_token | JWT (Cookie) | Y | 세션 인증 토큰 | jose 검증 통과 |
| x-user-id | String (Header) | Y | Middleware 주입 관리자 ID | 유효한 관리자 ID |
| x-user-role | String (Header) | Y | Middleware 주입 역할 | admin/operator/viewer |

#### 예외 처리

| 상황 | 처리 | 메시지 | 코드 |
|------|------|--------|------|
| 세션 쿠키 없음 (페이지) | /login 리다이렉트 | — | — |
| 세션 쿠키 없음 (API) | 401 JSON | "인증이 필요합니다" | UNAUTHORIZED |
| 세션 만료 | 쿠키 삭제 + /login 리다이렉트 | — | — |
| 역할 부족 (페이지) | 403 페이지 표시 | "접근 권한이 없습니다" | — |
| 역할 부족 (API) | 403 JSON | "접근 권한이 부족합니다" | FORBIDDEN |
| JWT 검증 실패 (변조) | 쿠키 삭제 + /login 리다이렉트 | — | — |

#### UI/UX 요구사항
- 403 페이지(SCR-RBAC-006)에는 "접근 권한이 없습니다" 메시지, 현재 역할 표시, "대시보드로 이동" 버튼을 포함한다.
- 리다이렉트 시 원래 접근하려던 경로를 쿼리 파라미터(`?redirect=/original-path`)로 보존하여, 로그인 후 원래 페이지로 복귀할 수 있다.

---

### 3.5 기능 상세: F-031 관리자 관리

#### 개요

Admin 역할 관리자가 관리자 계정을 조회, 초대, 역할 변경, 정지/활성화할 수 있는 관리 기능을 제공한다. `/settings/admins` 경로에서 관리자 목록을 테이블로 표시하고, `/settings/admins/invite`에서 새 관리자를 초대한다.

#### 사용자 스토리

**US-044**
```
As a Admin 역할 관리자,
I want to 전체 관리자 목록을 역할, 상태와 함께 조회하기를,
So that 팀 내 관리자 현황을 한눈에 파악할 수 있다.
```

**US-045**
```
As a Admin 역할 관리자,
I want to 이메일, 이름, 역할을 지정하여 새 관리자를 초대하기를,
So that 신규 팀원이 즉시 대시보드에 접근할 수 있다.
```

**US-046**
```
As a Admin 역할 관리자,
I want to 관리자의 역할을 변경하거나 계정을 정지/활성화하기를,
So that 업무 변경이나 퇴사에 따라 권한을 조정할 수 있다.
```

#### 상세 요구사항

| ID | 요구사항 | 필수 |
|----|----------|------|
| REQ-031-01 | `GET /api/admin/users`는 전체 관리자 목록을 반환한다. 필드: id, email, name, role, status, createdAt, lastLoginAt. | Y |
| REQ-031-02 | 관리자 목록 테이블은 이름, 이메일, 역할(Badge), 상태, 마지막 로그인, 액션 열로 구성한다. | Y |
| REQ-031-03 | `POST /api/admin/users`로 새 관리자를 초대한다. 요청: email(필수, email 형식), name(필수, 최대 50자), role(필수, admin/operator/viewer). | Y |
| REQ-031-04 | 이미 등록된 이메일로 초대 시 중복 오류를 반환한다. | Y |
| REQ-031-05 | `PATCH /api/admin/users/[id]/role`로 관리자 역할을 변경한다. 요청: role(필수, admin/operator/viewer). | Y |
| REQ-031-06 | 관리자는 자신의 역할을 변경할 수 없다. | Y |
| REQ-031-07 | 계정 정지 시 해당 관리자의 활성 세션을 즉시 무효화한다. | Y |
| REQ-031-08 | 역할 변경, 계정 생성, 정지, 활성화 시 감사 로그에 기록한다. | Y |
| REQ-031-09 | 초대 성공 시 `/settings/admins`로 리다이렉트하고, 성공 토스트 메시지를 표시한다. | Y |

#### 수용 조건 (Acceptance Criteria)

**AC-031-01**
```gherkin
Scenario: 관리자 목록 조회
  Given Admin 역할 관리자가 /settings/admins에 접근한다
  Then 전체 관리자 목록이 테이블에 표시된다
  And 각 행에 이름, 이메일, 역할 배지, 상태, 마지막 로그인이 표시된다
```

**AC-031-02**
```gherkin
Scenario: 관리자 초대 성공
  Given Admin 역할 관리자가 /settings/admins/invite에 있다
  When 이메일 "new@company.com", 이름 "최신입", 역할 "Viewer"를 입력하고 초대한다
  Then 관리자 목록에 "최신입" (Viewer, active)이 추가된다
  And 감사 로그에 user_created 액션이 기록된다
  And /settings/admins로 리다이렉트된다
```

**AC-031-03**
```gherkin
Scenario: 역할 변경
  Given Admin 역할 관리자가 관리자 목록에서 "이운영" 행의 액션 메뉴를 연다
  When 역할을 "Operator"에서 "Admin"으로 변경한다
  Then "이운영"의 역할 배지가 Admin으로 업데이트된다
  And 감사 로그에 role_changed 액션이 기록된다 (이전 역할: operator, 변경 역할: admin)
```

**AC-031-04**
```gherkin
Scenario: 자기 자신의 역할 변경 차단
  Given Admin 역할 관리자 "김관리"가 자신의 행에서 역할 변경을 시도한다
  Then 역할 변경이 차단된다
  And "자신의 역할은 변경할 수 없습니다." 메시지가 표시된다
```

**AC-031-05**
```gherkin
Scenario: 계정 정지
  Given Admin 역할 관리자가 "박조회" 행의 액션 메뉴에서 "계정 정지"를 클릭한다
  Then "박조회"의 상태가 suspended로 변경된다
  And "박조회"의 활성 세션이 즉시 무효화된다
  And 감사 로그에 user_suspended 액션이 기록된다
```

#### 비즈니스 규칙

| ID | 규칙 | 예시 |
|----|------|------|
| BR-031-01 | 관리자는 자신의 역할을 변경할 수 없다. | 유일한 Admin이 스스로 Viewer로 강등하는 사고 방지 |
| BR-031-02 | 이메일은 시스템 내에서 고유해야 한다. 중복 이메일로 초대 불가. | 동일 관리자 중복 등록 방지 |
| BR-031-03 | 계정 정지 시 해당 관리자의 모든 활성 세션이 즉시 무효화된다. | 정지된 관리자의 즉시 접근 차단 |
| BR-031-04 | 역할 변경, 계정 생성, 정지, 활성화는 모두 감사 로그에 기록된다. | 변경 추적 및 감사 대응 |

#### 데이터 요구사항

| 필드 | 타입 | 필수 | 설명 | 유효성 |
|------|------|------|------|--------|
| id | String | Y | 관리자 고유 ID | 시스템 자동 생성 |
| email | String | Y | 관리자 이메일 | email 형식, 시스템 내 고유 |
| name | String | Y | 관리자 이름 | 최대 50자 |
| role | Role | Y | 역할 | admin/operator/viewer |
| status | Enum | Y | 계정 상태 | active/suspended |
| createdAt | Datetime | Y | 생성일시 | ISO 8601 |
| lastLoginAt | Datetime | N | 마지막 로그인 | ISO 8601, null 허용 |

#### 예외 처리

| 상황 | 처리 | 메시지 | 코드 |
|------|------|--------|------|
| 중복 이메일 초대 | 초대 차단 | "이미 등록된 이메일입니다." | ERR-ADMIN-031-01 |
| 자기 역할 변경 시도 | 변경 차단 | "자신의 역할은 변경할 수 없습니다." | ERR-ADMIN-031-02 |
| 존재하지 않는 관리자 ID | 404 반환 | "관리자를 찾을 수 없습니다." | ERR-ADMIN-031-03 |
| Admin 외 역할이 관리자 관리 접근 | 403 반환 | "접근 권한이 부족합니다." | FORBIDDEN |

#### UI/UX 요구사항
- 관리자 목록(SCR-RBAC-003)은 Shadcn UI Table, Badge 컴포넌트를 사용한다.
- 역할 변경은 인라인 Select 컴포넌트로 즉시 변경 가능하다.
- 계정 정지/활성화는 확인 다이얼로그를 표시한 후 실행한다.
- 초대 폼(SCR-RBAC-004)은 React Hook Form + Zod로 유효성 검증한다.

---

### 3.6 기능 상세: F-032 감사 로그

#### 개요

관리자의 주요 액션(로그인, 로그아웃, 역할 변경, 계정 생성, 계정 정지, 계정 활성화)을 기록하고 조회하는 기능을 제공한다. Admin 역할만 감사 로그 페이지(`/settings/audit-log`)에 접근할 수 있다.

#### 사용자 스토리

**US-047**
```
As a Admin 역할 관리자,
I want to 관리자들의 주요 활동 이력을 감사 로그로 조회하기를,
So that 보안 이상 징후를 파악하고 감사 요청에 대응할 수 있다.
```

#### 상세 요구사항

| ID | 요구사항 | 필수 |
|----|----------|------|
| REQ-032-01 | 감사 로그에 기록되는 액션: login, logout, role_changed, user_created, user_suspended, user_activated (6종). | Y |
| REQ-032-02 | 각 로그 항목은 id, actorId, actorEmail, action, targetType, targetId, details, timestamp, ipAddress 필드를 포함한다. | Y |
| REQ-032-03 | `GET /api/admin/audit-log`는 최신순으로 정렬된 감사 로그 목록을 반환한다. 기본 50건. | Y |
| REQ-032-04 | 액션 유형별 필터링을 지원한다 (전체/로그인/로그아웃/역할변경/계정생성/계정정지/계정활성화). | Y |
| REQ-032-05 | 감사 로그 테이블 열: 시간, 실행자(이메일), 액션, 대상, 상세. | Y |
| REQ-032-06 | role_changed 액션의 details에는 이전 역할(previousRole)과 변경 역할(newRole)을 기록한다. | Y |
| REQ-032-07 | targetType은 admin_user, session, role 중 하나이다. | Y |
| REQ-032-08 | 감사 로그는 삭제 또는 수정이 불가능하다 (읽기 전용). | Y |

#### 수용 조건 (Acceptance Criteria)

**AC-032-01**
```gherkin
Scenario: 감사 로그 목록 조회
  Given Admin 역할 관리자가 /settings/audit-log에 접근한다
  Then 최신 50건의 감사 로그가 테이블에 표시된다
  And 각 행에 시간, 실행자 이메일, 액션, 대상, 상세가 표시된다
```

**AC-032-02**
```gherkin
Scenario: 액션 필터링
  Given Admin 역할 관리자가 감사 로그 페이지에 있다
  When 액션 필터를 "역할변경"으로 변경한다
  Then role_changed 액션만 필터링되어 표시된다
```

**AC-032-03**
```gherkin
Scenario: 로그인 액션 자동 기록
  Given 관리자가 로그인에 성공한다
  Then 감사 로그에 login 액션이 자동으로 기록된다
  And actorEmail에 로그인한 관리자 이메일이 기록된다
  And timestamp에 로그인 시각이 기록된다
```

**AC-032-04**
```gherkin
Scenario: 역할 변경 상세 기록
  Given Admin이 "이운영"의 역할을 Operator에서 Admin으로 변경한다
  Then 감사 로그에 role_changed 액션이 기록된다
  And details에 {"previousRole": "operator", "newRole": "admin"}이 기록된다
```

#### 비즈니스 규칙

| ID | 규칙 | 예시 |
|----|------|------|
| BR-032-01 | 감사 로그는 삭제 또는 수정이 불가능하다. | 감사 무결성 보장 |
| BR-032-02 | 모든 관리자 주요 액션(6종)은 예외 없이 기록된다. 기록 누락률 0%. | 감사 로그 완전성 |
| BR-032-03 | 감사 로그 조회 권한은 Admin 역할에게만 부여된다. | 민감 정보 접근 제한 |

#### 데이터 요구사항

| 필드 | 타입 | 필수 | 설명 | 유효성 |
|------|------|------|------|--------|
| id | String | Y | 로그 고유 ID | 시스템 자동 생성 |
| actorId | String | Y | 실행자 관리자 ID | FK → AdminUser |
| actorEmail | String | Y | 실행자 이메일 | 기록 시점 이메일 |
| action | AuditAction | Y | 액션 유형 | 6종 중 하나 |
| targetType | AuditTargetType | Y | 대상 유형 | admin_user/session/role |
| targetId | String | Y | 대상 ID | 대상 엔티티 ID |
| details | JSON | Y | 상세 정보 | 액션별 상이 |
| timestamp | Datetime | Y | 기록 시각 | ISO 8601 UTC |
| ipAddress | String | Y | 실행자 IP | 요청 IP 기록 |

#### 예외 처리

| 상황 | 처리 | 메시지 | 코드 |
|------|------|--------|------|
| Admin 외 역할이 감사 로그 접근 | 403 반환 | "접근 권한이 부족합니다." | FORBIDDEN |
| 감사 로그 삭제/수정 시도 | 차단 | "감사 로그는 수정하거나 삭제할 수 없습니다." | ERR-AUDIT-032-01 |

#### UI/UX 요구사항
- 감사 로그 페이지(SCR-RBAC-005)는 Shadcn UI Table, Select 컴포넌트를 사용한다.
- 최신순 정렬이 기본이다.
- 액션 필터는 페이지 상단에 Select 드롭다운으로 배치한다.
- 액션 유형별 색상 배지: login(초록), logout(회색), role_changed(파랑), user_created(청록), user_suspended(빨강), user_activated(주황).

---

### 3.7 기능 상세: F-033 GNB 역할 기반 네비게이션

#### 개요

사이드바(GNB) 네비게이션 메뉴를 로그인한 관리자의 역할에 따라 필터링한다. 관리자가 접근할 수 없는 메뉴는 사이드바에 표시하지 않아, 역할에 맞는 간결한 인터페이스를 제공한다.

#### 사용자 스토리

**US-048**
```
As a 관리자,
I want to 내 역할에 맞는 메뉴만 사이드바에 표시되기를,
So that 불필요한 메뉴 없이 깔끔한 인터페이스에서 작업할 수 있다.
```

#### 상세 요구사항

| ID | 요구사항 | 필수 |
|----|----------|------|
| REQ-033-01 | Viewer 역할: 대시보드(1개) 메뉴만 표시한다. | Y |
| REQ-033-02 | Operator 역할: 대시보드, 이벤트, 실험, 세그먼트(4개) 메뉴를 표시한다. | Y |
| REQ-033-03 | Admin 역할: 대시보드, 이벤트, 실험, 세그먼트, 설정(5개) 메뉴를 표시한다. | Y |
| REQ-033-04 | GNB 우측에 현재 관리자 이름, 역할 배지(Badge), 로그아웃 버튼을 표시한다. | Y |
| REQ-033-05 | 메뉴 필터링은 `useAuth` 훅의 `can()` 메서드를 사용하여 클라이언트 측에서 수행한다. | Y |
| REQ-033-06 | 각 메뉴 항목에 최소 역할(minimumRole)을 정의하고, `can(minimumRole)` 결과에 따라 렌더링 여부를 결정한다. | Y |

#### 수용 조건 (Acceptance Criteria)

**AC-033-01**
```gherkin
Scenario: Viewer 역할 사이드바
  Given 관리자가 Viewer 역할로 로그인되어 있다
  Then 사이드바에 "대시보드" 메뉴 1개만 표시된다
  And "이벤트", "실험", "세그먼트", "설정" 메뉴는 표시되지 않는다
```

**AC-033-02**
```gherkin
Scenario: Operator 역할 사이드바
  Given 관리자가 Operator 역할로 로그인되어 있다
  Then 사이드바에 "대시보드", "이벤트", "실험", "세그먼트" 메뉴 4개가 표시된다
  And "설정" 메뉴는 표시되지 않는다
```

**AC-033-03**
```gherkin
Scenario: Admin 역할 사이드바
  Given 관리자가 Admin 역할로 로그인되어 있다
  Then 사이드바에 "대시보드", "이벤트", "실험", "세그먼트", "설정" 메뉴 5개가 표시된다
```

**AC-033-04**
```gherkin
Scenario: GNB 관리자 정보 표시
  Given 관리자가 Operator 역할로 로그인되어 있다
  Then GNB 우측에 관리자 이름 "이운영"이 표시된다
  And 역할 배지 "Operator"가 표시된다
  And 로그아웃 버튼이 표시된다
```

#### 비즈니스 규칙

| ID | 규칙 | 예시 |
|----|------|------|
| BR-033-01 | 사이드바 메뉴는 역할별 정적 매핑이며, 동적 권한 변경은 후속 버전에서 지원한다. | v2.0 커스텀 역할 시 동적 변경 |
| BR-033-02 | 메뉴 필터링은 Middleware 라우트 보호(F-030)와 일관되어야 한다. 사이드바에 표시되는 메뉴의 경로는 해당 역할이 접근 가능해야 한다. | Viewer에게 이벤트 메뉴 표시 시 403 발생 — 이런 불일치를 방지 |

#### 데이터 요구사항

| 필드 | 타입 | 필수 | 설명 | 유효성 |
|------|------|------|------|--------|
| label | String | Y | 메뉴 표시명 | "대시보드", "이벤트" 등 |
| href | String | Y | 메뉴 경로 | /dashboard, /events 등 |
| minimumRole | Role | Y | 최소 역할 | viewer/operator/admin |
| icon | Component | Y | 메뉴 아이콘 | Lucide 아이콘 |

#### 예외 처리

| 상황 | 처리 | 메시지 | 코드 |
|------|------|--------|------|
| 세션 정보 로딩 중 | 사이드바 스켈레톤 UI 표시 | — | — |
| 세션 정보 로딩 실패 | 사이드바 빈 상태 + 로그인 리다이렉트 | — | — |

#### UI/UX 요구사항
- 사이드바(E-RBAC-01)는 좌측 고정 네비게이션으로 구현한다.
- 현재 활성 메뉴는 배경색으로 하이라이트한다.
- 역할 배지는 역할별 색상(Admin: 빨강, Operator: 파랑, Viewer: 회색)을 적용한다.
- 로그아웃 버튼 클릭 시 확인 없이 즉시 로그아웃한다.

---

## 4. Non-Functional Requirements

### 4.1 보안

| 항목 | 요구사항 |
|------|----------|
| 세션 쿠키 | httpOnly, secure, sameSite: lax 설정 필수 |
| JWT 토큰 | jose 라이브러리로 서명 및 검증. 비밀키는 환경 변수로 관리 |
| 비밀번호 | Mock 구현에서도 평문 비교는 서버 측에서만 수행. 클라이언트에 비밀번호 노출 금지 |
| 에러 메시지 | 로그인 실패 시 구체적 원인(이메일 없음/비밀번호 불일치)을 구분하지 않는 통합 메시지 |
| 세션 만료 | 24시간 후 자동 만료. 만료된 세션으로 접근 시 즉시 차단 |
| 계정 정지 | 정지 시 활성 세션 즉시 무효화 |

### 4.2 성능

| 항목 | 목표 |
|------|------|
| Middleware 오버헤드 | p99 50ms 이내 (세션 검증 + 역할 검사) |
| 로그인 API 응답 | 500ms 이내 |
| 관리자 목록 조회 | 200ms 이내 (Mock 데이터 기준) |
| 감사 로그 조회 | 300ms 이내 (50건 기준) |

### 4.3 확장성

| 항목 | 현재 (v1.0) | 후속 버전 |
|------|-------------|----------|
| 인증 방식 | Mock 인증 (이메일/비밀번호) | SSO 연동 (Google, GitHub) — v1.1 |
| 역할 구성 | 고정 4역할 | 커스텀 역할 생성 — v2.0 |
| 권한 세분화 | 역할 단위 라우트 보호 | 기능별 세부 권한 매트릭스 — v2.0 |
| 2차 인증 | 미지원 | MFA (TOTP) — 후속 |
| 비밀번호 관리 | 고정 Mock 비밀번호 | 비밀번호 변경/초기화 — v1.2 |
| 접근 분리 | 단일 프로젝트 | 프로젝트(게임)별 접근 분리 — v1.3 |
| 위험 작업 보호 | 미지원 | Safety Lock (2차 확인) — v1.4 |

---

## 5. Data Models

### 5.1 Role

```typescript
export type Role = "admin" | "operator" | "editor" | "viewer";

export const ROLE_LEVELS: Record<Role, number> = {
  admin: 4,
  operator: 3,
  editor: 2,
  viewer: 1,
};
```

### 5.2 AdminUser

```typescript
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: "active" | "suspended";
  createdAt: string;        // ISO 8601
  lastLoginAt: string | null;
}
```

### 5.3 Session (JWT Payload)

```typescript
export interface Session {
  userId: string;
  email: string;
  name: string;
  role: Role;
  expiresAt: string;        // ISO 8601
}
```

### 5.4 AuditLogEntry

```typescript
export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorEmail: string;
  action: AuditAction;
  targetType: AuditTargetType;
  targetId: string;
  details: Record<string, unknown>;
  timestamp: string;        // ISO 8601
  ipAddress: string;
}
```

### 5.5 AuditTargetType

```typescript
export type AuditTargetType = "admin_user" | "session" | "role";
```

### 5.6 AuditAction

```typescript
export type AuditAction =
  | "login"
  | "logout"
  | "role_changed"
  | "user_created"
  | "user_suspended"
  | "user_activated";
```

### 5.7 API 요청/응답 타입

```typescript
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user: Pick<AdminUser, "id" | "email" | "name" | "role">;
}

export interface InviteUserRequest {
  email: string;
  name: string;
  role: Role;
}

export interface ChangeRoleRequest {
  role: Role;
}
```

### 5.8 API 엔드포인트 요약

| 엔드포인트 | 메서드 | 설명 | 최소 역할 |
|------------|--------|------|----------|
| `/api/auth/login` | POST | 로그인 → 세션 발급 | 공개 |
| `/api/auth/logout` | POST | 로그아웃 → 세션 삭제 | 인증됨 |
| `/api/auth/me` | GET | 현재 세션 정보 반환 | 인증됨 |
| `/api/admin/users` | GET | 관리자 목록 조회 | admin |
| `/api/admin/users` | POST | 관리자 초대 (생성) | admin |
| `/api/admin/users/[id]/role` | PATCH | 역할 변경 | admin |
| `/api/admin/audit-log` | GET | 감사 로그 목록 | admin |

---

## 6. 변경 이력

| 버전 | 일자 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| v1.0 | 2026-03-26 | 초안 작성 — F-028~F-033 6개 기능, US-040~US-048 9개 사용자 스토리, 7개 API 엔드포인트 | prd |
