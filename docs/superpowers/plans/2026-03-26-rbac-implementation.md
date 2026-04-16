# RBAC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add role-based access control (Admin/Operator/Viewer) to the LiveOps admin app with mock authentication, middleware-based route protection, admin management UI, and audit logging.

**Architecture:** Next.js 16 Middleware intercepts all requests, validates JWT session cookies, and checks role hierarchy against route-level permissions. Mock auth uses in-memory user store with jose for JWT signing. Client-side `useAuth` hook + `RoleGate` component enable role-aware UI rendering. GNB with role-filtered navigation wraps all authenticated pages.

**Tech Stack:** Next.js 16, React 19, TypeScript, jose (JWT), Shadcn UI (Input, Label, Table, Select, Badge, DropdownMenu, Separator, Avatar), React Hook Form, Zod, Vitest + React Testing Library

**Spec:** `docs/superpowers/specs/2026-03-26-rbac-design.md` (SPEC-GLO-003)

---

## File Structure

```
apps/admin/
├── middleware.ts                               # Route protection middleware
├── src/
│   ├── app/
│   │   ├── layout.tsx                          # Modified: add AuthProvider
│   │   ├── login/
│   │   │   └── page.tsx                        # Login page
│   │   ├── settings/
│   │   │   ├── layout.tsx                      # Settings layout
│   │   │   ├── admins/
│   │   │   │   ├── page.tsx                    # Admin list page
│   │   │   │   └── invite/
│   │   │   │       └── page.tsx                # Invite admin page
│   │   │   └── audit-log/
│   │   │       └── page.tsx                    # Audit log page
│   │   ├── forbidden/
│   │   │   └── page.tsx                        # 403 page
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login/route.ts              # POST login
│   │       │   ├── logout/route.ts             # POST logout
│   │       │   └── me/route.ts                 # GET current session
│   │       └── admin/
│   │           ├── users/
│   │           │   ├── route.ts                # GET list, POST invite
│   │           │   └── [id]/
│   │           │       └── role/route.ts       # PATCH role change
│   │           └── audit-log/route.ts          # GET audit log
│   ├── features/
│   │   └── auth/
│   │       ├── types/
│   │       │   └── auth.ts                     # Role, AdminUser, Session, AuditLog types
│   │       ├── lib/
│   │       │   ├── session.ts                  # JWT encrypt/decrypt, cookie helpers
│   │       │   ├── session.test.ts
│   │       │   ├── roles.ts                    # Role hierarchy, route-role mapping
│   │       │   ├── roles.test.ts
│   │       │   ├── mock-users.ts               # Mock user store + audit log
│   │       │   └── audit.ts                    # Audit log helpers
│   │       ├── hooks/
│   │       │   └── use-auth.ts                 # useAuth React Query hook
│   │       ├── components/
│   │       │   ├── AuthProvider.tsx             # Auth context provider
│   │       │   ├── RoleGate.tsx                 # Conditional render by role
│   │       │   ├── RoleGate.test.tsx
│   │       │   ├── RoleBadge.tsx               # Role display badge
│   │       │   ├── LoginForm.tsx               # Login form component
│   │       │   ├── LoginForm.test.tsx
│   │       │   └── GNB.tsx                     # Global navigation bar
│   │       └── constants/
│   │           └── routes.ts                   # Route config with required roles
```

---

## Task 1: 의존성 설치 + TypeScript 타입 정의

**Files:**
- Modify: `apps/admin/package.json`
- Create: `apps/admin/src/features/auth/types/auth.ts`
- Create: `apps/admin/src/features/auth/constants/routes.ts`

- [ ] **Step 1: Install dependencies**

```bash
cd /Users/david/Downloads/Projects/LiveOps/apps/admin
npm install jose zod react-hook-form @hookform/resolvers
npx shadcn@latest add input label table select badge dropdown-menu separator avatar -y
```

- [ ] **Step 2: Create auth types**

Create `apps/admin/src/features/auth/types/auth.ts`:

```typescript
export type Role = "admin" | "operator" | "viewer";

export const ROLE_LEVELS: Record<Role, number> = {
  admin: 3,
  operator: 2,
  viewer: 1,
};

export const ROLE_LABELS: Record<Role, string> = {
  admin: "관리자",
  operator: "운영자",
  viewer: "뷰어",
};

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: "active" | "suspended";
  createdAt: string;
  lastLoginAt: string | null;
  passwordHash: string;
}

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: Role;
  expiresAt: string;
}

export type AuditTargetType = "admin_user" | "session" | "role";

export type AuditAction =
  | "login"
  | "logout"
  | "role_changed"
  | "user_created"
  | "user_suspended"
  | "user_activated";

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorEmail: string;
  action: AuditAction;
  targetType: AuditTargetType;
  targetId: string;
  details: Record<string, unknown>;
  timestamp: string;
  ipAddress: string;
}

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

- [ ] **Step 3: Create route config**

Create `apps/admin/src/features/auth/constants/routes.ts`:

```typescript
import type { Role } from "../types/auth";

