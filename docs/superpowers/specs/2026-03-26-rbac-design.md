---
id: "SPEC-GLO-003"
title: "역할 기반 접근 제어 (RBAC) 디자인 스펙"
project: "GLO"
version: "v1.0"
status: "draft"
created: "2026-03-26"
updated: "2026-03-26"
author: "planner"
reviewers: []
related_docs:
  - "RES-GLO-002"
  - "PRD-GLO-001"
  - "PRD-GLO-002"
  - "PRD-GLO-003"
tags:
  - "project:game-liveops"
  - "type:spec"
  - "topic:rbac"
---

# SPEC: 역할 기반 접근 제어 (RBAC) 디자인 스펙

> LiveOps 관리자 대시보드에서 Admin/Operator/Viewer 3개 역할 기반으로 기능 접근을 제어하고, 관리자 액션을 감사 로그로 기록하는 시스템

## 문서 정보

| 항목 | 내용 |
|------|------|
| 문서 ID | SPEC-GLO-003 |
| 버전 | v1.0 |
| 상태 | draft |
| 작성일 | 2026-03-26 |
| 작성자 | planner |
| 관련 문서 | RES-GLO-002, PRD-GLO-001, PRD-GLO-002, PRD-GLO-003 |

---

## 1. 개요

### 배경

경쟁사 분석(RES-GLO-002, Section 3.8)에서 "역할 기반 접근 제어(RBAC)"는 Must-Have #8로 분류되었다. 5/7 경쟁 플랫폼이 RBAC를 지원하며, SSO 연동(3/7), 감사 로그(4/7) 순으로 지원한다.

기존 PRD-GLO-002(라이브 이벤트)에서 `event_approver` 역할이 승인 워크플로우(F-011, REQ-011-03)에 이미 정의되어 있어, 이를 통합하는 RBAC 시스템이 필요하다.

> **용어 참고**: "관리자"는 LiveOps 대시보드에 접근하는 운영 인력을 지칭한다 (shared/terminology.md 준수).

### 설계 방향

**Next.js Middleware 기반 라우트 보호** — Middleware에서 세션 검증과 역할 기반 라우트 접근 검사를 수행한다. Metaplay의 커스텀 역할 + 세분화 권한 모델과 Hive Console의 운영자 친화적 UI를 참고한다.

### 핵심 결정 사항

| 항목 | 결정 |
|------|------|
| 주요 사용자 | LiveOps 운영팀 (비기술) |
| 역할 구성 | 3역할: Admin / Operator / Viewer (계층적) |
| 인증 방식 | Mock 인증 (이메일/비밀번호, 세션 쿠키 기반). 실제 SSO는 후속 버전 |
| event_approver 매핑 | Operator 역할에 포함 (별도 권한 분리 불필요) |
| 감사 로그 | 기본 포함 (로그인/역할변경 등 관리자 액션) |
| 데이터 소스 | Mock 데이터 기반, API 스펙 정의 |

### 범위

**포함**:
- 3역할 모델 (Admin/Operator/Viewer) 및 계층적 권한
- Mock 인증 (로그인/로그아웃/세션 관리)
- Next.js Middleware 기반 라우트 보호
- 관리자 목록 조회 및 역할 변경 UI (Admin 전용)
- 관리자 초대 UI (Admin 전용)
- 감사 로그 조회 UI (Admin 전용)
- 클라이언트 측 useAuth 훅 및 RoleGate 컴포넌트
- GNB에 역할 기반 네비게이션 필터링
- Mock API 엔드포인트 7개
- TypeScript 데이터 타입 정의

**미포함 (후속 버전)**:
- SSO 연동 (Google, GitHub, Atlassian)
- 커스텀 역할 생성
- 세부 기능별 권한 매트릭스 (feature-level permissions)
- 비밀번호 변경/초기화
- 멀티팩터 인증 (MFA)
- Safety Lock 기능 (Metaplay 패턴)
- 프로젝트(게임)별 접근 분리

---

## 2. 역할 모델

### 2.1 역할 정의

