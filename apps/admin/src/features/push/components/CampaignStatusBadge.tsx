"use client";

import type { CampaignStatus } from "../types/push";

const STATUS_CONFIG: Record<
  CampaignStatus,
  { label: string; bg: string; text: string }
> = {
  draft: { label: "초안", bg: "bg-gray-100", text: "text-gray-600" },
  pending_approval: {
    label: "승인 대기",
    bg: "bg-orange-100",
    text: "text-orange-600",
  },
  approved: { label: "승인됨", bg: "bg-emerald-100", text: "text-emerald-600" },
  scheduled: { label: "예약됨", bg: "bg-green-100", text: "text-green-600" },
  sending: { label: "발송 중", bg: "bg-blue-100", text: "text-blue-600" },
  sent: { label: "발송 완료", bg: "bg-slate-100", text: "text-slate-600" },
  failed: { label: "실패", bg: "bg-red-100", text: "text-red-600" },
  cancelled: { label: "취소됨", bg: "bg-purple-100", text: "text-purple-600" },
};

interface CampaignStatusBadgeProps {
  status: CampaignStatus;
}

export function CampaignStatusBadge({ status }: CampaignStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
}
