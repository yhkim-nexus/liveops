export type EventStatus =
  | "draft"
  | "pending_approval"
  | "scheduled"
  | "active"
  | "paused"
  | "ended"
  | "archived";

export type EventPriority = "low" | "medium" | "high" | "critical";

export type ScheduleType = "once" | "recurring";

export interface LiveEvent {
  id: string;
  name: string;
  description: string;
  eventType: string;            // 자유 문자열 레이블 (login_bonus, seasonal, tournament 등)
  priority: EventPriority;
  status: EventStatus;
  audienceId: string | null;
  audienceName: string | null;
  // 스케줄
  scheduleType: ScheduleType;
  startAt: string | null;       // ISO 8601 UTC
  endAt: string | null;         // null = 종료 미정
  rrule: string | null;         // RFC 5545 반복 규칙 (recurring일 때)
  rruleDurationMinutes: number | null; // 반복 인스턴스 지속 시간(분)
  displayTimezone: string;      // IANA timezone (예: Asia/Seoul)
  // 기타
  metadata: Record<string, unknown>;
  payloadSchemaVersion: string | null; // 메타데이터 스키마 버전, max 32 chars
  stickyMembership: boolean;           // 기본값 false
  rewards: string;
  participantCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateEventRequest = Pick<
  LiveEvent,
  | "name"
  | "description"
  | "eventType"
  | "priority"
  | "audienceId"
  | "audienceName"
  | "scheduleType"
  | "startAt"
  | "endAt"
  | "rrule"
  | "rruleDurationMinutes"
  | "displayTimezone"
  | "rewards"
  | "metadata"
  | "payloadSchemaVersion"
  | "stickyMembership"
>;

export interface EventStateLogEntry {
  id: string;
  eventId: string;
  fromStatus: EventStatus | null;
  toStatus: EventStatus;
  actorId: string;
  reason: string | null;
  createdAt: string;
}

export type TransitionAction =
  | "request_approval"
  | "approve"
  | "reject"
  | "pause"
  | "resume"
  | "kill"
  | "extend"
  | "archive";

export type UpdateEventRequest = Partial<CreateEventRequest & { status: EventStatus }>;

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: { generatedAt: string };
}

// 이벤트 유형 프리셋 (자주 쓰는 값 제안용, 강제 아님)
export const EVENT_TYPE_PRESETS: { value: string; label: string }[] = [
  { value: "login_bonus", label: "로그인 보상" },
  { value: "seasonal", label: "시즌 이벤트" },
  { value: "tournament", label: "토너먼트" },
  { value: "promotion", label: "프로모션" },
  { value: "attendance", label: "출석 보상" },
  { value: "comeback", label: "복귀 보상" },
  { value: "maintenance_compensation", label: "점검 보상" },
  { value: "special", label: "특별 이벤트" },
];

export const PRIORITY_OPTIONS: { value: EventPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];