export interface RouteConfig {
  pattern: string;
  minRole: Role | null;  // null = public
}

export const ROUTE_CONFIGS: RouteConfig[] = [
  { pattern: "/login", minRole: null },
  { pattern: "/forbidden", minRole: null },
  { pattern: "/api/auth/", minRole: null },
  { pattern: "/dashboard", minRole: "viewer" },
  { pattern: "/api/dashboard/", minRole: "viewer" },
  { pattern: "/events", minRole: "operator" },
  { pattern: "/experiments", minRole: "operator" },
  { pattern: "/segments", minRole: "operator" },
  { pattern: "/api/events/", minRole: "operator" },
  { pattern: "/settings", minRole: "admin" },
  { pattern: "/api/admin/", minRole: "admin" },
];

export const NAV_ITEMS: { href: string; label: string; minRole: Role }[] = [
  { href: "/dashboard", label: "대시보드", minRole: "viewer" },
  { href: "/events", label: "이벤트", minRole: "operator" },
  { href: "/experiments", label: "실험", minRole: "operator" },
  { href: "/segments", label: "세그먼트", minRole: "operator" },
  { href: "/settings/admins", label: "설정", minRole: "admin" },
];
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add auth dependencies, types, and route config"
```

---

## Task 2: 세션 관리 (JWT + Cookie) + 역할 유틸리티

**Files:**
- Create: `apps/admin/src/features/auth/lib/session.ts`
- Create: `apps/admin/src/features/auth/lib/session.test.ts`
- Create: `apps/admin/src/features/auth/lib/roles.ts`
- Create: `apps/admin/src/features/auth/lib/roles.test.ts`

- [ ] **Step 1: Write failing test for roles utility**

Create `apps/admin/src/features/auth/lib/roles.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { hasMinimumRole, getRequiredRole } from "./roles";

describe("hasMinimumRole", () => {
  it("admin has access to all roles", () => {
    expect(hasMinimumRole("admin", "admin")).toBe(true);
    expect(hasMinimumRole("admin", "operator")).toBe(true);
    expect(hasMinimumRole("admin", "viewer")).toBe(true);
  });

  it("operator has access to operator and viewer", () => {
    expect(hasMinimumRole("operator", "admin")).toBe(false);
    expect(hasMinimumRole("operator", "operator")).toBe(true);
    expect(hasMinimumRole("operator", "viewer")).toBe(true);
  });

  it("viewer only has access to viewer", () => {
    expect(hasMinimumRole("viewer", "admin")).toBe(false);
    expect(hasMinimumRole("viewer", "operator")).toBe(false);
    expect(hasMinimumRole("viewer", "viewer")).toBe(true);
  });
});

describe("getRequiredRole", () => {
  it("returns null for public routes", () => {
    expect(getRequiredRole("/login")).toBeNull();
    expect(getRequiredRole("/api/auth/login")).toBeNull();
  });

  it("returns viewer for dashboard", () => {
    expect(getRequiredRole("/dashboard")).toBe("viewer");
  });

  it("returns operator for events", () => {
    expect(getRequiredRole("/events")).toBe("operator");
    expect(getRequiredRole("/events/123/edit")).toBe("operator");
  });

  it("returns admin for settings", () => {
    expect(getRequiredRole("/settings/admins")).toBe("admin");
  });

  it("returns viewer for unknown routes (default)", () => {
    expect(getRequiredRole("/unknown")).toBe("viewer");
  });
});
```

- [ ] **Step 2: Run test → FAIL**

```bash
npx vitest run src/features/auth/lib/roles.test.ts
```

- [ ] **Step 3: Implement roles utility**

Create `apps/admin/src/features/auth/lib/roles.ts`:

```typescript
import { ROLE_LEVELS, type Role } from "../types/auth";
import { ROUTE_CONFIGS } from "../constants/routes";

export function hasMinimumRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_LEVELS[userRole] >= ROLE_LEVELS[requiredRole];
}

export function getRequiredRole(pathname: string): Role | null {
  for (const config of ROUTE_CONFIGS) {
    if (pathname === config.pattern || pathname.startsWith(config.pattern)) {
      return config.minRole;
    }
  }
  return "viewer"; // default: require at least viewer
}
```

- [ ] **Step 4: Run test → PASS**

```bash
npx vitest run src/features/auth/lib/roles.test.ts
```

- [ ] **Step 5: Write failing test for session**

Create `apps/admin/src/features/auth/lib/session.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { encrypt, decrypt } from "./session";
import type { SessionPayload } from "../types/auth";

