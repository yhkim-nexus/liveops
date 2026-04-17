import type {
  PushCampaign,
  CampaignStatus,
  AudienceType,
  PlatformFilter,
  CreateCampaignRequest,
  UpdateCampaignRequest,
  PushSettings,
} from "../types/push";

// ---------------------------------------------------------------------------
// 내부 헬퍼
// ---------------------------------------------------------------------------

function makeSentStats(sentCount: number): Pick<
  PushCampaign,
  "sentCount" | "deliveredCount" | "openedCount" | "failedCount"
> {
  const deliveredCount = Math.floor(sentCount * 0.95);
  const openedCount = Math.floor(deliveredCount * (0.05 + Math.random() * 0.1));
  const failedCount = Math.floor(sentCount * (0.01 + Math.random() * 0.04));
  return { sentCount, deliveredCount, openedCount, failedCount };
}

const ZERO_STATS: Pick<
  PushCampaign,
  "sentCount" | "deliveredCount" | "openedCount" | "failedCount"
> = { sentCount: 0, deliveredCount: 0, openedCount: 0, failedCount: 0 };

// ---------------------------------------------------------------------------
// 목(mock) 데이터 — 15개 캠페인, 모든 상태 커버
// ---------------------------------------------------------------------------

let campaigns: PushCampaign[] = [
  // 1. sent / all / immediate / normal
  {
    id: "campaign-1",
    name: "봄맞이 복귀 이벤트 알림",
    title: "봄맞이 복귀 이벤트가 시작됐어요! 🌸",
    body: "오랜만이에요! 돌아온 기념으로 특별 보상을 드려요. 지금 바로 확인하세요.",
    deepLinkUrl: "app://events/spring-comeback",
    imageUrl: "https://cdn.example.com/push/spring-event.jpg",
    customData: { eventId: "EVT-001", type: "comeback" },
    audienceType: "all",
    audienceIds: null,
    audienceName: null,
    playerIds: null,
    pushOptInFilter: true,
    platformFilter: "all",
    scheduleType: "immediate",
    scheduledAt: null,
    timezone: "Asia/Seoul",
    rrule: null,
    usePlayerTimezone: false,
    priority: "normal",
    estimatedReach: 48320,
    status: "sent",
    createdBy: "admin@example.com",
    approvedBy: "manager@example.com",
    rejectedBy: null,
    rejectionReason: null,
    ...makeSentStats(48320),
    createdAt: "2026-03-01T09:00:00.000Z",
    updatedAt: "2026-03-01T10:15:00.000Z",
    sentAt: "2026-03-01T10:15:00.000Z",
  },

  // 2. sent / audience(활성 회원) / scheduled / normal
  {
    id: "campaign-2",
    name: "신규 시즌 3 오픈 알림",
    title: "시즌 3가 열렸습니다! ⚔️",
    body: "새로운 콘텐츠와 보상이 가득한 시즌 3를 지금 시작해보세요. 선착순 보상 증정!",
    deepLinkUrl: "app://season/3",
    imageUrl: "https://cdn.example.com/push/season3.jpg",
    customData: { seasonId: "S3", bonus: true },
    audienceType: "audience",
    audienceIds: ["seg-active"],
    audienceName: "활성 회원",
    playerIds: null,
    pushOptInFilter: true,
    platformFilter: "all",
    scheduleType: "scheduled",
    scheduledAt: "2026-03-10T01:00:00.000Z",
    timezone: "Asia/Seoul",
    rrule: null,
    usePlayerTimezone: false,
    priority: "normal",
    estimatedReach: 31500,
    status: "sent",
    createdBy: "admin@example.com",
    approvedBy: "manager@example.com",
    rejectedBy: null,
    rejectionReason: null,
    ...makeSentStats(31500),
    createdAt: "2026-03-08T14:00:00.000Z",
    updatedAt: "2026-03-10T01:00:30.000Z",
    sentAt: "2026-03-10T01:00:30.000Z",
  },

  // 3. sent / all / immediate / critical
  {
    id: "campaign-3",
    name: "긴급 점검 공지",
    title: "[긴급] 서버 점검 안내",
    body: "2026-03-15 02:00~04:00(KST) 동안 서버 점검이 진행됩니다. 이용에 불편을 드려 죄송합니다.",
    deepLinkUrl: null,
    imageUrl: null,
    customData: { type: "maintenance", startAt: "2026-03-15T17:00:00Z" },
    audienceType: "all",
    audienceIds: null,
    audienceName: null,
    playerIds: null,
    pushOptInFilter: false,
    platformFilter: "all",
    scheduleType: "immediate",
    scheduledAt: null,
    timezone: "Asia/Seoul",
    rrule: null,
    usePlayerTimezone: false,
    priority: "critical",
    estimatedReach: 52000,
    status: "sent",
    createdBy: "ops@example.com",
    approvedBy: "manager@example.com",
    rejectedBy: null,
    rejectionReason: null,
    ...makeSentStats(52000),
    createdAt: "2026-03-14T20:00:00.000Z",
    updatedAt: "2026-03-14T20:05:00.000Z",
    sentAt: "2026-03-14T20:05:00.000Z",
  },

  // 4. scheduled / audience(활성 회원) / recurring / normal
  {
    id: "campaign-4",
    name: "주간 미션 리마인더",
    title: "이번 주 미션 마감이 다가오고 있어요! ⏰",
    body: "아직 이번 주 미션을 완료하지 않으셨나요? 지금 접속하고 보상을 챙기세요!",
    deepLinkUrl: "app://missions/weekly",
    imageUrl: null,
    customData: null,
    audienceType: "audience",
    audienceIds: ["seg-active"],
    audienceName: "활성 회원",
    playerIds: null,
    pushOptInFilter: true,
    platformFilter: "all",
    scheduleType: "recurring",
    scheduledAt: "2026-03-28T10:00:00.000Z",
    timezone: "Asia/Seoul",
    rrule: "FREQ=WEEKLY;BYDAY=FR;BYHOUR=10;BYMINUTE=0",
    usePlayerTimezone: false,
    priority: "normal",
    estimatedReach: 29800,
    status: "scheduled",
    createdBy: "admin@example.com",
    approvedBy: "manager@example.com",
    rejectedBy: null,
    rejectionReason: null,
    ...ZERO_STATS,
    createdAt: "2026-03-20T11:00:00.000Z",
    updatedAt: "2026-03-21T09:00:00.000Z",
    sentAt: null,
  },

  // 5. approved / audience(고래 회원) / scheduled / normal
  {
    id: "campaign-5",
    name: "VIP 전용 보상 알림",
    title: "VIP 회원만을 위한 특별 보상 🎁",
    body: "소중한 VIP 회원님께 감사의 선물을 드려요. 기간 한정이니 놓치지 마세요!",
    deepLinkUrl: "app://rewards/vip",
    imageUrl: "https://cdn.example.com/push/vip-reward.jpg",
    customData: { tier: "whale", rewardId: "RWD-VIP-001" },
    audienceType: "audience",
    audienceIds: ["seg-whale"],
    audienceName: "고래 회원",
    playerIds: null,
    pushOptInFilter: true,
    platformFilter: "all",
    scheduleType: "scheduled",
    scheduledAt: "2026-04-01T09:00:00.000Z",
    timezone: "Asia/Seoul",
    rrule: null,
    usePlayerTimezone: false,
    priority: "normal",
    estimatedReach: 1250,
    status: "approved",
    createdBy: "admin@example.com",
    approvedBy: "manager@example.com",
    rejectedBy: null,
    rejectionReason: null,
    ...ZERO_STATS,
    createdAt: "2026-03-25T13:00:00.000Z",
    updatedAt: "2026-03-26T10:00:00.000Z",
    sentAt: null,
  },

  // 6. pending_approval / all / scheduled / normal
  {
    id: "campaign-6",
    name: "시즌 패스 할인 알림",
    title: "시즌 패스 30% 할인! 오늘까지 🛒",
    body: "시즌 패스를 지금 구매하면 30% 할인! 오늘 자정에 종료되는 특가를 놓치지 마세요.",
    deepLinkUrl: "app://shop/season-pass",
    imageUrl: "https://cdn.example.com/push/season-pass-sale.jpg",
    customData: { discountRate: 30, productId: "SP-001" },
    audienceType: "all",
    audienceIds: null,
    audienceName: null,
    playerIds: null,
    pushOptInFilter: true,
    platformFilter: "all",
    scheduleType: "scheduled",
    scheduledAt: "2026-04-02T12:00:00.000Z",
    timezone: "Asia/Seoul",
    rrule: null,
    usePlayerTimezone: false,
    priority: "normal",
    estimatedReach: 50200,
    status: "pending_approval",
    createdBy: "admin@example.com",
    approvedBy: null,
    rejectedBy: null,
    rejectionReason: null,
    ...ZERO_STATS,
    createdAt: "2026-03-26T16:00:00.000Z",
    updatedAt: "2026-03-26T16:00:00.000Z",
    sentAt: null,
  },

  // 7. draft / audience(휴면 회원) / scheduled / normal
  {
    id: "campaign-7",
    name: "복귀 플레이어 환영",
    title: "오랫동안 보고 싶었어요 👋",
    body: "30일 이상 쉬셨군요! 복귀 기념 선물 꾸러미를 준비했어요. 지금 돌아오세요.",
    deepLinkUrl: "app://events/comeback",
    imageUrl: "https://cdn.example.com/push/comeback.jpg",
    customData: { type: "reengagement", daysInactive: 30 },
    audienceType: "audience",
    audienceIds: ["seg-dormant"],
    audienceName: "휴면 회원",
    playerIds: null,
    pushOptInFilter: true,
    platformFilter: "all",
    scheduleType: "scheduled",
    scheduledAt: "2026-04-05T10:00:00.000Z",
    timezone: "Asia/Seoul",
    rrule: null,
    usePlayerTimezone: true,
    priority: "normal",
    estimatedReach: 8900,
    status: "draft",
    createdBy: "admin@example.com",
    approvedBy: null,
    rejectedBy: null,
    rejectionReason: null,
    ...ZERO_STATS,
    createdAt: "2026-03-27T09:00:00.000Z",
    updatedAt: "2026-03-27T09:00:00.000Z",
    sentAt: null,
  },

  // 8. sending / audience(활성 회원) / immediate / normal
  {
    id: "campaign-8",
    name: "이벤트 종료 임박 알림",
    title: "이벤트가 곧 종료돼요! 서둘러요 🔥",
    body: "봄 이벤트가 24시간 후 종료됩니다. 아직 보상을 못 받으셨다면 지금 바로!",
    deepLinkUrl: "app://events/spring",
    imageUrl: null,
    customData: { eventId: "EVT-SPRING-2026", hoursLeft: 24 },
    audienceType: "audience",
    audienceIds: ["seg-active"],
    audienceName: "활성 회원",
    playerIds: null,
    pushOptInFilter: true,
    platformFilter: "all",
    scheduleType: "immediate",
    scheduledAt: null,
    timezone: "Asia/Seoul",
    rrule: null,
    usePlayerTimezone: false,
    priority: "normal",
    estimatedReach: 30100,
    status: "sending",
    createdBy: "admin@example.com",
    approvedBy: "manager@example.com",
    rejectedBy: null,
    rejectionReason: null,
    ...ZERO_STATS,
    createdAt: "2026-03-27T08:00:00.000Z",
    updatedAt: "2026-03-27T08:30:00.000Z",
    sentAt: null,
  },

  // 9. failed / all / immediate / normal
  {
    id: "campaign-9",
    name: "업데이트 안내",
    title: "새 버전이 업데이트됐어요! 🆕",
    body: "버그 수정 및 성능 개선이 포함된 새 버전이 출시됐습니다. 지금 업데이트하세요.",
    deepLinkUrl: "app://update",
    imageUrl: null,
    customData: { version: "3.2.1", forceUpdate: false },
    audienceType: "all",
    audienceIds: null,
    audienceName: null,
    playerIds: null,
    pushOptInFilter: false,
    platformFilter: "all",
    scheduleType: "immediate",
    scheduledAt: null,
    timezone: "Asia/Seoul",
    rrule: null,
    usePlayerTimezone: false,
    priority: "normal",
    estimatedReach: 52000,
    status: "failed",
    createdBy: "ops@example.com",
    approvedBy: "manager@example.com",
    rejectedBy: null,
    rejectionReason: null,
    sentCount: 0,
    deliveredCount: 0,
    openedCount: 0,
    failedCount: 52000,
    createdAt: "2026-03-22T06:00:00.000Z",
    updatedAt: "2026-03-22T06:02:00.000Z",
    sentAt: null,
  },

  // 10. cancelled / audience / scheduled / normal
  {
    id: "campaign-10",
    name: "대회 참가 초대",
    title: "챔피언십 대회에 참가하세요! 🏆",
    body: "이번 주말 열리는 챔피언십 대회에 도전해보세요. 우승자에게 특별 보상 증정!",
    deepLinkUrl: "app://tournament/championship",
    imageUrl: "https://cdn.example.com/push/tournament.jpg",
    customData: { tournamentId: "CHAMP-2026-Q1" },
    audienceType: "audience",
    audienceIds: ["seg-competitive"],
    audienceName: "경쟁전 회원",
    playerIds: null,
    pushOptInFilter: true,
    platformFilter: "all",
    scheduleType: "scheduled",
    scheduledAt: "2026-03-25T09:00:00.000Z",
    timezone: "Asia/Seoul",
    rrule: null,
    usePlayerTimezone: false,
    priority: "normal",
    estimatedReach: 15600,
    status: "cancelled",
    createdBy: "admin@example.com",
    approvedBy: "manager@example.com",
    rejectedBy: null,
    rejectionReason: null,
    ...ZERO_STATS,
    createdAt: "2026-03-20T10:00:00.000Z",
    updatedAt: "2026-03-24T17:00:00.000Z",
    sentAt: null,
  },

  // 11. sent / all / recurring / normal
  {
    id: "campaign-11",
    name: "데일리 보상 리마인더",
    title: "오늘의 데일리 보상 받으셨나요? 🎀",
    body: "매일 접속하면 쌓이는 데일리 보상! 오늘도 잊지 말고 챙기세요.",
    deepLinkUrl: "app://rewards/daily",
    imageUrl: null,
    customData: null,
    audienceType: "all",
    audienceIds: null,
    audienceName: null,
    playerIds: null,
    pushOptInFilter: true,
    platformFilter: "all",
    scheduleType: "recurring",
    scheduledAt: "2026-03-01T10:00:00.000Z",
    timezone: "Asia/Seoul",
    rrule: "FREQ=DAILY;BYHOUR=10;BYMINUTE=0",
    usePlayerTimezone: false,
    priority: "normal",
    estimatedReach: 48000,
    status: "sent",
    createdBy: "admin@example.com",
    approvedBy: "manager@example.com",
    rejectedBy: null,
    rejectionReason: null,
    ...makeSentStats(12800),
    createdAt: "2026-02-28T12:00:00.000Z",
    updatedAt: "2026-03-27T10:00:30.000Z",
    sentAt: "2026-03-27T10:00:30.000Z",
  },

  // 12. draft / all / scheduled / normal
  {
    id: "campaign-12",
    name: "친구 초대 캠페인",
    title: "친구를 초대하고 함께 즐겨요! 👫",
    body: "친구를 초대하면 두 분 모두에게 특별 보상을 드려요. 지금 초대 링크를 공유하세요.",
    deepLinkUrl: "app://social/invite",
    imageUrl: "https://cdn.example.com/push/friend-invite.jpg",
    customData: { campaignType: "referral" },
    audienceType: "all",
    audienceIds: null,
    audienceName: null,
    playerIds: null,
    pushOptInFilter: true,
    platformFilter: "all",
    scheduleType: "scheduled",
    scheduledAt: "2026-04-10T10:00:00.000Z",
    timezone: "Asia/Seoul",
    rrule: null,
    usePlayerTimezone: false,
    priority: "normal",
    estimatedReach: 50200,
    status: "draft",
    createdBy: "admin@example.com",
    approvedBy: null,
    rejectedBy: null,
    rejectionReason: null,
    ...ZERO_STATS,
    createdAt: "2026-03-27T10:00:00.000Z",
    updatedAt: "2026-03-27T10:00:00.000Z",
    sentAt: null,
  },

  // 13. sent / audience(결제자) / immediate / normal
  {
    id: "campaign-13",
    name: "결제 감사 알림",
    title: "구매해주셔서 감사합니다 💙",
    body: "소중한 구매에 감사드립니다. 추가 감사 보너스가 우편함에 전달됐으니 확인해보세요!",
    deepLinkUrl: "app://mailbox",
    imageUrl: null,
    customData: { type: "purchase_thank_you" },
    audienceType: "audience",
    audienceIds: ["seg-payers"],
    audienceName: "결제자",
    playerIds: null,
    pushOptInFilter: false,
    platformFilter: "all",
    scheduleType: "immediate",
    scheduledAt: null,
    timezone: "Asia/Seoul",
    rrule: null,
    usePlayerTimezone: false,
    priority: "normal",
    estimatedReach: 4300,
    status: "sent",
    createdBy: "admin@example.com",
    approvedBy: "manager@example.com",
    rejectedBy: null,
    rejectionReason: null,
    ...makeSentStats(4300),
    createdAt: "2026-03-15T14:00:00.000Z",
    updatedAt: "2026-03-15T14:01:00.000Z",
    sentAt: "2026-03-15T14:01:00.000Z",
  },

  // 14. pending_approval / audience(활성 회원) / scheduled / normal
  {
    id: "campaign-14",
    name: "신규 콘텐츠 안내",
    title: "새로운 콘텐츠가 추가됐어요! 🎮",
    body: "새로운 스테이지, 캐릭터, 아이템이 추가됐습니다. 지금 업데이트하고 먼저 경험해보세요.",
    deepLinkUrl: "app://contents/new",
    imageUrl: "https://cdn.example.com/push/new-content.jpg",
    customData: { contentPatch: "v3.3.0" },
    audienceType: "audience",
    audienceIds: ["seg-active"],
    audienceName: "활성 회원",
    playerIds: null,
    pushOptInFilter: true,
    platformFilter: "all",
    scheduleType: "scheduled",
    scheduledAt: "2026-04-03T11:00:00.000Z",
    timezone: "Asia/Seoul",
    rrule: null,
    usePlayerTimezone: false,
    priority: "normal",
    estimatedReach: 31500,
    status: "pending_approval",
    createdBy: "admin@example.com",
    approvedBy: null,
    rejectedBy: null,
    rejectionReason: null,
    ...ZERO_STATS,
    createdAt: "2026-03-27T11:00:00.000Z",
    updatedAt: "2026-03-27T11:00:00.000Z",
    sentAt: null,
  },

  // 15. sent / all / immediate / critical
  {
    id: "campaign-15",
    name: "점검 완료 알림",
    title: "[안내] 서버 점검이 완료됐습니다 ✅",
    body: "서버 점검이 정상적으로 완료됐습니다. 접속해주셔서 감사합니다. 보상 우편함을 확인해보세요!",
    deepLinkUrl: "app://mailbox",
    imageUrl: null,
    customData: { type: "maintenance_complete" },
    audienceType: "all",
    audienceIds: null,
    audienceName: null,
    playerIds: null,
    pushOptInFilter: false,
    platformFilter: "all",
    scheduleType: "immediate",
    scheduledAt: null,
    timezone: "Asia/Seoul",
    rrule: null,
    usePlayerTimezone: false,
    priority: "critical",
    estimatedReach: 52000,
    status: "sent",
    createdBy: "ops@example.com",
    approvedBy: "manager@example.com",
    rejectedBy: null,
    rejectionReason: null,
    ...makeSentStats(49800),
    createdAt: "2026-03-15T04:05:00.000Z",
    updatedAt: "2026-03-15T04:06:00.000Z",
    sentAt: "2026-03-15T04:06:00.000Z",
  },
];

