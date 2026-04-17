"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEvents } from "@/features/events/hooks/use-event-queries";

interface TabDef {
  href: string;
  label: string;
  exact?: boolean;
  showBadge?: boolean;
  disabled?: boolean;
}

const TABS: TabDef[] = [
  { href: "/events", label: "이벤트 목록", exact: true },
  { href: "/events/approvals", label: "승인 대기", showBadge: true },
  { href: "/events/calendar", label: "캘린더" },
  { href: "/events/timeline", label: "타임라인" },
];

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: events } = useEvents({ status: "pending_approval" });
  const pendingCount = events?.length ?? 0;

  // Hide sub-tabs on create/edit/detail pages
  const showSubTabs =
    pathname === "/events" ||
    pathname === "/events/approvals" ||
    pathname === "/events/calendar" ||
    pathname === "/events/timeline";

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">라이브 이벤트</h1>

      {showSubTabs && (
        <div className="flex gap-1 border-b">
          {TABS.map((tab) => {
            const isActive = tab.exact
              ? pathname === tab.href
              : pathname.startsWith(tab.href);

            if (tab.disabled) {
              return (
                <span
                  key={tab.href}
                  className="inline-flex items-center gap-1.5 border-b-2 border-transparent px-4 py-2 text-sm text-muted-foreground/50 cursor-not-allowed"
                >
                  {tab.label}
                  <span className="text-[10px]">(P1)</span>
                </span>
              );
            }

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`inline-flex items-center gap-1.5 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
                {tab.showBadge && pendingCount > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 text-[11px] font-semibold text-white">
                    {pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {children}
    </div>
  );
}