| 역할 | 코드 | 권한 수준 | 주요 기능 |
|------|------|----------|----------|
| **Admin** | `admin` | 3 (최고) | 전체 기능 + 관리자 관리 + 역할 부여/변경 + 시스템 설정 |
| **Operator** | `operator` | 2 | 이벤트 CRUD + 승인/반려 + 긴급 제어(Pause/Kill/Extend) + 대시보드 조회 |
| **Viewer** | `viewer` | 1 (최저) | 대시보드 조회 + 이벤트/실험 목록 조회 (읽기 전용) |

### 2.2 역할 계층

```
admin (level 3) ── 모든 권한
  └── operator (level 2) ── 운영 기능 + 조회
        └── viewer (level 1) ── 조회만
```

상위 역할은 하위 역할의 모든 권한을 자동 포함한다. 역할 검사는 `roleLevel >= requiredLevel` 비교로 수행한다.

### 2.3 기존 시스템 연동

| 기존 역할/권한 | RBAC 매핑 | 근거 |
|--------------|----------|------|
| `event_approver` (PRD-GLO-002) | Operator | 이벤트 승인은 Operator의 기본 권한 |
| 이벤트 CRUD (PRD-GLO-002) | Operator | project edit permission → Operator |
| 이벤트 조회 (PRD-GLO-002) | Viewer | project read permission → Viewer |
| 긴급 제어 Pause/Kill/Extend (A-017) | Operator | 운영 책임자 권한으로 통합 |
| KPI 대시보드 (SPEC-GLO-002) | Viewer | 읽기 전용 대시보드 |
| `experiment_creator` (SPEC-GLO-001) | Operator | 실험 생성은 운영 권한 |
| `experiment_approver` (SPEC-GLO-001) | Operator | 실험 승인은 Operator 이상 |
| `experiment_operator` (SPEC-GLO-001) | Operator | 실험 긴급 종료는 Operator 이상 |

---

## 3. 인증 플로우

### 3.1 로그인

1. 관리자가 `/login`에서 이메일 + 비밀번호 입력
2. `POST /api/auth/login` 호출
3. Mock 검증 → 성공 시 세션 토큰 생성 → `session_token` 쿠키 설정 (httpOnly, secure, sameSite: lax)
4. `/dashboard`로 리다이렉트
5. 감사 로그에 `login` 액션 기록

### 3.2 세션 관리

- 세션 만료: 24시간 (Mock 구현에서는 고정 기간)
- 세션 쿠키: `session_token` (httpOnly, path: /)
- 세션 검증: Middleware에서 매 요청마다 쿠키 검증

### 3.3 로그아웃

1. `POST /api/auth/logout` 호출
2. 세션 삭제 + 쿠키 제거
3. `/login`으로 리다이렉트
4. 감사 로그에 `logout` 액션 기록

### 3.4 Mock 계정

| 이메일 | 비밀번호 | 역할 | 이름 |
|--------|----------|------|------|
| admin@liveops.dev | admin123 | admin | 김관리 |
| operator@liveops.dev | oper123 | operator | 이운영 |
| viewer@liveops.dev | view123 | viewer | 박조회 |

---

## 4. 라우트 보호

### 4.1 Middleware 규칙

**시스템 컴포넌트** (UI 없음 — 화면 ID 미부여)

| 라우트 패턴 | 최소 역할 | 비인증 시 동작 | 권한 부족 시 동작 |
|------------|----------|--------------|----------------|
| `/login` | 없음 (공개) | — | — |
| `/dashboard` | viewer | → `/login` | 403 페이지 |
| `/events/*` | operator | → `/login` | 403 페이지 |
| `/experiments/*` | operator | → `/login` | 403 페이지 |
| `/segments/*` | operator | → `/login` | 403 페이지 |
| `/settings/*` | admin | → `/login` | 403 페이지 |
| `/api/auth/*` | 없음 (공개) | — | — |
| `/api/dashboard/*` | viewer | 401 JSON | 403 JSON |
| `/api/events/*` | operator | 401 JSON | 403 JSON |
| `/api/admin/*` | admin | 401 JSON | 403 JSON |

### 4.2 Middleware 로직