describe("session encrypt/decrypt", () => {
  const payload: SessionPayload = {
    userId: "user-1",
    email: "admin@liveops.dev",
    name: "김관리",
    role: "admin",
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  };

  it("encrypts and decrypts a session payload", async () => {
    const token = await encrypt(payload);
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(0);

    const decrypted = await decrypt(token);
    expect(decrypted).not.toBeNull();
    expect(decrypted!.userId).toBe(payload.userId);
    expect(decrypted!.role).toBe("admin");
  });

  it("returns null for invalid token", async () => {
    const result = await decrypt("invalid-token");
    expect(result).toBeNull();
  });
});
```

- [ ] **Step 6: Run test → FAIL**

- [ ] **Step 7: Implement session utility**

Create `apps/admin/src/features/auth/lib/session.ts`:

```typescript
import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { SessionPayload } from "../types/auth";

const SECRET_KEY = process.env.SESSION_SECRET ?? "liveops-dev-secret-key-change-in-production";
const encodedKey = new TextEncoder().encode(SECRET_KEY);
const SESSION_COOKIE_NAME = "session_token";

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(encodedKey);
}

export async function decrypt(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await encrypt(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return decrypt(token);
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
```

Note: The `session.test.ts` tests only `encrypt`/`decrypt` (pure functions). The cookie-dependent functions (`createSession`, `getSession`, `deleteSession`) require Next.js server context and will be tested via API integration.

For the test to work with `server-only`, the test needs to mock it:

Add to top of `session.test.ts`:
```typescript
vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));
```

- [ ] **Step 8: Run test → PASS**

```bash
npx vitest run src/features/auth/lib/session.test.ts
```

- [ ] **Step 9: Commit**

```bash
git add src/features/auth/lib/ && git commit -m "feat: add session JWT management and role hierarchy utilities"
```

---

## Task 3: Mock 데이터 스토어 + 감사 로그

**Files:**
- Create: `apps/admin/src/features/auth/lib/mock-users.ts`
- Create: `apps/admin/src/features/auth/lib/audit.ts`

- [ ] **Step 1: Create mock user store**

Create `apps/admin/src/features/auth/lib/mock-users.ts`:

```typescript
import type { AdminUser } from "../types/auth";

// In-memory mock store (resets on server restart)
const users: AdminUser[] = [
  {
    id: "admin-001",
    email: "admin@liveops.dev",
    name: "김관리",
    role: "admin",
    status: "active",
    createdAt: "2026-01-01T00:00:00Z",
    lastLoginAt: null,
    passwordHash: "admin123", // Mock: plaintext for dev
  },
  {
    id: "oper-001",
    email: "operator@liveops.dev",
    name: "이운영",
    role: "operator",
    status: "active",
    createdAt: "2026-01-15T00:00:00Z",
    lastLoginAt: null,
    passwordHash: "oper123",
  },
  {
    id: "view-001",
    email: "viewer@liveops.dev",
    name: "박조회",
    role: "viewer",
    status: "active",
    createdAt: "2026-02-01T00:00:00Z",
    lastLoginAt: null,
    passwordHash: "view123",
  },
];

export function findUserByEmail(email: string): AdminUser | undefined {
  return users.find((u) => u.email === email);
}

export function verifyPassword(user: AdminUser, password: string): boolean {
  return user.passwordHash === password; // Mock: plaintext comparison
}

export function getAllUsers(): Omit<AdminUser, "passwordHash">[] {
  return users.map(({ passwordHash: _, ...rest }) => rest);
}

export function findUserById(id: string): AdminUser | undefined {
  return users.find((u) => u.id === id);
}

export function updateUserRole(id: string, role: AdminUser["role"]): boolean {
  const user = users.find((u) => u.id === id);
  if (!user) return false;
  user.role = role;
  return true;
}

export function updateUserStatus(id: string, status: AdminUser["status"]): boolean {
  const user = users.find((u) => u.id === id);
  if (!user) return false;
  user.status = status;
  return true;
}

export function createUser(data: { email: string; name: string; role: AdminUser["role"] }): AdminUser {
  const newUser: AdminUser = {
    id: `user-${Date.now()}`,
    email: data.email,
    name: data.name,
    role: data.role,
    status: "active",
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
    passwordHash: "temp123", // Mock: temporary password
  };
  users.push(newUser);
  return newUser;
}

export function updateLastLogin(id: string): void {
  const user = users.find((u) => u.id === id);
  if (user) user.lastLoginAt = new Date().toISOString();
}
```

- [ ] **Step 2: Create audit log helper**

Create `apps/admin/src/features/auth/lib/audit.ts`:

```typescript
import type { AuditLogEntry, AuditAction, AuditTargetType } from "../types/auth";

