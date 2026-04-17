import type {
  LiveEvent,
  EventStatus,
  CreateEventRequest,
  UpdateEventRequest,
  EventStateLogEntry,
  TransitionAction,
} from "../types/event";

let events: LiveEvent[] = [
  {
    id: "evt-001",
    name: "신규 회원 환영 이벤트",
    description: "가입 7일 이내 신규 회원에게 환영 보상을 지급하는 이벤트입니다.",
    eventType: "login_bonus",
    priority: "high",
    status: "active",
    audienceId: "aud-003",
    audienceName: "신규 회원",
    scheduleType: "once",
    startAt: "2026-03-20T00:00:00Z",
    endAt: "2026-04-20T23:59:59Z",
    rrule: null,
    rruleDurationMinutes: null,
    displayTimezone: "Asia/Seoul",
    metadata: { welcomeMessage: "환영합니다!" },
    payloadSchemaVersion: "1.0.0",
    stickyMembership: false,
    rewards: "환영 상자 1개, 골드 500, 경험치 부스트 24시간",
    participantCount: 12_841,
    createdBy: "admin@liveops.dev",
    createdAt: "2026-03-18T09:00:00Z",
    updatedAt: "2026-03-20T00:00:00Z",
  },
  {
    id: "evt-002",
    name: "주말 더블 XP",
    description: "매주 금요일~일요일 경험치 2배 반복 이벤트.",
    eventType: "attendance",
    priority: "medium",
    status: "scheduled",
    audienceId: null,
    audienceName: null,
    scheduleType: "recurring",
    startAt: "2026-03-28T18:00:00Z",
    endAt: null,
    rrule: "FREQ=WEEKLY;BYDAY=FR",
    rruleDurationMinutes: 4320, // 72시간 (금~일)
    displayTimezone: "Asia/Seoul",
    metadata: {},
    payloadSchemaVersion: null,
    stickyMembership: false,
    rewards: "경험치 2배 버프 (자동 적용)",
    participantCount: 0,
    createdBy: "admin@liveops.dev",
    createdAt: "2026-03-22T14:00:00Z",
    updatedAt: "2026-03-22T14:00:00Z",
  },
  {
    id: "evt-003",
    name: "시즌 패스 프로모션",
    description: "시즌 2 패스 30% 할인 판매 프로모션.",
    eventType: "promotion",
    priority: "high",
    status: "draft",
    audienceId: null,
    audienceName: null,
    scheduleType: "once",
    startAt: "2026-04-01T00:00:00Z",
    endAt: "2026-04-07T23:59:59Z",
    rrule: null,
    rruleDurationMinutes: null,
    displayTimezone: "Asia/Seoul",
    metadata: { discountRate: 30 },
    payloadSchemaVersion: "1.1.0",
    stickyMembership: false,
    rewards: "시즌 패스 30% 할인, 구매 시 보너스 스킨 1종",
    participantCount: 0,
    createdBy: "operator@liveops.dev",
    createdAt: "2026-03-25T10:00:00Z",
    updatedAt: "2026-03-25T10:00:00Z",
  },
  {
    id: "evt-004",
    name: "VIP 전용 보상",
    description: "고래 회원(VIP) 대상 일일 보상. 매일 접속 시 VIP 전용 보상 지급.",
    eventType: "special",
    priority: "medium",
    status: "active",
    audienceId: "aud-001",
    audienceName: "고래 회원",
    scheduleType: "recurring",
    startAt: "2026-03-01T00:00:00Z",
    endAt: null,
    rrule: "FREQ=DAILY",
    rruleDurationMinutes: 1440, // 24시간
    displayTimezone: "Asia/Seoul",
    metadata: {},
    payloadSchemaVersion: null,
    stickyMembership: true,
    rewards: "VIP 일일 상자, 골드 1,000, 프리미엄 재화 50",
    participantCount: 2_134,
    createdBy: "admin@liveops.dev",
    createdAt: "2026-02-28T15:00:00Z",
    updatedAt: "2026-03-15T09:00:00Z",
  },
  {
    id: "evt-005",
    name: "복귀 회원 보너스",
    description: "14일 이상 미접속 후 복귀한 회원에게 복귀 보상 지급.",
    eventType: "comeback",
    priority: "medium",
    status: "ended",
    audienceId: "aud-002",
    audienceName: "이탈 위험",
    scheduleType: "once",
    startAt: "2026-02-15T00:00:00Z",
    endAt: "2026-03-15T23:59:59Z",
    rrule: null,
    rruleDurationMinutes: null,
    displayTimezone: "Asia/Seoul",
    metadata: {},
    payloadSchemaVersion: null,
    stickyMembership: false,
    rewards: "복귀 환영 상자, 골드 2,000, 7일 프리미엄 패스",
    participantCount: 8_923,
    createdBy: "admin@liveops.dev",
    createdAt: "2026-02-10T11:00:00Z",
    updatedAt: "2026-03-16T00:00:00Z",
  },
  {
    id: "evt-006",
    name: "한국 서버 특별 이벤트",
    description: "한국 서버 회원 대상 한정 스킨과 추가 보상 지급.",
    eventType: "seasonal",
    priority: "high",
    status: "active",
    audienceId: "aud-004",
    audienceName: "한국 회원",
    scheduleType: "once",
    startAt: "2026-03-22T00:00:00Z",
    endAt: "2026-04-05T23:59:59Z",
    rrule: null,
    rruleDurationMinutes: null,
    displayTimezone: "Asia/Seoul",
    metadata: {},
    payloadSchemaVersion: null,
    stickyMembership: false,
    rewards: "한정 스킨 '무궁화', 골드 3,000, 경험치 부스트 48시간",
    participantCount: 31_204,
    createdBy: "operator@liveops.dev",
    createdAt: "2026-03-20T08:00:00Z",
    updatedAt: "2026-03-22T00:00:00Z",
  },
  {
    id: "evt-008",
    name: "신규 온보딩 이벤트",
    description: "신규 가입 3일 이내 회원에게 온보딩 보상 지급.",
    eventType: "login_bonus",
    priority: "high",
    status: "pending_approval",
    audienceId: "aud-003",
    audienceName: "신규 회원",
    scheduleType: "once",
    startAt: "2026-04-08T00:00:00Z",
    endAt: "2026-04-10T23:59:59Z",
    rrule: null,
    rruleDurationMinutes: null,
    displayTimezone: "Asia/Seoul",
    metadata: { bonusType: "gem", amount: 50 },
    payloadSchemaVersion: "1.0.0",
    stickyMembership: false,
    rewards: "보석 50개, 골드 1,000",
    participantCount: 0,
    createdBy: "operator@liveops.dev",
    createdAt: "2026-03-23T14:30:00Z",
    updatedAt: "2026-03-23T14:30:00Z",
  },
  {
    id: "evt-009",
    name: "VIP 4월 특별 보상",
    description: "VIP 회원 4월 특별 보상 이벤트.",
    eventType: "special",
    priority: "critical",
    status: "pending_approval",
    audienceId: "aud-001",
    audienceName: "고래 회원",
    scheduleType: "once",
    startAt: "2026-04-01T00:00:00Z",
    endAt: "2026-04-30T23:59:59Z",
    rrule: null,
    rruleDurationMinutes: null,
    displayTimezone: "Asia/Seoul",
    metadata: {},
    payloadSchemaVersion: null,
    stickyMembership: true,
    rewards: "VIP 전용 스킨, 골드 5,000, 프리미엄 재화 200",
    participantCount: 0,
    createdBy: "admin@liveops.dev",
    createdAt: "2026-03-23T11:00:00Z",
    updatedAt: "2026-03-23T11:00:00Z",
  },
  {
    id: "evt-007",
    name: "금요일 출석 보상",
    description: "매주 금요일 오전 9시 자동 활성화 출석 보상 이벤트.",
    eventType: "attendance",
    priority: "low",
    status: "active",
    audienceId: null,
    audienceName: null,
    scheduleType: "recurring",
    startAt: "2026-03-07T00:00:00Z",
    endAt: null,
    rrule: "FREQ=WEEKLY;BYDAY=FR",
    rruleDurationMinutes: 1440, // 24시간
    displayTimezone: "Asia/Seoul",
    metadata: {},
    payloadSchemaVersion: null,
    stickyMembership: false,
    rewards: "출석 코인 100, 랜덤 상자 1개",
    participantCount: 45_012,
    createdBy: "operator@liveops.dev",
    createdAt: "2026-03-05T10:00:00Z",
    updatedAt: "2026-03-07T00:00:00Z",
  },
  {
    id: "evt-010",
    name: "봄맞이 쿠폰 이벤트",
    description: "봄 시즌 한정 쿠폰 지급 이벤트.",
    eventType: "promotion",
    priority: "medium",
    status: "active",
    audienceId: null,
    audienceName: null,
    scheduleType: "once",
    startAt: "2026-03-20T00:00:00Z",
    endAt: "2026-04-05T23:59:59Z",
    rrule: null,
    rruleDurationMinutes: null,
    displayTimezone: "Asia/Seoul",
    metadata: { couponCode: "SPRING2026" },
    payloadSchemaVersion: null,
    stickyMembership: false,
    rewards: "50% 할인 쿠폰 1매",
    participantCount: 22_500,
    createdBy: "operator@liveops.dev",
    createdAt: "2026-03-19T10:00:00Z",
    updatedAt: "2026-03-20T00:00:00Z",
  },
  {
    id: "evt-011",
    name: "레벨업 챌린지",
    description: "7일 이내 10레벨 달성 시 보상 지급.",
    eventType: "attendance",
    priority: "high",
    status: "active",
    audienceId: "aud-003",
    audienceName: "신규 회원",
    scheduleType: "once",
    startAt: "2026-03-22T00:00:00Z",
    endAt: "2026-03-29T23:59:59Z",
    rrule: null,
    rruleDurationMinutes: null,
    displayTimezone: "Asia/Seoul",
    metadata: {},
    payloadSchemaVersion: null,
    stickyMembership: false,
    rewards: "레벨업 상자, 골드 800",
    participantCount: 5_340,
    createdBy: "admin@liveops.dev",
    createdAt: "2026-03-21T09:00:00Z",
    updatedAt: "2026-03-22T00:00:00Z",
  },
  {
    id: "evt-012",
    name: "친구 초대 캠페인",
    description: "친구 1명 초대 시 보상 지급 캠페인.",
    eventType: "promotion",
    priority: "medium",
    status: "active",
    audienceId: null,
    audienceName: null,
    scheduleType: "once",
    startAt: "2026-03-25T00:00:00Z",
    endAt: "2026-04-08T23:59:59Z",
    rrule: null,
    rruleDurationMinutes: null,
    displayTimezone: "Asia/Seoul",
    metadata: {},
    payloadSchemaVersion: null,
    stickyMembership: false,
    rewards: "초대 보상 상자, 골드 1,500",
    participantCount: 0,
    createdBy: "operator@liveops.dev",
    createdAt: "2026-03-24T08:00:00Z",
    updatedAt: "2026-03-24T08:00:00Z",
  },
  {
    id: "evt-013",
    name: "매일 미니게임",
    description: "매일 접속 시 미니게임 참여 가능.",
    eventType: "attendance",
    priority: "low",
    status: "active",
    audienceId: null,
    audienceName: null,
    scheduleType: "recurring",
    startAt: "2026-03-20T00:00:00Z",
    endAt: null,
    rrule: "FREQ=DAILY",
    rruleDurationMinutes: 1440,
    displayTimezone: "Asia/Seoul",
    metadata: {},
    payloadSchemaVersion: null,
    stickyMembership: false,
    rewards: "미니게임 코인 30",
    participantCount: 67_800,
    createdBy: "admin@liveops.dev",
    createdAt: "2026-03-19T14:00:00Z",
    updatedAt: "2026-03-20T00:00:00Z",
  },
  {
    id: "evt-014",
    name: "고래 전용 더블 드롭",
    description: "고래 회원 대상 아이템 드롭률 2배.",
    eventType: "special",
    priority: "critical",
    status: "active",
    audienceId: "aud-001",
    audienceName: "고래 회원",
    scheduleType: "once",
    startAt: "2026-03-20T00:00:00Z",
    endAt: "2026-04-03T23:59:59Z",
    rrule: null,
    rruleDurationMinutes: null,
    displayTimezone: "Asia/Seoul",
    metadata: { dropMultiplier: 2 },
    payloadSchemaVersion: null,
    stickyMembership: true,
    rewards: "아이템 드롭률 2배",
    participantCount: 1_890,
    createdBy: "admin@liveops.dev",
    createdAt: "2026-03-19T11:00:00Z",
    updatedAt: "2026-03-20T00:00:00Z",
  },
  {
    id: "evt-015",
    name: "PvP 시즌 오픈",
    description: "PvP 시즌 3 개막 기념 보상 이벤트.",
    eventType: "tournament",
    priority: "high",
    status: "active",
    audienceId: "aud-005",
    audienceName: "활성 회원",
    scheduleType: "once",
    startAt: "2026-03-23T00:00:00Z",
    endAt: "2026-04-06T23:59:59Z",
    rrule: null,
    rruleDurationMinutes: null,
    displayTimezone: "Asia/Seoul",
    metadata: { season: 3 },
    payloadSchemaVersion: "1.0.0",
    stickyMembership: false,
    rewards: "시즌 트로피, 골드 2,000, 한정 스킨",
    participantCount: 38_200,
    createdBy: "operator@liveops.dev",
    createdAt: "2026-03-22T10:00:00Z",
    updatedAt: "2026-03-23T00:00:00Z",
  },
  {
    id: "evt-016",
    name: "보상 오류 점검 중",
    description: "보상 수량 오류 발견으로 일시정지된 이벤트. 점검 후 재개 예정.",
    eventType: "promotion",
    priority: "high",
    status: "paused",
    audienceId: null,
    audienceName: null,
    scheduleType: "once",
    startAt: "2026-03-18T00:00:00Z",
    endAt: "2026-04-01T23:59:59Z",
    rrule: null,
    rruleDurationMinutes: null,
    displayTimezone: "Asia/Seoul",
    metadata: { originalReward: 500, errorType: "quantity_overflow" },
    payloadSchemaVersion: null,
    stickyMembership: false,
    rewards: "골드 500 (오류 수정 후 재개 예정)",
    participantCount: 15_230,
    createdBy: "operator@liveops.dev",
    createdAt: "2026-03-17T09:00:00Z",
    updatedAt: "2026-03-24T14:00:00Z",
  },
  {
    id: "evt-017",
    name: "시즌 1 종료 보관",
    description: "시즌 1 이벤트 종료 후 보관 처리됨. 읽기 전용.",
    eventType: "seasonal",
    priority: "medium",
    status: "archived",
    audienceId: null,
    audienceName: null,
    scheduleType: "once",
    startAt: "2026-02-01T00:00:00Z",
    endAt: "2026-02-28T23:59:59Z",
    rrule: null,
    rruleDurationMinutes: null,
    displayTimezone: "Asia/Seoul",
    metadata: { season: 1 },
    payloadSchemaVersion: "1.0.0",
    stickyMembership: false,
    rewards: "시즌 1 트로피, 골드 1,000",
    participantCount: 52_100,
    createdBy: "admin@liveops.dev",
    createdAt: "2026-01-25T10:00:00Z",
    updatedAt: "2026-03-05T09:00:00Z",
  },
];

