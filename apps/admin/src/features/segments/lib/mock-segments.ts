import type {
  Audience,
  AudienceCondition,
  ConditionGroup,
  ComputedPropertyRule,
  CreateAudienceRequest,
  UpdateAudienceRequest,
  PropertyDefinition,
  EventDefinition,
  FilterOperator,
} from "../types/segment";
import { OPERATOR_LABELS } from "../types/segment";

// ── Property Definitions ──────────────────────────────────────────────

export const DEFAULT_PROPERTIES: PropertyDefinition[] = [
  {
    key: "countryCode",
    label: "국가 코드",
    category: "default",
    valueType: "string",
    description: "ISO 3166-1 alpha-2 국가 코드 (예: KR, US, JP)",
  },
  {
    key: "platform",
    label: "플랫폼",
    category: "default",
    valueType: "string",
    description: "ios, android, pc, console, web",
  },
  {
    key: "os",
    label: "OS",
    category: "default",
    valueType: "string",
    description: "운영체제 (예: iOS 17.0, Android 14)",
  },
  {
    key: "appVersion",
    label: "앱 버전",
    category: "default",
    valueType: "string",
    description: "클라이언트 앱 버전 (예: 1.2.3)",
  },
  {
    key: "createTime",
    label: "가입 시각",
    category: "default",
    valueType: "string",
    description: "플레이어 최초 가입 타임스탬프",
  },
  {
    key: "updateTime",
    label: "최종 업데이트 시각",
    category: "default",
    valueType: "string",
    description: "플레이어 속성 최종 업데이트 타임스탬프",
  },
];

export const COMPUTED_PROPERTIES: PropertyDefinition[] = [
  {
    key: "sessionCount",
    label: "세션 횟수",
    category: "computed",
    valueType: "numeric",
    description: "총 세션 시작 횟수",
    computedRule: {
      eventName: "session_start",
      aggregation: "count",
    },
  },
  {
    key: "sessionSeenLast",
    label: "마지막 세션",
    category: "computed",
    valueType: "string",
    description: "마지막 세션 시작 타임스탬프",
    computedRule: {
      eventName: "session_start",
      aggregation: "seen_last",
    },
  },
  {
    key: "purchaseCompletedCount",
    label: "결제 횟수",
    category: "computed",
    valueType: "numeric",
    description: "총 결제 완료 횟수",
    computedRule: {
      eventName: "purchase_completed",
      aggregation: "count",
    },
  },
  {
    key: "purchaseCompletedSeenLast",
    label: "마지막 결제",
    category: "computed",
    valueType: "string",
    description: "마지막 결제 완료 타임스탬프",
    computedRule: {
      eventName: "purchase_completed",
      aggregation: "seen_last",
    },
  },
  {
    key: "purchaseCompletedValueSum",
    label: "총 결제 금액",
    category: "computed",
    valueType: "numeric",
    description: "결제 금액 합계",
    computedRule: {
      eventName: "purchase_completed",
      aggregation: "value_sum",
      parameterName: "amount",
    },
  },
];

let customProperties: PropertyDefinition[] = [
  {
    key: "vipTier",
    label: "VIP 등급",
    category: "custom",
    valueType: "string",
    description: "VIP 등급 (bronze, silver, gold, platinum)",
  },
  {
    key: "preferredLanguage",
    label: "선호 언어",
    category: "custom",
    valueType: "string",
    description: "플레이어 선호 언어 (예: ko, en, ja)",
  },
];

export function getAllProperties(): PropertyDefinition[] {
  return [...DEFAULT_PROPERTIES, ...COMPUTED_PROPERTIES, ...customProperties];
}

export function getPropertiesByCategory(
  category: PropertyDefinition["category"],
): PropertyDefinition[] {
  switch (category) {
    case "default":
      return [...DEFAULT_PROPERTIES];
    case "computed":
      return [...COMPUTED_PROPERTIES];
    case "custom":
      return [...customProperties];
  }
}

export function createCustomProperty(
  prop: Omit<PropertyDefinition, "category">,
): PropertyDefinition {
  const newProp: PropertyDefinition = { ...prop, category: "custom" };
  customProperties = [...customProperties, newProp];
  return newProp;
}