// In-memory audit log (resets on server restart)
const auditLog: AuditLogEntry[] = [];

export function addAuditEntry(params: {
  actorId: string;
  actorEmail: string;
  action: AuditAction;
  targetType: AuditTargetType;
  targetId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}): AuditLogEntry {
  const entry: AuditLogEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    actorId: params.actorId,
    actorEmail: params.actorEmail,
    action: params.action,
    targetType: params.targetType,
    targetId: params.targetId,
    details: params.details ?? {},
    timestamp: new Date().toISOString(),
    ipAddress: params.ipAddress ?? "127.0.0.1",
  };
  auditLog.unshift(entry); // newest first
  return entry;
}

export function getAuditLog(filter?: { action?: AuditAction }): AuditLogEntry[] {
  if (filter?.action) {
    return auditLog.filter((e) => e.action === filter.action);
  }
  return auditLog.slice(0, 100); // max 100 entries
}
```

- [ ] **Step 3: Commit**

```bash
git add src/features/auth/lib/mock-users.ts src/features/auth/lib/audit.ts && git commit -m "feat: add mock user store and audit log helpers"
```

---

## Task 4: Auth API Route Handlers

**Files:**
- Create: `apps/admin/src/app/api/auth/login/route.ts`
- Create: `apps/admin/src/app/api/auth/logout/route.ts`
- Create: `apps/admin/src/app/api/auth/me/route.ts`

- [ ] **Step 1: Create login route**

Create `apps/admin/src/app/api/auth/login/route.ts`:

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { findUserByEmail, verifyPassword, updateLastLogin } from "@/features/auth/lib/mock-users";
import { createSession } from "@/features/auth/lib/session";
import { addAuditEntry } from "@/features/auth/lib/audit";
import type { LoginRequest, SessionPayload } from "@/features/auth/types/auth";

export async function POST(request: NextRequest) {
  const body: LoginRequest = await request.json();

  const user = findUserByEmail(body.email);
  if (!user || !verifyPassword(user, body.password)) {
    return NextResponse.json(
      { success: false, error: "이메일 또는 비밀번호가 올바르지 않습니다" },
      { status: 401 }
    );
  }

  if (user.status === "suspended") {
    return NextResponse.json(
      { success: false, error: "정지된 계정입니다. 관리자에게 문의하세요." },
      { status: 403 }
    );
  }

  const payload: SessionPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };

  await createSession(payload);
  updateLastLogin(user.id);

  addAuditEntry({
    actorId: user.id,
    actorEmail: user.email,
    action: "login",
    targetType: "session",
    targetId: user.id,
    ipAddress: request.headers.get("x-forwarded-for") ?? "127.0.0.1",
  });

  return NextResponse.json({
    success: true,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
}
```

- [ ] **Step 2: Create logout route**