let nextId = 18;
let nextLogId = 7;

// -- State log --

let EVENT_STATE_LOG: EventStateLogEntry[] = [
  // evt-001: draft -> pending_approval -> scheduled -> active
  { id: "log-001", eventId: "evt-001", fromStatus: null, toStatus: "draft", actorId: "admin@liveops.dev", reason: null, createdAt: "2026-03-18T09:00:00Z" },
  { id: "log-002", eventId: "evt-001", fromStatus: "draft", toStatus: "pending_approval", actorId: "admin@liveops.dev", reason: null, createdAt: "2026-03-18T12:00:00Z" },
  { id: "log-003", eventId: "evt-001", fromStatus: "pending_approval", toStatus: "scheduled", actorId: "admin@liveops.dev", reason: "승인 완료", createdAt: "2026-03-19T10:00:00Z" },
  { id: "log-004", eventId: "evt-001", fromStatus: "scheduled", toStatus: "active", actorId: "system", reason: "자동 활성화", createdAt: "2026-03-20T00:00:00Z" },
  // evt-005: draft -> ... -> active -> ended
  { id: "log-005", eventId: "evt-005", fromStatus: "active", toStatus: "ended", actorId: "system", reason: "종료 시간 도달", createdAt: "2026-03-16T00:00:00Z" },
  // evt-004: active (with pause history)
  { id: "log-006", eventId: "evt-004", fromStatus: "scheduled", toStatus: "active", actorId: "system", reason: "자동 활성화", createdAt: "2026-03-01T00:00:00Z" },
];