export function deleteCustomProperty(key: string): boolean {
  const len = customProperties.length;
  customProperties = customProperties.filter((p) => p.key !== key);
  return customProperties.length < len;
}

// ── Event Taxonomy ────────────────────────────────────────────────────

let eventDefinitions: EventDefinition[] = [
  {
    name: "session_start",
    displayName: "세션 시작",
    description: "플레이어가 게임에 접속하여 세션을 시작할 때 발생",
    category: "builtin",
    parameters: [
      { name: "device_id", type: "string", required: true },
      { name: "session_id", type: "string", required: true },
    ],
    computedProperties: ["sessionCount", "sessionSeenLast"],
    computedRules: [
      { id: "cr-001", propertyKey: "sessionCount", eventName: "session_start", aggregationType: "count" },
      { id: "cr-002", propertyKey: "sessionSeenLast", eventName: "session_start", aggregationType: "seen_last" },
    ],
    createdAt: "2026-02-01T00:00:00Z",
  },
  {
    name: "session_end",
    displayName: "세션 종료",
    description: "플레이어 세션이 종료될 때 발생",
    category: "builtin",
    parameters: [
      { name: "session_id", type: "string", required: true },
      { name: "duration_seconds", type: "number", required: true },
    ],
    computedProperties: [],
    computedRules: [],
    createdAt: "2026-02-01T00:00:00Z",
  },
  {
    name: "purchase_completed",
    displayName: "결제 완료",
    description: "인앱 결제가 완료되었을 때 발생",
    category: "builtin",
    parameters: [
      { name: "product_id", type: "string", required: true },
      { name: "amount", type: "number", required: true },
      { name: "currency", type: "string", required: true },
    ],
    computedProperties: [
      "purchaseCompletedCount",
      "purchaseCompletedSeenLast",
      "purchaseCompletedValueSum",
    ],
    computedRules: [
      { id: "cr-003", propertyKey: "purchaseCompletedCount", eventName: "purchase_completed", aggregationType: "count" },
      { id: "cr-004", propertyKey: "purchaseCompletedSeenLast", eventName: "purchase_completed", aggregationType: "seen_last" },
      { id: "cr-005", propertyKey: "purchaseCompletedValueSum", eventName: "purchase_completed", aggregationType: "value_sum", parameterName: "amount" },
    ],
    createdAt: "2026-02-01T00:00:00Z",
  },
  {
    name: "level_up",
    displayName: "레벨 업",
    description: "플레이어가 레벨업했을 때 발생",
    category: "builtin",
    parameters: [
      { name: "new_level", type: "number", required: true },
      { name: "previous_level", type: "number", required: false },
    ],
    computedProperties: ["levelUpCount"],
    computedRules: [
      { id: "cr-006", propertyKey: "levelUpCount", eventName: "level_up", aggregationType: "count" },
    ],
    createdAt: "2026-02-01T00:00:00Z",
  },
  {
    name: "tutorial_complete",
    displayName: "튜토리얼 완료",
    description: "플레이어가 튜토리얼을 완료했을 때 발생",
    category: "builtin",
    parameters: [
      { name: "tutorial_id", type: "string", required: true },
      { name: "completion_time", type: "number", required: false },
    ],
    computedProperties: [],
    computedRules: [],
    createdAt: "2026-02-01T00:00:00Z",
  },
];

export function getAllEventDefinitions(): EventDefinition[] {
  return [...eventDefinitions];
}

export function getEventDefinition(
  name: string,
): EventDefinition | undefined {
  return eventDefinitions.find((e) => e.name === name);
}

export function createEventDefinition(
  def: Omit<EventDefinition, "createdAt" | "category">,
): EventDefinition {
  const newDef: EventDefinition = {
    ...def,
    computedRules: def.computedRules ?? [],
    category: "custom",
    createdAt: new Date().toISOString(),
  };
  eventDefinitions = [...eventDefinitions, newDef];
  return newDef;
}

// ── Audience Mock Data ────────────────────────────────────────────────