Create `apps/admin/src/app/api/auth/logout/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { getSession, deleteSession } from "@/features/auth/lib/session";
import { addAuditEntry } from "@/features/auth/lib/audit";

export async function POST() {
  const session = await getSession();

  if (session) {
    addAuditEntry({
      actorId: session.userId,
      actorEmail: session.email,
      action: "logout",
      targetType: "session",
      targetId: session.userId,
    });
  }

  await deleteSession();
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: Create me route**

Create `apps/admin/src/app/api/auth/me/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { getSession } from "@/features/auth/lib/session";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      userId: session.userId,
      email: session.email,
      name: session.name,
      role: session.role,
    },
  });
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/auth/ && git commit -m "feat: add auth API routes (login, logout, me)"
```

---

## Task 5: Middleware (라우트 보호)

**Files:**
- Create: `apps/admin/middleware.ts`

- [ ] **Step 1: Read Next.js middleware docs**

Read `node_modules/next/dist/docs/01-app/02-guides/authentication.md` to verify the correct middleware pattern for Next.js 16.

- [ ] **Step 2: Create middleware**

Create `apps/admin/middleware.ts`:

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/features/auth/lib/session";
import { getRequiredRole } from "@/features/auth/lib/roles";
import { hasMinimumRole } from "@/features/auth/lib/roles";

const PUBLIC_PATHS = ["/login", "/forbidden", "/api/auth/", "/_next/", "/favicon.ico"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p));
}

function isApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api/");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths — pass through
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Get session from cookie
  const token = request.cookies.get("session_token")?.value;

  if (!token) {
    if (isApiRoute(pathname)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Decrypt and validate session
  const session = await decrypt(token);

  if (!session) {
    // Invalid or expired token
    const response = isApiRoute(pathname)
      ? NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      : NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("session_token");
    return response;
  }

  // Check role
  const requiredRole = getRequiredRole(pathname);
  if (requiredRole && !hasMinimumRole(session.role, requiredRole)) {
    if (isApiRoute(pathname)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/forbidden", request.url));
  }

  // Inject user info into request headers for server components/API routes
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", session.userId);
  requestHeaders.set("x-user-email", session.email);
  requestHeaders.set("x-user-name", session.name);
  requestHeaders.set("x-user-role", session.role);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

> **Important:** `session.ts` uses `import "server-only"` which doesn't work in middleware (edge runtime). The middleware must import only `encrypt`/`decrypt` directly. Refactor: extract `encrypt`/`decrypt` into a separate file that doesn't use `server-only`, or conditionally import. The simplest fix: the middleware only needs `decrypt` — duplicate the JWT logic inline in middleware or create a shared `jwt.ts` without `server-only`.

**Recommended approach:** Split session.ts:
- `src/features/auth/lib/jwt.ts` — pure `encrypt`/`decrypt` (no `server-only`)
- `src/features/auth/lib/session.ts` — cookie helpers using `jwt.ts` + `server-only`
- Middleware imports from `jwt.ts` directly

- [ ] **Step 3: Verify middleware works**

```bash
npm run build
```

Expected: Build succeeds. Middleware listed in build output.

- [ ] **Step 4: Commit**

```bash
git add middleware.ts src/features/auth/lib/jwt.ts && git commit -m "feat: add middleware for route protection with role checking"
```

---

## Task 6: Admin 관리 API Routes

**Files:**
- Create: `apps/admin/src/app/api/admin/users/route.ts`
- Create: `apps/admin/src/app/api/admin/users/[id]/role/route.ts`
- Create: `apps/admin/src/app/api/admin/audit-log/route.ts`

- [ ] **Step 1: Create users list + invite route**

Create `apps/admin/src/app/api/admin/users/route.ts`:

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAllUsers, createUser, findUserByEmail } from "@/features/auth/lib/mock-users";
import { addAuditEntry } from "@/features/auth/lib/audit";
import type { InviteUserRequest } from "@/features/auth/types/auth";

export async function GET() {
  return NextResponse.json({ success: true, data: getAllUsers() });
}

export async function POST(request: NextRequest) {
  const body: InviteUserRequest = await request.json();
  const actorId = request.headers.get("x-user-id") ?? "unknown";
  const actorEmail = request.headers.get("x-user-email") ?? "unknown";

  // Check duplicate email
  if (findUserByEmail(body.email)) {
    return NextResponse.json(
      { success: false, error: "이미 등록된 이메일입니다" },
      { status: 409 }
    );
  }

  const newUser = createUser({ email: body.email, name: body.name, role: body.role });

  addAuditEntry({
    actorId,
    actorEmail,
    action: "user_created",
    targetType: "admin_user",
    targetId: newUser.id,
    details: { email: body.email, role: body.role },
  });

  const { passwordHash: _, ...safeUser } = newUser;
  return NextResponse.json({ success: true, data: safeUser }, { status: 201 });
}
```

- [ ] **Step 2: Create role change route**

Create `apps/admin/src/app/api/admin/users/[id]/role/route.ts`:

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { findUserById, updateUserRole } from "@/features/auth/lib/mock-users";
import { addAuditEntry } from "@/features/auth/lib/audit";
import type { ChangeRoleRequest } from "@/features/auth/types/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body: ChangeRoleRequest = await request.json();
  const actorId = request.headers.get("x-user-id") ?? "unknown";
  const actorEmail = request.headers.get("x-user-email") ?? "unknown";

  const user = findUserById(id);
  if (!user) {
    return NextResponse.json({ success: false, error: "관리자를 찾을 수 없습니다" }, { status: 404 });
  }

  const previousRole = user.role;
  const success = updateUserRole(id, body.role);

  if (success) {
    addAuditEntry({
      actorId,
      actorEmail,
      action: "role_changed",
      targetType: "role",
      targetId: id,
      details: { previousRole, newRole: body.role, targetEmail: user.email },
    });
  }

  return NextResponse.json({ success });
}
```

- [ ] **Step 3: Create audit log route**

Create `apps/admin/src/app/api/admin/audit-log/route.ts`:

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuditLog } from "@/features/auth/lib/audit";
import type { AuditAction } from "@/features/auth/types/auth";

export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get("action") as AuditAction | null;
  const log = getAuditLog(action ? { action } : undefined);
  return NextResponse.json({ success: true, data: log });
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/admin/ && git commit -m "feat: add admin management API routes (users, roles, audit log)"
```

---

## Task 7: useAuth 훅 + AuthProvider + RoleGate

**Files:**
- Create: `apps/admin/src/features/auth/hooks/use-auth.ts`
- Create: `apps/admin/src/features/auth/components/AuthProvider.tsx`
- Create: `apps/admin/src/features/auth/components/RoleGate.tsx`
- Create: `apps/admin/src/features/auth/components/RoleGate.test.tsx`
- Create: `apps/admin/src/features/auth/components/RoleBadge.tsx`
- Modify: `apps/admin/src/app/layout.tsx`