// Transition rules: { [fromStatus]: { [action]: toStatus } }
const TRANSITION_MAP: Record<string, Record<TransitionAction, EventStatus | undefined>> = {
  draft: { request_approval: "pending_approval", approve: undefined, reject: undefined, pause: undefined, resume: undefined, kill: undefined, extend: undefined, archive: undefined },
  pending_approval: { request_approval: undefined, approve: "scheduled", reject: "draft", pause: undefined, resume: undefined, kill: undefined, extend: undefined, archive: undefined },
  scheduled: { request_approval: undefined, approve: undefined, reject: undefined, pause: undefined, resume: undefined, kill: undefined, extend: undefined, archive: undefined },
  active: { request_approval: undefined, approve: undefined, reject: undefined, pause: "paused", resume: undefined, kill: "ended", extend: "active", archive: undefined },
  paused: { request_approval: undefined, approve: undefined, reject: undefined, pause: undefined, resume: "active", kill: "ended", extend: undefined, archive: undefined },
  ended: { request_approval: undefined, approve: undefined, reject: undefined, pause: undefined, resume: undefined, kill: undefined, extend: undefined, archive: "archived" },
  archived: { request_approval: undefined, approve: undefined, reject: undefined, pause: undefined, resume: undefined, kill: undefined, extend: undefined, archive: undefined },
};

