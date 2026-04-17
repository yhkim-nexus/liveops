"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface TabDef {
  href: string;
  label: string;
  exact?: boolean;
}

const TABS: TabDef[] = [
  { href: "/segments", label: "오디언스", exact: true },
  { href: "/segments/properties", label: "속성 관리" },
  { href: "/segments/taxonomy", label: "이벤트 택소노미" },
];

export default function SegmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Hide sub-tabs on create/edit/detail pages
  const showSubTabs =
    pathname === "/segments" ||
    pathname === "/segments/properties" ||
    pathname === "/segments/taxonomy";

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">세그멘테이션</h1>

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
              </Link>
            );
          })}
        </div>
      )}

      {children}
    </div>
  );
}
