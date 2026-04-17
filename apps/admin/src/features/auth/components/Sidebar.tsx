"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FlaskConical,
  UserSearch,
  Bell,
  Settings,
  Settings2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { NAV_ITEMS } from "../constants/routes";
import { Separator } from "@/components/ui/separator";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  "/dashboard": LayoutDashboard,
  "/events": Calendar,
  "/experiments": FlaskConical,
  "/segments": Users,
  "/players": UserSearch,
  "/remote-config": Settings2,
  "/push/campaigns": Bell,
  "/settings/admins": Settings,
};

const STORAGE_KEY = "sidebar-collapsed";

export function Sidebar() {
  const { can } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") setCollapsed(true);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  };

  const visibleItems = NAV_ITEMS.filter((item) => can(item.minRole));

  // Find index of settings item to insert separator before it
  const settingsIndex = visibleItems.findIndex((item) =>
    item.href.startsWith("/settings"),
  );

  return (
    <aside
      className={`flex h-screen flex-col border-r bg-white transition-[width] duration-200 ${
        collapsed ? "w-16" : "w-60"
      }`}
      style={{ minWidth: collapsed ? 64 : 240 }}
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-4">
        <Link
          href="/dashboard"
          className="text-lg font-bold text-gray-900 truncate"
        >
          {collapsed ? "LO" : "LiveOps"}
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        {visibleItems.map((item, index) => {
          const Icon = ICON_MAP[item.href];
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <div key={item.href}>
              {index === settingsIndex && settingsIndex > 0 && (
                <Separator className="my-2" />
              )}
              <Link
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                } ${collapsed ? "justify-center" : ""}`}
              >
                {Icon && (
                  <Icon className="size-5 shrink-0" />
                )}
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            </div>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t p-2">
        <button
          onClick={toggle}
          className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 ${
            collapsed ? "justify-center" : ""
          }`}
          aria-label={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
        >
          {collapsed ? (
            <ChevronRight className="size-5 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="size-5 shrink-0" />
              <span>접기</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