```
1. 요청 경로가 공개 경로인가? → 통과
2. 세션 쿠키(session_token) 존재하는가?
   - 없음 → 페이지 요청이면 /login 리다이렉트, API면 401 반환
3. 세션이 유효한가? (만료 체크)
   - 만료 → 쿠키 삭제 + /login 리다이렉트 또는 401
4. 요청 경로에 필요한 최소 역할은?
5. 사용자 역할 수준 >= 필요 역할 수준?
   - 부족 → 페이지면 403, API면 403 JSON
6. 통과 → 요청 헤더에 사용자 정보 주입 (x-user-id, x-user-role)
```

---

## 5. API 스펙

### 5.1 엔드포인트 목록

| 엔드포인트 | 메서드 | 설명 | 최소 역할 |
|------------|--------|------|----------|
| `/api/auth/login` | POST | 로그인 → 세션 발급 | 공개 |
| `/api/auth/logout` | POST | 로그아웃 → 세션 삭제 | 인증됨 |
| `/api/auth/me` | GET | 현재 세션 정보 반환 | 인증됨 |
| `/api/admin/users` | GET | 관리자 목록 조회 | admin |
| `/api/admin/users` | POST | 관리자 초대 (생성) | admin |
| `/api/admin/users/[id]/role` | PATCH | 역할 변경 | admin |
| `/api/admin/audit-log` | GET | 감사 로그 목록 | admin |

### 5.2 데이터 타입

```typescript
// ── 역할 ──
export type Role = "admin" | "operator" | "viewer";

export const ROLE_LEVELS: Record<Role, number> = {
  admin: 3,
  operator: 2,
  viewer: 1,
};

// ── 관리자 계정 ──
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: "active" | "suspended";
  createdAt: string;        // ISO 8601
  lastLoginAt: string | null;
}

// ── 세션 ──
export interface Session {
  userId: string;
  email: string;
  name: string;
  role: Role;
  expiresAt: string;        // ISO 8601
}

// ── 감사 로그 ──
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

export type AuditTargetType = "admin_user" | "session" | "role";

export type AuditAction =
  | "login"
  | "logout"
  | "role_changed"
  | "user_created"
  | "user_suspended"
  | "user_activated";

// ── API 요청/응답 ──
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

---

## 6. UI 화면

### 6.1 로그인 페이지

**화면 ID**: `SCR-RBAC-002`
**경로**: `/login`
**접근**: 공개

**구성**:
- 이메일 입력 (text input, required)
- 비밀번호 입력 (password input, required)
- 로그인 버튼
- 에러 메시지 표시 영역 ("이메일 또는 비밀번호가 올바르지 않습니다")

**인터랙션 ID**: `INT-RBAC-01` (로그인 폼 제출)

### 6.2 GNB (Global Navigation Bar)

**요소 ID**: `E-RBAC-01`

**구성**:
- 좌측: 로고 + 네비게이션 링크 (역할 기반 필터링)
- 우측: 관리자 이름 + 역할 배지(Badge) + 로그아웃 버튼

**역할별 네비게이션**:

| 메뉴 | viewer | operator | admin |
|------|--------|----------|-------|
| 대시보드 | ✅ | ✅ | ✅ |
| 이벤트 | ❌ | ✅ | ✅ |
| 실험 | ❌ | ✅ | ✅ |
| 세그먼트 | ❌ | ✅ | ✅ |
| 설정 | ❌ | ❌ | ✅ |

### 6.3 관리자 목록 페이지

**화면 ID**: `SCR-RBAC-003`
**경로**: `/settings/admins`
**접근**: admin

**구성**:
- 관리자 초대 버튼 (→ `/settings/admins/invite`)
- 테이블: 이름, 이메일, 역할(Badge), 상태, 마지막 로그인, 액션
- 액션 드롭다운: 역할 변경 (Select), 계정 정지/활성화

**인터랙션 ID**: `INT-RBAC-02` (역할 변경), `INT-RBAC-03` (계정 정지/활성화)

### 6.4 관리자 초대 페이지

**화면 ID**: `SCR-RBAC-004`
**경로**: `/settings/admins/invite`
**접근**: admin

**구성**:
- 이메일 입력 (required, email validation)
- 이름 입력 (required)
- 역할 선택 (Select: admin/operator/viewer)
- 초대 버튼
- 성공 시 `/settings/admins`로 리다이렉트

**인터랙션 ID**: `INT-RBAC-04` (초대 폼 제출)

### 6.5 감사 로그 페이지

**화면 ID**: `SCR-RBAC-005`
**경로**: `/settings/audit-log`
**접근**: admin

**구성**:
- 테이블: 시간, 실행자(이메일), 액션, 대상, 상세
- 최신순 정렬 (기본 50개)
- 액션 필터 (Select: 전체/로그인/역할변경/계정생성)

**인터랙션 ID**: `INT-RBAC-05` (필터 변경)

### 6.6 403 페이지

**화면 ID**: `SCR-RBAC-006`
**경로**: 동적 (403 응답 시)

**구성**:
- "접근 권한이 없습니다" 메시지
- 현재 역할 표시
- "대시보드로 이동" 버튼

---

## 7. 클라이언트 측 컴포넌트

### 7.1 useAuth 훅

```typescript
interface AuthContext {
  user: Pick<AdminUser, "id" | "email" | "name" | "role"> | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  can: (minimumRole: Role) => boolean;
  logout: () => Promise<void>;
}
```

`can(minimumRole)` 메서드는 `ROLE_LEVELS[user.role] >= ROLE_LEVELS[minimumRole]`로 판단한다.

### 7.2 RoleGate 컴포넌트

```tsx
<RoleGate role="operator" fallback={<p>권한이 없습니다</p>}>
  <EventApproveButton />