export function getAllEvents(): LiveEvent[] {
  return [...events];
}

export function getEventById(id: string): LiveEvent | undefined {
  return events.find((e) => e.id === id);
}

export function createEvent(req: CreateEventRequest): LiveEvent {
  const now = new Date().toISOString();
  const event: LiveEvent = {
    id: `evt-${String(nextId++).padStart(3, "0")}`,
    name: req.name,
    description: req.description,
    eventType: req.eventType,
    priority: req.priority,
    status: "draft",
    audienceId: req.audienceId,
    audienceName: req.audienceName,
    scheduleType: req.scheduleType,
    startAt: req.startAt,
    endAt: req.endAt,
    rrule: req.rrule,
    rruleDurationMinutes: req.rruleDurationMinutes,
    displayTimezone: req.displayTimezone || "Asia/Seoul",
    metadata: req.metadata ?? {},
    payloadSchemaVersion: req.payloadSchemaVersion ?? null,
    stickyMembership: req.stickyMembership ?? false,
    rewards: req.rewards,
    participantCount: 0,
    createdBy: "admin@liveops.dev",
    createdAt: now,
    updatedAt: now,
  };
  events = [event, ...events];
  return event;
}

export function updateEvent(
  id: string,
  req: UpdateEventRequest,
): LiveEvent | undefined {
  const index = events.findIndex((e) => e.id === id);
  if (index === -1) return undefined;
  const updated: LiveEvent = {
    ...events[index],
    ...req,
    updatedAt: new Date().toISOString(),
  };
  events = events.map((e) => (e.id === id ? updated : e));
  return updated;
}

