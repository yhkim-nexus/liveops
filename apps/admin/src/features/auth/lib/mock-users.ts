import type { AdminUser } from "../types/auth";

const users: AdminUser[] = [
  {
    id: "admin-001",
    email: "admin@liveops.dev",
    name: "김관리",
    role: "admin",
    status: "active",
    createdAt: "2026-01-01T00:00:00Z",
    lastLoginAt: null,
    passwordHash: "admin123",
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
    id: "edit-001",
    email: "editor@liveops.dev",
    name: "최편집",
    role: "editor",
    status: "active",
    createdAt: "2026-02-01T00:00:00Z",
    lastLoginAt: null,
    passwordHash: "editor123",
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
  return user.passwordHash === password;
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
    passwordHash: "temp123",
  };
  users.push(newUser);
  return newUser;
}

export function updateLastLogin(id: string): void {
  const user = users.find((u) => u.id === id);
  if (user) user.lastLoginAt = new Date().toISOString();
}
