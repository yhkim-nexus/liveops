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
