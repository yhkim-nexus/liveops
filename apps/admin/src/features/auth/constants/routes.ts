import type { Role } from "../types/auth";

export interface RouteConfig {
  pattern: string;
  minRole: Role | null;
}

export const ROUTE_CONFIGS: RouteConfig[] = [
  { pattern: "/login", minRole: null },
  { pattern: "/forbidden", minRole: null },
  { pattern: "/api/auth/", minRole: null },
  { pattern: "/dashboard", minRole: "viewer" },
  { pattern: "/api/dashboard/", minRole: "viewer" },
  { pattern: "/events/approvals", minRole: "operator" },
  { pattern: "/events/new", minRole: "editor" },
  { pattern: "/events", minRole: "viewer" },
  { pattern: "/api/events/", minRole: "viewer" },
  { pattern: "/experiments/approvals", minRole: "operator" },
  { pattern: "/experiments/new", minRole: "editor" },
  { pattern: "/experiments", minRole: "viewer" },
  { pattern: "/api/experiments/", minRole: "viewer" },
  { pattern: "/segments/new", minRole: "editor" },
  { pattern: "/segments", minRole: "viewer" },
  { pattern: "/api/segments/", minRole: "viewer" },
  { pattern: "/players", minRole: "viewer" },
  { pattern: "/api/players/", minRole: "viewer" },
  { pattern: "/remote-config/approvals", minRole: "operator" },
  { pattern: "/remote-config/new", minRole: "editor" },
  { pattern: "/remote-config", minRole: "viewer" },
  { pattern: "/api/remote-config/", minRole: "viewer" },
  { pattern: "/push/campaigns/approvals", minRole: "operator" },
  { pattern: "/push/campaigns/new", minRole: "editor" },
  { pattern: "/push", minRole: "viewer" },
  { pattern: "/api/push/", minRole: "viewer" },
  { pattern: "/settings", minRole: "admin" },
  { pattern: "/api/admin/", minRole: "admin" },
];

export const NAV_ITEMS: { href: string; label: string; minRole: Role }[] = [
  { href: "/dashboard", label: "대시보드", minRole: "viewer" },
  { href: "/players", label: "플레이어", minRole: "viewer" },
  { href: "/segments", label: "세그멘테이션", minRole: "viewer" },
  { href: "/events", label: "이벤트", minRole: "viewer" },
  { href: "/experiments", label: "실험", minRole: "viewer" },
  { href: "/remote-config", label: "Remote Config", minRole: "viewer" },
  { href: "/push/campaigns", label: "푸시 알림", minRole: "viewer" },
  { href: "/settings/admins", label: "설정", minRole: "admin" },
];
