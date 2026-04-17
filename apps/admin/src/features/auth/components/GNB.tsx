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
          <Link href="/dashboard" className="text-lg font-bold">LiveOps</Link>
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
            <Button variant="ghost" size="sm" onClick={logout}>로그아웃</Button>
          </div>
        )}
      </div>
    </nav>
  );
}
