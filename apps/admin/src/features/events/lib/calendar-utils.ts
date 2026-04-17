import type { EventStatus } from "../types/event";

// Status color map matching EventStatusBadge
export const STATUS_COLORS: Record<EventStatus, string> = {
  draft: "#6B7280",
  pending_approval: "#F59E0B",
  scheduled: "#10B981",
  active: "#3B82F6",
  paused: "#EAB308",
  ended: "#374151",
  archived: "#8B5CF6",
};

export const STATUS_LABELS: Record<EventStatus, string> = {
  draft: "초안",
  pending_approval: "승인 대기",
  scheduled: "예정",
  active: "활성",
  paused: "일시정지",
  ended: "종료",
  archived: "보관",
};

/**
 * Get an array of Date objects for a grid of weeks starting from the given date's week.
 */
export function getWeekDays(date: Date, weekCount: number): Date[] {
  const start = new Date(date);
  // Go to Sunday of the current week
  start.setDate(start.getDate() - start.getDay());
  start.setHours(0, 0, 0, 0);

  const days: Date[] = [];
  for (let i = 0; i < weekCount * 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

/**
 * Get all days to display for a month view (including padding days from prev/next months).
 */
export function getMonthDays(date: Date): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();

  // First day of the month
  const firstDay = new Date(year, month, 1);
  // Start from Sunday of the week containing the first day
  const start = new Date(firstDay);
  start.setDate(start.getDate() - start.getDay());

  // Last day of the month
  const lastDay = new Date(year, month + 1, 0);
  // End at Saturday of the week containing the last day
  const end = new Date(lastDay);
  end.setDate(end.getDate() + (6 - end.getDay()));

  const days: Date[] = [];
  const current = new Date(start);
  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatDateRange(start: Date, end: Date): string {
  const fmt = (d: Date) =>
    d.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  return `${fmt(start)} ~ ${fmt(end)}`;
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Get the effective end date for an event (for visual rendering).
 * If endAt is null, use startAt + 7 days or current date (whichever is later for active events).
 */
export function getEffectiveEndDate(
  startAt: string | null,
  endAt: string | null,
  status: EventStatus,
): Date {
  if (endAt) return new Date(endAt);
  if (!startAt) return new Date();

  const start = new Date(startAt);
  const sevenDaysLater = new Date(start);
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);

  if (status === "active") {
    const now = new Date();
    return now > sevenDaysLater ? now : sevenDaysLater;
  }
  return sevenDaysLater;
}
