"use client";

import Link from "next/link";
import { EventStatusBadge } from "./EventStatusBadge";
import type { LiveEvent } from "../types/event";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface EventPopoverProps {
  event: LiveEvent;
  children: React.ReactNode;
}

function formatPeriod(event: LiveEvent): string {
  const opts: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: event.displayTimezone,
  };
  const start = event.startAt
    ? new Date(event.startAt).toLocaleString("ko-KR", opts)
    : "-";
  const end = event.endAt
    ? new Date(event.endAt).toLocaleString("ko-KR", opts)
    : "종료 미정";
  return `${start} ~ ${end}`;
}

const PRIORITY_LABELS: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export function EventPopover({ event, children }: EventPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger nativeButton={false} render={<span />}>{children}</PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="w-72 p-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold truncate">{event.name}</p>
            <EventStatusBadge status={event.status} />
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>{formatPeriod(event)}</p>
            <p>오디언스: {event.audienceName ?? "전체"}</p>
            <p>우선순위: {PRIORITY_LABELS[event.priority] ?? event.priority}</p>
          </div>
          <Link
            href={`/events/${event.id}`}
            className="inline-block text-xs text-primary hover:underline"
          >
            상세 보기 &rarr;
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