// ---------------------------------------------------------------------------
// ID 카운터
// ---------------------------------------------------------------------------

let nextId = campaigns.length + 1;

function generateId(): string {
  return `campaign-${nextId++}`;
}

// ---------------------------------------------------------------------------
// 필터/정렬 타입
// ---------------------------------------------------------------------------

export interface GetCampaignsFilters {
  status?: CampaignStatus;
  search?: string;
  sortBy?: keyof PushCampaign;
  sortOrder?: "asc" | "desc";
}

// ---------------------------------------------------------------------------
// CRUD 함수
// ---------------------------------------------------------------------------

/**
 * 전체 캠페인 목록을 반환한다. 상태 필터, 이름 검색, 정렬을 지원한다.
 */
export function getAllCampaigns(filters: GetCampaignsFilters = {}): PushCampaign[] {
  let result = [...campaigns];

  if (filters.status) {
    result = result.filter((c) => c.status === filters.status);
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter((c) => c.name.toLowerCase().includes(q));
  }

  if (filters.sortBy) {
    const key = filters.sortBy;
    const dir = filters.sortOrder === "desc" ? -1 : 1;
    result.sort((a, b) => {
      const av = a[key] ?? "";
      const bv = b[key] ?? "";
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
  } else {
    // 기본: 최신순
    result.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  return result;
}

/**
 * ID로 단일 캠페인을 반환한다.
 */
export function getCampaign(id: string): PushCampaign | undefined {
  return campaigns.find((c) => c.id === id);
}

/**
 * 새 캠페인을 생성한다. 초기 상태는 항상 "draft"다.
 */
export function createCampaign(data: CreateCampaignRequest): PushCampaign {
  const now = new Date().toISOString();
  const campaign: PushCampaign = {
    ...data,
    id: generateId(),
    estimatedReach: estimateReach(data.audienceType, data.audienceIds, data.platformFilter),
    status: "draft",
    createdBy: "admin@example.com",
    approvedBy: null,
    rejectedBy: null,
    rejectionReason: null,
    ...ZERO_STATS,
    createdAt: now,
    updatedAt: now,
    sentAt: null,
  };
  campaigns.push(campaign);
  return campaign;
}

/**
 * draft 상태의 캠페인을 수정한다.
 */
export function updateCampaign(
  id: string,
  data: UpdateCampaignRequest
): PushCampaign | null {
  const idx = campaigns.findIndex((c) => c.id === id);
  if (idx === -1) return null;

  const existing = campaigns[idx];
  const updated: PushCampaign = {
    ...existing,
    ...data,
    updatedAt: new Date().toISOString(),
  };
  campaigns[idx] = updated;
  return updated;
}

/**
 * draft 상태의 캠페인만 삭제할 수 있다.
 */
export function deleteCampaign(id: string): boolean {
  const idx = campaigns.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  if (campaigns[idx].status !== "draft") return false;

  campaigns.splice(idx, 1);
  return true;
}

/**
 * 기존 캠페인을 복사한다. 새 캠페인의 이름에 "(복사)" 접미사가 붙고 상태는 "draft"가 된다.
 */
export function duplicateCampaign(id: string): PushCampaign | null {
  const source = getCampaign(id);
  if (!source) return null;

  const now = new Date().toISOString();
  const copy: PushCampaign = {
    ...source,
    id: generateId(),
    name: `${source.name} (복사)`,
    status: "draft",
    approvedBy: null,
    rejectedBy: null,
    rejectionReason: null,
    ...ZERO_STATS,
    createdAt: now,
    updatedAt: now,
    sentAt: null,
  };
  campaigns.push(copy);
  return copy;
}

// ---------------------------------------------------------------------------
// 상태 전이
// ---------------------------------------------------------------------------

export type TransitionAction = "submit" | "approve" | "reject" | "cancel";

export interface TransitionOptions {
  /** reject 액션 시 필수 */
  reason?: string;
  /** approve 시 수행자 */
  by?: string;
}

/**
 * 캠페인 상태를 전이한다.
 *
 * - submit  : draft -> pending_approval
 * - approve : pending_approval -> approved (or scheduled if scheduledAt exists)
 * - reject  : pending_approval -> draft (reason 필수)
 * - cancel  : approved | scheduled | sending -> cancelled
 */
export function transitionStatus(
  id: string,
  action: TransitionAction,
  options: TransitionOptions = {}
): PushCampaign | null {
  const idx = campaigns.findIndex((c) => c.id === id);
  if (idx === -1) return null;

  const campaign = { ...campaigns[idx] };
  const now = new Date().toISOString();

  switch (action) {
    case "submit":
      if (campaign.status !== "draft") return null;
      campaign.status = "pending_approval";
      campaign.updatedAt = now;
      break;

    case "approve":
      if (campaign.status !== "pending_approval") return null;
      campaign.approvedBy = options.by ?? "manager@example.com";
      campaign.status = campaign.scheduledAt ? "scheduled" : "approved";
      campaign.updatedAt = now;
      break;

    case "reject":
      if (campaign.status !== "pending_approval") return null;
      if (!options.reason) return null;
      campaign.rejectedBy = options.by ?? "manager@example.com";
      campaign.rejectionReason = options.reason;
      campaign.status = "draft";
      campaign.updatedAt = now;
      break;

    case "cancel":
      if (!["approved", "scheduled", "sending"].includes(campaign.status)) return null;
      campaign.status = "cancelled";
      campaign.updatedAt = now;
      break;

    default:
      return null;
  }

  campaigns[idx] = campaign;
  return campaign;
}

// ---------------------------------------------------------------------------
// 도달 범위 추정
// ---------------------------------------------------------------------------

/** 세그먼트별 기준 도달 수 */
const SEGMENT_REACH: Record<string, number> = {
  "seg-active": 31500,
  "seg-whale": 1250,
  "seg-dormant": 8900,
  "seg-payers": 4300,
  "seg-competitive": 15600,
};

const PLATFORM_RATIO: Record<string, number> = {
  all: 1,
  ios: 0.42,
  android: 0.58,
};

/**
 * 대상 조건에 따른 예상 도달 범위를 반환한다 (mock 계산).
 */
export function estimateReach(
  audienceType: AudienceType,
  audienceIds: string[] | null,
  platformFilter: PlatformFilter
): number {
  const platformRatio = PLATFORM_RATIO[platformFilter] ?? 1;

  if (audienceType === "all") {
    return Math.floor(52000 * platformRatio);
  }

  if (audienceType === "individual") {
    return 1;
  }

  // audience 타입: audienceIds 기반 합산
  const total =
    audienceIds?.reduce((sum, segId) => sum + (SEGMENT_REACH[segId] ?? 5000), 0) ??
    5000;

  return Math.floor(total * platformRatio);
}

// ---------------------------------------------------------------------------
// Push 설정
// ---------------------------------------------------------------------------

let pushSettings: PushSettings = {
  dailyMaxPerPlayer: 3,
  dailyMaxMin: 1,
  dailyMaxMax: 10,
};

export function getPushSettings(): PushSettings {
  return { ...pushSettings };
}

export function updatePushSettings(data: Partial<PushSettings>): PushSettings {
  pushSettings = { ...pushSettings, ...data };
  return { ...pushSettings };
}