- [ ] **Step 1: Create useAuth hook**

Create `apps/admin/src/features/auth/hooks/use-auth.ts`:

```typescript
"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ROLE_LEVELS, type Role } from "../types/auth";

interface AuthUser {
  userId: string;
  email: string;
  name: string;
  role: Role;
}

interface AuthContext {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  can: (minimumRole: Role) => boolean;
  logout: () => Promise<void>;
}

export function useAuth(): AuthContext {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) return null;
      const json = await res.json();
      return json.authenticated ? (json.user as AuthUser) : null;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const user = data ?? null;

  const can = (minimumRole: Role): boolean => {
    if (!user) return false;
    return ROLE_LEVELS[user.role] >= ROLE_LEVELS[minimumRole];
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    queryClient.clear();
    router.push("/login");
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    can,
    logout,
  };
}
```

- [ ] **Step 2: Write failing test for RoleGate**

Create `apps/admin/src/features/auth/components/RoleGate.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RoleGate } from "./RoleGate";

// Mock useAuth
vi.mock("../hooks/use-auth", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "../hooks/use-auth";
const mockUseAuth = vi.mocked(useAuth);

describe("RoleGate", () => {
  it("renders children when user has sufficient role", () => {
    mockUseAuth.mockReturnValue({
      user: { userId: "1", email: "a@a.com", name: "A", role: "admin" },
      isLoading: false,
      isAuthenticated: true,
      can: (r) => true,
      logout: vi.fn(),
    });

    render(
      <RoleGate role="operator">
        <p>Secret content</p>
      </RoleGate>
    );
    expect(screen.getByText("Secret content")).toBeInTheDocument();
  });

  it("renders fallback when user lacks role", () => {
    mockUseAuth.mockReturnValue({
      user: { userId: "1", email: "a@a.com", name: "A", role: "viewer" },
      isLoading: false,
      isAuthenticated: true,
      can: (r) => r === "viewer",
      logout: vi.fn(),
    });

    render(
      <RoleGate role="operator" fallback={<p>No access</p>}>
        <p>Secret content</p>
      </RoleGate>
    );
    expect(screen.queryByText("Secret content")).not.toBeInTheDocument();
    expect(screen.getByText("No access")).toBeInTheDocument();
  });

  it("renders nothing when no fallback and insufficient role", () => {
    mockUseAuth.mockReturnValue({
      user: { userId: "1", email: "a@a.com", name: "A", role: "viewer" },
      isLoading: false,
      isAuthenticated: true,
      can: (r) => r === "viewer",
      logout: vi.fn(),
    });

    const { container } = render(
      <RoleGate role="admin">
        <p>Admin only</p>
      </RoleGate>
    );
    expect(container.innerHTML).toBe("");
  });
});
```

- [ ] **Step 3: Run test → FAIL**

- [ ] **Step 4: Implement RoleGate + RoleBadge**

Create `apps/admin/src/features/auth/components/RoleGate.tsx`:

```tsx
"use client";

import type { ReactNode } from "react";
import { useAuth } from "../hooks/use-auth";
import type { Role } from "../types/auth";

interface RoleGateProps {
  role: Role;
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGate({ role, children, fallback }: RoleGateProps) {
  const { can } = useAuth();
  if (!can(role)) return fallback ?? null;
  return <>{children}</>;
}
```

Create `apps/admin/src/features/auth/components/RoleBadge.tsx`:

```tsx
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS, type Role } from "../types/auth";

const ROLE_VARIANT: Record<Role, "default" | "secondary" | "outline"> = {
  admin: "default",
  operator: "secondary",
  viewer: "outline",
};

export function RoleBadge({ role }: { role: Role }) {
  return <Badge variant={ROLE_VARIANT[role]}>{ROLE_LABELS[role]}</Badge>;
}
```

- [ ] **Step 5: Run test → PASS**

- [ ] **Step 6: Create AuthProvider + update layout**

Create `apps/admin/src/features/auth/components/AuthProvider.tsx`:

```tsx
"use client";

import type { ReactNode } from "react";

// AuthProvider is a thin wrapper for future context needs.
// Currently, useAuth uses React Query directly, no context needed.
// This component exists as a mounting point for auth-related side effects.
export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
```

Modify `apps/admin/src/app/layout.tsx` — read current file first, then wrap with AuthProvider and GNB (GNB added in next task).

- [ ] **Step 7: Commit**

```bash
git add src/features/auth/hooks/ src/features/auth/components/ src/app/layout.tsx && git commit -m "feat: add useAuth hook, RoleGate, RoleBadge, and AuthProvider"
```

---

