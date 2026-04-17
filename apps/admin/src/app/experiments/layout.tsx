"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useExperiments } from "@/features/experiments/hooks/use-experiment-queries";

interface TabDef {
  href: string;
  label: string;
  exact?: boolean;
  showBadge?: boolean;
}

const TABS: TabDef[] = [
  { href: "/experiments", label: "실험 목록", exact: true },
  { href: "/experiments/approvals", label: "승인 대기", showBadge: true },
];

export default function ExperimentsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: experiments } = useExperiments({ status: "pending_approval" });
  const pendingCount = experiments?.length ?? 0;

  // Hide sub-tabs on create/edit/detail pages
  const showSubTabs =
    pathname === "/experiments" ||
    pathname === "/experiments/approvals";

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">A/B 테스트</h1>

      {showSubTabs && (
        <div className="flex gap-1 border-b">
          {TABS.map((tab) => {
            const isActive = tab.exact
              ? pathname === tab.href
              : pathname.startsWith(tab.href);

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
