"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEvents } from "@/features/events/hooks/use-event-queries";
import { EventPopover } from "@/features/events/components/EventPopover";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  formatDateRange,
  getEffectiveEndDate,
} from "@/features/events/lib/calendar-utils";
import type { LiveEvent, EventStatus } from "@/features/events/types/event";
import { EVENT_TYPE_PRESETS } from "@/features/events/types/event";

type ZoomLevel = "1d" | "1w" | "2w" | "1m";

const ZOOM_OPTIONS: { value: ZoomLevel; label: string }[] = [
  { value: "1d", label: "1일" },
  { value: "1w", label: "1주" },
  { value: "2w", label: "2주" },
  { value: "1m", label: "1개월" },
];

const STATUS_FILTER_OPTIONS = [
  { value: "all", label: "전체 상태" },
  { value: "draft", label: "초안" },
  { value: "pending_approval", label: "승인 대기" },
  { value: "scheduled", label: "예정" },
  { value: "active", label: "활성" },
  { value: "paused", label: "일시정지" },
  { value: "ended", label: "종료" },
  { value: "archived", label: "보관" },
];

const TYPE_FILTER_OPTIONS = [
  { value: "all", label: "전체 타입" },
  ...EVENT_TYPE_PRESETS,
];

function getRange(date: Date, zoom: ZoomLevel): { start: Date; end: Date } {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  switch (zoom) {
    case "1d":
      end.setDate(end.getDate() + 1);
      break;
    case "1w":
      end.setDate(end.getDate() + 7);
      break;
    case "2w":
      end.setDate(end.getDate() + 14);
      break;
    case "1m":
      end.setMonth(end.getMonth() + 1);
      break;
  }
  end.setMilliseconds(end.getMilliseconds() - 1);
  return { start, end };
}

function navigateDate(date: Date, zoom: ZoomLevel, direction: number): Date {
  const next = new Date(date);
  switch (zoom) {
    case "1d":
      next.setDate(next.getDate() + direction);
      break;
    case "1w":
      next.setDate(next.getDate() + direction * 7);
      break;
    case "2w":
      next.setDate(next.getDate() + direction * 14);
      break;
    case "1m":
      next.setMonth(next.getMonth() + direction);
      break;
  }
  return next;
}

function getDateTicks(start: Date, end: Date, zoom: ZoomLevel): Date[] {
  const ticks: Date[] = [];
  const current = new Date(start);
  while (current <= end) {
    ticks.push(new Date(current));
    if (zoom === "1d") {
      current.setHours(current.getHours() + 3);
    } else {
      current.setDate(current.getDate() + 1);
    }
  }
  return ticks;
}