let audiences: Audience[] = [
  {
    id: "aud-001",
    name: "신규 플레이어",
    description:
      '가입 3일 이내 플레이어. 필터: Now() - Properties("createTime", 0) <= Duration("3d")',
    status: "active",
    conditionGroups: [
      {
        logic: "and",
        conditions: [
          { property: "createTime", operator: "gte", value: "3d_ago" },
        ],
      },
    ],
    filterExpression: 'Now() - Properties("createTime", 0) <= Duration("3d")',
    memberCount: 24_183,
    lastRefreshedAt: "2026-03-26T09:55:00Z",
    usageCount: 3,
    isPredefined: true,
    createdAt: "2026-02-15T09:00:00Z",
    updatedAt: "2026-03-26T09:55:00Z",
  },
  {
    id: "aud-002",
    name: "활성 플레이어",
    description:
      '최근 7일 이내 접속 플레이어. 필터: Now() - PropertiesComputed("sessionSeenLast", 0) <= Duration("7d")',
    status: "active",
    conditionGroups: [
      {
        logic: "and",
        conditions: [
          { property: "sessionSeenLast", operator: "gte", value: "7d_ago" },
        ],
      },
    ],
    filterExpression:
      'Now() - PropertiesComputed("sessionSeenLast", 0) <= Duration("7d")',
    memberCount: 142_902,
    lastRefreshedAt: "2026-03-26T09:48:00Z",
    usageCount: 7,
    isPredefined: true,
    createdAt: "2026-02-15T09:00:00Z",
    updatedAt: "2026-03-26T09:48:00Z",
  },
  {
    id: "aud-003",
    name: "휴면 플레이어",
    description:
      '7일 초과 ~ 30일 이내 미접속. 필터: sessionSeenLast > 7d and <= 30d',
    status: "active",
    conditionGroups: [
      {
        logic: "and",
        conditions: [
          { property: "sessionSeenLast", operator: "lt", value: "7d_ago" },
          { property: "sessionSeenLast", operator: "gte", value: "30d_ago" },
        ],
      },
    ],
    filterExpression:
      'Now() - PropertiesComputed("sessionSeenLast", 0) > Duration("7d") and Now() - PropertiesComputed("sessionSeenLast", 0) <= Duration("30d")',
    memberCount: 38_441,
    lastRefreshedAt: "2026-03-26T09:52:00Z",
    usageCount: 2,
    isPredefined: true,
    createdAt: "2026-02-15T09:00:00Z",
    updatedAt: "2026-03-26T09:52:00Z",
  },
  {
    id: "aud-004",
    name: "이탈 플레이어",
    description:
      '30일 초과 미접속. 필터: Now() - PropertiesComputed("sessionSeenLast", 0) > Duration("30d")',
    status: "active",
    conditionGroups: [
      {
        logic: "and",
        conditions: [
          { property: "sessionSeenLast", operator: "lt", value: "30d_ago" },
        ],
      },
    ],
    filterExpression:
      'Now() - PropertiesComputed("sessionSeenLast", 0) > Duration("30d")',
    memberCount: 91_204,
    lastRefreshedAt: "2026-03-26T09:45:00Z",
    usageCount: 0,
    isPredefined: true,
    createdAt: "2026-02-15T09:00:00Z",
    updatedAt: "2026-03-26T09:45:00Z",
  },
  {
    id: "aud-005",
    name: "결제 경험자",
    description:
      '결제 1회 이상. 필터: PropertiesComputed("purchaseCompletedCount", 0) > 0',
    status: "active",
    conditionGroups: [
      {
        logic: "and",
        conditions: [
          { property: "purchaseCompletedCount", operator: "gt", value: 0 },
        ],
      },
    ],
    filterExpression:
      'PropertiesComputed("purchaseCompletedCount", 0) > 0',
    memberCount: 18_302,
    lastRefreshedAt: "2026-03-26T09:57:00Z",
    usageCount: 5,
    isPredefined: true,
    createdAt: "2026-02-15T09:00:00Z",
    updatedAt: "2026-03-26T09:57:00Z",
  },
  {
    id: "aud-006",
    name: "이탈 결제자",
    description:
      "결제 경험 있으나 30일 이상 미접속. 복합 조건 오디언스",
    status: "active",
    conditionGroups: [
      {
        logic: "and",
        conditions: [
          { property: "purchaseCompletedCount", operator: "gt", value: 0 },
          {
            property: "purchaseCompletedSeenLast",
            operator: "lt",
            value: "30d_ago",
          },
        ],
      },
    ],
    filterExpression:
      'PropertiesComputed("purchaseCompletedCount", 0) > 0 and Now() - PropertiesComputed("purchaseCompletedSeenLast", 0) >= Duration("30d")',
    memberCount: 4_102,
    lastRefreshedAt: "2026-03-26T09:42:00Z",
    usageCount: 4,
    isPredefined: true,
    createdAt: "2026-03-01T14:00:00Z",
    updatedAt: "2026-03-26T09:42:00Z",
  },
  {
    id: "aud-007",
    name: "하드코어 플레이어",
    description:
      '세션 500회 이상. 필터: PropertiesComputed("sessionCount", 0) >= 500',
    status: "active",
    conditionGroups: [
      {
        logic: "and",
        conditions: [
          { property: "sessionCount", operator: "gte", value: 500 },
        ],
      },
    ],
    filterExpression:
      'PropertiesComputed("sessionCount", 0) >= 500',
    memberCount: 2_891,
    lastRefreshedAt: "2026-03-26T09:39:00Z",
    usageCount: 0,
    isPredefined: true,
    createdAt: "2026-02-10T10:00:00Z",
    updatedAt: "2026-03-26T09:39:00Z",
  },
  {
    id: "aud-008",
    name: "국내 플레이어",
    description:
      '한국 국가 코드 플레이어. 필터: Properties("countryCode", "") == "KR"',
    status: "active",
    conditionGroups: [
      {
        logic: "and",
        conditions: [
          { property: "countryCode", operator: "eq", value: "KR" },
        ],
      },
    ],
    filterExpression: 'Properties("countryCode", "") == "KR"',
    memberCount: 53_401,
    lastRefreshedAt: "2026-03-26T09:53:00Z",
    usageCount: 2,
    isPredefined: true,
    createdAt: "2026-02-20T11:00:00Z",
    updatedAt: "2026-03-26T09:53:00Z",
  },
  {
    id: "aud-009",
    name: "iOS 플레이어",
    description:
      '플랫폼이 iOS인 플레이어. 필터: Properties("platform", "") == "iOS"',
    status: "active",
    conditionGroups: [
      {
        logic: "and",
        conditions: [
          { property: "platform", operator: "eq", value: "iOS" },
        ],
      },
    ],
    filterExpression: 'Properties("platform", "") == "iOS"',
    memberCount: 67_812,
    lastRefreshedAt: "2026-03-26T09:50:00Z",
    usageCount: 1,
    isPredefined: false,
    createdAt: "2026-03-05T10:00:00Z",
    updatedAt: "2026-03-26T09:50:00Z",
  },
  {
    id: "aud-010",
    name: "고레벨 플레이어",
    description:
      '캐릭터 레벨 30 이상. 필터: Properties("characterLevel", 0) >= 30',
    status: "active",
    conditionGroups: [
      {
        logic: "and",
        conditions: [
          { property: "characterLevel", operator: "gte", value: 30 },
        ],
      },
    ],
    filterExpression: 'Properties("characterLevel", 0) >= 30',
    memberCount: 11_540,
    lastRefreshedAt: "2026-03-26T09:47:00Z",
    usageCount: 0,
    isPredefined: false,
    createdAt: "2026-03-10T14:00:00Z",
    updatedAt: "2026-03-26T09:47:00Z",
  },
  {
    id: "aud-011",
    name: "최근 결제자",
    description:
      '최근 7일 이내 결제 플레이어. 필터: Now() - PropertiesComputed("purchaseCompletedSeenLast", 0) <= Duration("7d")',
    status: "active",
    conditionGroups: [
      {
        logic: "and",
        conditions: [
          { property: "purchaseCompletedSeenLast", operator: "gte", value: "7d_ago" },
        ],
      },
    ],
    filterExpression:
      'Now() - PropertiesComputed("purchaseCompletedSeenLast", 0) <= Duration("7d")',
    memberCount: 6_283,
    lastRefreshedAt: "2026-03-26T09:44:00Z",
    usageCount: 1,
    isPredefined: false,
    createdAt: "2026-03-12T09:00:00Z",
    updatedAt: "2026-03-26T09:44:00Z",
  },
  {
    id: "aud-012",
    name: "튜토리얼 미완료",
    description:
      '튜토리얼을 완료하지 않은 플레이어. 필터: Properties("tutorialCompleted", false) == false',
    status: "draft",
    conditionGroups: [
      {
        logic: "and",
        conditions: [
          { property: "tutorialCompleted", operator: "eq", value: "false" },
        ],
      },
    ],
    filterExpression: 'Properties("tutorialCompleted", false) == false',
    memberCount: 31_902,
    lastRefreshedAt: null,
    usageCount: 0,
    isPredefined: false,
    createdAt: "2026-03-20T16:00:00Z",
    updatedAt: "2026-03-20T16:00:00Z",
  },
];