</RoleGate>
```

`role` prop 이상의 역할을 가진 관리자에게만 자식을 렌더링한다.

---

## 8. 기술 스택

| 영역 | 기술 | 용도 |
|------|------|------|
| 인증 미들웨어 | Next.js 16 Middleware | 세션 검증 + 라우트 보호 |
| 세션 저장 | httpOnly 쿠키 + 서버 Map | Mock 세션 스토어 |
| UI | Shadcn UI (Table, Badge, Select, Input, Button) | 관리자 목록, 감사 로그 |
| 폼 검증 | React Hook Form + Zod | 로그인, 초대 폼 |
| 데이터 패칭 | React Query | API 호출, 캐싱 |
| 테스트 | Vitest + React Testing Library | 컴포넌트 + 유틸리티 테스트 |

---

## 9. 후속 버전 로드맵

| 버전 | 기능 | 우선순위 | 변경 규모 |
|------|------|---------|----------|
| v1.1 | SSO 연동 (Google, GitHub) | Should-Have | 소규모 — NextAuth.js 통합 |
| v1.2 | 비밀번호 변경/초기화 | Should-Have | 소규모 — 폼 + API 추가 |
| v1.3 | 프로젝트(게임)별 접근 분리 | Should-Have | 중규모 — 데이터 모델 확장 |
| v1.4 | Safety Lock (위험 작업 2차 확인) | Nice-to-Have | 소규모 — Metaplay 패턴 적용 |
| v2.0 | 커스텀 역할 + 세부 권한 매트릭스 | Future | 대규모 — 권한 시스템 재설계 |

---

## 10. 성공 기준

| 기준 | 목표 | 측정 방법 |
|------|------|----------|
| 로그인 응답 시간 | 500ms 이내 | Mock API 기준 |
| 미들웨어 오버헤드 | 50ms 이내 | 세션 검증 + 역할 검사 |
| 역할 검사 정확도 | 100% | 모든 라우트에서 역할 미달 시 403 반환 |
| 감사 로그 기록 | 100% | 모든 관리자 액션이 로그에 기록됨 |
| Mock 계정 동작 | 3개 역할 모두 정상 | 각 Mock 계정으로 로그인 후 권한 범위 확인 |

---

## 변경 이력

| 버전 | 일자 | 변경 내용 | 작성자 |
|------|------|----------|--------|
| v1.0 | 2026-03-26 | 초안 작성 | planner |
