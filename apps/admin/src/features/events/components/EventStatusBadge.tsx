import type { EventStatus } from "../types/event";

const STATUS_CONFIG: Record<
  EventStatus,
  { label: string; bg: string; text: string }
> = {
  draft: { label: "draft", bg: "bg-gray-100", text: "text-[#6B7280]" },
  pending_approval: { label: "승인 대기", bg: "bg-orange-100", text: "text-[#F59E0B]" },
  scheduled: { label: "scheduled", bg: "bg-green-100", text: "text-[#10B981]" },
  active: { label: "active", bg: "bg-blue-100", text: "text-[#3B82F6]" },
  paused: { label: "paused", bg: "bg-yellow-100", text: "text-[#EAB308]" },
  ended: { label: "ended", bg: "bg-gray-200", text: "text-[#374151]" },
  archived: { label: "archived", bg: "bg-purple-100", text: "text-[#8B5CF6]" },
};

export function EventStatusBadge({ status }: EventStatusBadgeProps) {
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

interface EventStatusBadgeProps {
  status: EventStatus;
}