let nextId = 13;

// ── Audience CRUD ─────────────────────────────────────────────────────

export function getAllAudiences(): Audience[] {
  return [...audiences];
}

export function getAudienceById(id: string): Audience | undefined {
  return audiences.find((a) => a.id === id);
}

export function createAudience(req: CreateAudienceRequest): Audience {
  const now = new Date().toISOString();
  const audience: Audience = {
    id: `aud-${String(nextId++).padStart(3, "0")}`,
    name: req.name,
    description: req.description,
    status: "draft",
    conditionGroups: req.conditionGroups,
    filterExpression: req.filterExpression,
    memberCount: Math.floor(Math.random() * 50_000) + 100,
    lastRefreshedAt: null,
    usageCount: 0,
    isPredefined: false,
    createdAt: now,
    updatedAt: now,
  };
  audiences = [audience, ...audiences];
  return audience;
}

export function updateAudience(
  id: string,
  req: UpdateAudienceRequest,
): Audience | undefined {
  const index = audiences.findIndex((a) => a.id === id);
  if (index === -1) return undefined;
  const updated: Audience = {
    ...audiences[index],
    ...req,
    updatedAt: new Date().toISOString(),
  };
  audiences = audiences.map((a) => (a.id === id ? updated : a));
  return updated;
}

