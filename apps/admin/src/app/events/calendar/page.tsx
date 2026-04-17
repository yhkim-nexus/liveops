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
import { EventStatusBadge } from "@/features/events/components/EventStatusBadge";
import { EventPopover } from "@/features/events/components/EventPopover";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  getWeekDays,
  getMonthDays,
  isToday,
  isSameDay,
  formatDateRange,
  getEffectiveEndDate,
} from "@/features/events/lib/calendar-utils";
import type { LiveEvent, EventStatus } from "@/features/events/types/event";
import { EVENT_TYPE_PRESETS } from "@/features/events/types/event";

type ViewType = "1w" | "2w" | "4w" | "month";

const VIEW_OPTIONS: { value: ViewType; label: string }[] = [
  { value: "1w", label: "1주" },
  { value: "2w", label: "2주" },
  { value: "4w", label: "4주" },
  { value: "month", label: "월" },
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

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

const MAX_EVENTS_PER_CELL = 5;

function getWeekCount(viewType: ViewType): number {
  switch (viewType) {
    case "1w": return 1;
    case "2w": return 2;
    case "4w": return 4;
    default: return 4;
  }
}

function navigateDate(date: Date, viewType: ViewType, direction: number): Date {
  const next = new Date(date);
  if (viewType === "month") {
    next.setMonth(next.getMonth() + direction);
  } else {
    const weeks = getWeekCount(viewType);
    next.setDate(next.getDate() + direction * weeks * 7);
  }
  return next;
}

function eventSpansDay(event: LiveEvent, day: Date): boolean {
  if (!event.startAt) return false;
  const start = new Date(event.startAt);
  start.setHours(0, 0, 0, 0);
  const end = getEffectiveEndDate(event.startAt, event.endAt, event.status);
  end.setHours(23, 59, 59, 999);
  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(day);
  dayEnd.setHours(23, 59, 59, 999);
  return start <= dayEnd && end >= dayStart;
}

export default function CalendarPage() {
  const router = useRouter();
  const [viewType, setViewType] = useState<ViewType>("4w");
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

  const days = useMemo(() => {
    if (viewType === "month") {
      return getMonthDays(currentDate);
    }
    return getWeekDays(currentDate, getWeekCount(viewType));
  }, [currentDate, viewType]);

  const rangeLabel = useMemo(() => {
    if (days.length === 0) return "";
    if (viewType === "month") {
      return `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`;
    }
    return formatDateRange(days[0], days[days.length - 1]);
  }, [days, currentDate, viewType]);

  const eventsForDay = useMemo(() => {
    const map = new Map<string, LiveEvent[]>();
    for (const day of days) {
      const key = day.toISOString().slice(0, 10);
      const matching = filteredEvents.filter((e) => eventSpansDay(e, day));
      map.set(key, matching);
    }
    return map;
  }, [days, filteredEvents]);

  const handlePrev = () => setCurrentDate(navigateDate(currentDate, viewType, -1));
  const handleNext = () => setCurrentDate(navigateDate(currentDate, viewType, 1));

  const resetFilters = () => {
    setStatusFilter("all");
    setTypeFilter("all");
  };

  const hasActiveFilters = statusFilter !== "all" || typeFilter !== "all";

  const currentMonth = viewType === "month" ? currentDate.getMonth() : -1;

  // Legend statuses to show
  const legendStatuses: EventStatus[] = [
    "active", "scheduled", "paused", "draft", "pending_approval", "ended", "archived",
  ];

  return (
    <div className="space-y-4">
      {/* Header: View toggle + navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          {VIEW_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={viewType === opt.value ? "default" : "outline"}
              size="sm"
              onClick={() => setViewType(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
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

      {/* Calendar Grid */}
      {isLoading ? (
        <div className="h-96 animate-pulse rounded bg-muted" />
      ) : (
        <div className="border rounded-lg overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b bg-muted/50">
            {DAY_NAMES.map((name, i) => (
              <div
                key={name}
                className={`px-2 py-1.5 text-center text-xs font-medium ${
                  i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-muted-foreground"
                }`}
              >
                {name}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {days.map((day, idx) => {
              const key = day.toISOString().slice(0, 10);
              const dayEvents = eventsForDay.get(key) ?? [];
              const isCurrentMonth =
                viewType !== "month" || day.getMonth() === currentMonth;
              const todayHighlight = isToday(day);
              const dayOfWeek = day.getDay();

              return (
                <div
                  key={key}
                  className={`min-h-[140px] border-b border-r p-1 ${
                    todayHighlight ? "bg-blue-50 dark:bg-blue-950/30" : ""
                  } ${!isCurrentMonth ? "opacity-40" : ""}`}
                >
                  {/* Date number */}
                  <div
                    className={`text-xs mb-0.5 ${
                      todayHighlight
                        ? "inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold"
                        : dayOfWeek === 0
                          ? "text-red-500"
                          : dayOfWeek === 6
                            ? "text-blue-500"
                            : "text-muted-foreground"
                    }`}
                  >
                    {day.getDate()}
                  </div>

                  {/* Event blocks */}
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, MAX_EVENTS_PER_CELL).map((event) => (
                      <EventPopover key={event.id} event={event}>
                        <div
                          className="flex items-center gap-1 rounded px-1 py-0.5 text-[10px] leading-tight cursor-pointer hover:bg-muted/80 transition-colors truncate"
                          style={{
                            borderLeft: `3px solid ${STATUS_COLORS[event.status]}`,
                          }}
                          onClick={() => router.push(`/events/${event.id}`)}
                        >
                          <span className="truncate">{event.name}</span>
                        </div>
                      </EventPopover>
                    ))}
                    {dayEvents.length > MAX_EVENTS_PER_CELL && (
                      <div className="text-[10px] text-muted-foreground pl-1">
                        +{dayEvents.length - MAX_EVENTS_PER_CELL}개 더
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filteredEvents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <p className="text-sm">이 기간에 이벤트가 없습니다</p>
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
