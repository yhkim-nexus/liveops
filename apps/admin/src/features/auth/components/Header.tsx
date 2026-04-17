"use client";

import { useAuth } from "../hooks/use-auth";
import { RoleBadge } from "./RoleBadge";
import { Button } from "@/components/ui/button";

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated || !user) return null;

  return (
    <header className="flex h-14 items-center justify-end border-b bg-white px-6">
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-700">{user.name}</span>
        <RoleBadge role={user.role} />
        <Button variant="ghost" size="sm" onClick={logout}>
          로그아웃
        </Button>
      </div>
    </header>
  );
}