export function deleteAudience(id: string): boolean {
  const len = audiences.length;
  audiences = audiences.filter((a) => a.id !== id);
  return audiences.length < len;
}

export function duplicateAudience(id: string): Audience | undefined {
  const original = audiences.find((a) => a.id === id);
  if (!original) return undefined;
  const now = new Date().toISOString();
  const duplicate: Audience = {
    ...original,
    id: `aud-${String(nextId++).padStart(3, "0")}`,
    name: `${original.name} (복사본)`,
    status: "draft",
    usageCount: 0,
    isPredefined: false,
    lastRefreshedAt: null,
    createdAt: now,
    updatedAt: now,
  };
  audiences = [duplicate, ...audiences];
  return duplicate;
}

export function refreshAudience(id: string): Audience | undefined {
  const index = audiences.findIndex((a) => a.id === id);
  if (index === -1) return undefined;
  const now = new Date().toISOString();
  const refreshed: Audience = {
    ...audiences[index],
    lastRefreshedAt: now,
    memberCount:
      audiences[index].memberCount +
      Math.floor(Math.random() * 200) -
      100,
    updatedAt: now,
  };
  audiences = audiences.map((a) => (a.id === id ? refreshed : a));
  return refreshed;
}

// ── Helpers ───────────────────────────────────────────────────────────

export function formatCondition(condition: AudienceCondition): string {
  const allProps = getAllProperties();
  const prop =
    allProps.find((p) => p.key === condition.property)?.label ??
    condition.property;
  const op = OPERATOR_LABELS[condition.operator as FilterOperator] ?? condition.operator;
  const val = Array.isArray(condition.value)
    ? condition.value.join(", ")
    : String(condition.value);
  return `${prop} ${op} ${val}`;
}