export function deleteEvent(id: string): boolean {
  const target = events.find((e) => e.id === id);
  if (!target) return false;
  if (target.status !== "draft") return false;
  const len = events.length;
  events = events.filter((e) => e.id !== id);
  return events.length < len;
}

export function duplicateEvent(id: string): LiveEvent | undefined {
  const source = events.find((e) => e.id === id);
  if (!source) return undefined;
  const now = new Date().toISOString();
  const newEvent: LiveEvent = {
    ...source,
    id: `evt-${String(nextId++).padStart(3, "0")}`,
    name: `${source.name} (복사본)`,
    status: "draft",
    startAt: null,
    endAt: null,
    participantCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  events = [newEvent, ...events];
  return newEvent;
}

export function addStateLog(entry: Omit<EventStateLogEntry, "id" | "createdAt">): EventStateLogEntry {
  const log: EventStateLogEntry = {
    ...entry,
    id: `log-${String(++nextLogId).padStart(3, "0")}`,
    createdAt: new Date().toISOString(),
  };
  EVENT_STATE_LOG = [...EVENT_STATE_LOG, log];
  return log;
}

export function getStateLog(eventId: string): EventStateLogEntry[] {
  return EVENT_STATE_LOG.filter((l) => l.eventId === eventId);
}

export function transitionEventStatus(
  id: string,
  action: TransitionAction,
  actorId: string,
  reason?: string,
  newEndAt?: string,
): { event: LiveEvent; log: EventStateLogEntry } | { error: string } {
  const event = events.find((e) => e.id === id);
  if (!event) return { error: "이벤트를 찾을 수 없습니다." };

  const transitions = TRANSITION_MAP[event.status];
  if (!transitions) return { error: `현재 상태(${event.status})에서는 전환할 수 없습니다.` };

  const toStatus = transitions[action];
  if (!toStatus) return { error: `현재 상태(${event.status})에서 '${action}' 액션을 수행할 수 없습니다.` };

  const fromStatus = event.status;

  // For extend action, update endAt
  if (action === "extend" && newEndAt) {
    event.endAt = newEndAt;
  }

  event.status = toStatus;
  event.updatedAt = new Date().toISOString();

  events = events.map((e) => (e.id === id ? event : e));

  const log = addStateLog({
    eventId: id,
    fromStatus,
    toStatus,
    actorId,
    reason: reason ?? null,
  });

  return { event, log };
}