## Task 8: GNB (Global Navigation Bar) + Login Page

**Files:**
- Create: `apps/admin/src/features/auth/components/GNB.tsx`
- Create: `apps/admin/src/features/auth/components/LoginForm.tsx`
- Create: `apps/admin/src/features/auth/components/LoginForm.test.tsx`
- Create: `apps/admin/src/app/login/page.tsx`
- Modify: `apps/admin/src/app/layout.tsx`

- [ ] **Step 1: Create GNB**

Create `apps/admin/src/features/auth/components/GNB.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../hooks/use-auth";
import { RoleBadge } from "./RoleBadge";
import { NAV_ITEMS } from "../constants/routes";
import { Button } from "@/components/ui/button";

export function GNB() {
  const { user, isAuthenticated, can, logout } = useAuth();
  const pathname = usePathname();

  if (!isAuthenticated) return null;

  const visibleItems = NAV_ITEMS.filter((item) => can(item.minRole));

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-lg font-bold">
            LiveOps
          </Link>
          <div className="flex gap-1">
            {visibleItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  pathname.startsWith(item.href)
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        {user && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-700">{user.name}</span>
            <RoleBadge role={user.role} />
            <Button variant="ghost" size="sm" onClick={logout}>
              로그아웃
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Write failing test for LoginForm**

Create `apps/admin/src/features/auth/components/LoginForm.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./LoginForm";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("LoginForm", () => {
  it("renders email and password inputs", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText("이메일")).toBeInTheDocument();
    expect(screen.getByLabelText("비밀번호")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "로그인" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run test → FAIL**

- [ ] **Step 4: Implement LoginForm**

Create `apps/admin/src/features/auth/components/LoginForm.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "로그인에 실패했습니다");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("서버와 통신할 수 없습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-center text-2xl">LiveOps Admin</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@liveops.dev"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 5: Run test → PASS**

- [ ] **Step 6: Create login page**

Create `apps/admin/src/app/login/page.tsx`:

```tsx
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <LoginForm />
    </div>
  );
}
```

- [ ] **Step 7: Update layout with GNB**

Modify `apps/admin/src/app/layout.tsx` — read current file, then add GNB between QueryProvider and children. Login page should NOT show GNB (handle via pathname check in GNB component — already done: GNB returns null when !isAuthenticated).

- [ ] **Step 8: Create 403 page**

Create `apps/admin/src/app/forbidden/page.tsx`:

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle className="text-4xl text-red-600">403</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">접근 권한이 없습니다</p>
          <Button asChild>
            <Link href="/dashboard">대시보드로 이동</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 9: Commit**

```bash
git add src/features/auth/components/GNB.tsx src/features/auth/components/LoginForm* src/app/login/ src/app/forbidden/ src/app/layout.tsx && git commit -m "feat: add GNB, login page, and 403 forbidden page"
```

---

## Task 9: Settings 페이지 (관리자 목록 + 초대 + 감사 로그)

**Files:**
- Create: `apps/admin/src/app/settings/layout.tsx`
- Create: `apps/admin/src/app/settings/admins/page.tsx`
- Create: `apps/admin/src/app/settings/admins/invite/page.tsx`
- Create: `apps/admin/src/app/settings/audit-log/page.tsx`

- [ ] **Step 1: Create settings layout**

Create `apps/admin/src/app/settings/layout.tsx`:

```tsx
import Link from "next/link";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl p-6">
      <h1 className="mb-6 text-2xl font-bold">설정</h1>
      <div className="flex gap-4 border-b pb-4 mb-6">
        <Link href="/settings/admins" className="text-sm font-medium hover:underline">관리자 관리</Link>
        <Link href="/settings/audit-log" className="text-sm font-medium hover:underline">감사 로그</Link>
      </div>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Create admin list page**

Create `apps/admin/src/app/settings/admins/page.tsx`:

```tsx
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RoleBadge } from "@/features/auth/components/RoleBadge";
import type { AdminUser, Role } from "@/features/auth/types/auth";

export default function AdminListPage() {
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users");
      const json = await res.json();
      return json.data as Omit<AdminUser, "passwordHash">[];
    },
  });

  const changeRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: Role }) => {
      await fetch(`/api/admin/users/${id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });

  if (isLoading) return <p className="text-muted-foreground">로딩 중...</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-lg font-semibold">관리자 목록</h2>
        <Button asChild>
          <Link href="/settings/admins/invite">관리자 초대</Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>이름</TableHead>
            <TableHead>이메일</TableHead>
            <TableHead>역할</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>마지막 로그인</TableHead>
            <TableHead>역할 변경</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell><RoleBadge role={user.role} /></TableCell>
              <TableCell>{user.status === "active" ? "활성" : "정지"}</TableCell>
              <TableCell>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString("ko") : "—"}</TableCell>
              <TableCell>
                <Select
                  value={user.role}
                  onValueChange={(value) => changeRole.mutate({ id: user.id, role: value as Role })}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">관리자</SelectItem>
                    <SelectItem value="operator">운영자</SelectItem>
                    <SelectItem value="viewer">뷰어</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

