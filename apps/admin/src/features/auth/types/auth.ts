export type Role = "admin" | "operator" | "editor" | "viewer";

export const ROLE_LEVELS: Record<Role, number> = {
  admin: 4,
  operator: 3,
  editor: 2,
  viewer: 1,
};

export const ROLE_LABELS: Record<Role, string> = {
  admin: "관리자",
  operator: "운영자",
  editor: "에디터",
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
