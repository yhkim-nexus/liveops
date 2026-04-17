export type CampaignStatus =
  | "draft"
  | "pending_approval"
  | "approved"
  | "scheduled"
  | "sending"
  | "sent"
  | "failed"
  | "cancelled";

export type CampaignPriority = "normal" | "critical";
export type AudienceType = "all" | "audience" | "individual";
export type PlatformFilter = "all" | "ios" | "android";
export type PushScheduleType = "immediate" | "scheduled" | "recurring";

export interface PushCampaign {
  id: string;
  name: string;
  /** 최대 50자 */
  title: string;
  /** 최대 200자 */
  body: string;
  deepLinkUrl: string | null;
  imageUrl: string | null;
  customData: Record<string, unknown> | null;
  audienceType: AudienceType;
  audienceIds: string[] | null;
  audienceName: string | null;
  playerIds: string[] | null;
  pushOptInFilter: boolean;
  platformFilter: PlatformFilter;
  scheduleType: PushScheduleType;
  scheduledAt: string | null;
  timezone: string;
  rrule: string | null;
  usePlayerTimezone: boolean;
  priority: CampaignPriority;
  estimatedReach: number;
  status: CampaignStatus;
  createdBy: string;
  approvedBy: string | null;
  rejectedBy: string | null;
  rejectionReason: string | null;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  failedCount: number;
  createdAt: string;
  updatedAt: string;
  sentAt: string | null;
}

export type CreateCampaignRequest = Pick<
  PushCampaign,
  | "name"
  | "title"
  | "body"
  | "deepLinkUrl"
  | "imageUrl"
  | "customData"
  | "audienceType"
  | "audienceIds"
  | "audienceName"
  | "playerIds"
  | "pushOptInFilter"
  | "platformFilter"
  | "scheduleType"
  | "scheduledAt"
  | "timezone"
  | "rrule"
  | "usePlayerTimezone"
  | "priority"
>;

export type UpdateCampaignRequest = Partial<CreateCampaignRequest>;

export interface PushSettings {
  /** 플레이어당 일일 최대 발송 횟수. 기본값: 3 */
  dailyMaxPerPlayer: number;
  /** 최솟값: 1 */
  dailyMaxMin: number;
  /** 최댓값: 10 */
  dailyMaxMax: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: { generatedAt: string };
}

export const CAMPAIGN_STATUS_OPTIONS: { value: CampaignStatus; label: string }[] = [
  { value: "draft", label: "초안" },
  { value: "pending_approval", label: "승인 대기" },
  { value: "approved", label: "승인됨" },
  { value: "scheduled", label: "예약됨" },
  { value: "sending", label: "발송 중" },
  { value: "sent", label: "발송 완료" },
  { value: "failed", label: "실패" },
  { value: "cancelled", label: "취소됨" },
];

export const PRIORITY_OPTIONS: { value: CampaignPriority; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "critical", label: "Critical" },
];

export const PLATFORM_OPTIONS: { value: PlatformFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "ios", label: "iOS" },
  { value: "android", label: "Android" },
];

export const SCHEDULE_TYPE_OPTIONS: { value: PushScheduleType; label: string }[] = [
  { value: "immediate", label: "즉시 발송" },
  { value: "scheduled", label: "예약 발송" },
  { value: "recurring", label: "반복 발송" },
];