- [ ] **Step 3: Create invite page**

Create `apps/admin/src/app/settings/admins/invite/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Role } from "@/features/auth/types/auth";

export default function InviteAdminPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("viewer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, role }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "초대에 실패했습니다");
        return;
      }

      router.push("/settings/admins");
    } catch {
      setError("서버와 통신할 수 없습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>관리자 초대</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">이름</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>역할</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">관리자</SelectItem>
                <SelectItem value="operator">운영자</SelectItem>
                <SelectItem value="viewer">뷰어</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? "초대 중..." : "초대하기"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: Create audit log page**

Create `apps/admin/src/app/settings/audit-log/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AuditLogEntry, AuditAction } from "@/features/auth/types/auth";

const ACTION_LABELS: Record<AuditAction, string> = {
  login: "로그인",
  logout: "로그아웃",
  role_changed: "역할 변경",
  user_created: "계정 생성",
  user_suspended: "계정 정지",
  user_activated: "계정 활성화",
};

export default function AuditLogPage() {
  const [filter, setFilter] = useState<string>("all");

  const { data: entries, isLoading } = useQuery({
    queryKey: ["admin", "audit-log", filter],
    queryFn: async () => {
      const params = filter !== "all" ? `?action=${filter}` : "";
      const res = await fetch(`/api/admin/audit-log${params}`);
      const json = await res.json();
      return json.data as AuditLogEntry[];
    },
  });

  if (isLoading) return <p className="text-muted-foreground">로딩 중...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">감사 로그</h2>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="login">로그인</SelectItem>
            <SelectItem value="role_changed">역할 변경</SelectItem>
            <SelectItem value="user_created">계정 생성</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>시간</TableHead>
            <TableHead>실행자</TableHead>
            <TableHead>액션</TableHead>
            <TableHead>대상</TableHead>
            <TableHead>상세</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries?.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">로그가 없습니다</TableCell>
            </TableRow>
          )}
          {entries?.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="text-xs">{new Date(entry.timestamp).toLocaleString("ko")}</TableCell>
              <TableCell>{entry.actorEmail}</TableCell>
              <TableCell>{ACTION_LABELS[entry.action] ?? entry.action}</TableCell>
              <TableCell>{entry.targetId}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{JSON.stringify(entry.details)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/settings/ && git commit -m "feat: add settings pages (admin list, invite, audit log)"
```

---

## Task 10: 통합 + 검증

**Files:**
- Modify: `apps/admin/src/app/page.tsx` (already redirects to /dashboard)
- Modify: `apps/admin/src/app/layout.tsx` (add GNB)

- [ ] **Step 1: Update root layout with GNB**

Read current `src/app/layout.tsx`, add GNB import and render between QueryProvider and children:

```tsx
import { GNB } from "@/features/auth/components/GNB";

// Inside body, after <QueryProvider>:
<GNB />
{children}
```

- [ ] **Step 2: Run all tests**

```bash
npx vitest run
```

Expected: All tests pass (existing dashboard tests + new auth tests).

- [ ] **Step 3: Build check**

```bash
npm run build
```

Expected: Build succeeds. Middleware listed in output. All routes recognized.

- [ ] **Step 4: Manual verification**

```bash
npm run dev
```

Test:
1. Open `http://localhost:3000` → redirected to `/login` (middleware blocks unauthenticated)
2. Login with `admin@liveops.dev` / `admin123` → dashboard loads with GNB
3. GNB shows all 5 nav items (admin role)
4. Navigate to `/settings/admins` → admin list visible
5. Change a user's role → audit log records the change
6. Logout → redirected to `/login`
7. Login with `viewer@liveops.dev` / `view123` → dashboard loads
8. GNB shows only "대시보드" (viewer role)
9. Navigate to `/events` manually → redirected to `/forbidden`
10. Navigate to `/settings/admins` manually → redirected to `/forbidden`

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: integrate RBAC with GNB and complete route protection"
```

---

## Verification Checklist

- [ ] `npx vitest run` — all tests pass
- [ ] `npm run build` — build succeeds
- [ ] Login with 3 mock accounts works
- [ ] Middleware blocks unauthenticated access to all protected routes
- [ ] Admin sees all nav items; Operator sees 4; Viewer sees 1
- [ ] Role change via UI works and appears in audit log
- [ ] Login/logout events recorded in audit log
- [ ] 403 page shown for insufficient role
- [ ] API routes return 401/403 for unauthorized/forbidden requests