function formatTickLabel(date: Date, zoom: ZoomLevel): string {
  if (zoom === "1d") {
    return `${date.getHours()}시`;
  }
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

interface Lane {
  label: string;
  events: LiveEvent[];
}

export default function TimelinePage() {
  const router = useRouter();
  const [zoom, setZoom] = useState<ZoomLevel>("1m");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: events, isLoading } = useEvents();

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    return events.filter((e) => {
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (typeFilter !== "all" && e.eventType !== typeFilter) return false;
      return true;
    });
  }, [events, statusFilter, typeFilter]);

  const { start: rangeStart, end: rangeEnd } = useMemo(
    () => getRange(currentDate, zoom),
    [currentDate, zoom],
  );

  const rangeDuration = rangeEnd.getTime() - rangeStart.getTime();

  const rangeLabel = useMemo(() => {
    if (zoom === "1m") {
      return `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`;
    }
    return formatDateRange(rangeStart, rangeEnd);
  }, [currentDate, zoom, rangeStart, rangeEnd]);

  // Group events by audienceName into lanes (only events within visible range)
  const lanes = useMemo<Lane[]>(() => {
    const map = new Map<string, LiveEvent[]>();
    for (const event of filteredEvents) {
      if (!event.startAt) continue;
      const eventStart = new Date(event.startAt);
      const eventEnd = getEffectiveEndDate(event.startAt, event.endAt, event.status);
      // Skip events completely outside the visible range
      if (eventEnd.getTime() <= rangeStart.getTime() || eventStart.getTime() >= rangeEnd.getTime()) continue;

      const key = event.audienceName ?? "전체";
      const list = map.get(key) ?? [];
      list.push(event);
      map.set(key, list);
    }
    // Sort: "전체" first, then alphabetical
    const entries = Array.from(map.entries()).sort((a, b) => {
      if (a[0] === "전체") return -1;
      if (b[0] === "전체") return 1;
      return a[0].localeCompare(b[0]);
    });
    return entries.map(([label, evts]) => ({ label, events: evts }));
  }, [filteredEvents, rangeStart, rangeEnd]);

  const ticks = useMemo(
    () => getDateTicks(rangeStart, rangeEnd, zoom),
    [rangeStart, rangeEnd, zoom],
  );

  // Compute today line position
  const todayPos = useMemo(() => {
    const now = new Date();
    if (now < rangeStart || now > rangeEnd) return null;
    return ((now.getTime() - rangeStart.getTime()) / rangeDuration) * 100;
  }, [rangeStart, rangeEnd, rangeDuration]);

  const handlePrev = () => setCurrentDate(navigateDate(currentDate, zoom, -1));
  const handleNext = () => setCurrentDate(navigateDate(currentDate, zoom, 1));

  const resetFilters = () => {
    setStatusFilter("all");
    setTypeFilter("all");
  };

  const hasActiveFilters = statusFilter !== "all" || typeFilter !== "all";

  const legendStatuses: EventStatus[] = [
    "active", "scheduled", "paused", "ended", "draft", "pending_approval", "archived",
  ];

  function getBarStyle(event: LiveEvent) {
    if (!event.startAt) return null;
    const eventStart = new Date(event.startAt);
    const eventEnd = getEffectiveEndDate(event.startAt, event.endAt, event.status);

    // Clamp to range
    const clampedStart = Math.max(eventStart.getTime(), rangeStart.getTime());
    const clampedEnd = Math.min(eventEnd.getTime(), rangeEnd.getTime());

    if (clampedStart >= rangeEnd.getTime() || clampedEnd <= rangeStart.getTime()) {
      return null; // out of range
    }

    const left = ((clampedStart - rangeStart.getTime()) / rangeDuration) * 100;
    const width = ((clampedEnd - clampedStart) / rangeDuration) * 100;

    return {
      left: `${Math.max(0, left)}%`,
      width: `${Math.max(1, Math.min(100 - left, width))}%`,
      backgroundColor: STATUS_COLORS[event.status],
    };
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon-sm" onClick={handlePrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[200px] text-center">
            {rangeLabel}
          </span>
          <Button variant="outline" size="icon-sm" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            오늘
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground mr-1">줌:</span>
          {ZOOM_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={zoom === opt.value ? "default" : "outline"}
              size="sm"
              onClick={() => setZoom(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={statusFilter} onValueChange={(v) => { if (v) setStatusFilter(v); }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="상태" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={(v) => { if (v) setTypeFilter(v); }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="타입" />
          </SelectTrigger>
          <SelectContent>
            {TYPE_FILTER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <RotateCcw className="mr-1 h-3.5 w-3.5" />
            초기화
          </Button>
        )}
      </div>

      {/* Timeline */}
      {isLoading ? (
        <div className="h-96 animate-pulse rounded bg-muted" />
      ) : lanes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <p className="text-sm">이 기간에 이벤트가 없습니다</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          {/* Date header */}
          <div className="flex border-b bg-muted/50">
            <div className="w-[140px] shrink-0 border-r px-3 py-1.5 text-xs font-medium text-muted-foreground">
              오디언스
            </div>
            <div className="flex-1 relative">
              {ticks.map((tick, i) => {
                const pos =
                  ((tick.getTime() - rangeStart.getTime()) / rangeDuration) *
                  100;
                return (
                  <div key={i}>
                    <div
                      className="absolute text-[10px] text-muted-foreground -translate-x-1/2"
                      style={{ left: `${pos}%`, top: "4px" }}
                    >
                      {formatTickLabel(tick, zoom)}
                    </div>
                    <div
                      className="absolute top-0 bottom-0 w-px bg-border"
                      style={{ left: `${pos}%` }}
                    />
                  </div>
                );
              })}
              <div className="h-6" />
            </div>
          </div>

          {/* Lanes */}
          {lanes.map((lane) => (
            <div key={lane.label} className="flex border-b last:border-b-0">
              <div className="w-[140px] shrink-0 border-r px-3 py-2 text-xs font-medium flex items-start">
                <span className="truncate">{lane.label}</span>
              </div>
              <div className="flex-1 relative min-h-[64px]">
                {/* Tick grid lines */}
                {ticks.map((tick, i) => {
                  const pos =
                    ((tick.getTime() - rangeStart.getTime()) / rangeDuration) *
                    100;
                  return (
                    <div
                      key={`grid-${i}`}
                      className="absolute top-0 bottom-0 w-px bg-border"
                      style={{ left: `${pos}%` }}
                    />
                  );
                })}
                {/* Today line */}
                {todayPos !== null && (
                  <div
                    className="absolute top-0 bottom-0 w-px border-l-2 border-dashed border-red-500 z-10"
                    style={{ left: `${todayPos}%` }}
                  />
                )}

                {/* Event bars */}
                {(() => {
                  const BAR_HEIGHT = 24;
                  const BAR_GAP = 4;
                  const ROW_STEP = BAR_HEIGHT + BAR_GAP;
                  const visibleBars = lane.events
                    .map((event) => ({ event, style: getBarStyle(event) }))
                    .filter((b): b is { event: LiveEvent; style: NonNullable<ReturnType<typeof getBarStyle>> } => b.style !== null);
                  const totalHeight = Math.max(64, visibleBars.length * ROW_STEP + 8);
                  return (
                    <div className="relative" style={{ height: totalHeight }}>
                      {visibleBars.map((bar, idx) => (
                        <EventPopover key={bar.event.id} event={bar.event}>
                          <div
                            className="absolute rounded cursor-pointer hover:opacity-80 transition-opacity flex items-center px-1.5 overflow-hidden"
                            style={{
                              top: 4 + idx * ROW_STEP,
                              height: BAR_HEIGHT,
                              left: bar.style.left,
                              width: bar.style.width,
                              backgroundColor: bar.style.backgroundColor,
                            }}
                            onClick={() => router.push(`/events/${bar.event.id}`)}
                          >
                            <span className="text-[10px] text-white font-medium truncate drop-shadow-sm">
                              {bar.event.name}
                            </span>
                          </div>
                        </EventPopover>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        {legendStatuses.map((status) => (
          <div key={status} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: STATUS_COLORS[status] }}
            />
            <span>{STATUS_LABELS[status]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