export function formatConditionGroup(group: ConditionGroup): string {
  return group.conditions.map(formatCondition).join(` ${group.logic.toUpperCase()} `);
}

// ── Usage References (mock) ───────────────────────────────────────────

export interface UsageReference {
  type: "live_event" | "experiment" | "feature_flag" | "message";
  id: string;
  name: string;
}

const USAGE_MAP: Record<string, UsageReference[]> = {
  "aud-001": [
    { type: "live_event", id: "evt-001", name: "봄맞이 복귀 이벤트" },
    { type: "message", id: "msg-001", name: "신규 환영 메시지" },
    { type: "experiment", id: "exp-001", name: "온보딩 UI A/B 테스트" },
  ],
  "aud-002": [
    { type: "live_event", id: "evt-002", name: "주간 보상 이벤트" },
    { type: "live_event", id: "evt-003", name: "시즌 패스 이벤트" },
    { type: "experiment", id: "exp-002", name: "상점 레이아웃 테스트" },
    { type: "feature_flag", id: "ff-001", name: "신규 UI 공개" },
    { type: "message", id: "msg-002", name: "일일 로그인 알림" },
    { type: "message", id: "msg-003", name: "신규 컨텐츠 알림" },
    { type: "feature_flag", id: "ff-002", name: "매칭 알고리즘 v2" },
  ],
  "aud-003": [
    { type: "message", id: "msg-004", name: "복귀 유도 푸시" },
    { type: "live_event", id: "evt-004", name: "복귀 보너스 이벤트" },
  ],
  "aud-005": [
    { type: "live_event", id: "evt-005", name: "결제자 감사 이벤트" },
    { type: "experiment", id: "exp-003", name: "구매 흐름 최적화" },
    { type: "message", id: "msg-005", name: "VIP 전용 알림" },
    { type: "feature_flag", id: "ff-003", name: "프리미엄 기능 개방" },
    { type: "live_event", id: "evt-006", name: "결제자 전용 세일" },
  ],
  "aud-006": [
    { type: "live_event", id: "evt-007", name: "이탈 결제자 복귀 오퍼" },
    { type: "message", id: "msg-006", name: "VIP 복귀 메시지" },
    { type: "experiment", id: "exp-004", name: "복귀 오퍼 가격 테스트" },
    { type: "message", id: "msg-007", name: "할인 쿠폰 발송" },
  ],
  "aud-008": [
    { type: "live_event", id: "evt-008", name: "한국 전용 이벤트" },
    { type: "message", id: "msg-008", name: "한국어 공지사항" },
  ],
};

export function getAudienceUsages(audienceId: string): UsageReference[] {
  return USAGE_MAP[audienceId] ?? [];
}

// ── Sample Members (mock) ─────────────────────────────────────────────

export interface SampleMember {
  id: string;
  name: string;
  countryCode: string;
  platform: string;
  sessionCount: number;
  lastLogin: string;
}

export function getSampleMembers(_audienceId: string): SampleMember[] {
  return [
    { id: "p-10001", name: "Player_Alpha", countryCode: "KR", platform: "ios", sessionCount: 312, lastLogin: "2026-03-26" },
    { id: "p-10002", name: "Player_Bravo", countryCode: "KR", platform: "android", sessionCount: 187, lastLogin: "2026-03-25" },
    { id: "p-10003", name: "Player_Charlie", countryCode: "JP", platform: "ios", sessionCount: 541, lastLogin: "2026-03-26" },
    { id: "p-10004", name: "Player_Delta", countryCode: "US", platform: "pc", sessionCount: 89, lastLogin: "2026-03-24" },
    { id: "p-10005", name: "Player_Echo", countryCode: "KR", platform: "android", sessionCount: 723, lastLogin: "2026-03-26" },
  ];
}

// Type label helpers
const USAGE_TYPE_LABELS: Record<UsageReference["type"], string> = {
  live_event: "라이브 이벤트",
  experiment: "실험",
  feature_flag: "기능 플래그",
  message: "메시지",
};

export function getUsageTypeLabel(type: UsageReference["type"]): string {
  return USAGE_TYPE_LABELS[type];
}
