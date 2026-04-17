import type {
  RemoteConfigEntry,
  RemoteConfigChangeLog,
  CreateRemoteConfigRequest,
  UpdateRemoteConfigRequest,
  ConfigTransitionAction,
  ConfigStatus,
} from "../types/remote-config";

// --- Mock data store ---

const CURRENT_USER = "admin@example.com";

let nextId = 17;
let nextLogId = 50;

function rcId(n: number): string {
  return `rc-${String(n).padStart(3, "0")}`;
}

function logId(): string {
  return `cl-${String(nextLogId++).padStart(3, "0")}`;
}

let configs: RemoteConfigEntry[] = [
  // --- Client configs ---
  {
    id: rcId(1),
    key: "game.reward.daily_coin",
    valueType: "number",
    value: "100",
    description: "일일 보상 코인 지급량",
    target: "client",
    tags: ["reward", "economy"],
    status: "active",
    createdAt: "2026-01-15T09:00:00Z",
    createdBy: "admin@example.com",
    updatedAt: "2026-03-10T14:30:00Z",
    updatedBy: "admin@example.com",
  },
  {
    id: rcId(2),
    key: "game.reward.multiplier",
    valueType: "number",
    value: "1.5",
    description: "보상 배율 (이벤트 기간 적용)",
    target: "client",
    tags: ["reward", "event"],
    status: "active",
    createdAt: "2026-01-15T09:10:00Z",
    createdBy: "admin@example.com",
    updatedAt: "2026-03-20T10:00:00Z",
    updatedBy: "planner@example.com",
  },
  {
    id: rcId(3),
    key: "ui.banner.welcome_text",
    valueType: "string",
    value: "새 시즌이 시작되었습니다! 지금 참여하세요.",
    description: "메인 화면 상단 배너 문구",
    target: "client",
    tags: ["ui", "banner"],
    status: "pending_approval",
    createdAt: "2026-02-01T10:00:00Z",
    createdBy: "planner@example.com",
    updatedAt: "2026-03-25T09:00:00Z",
    updatedBy: "admin@example.com",
  },
  {
    id: rcId(4),
    key: "ui.theme.dark_mode",
    valueType: "boolean",
    value: "true",
    description: "다크 모드 기본 활성화 여부",
    target: "client",
    tags: ["ui", "theme"],
    status: "active",
    createdAt: "2026-02-05T11:00:00Z",
    createdBy: "admin@example.com",
    updatedAt: "2026-02-05T11:00:00Z",
    updatedBy: "admin@example.com",
  },
  {
    id: rcId(5),
    key: "feature.pvp.enabled",
    valueType: "boolean",
    value: "true",
    description: "PvP 기능 활성화 플래그",
    target: "client",
    tags: ["feature", "pvp"],
    status: "draft",
    createdAt: "2026-02-10T14:00:00Z",
    createdBy: "admin@example.com",
    updatedAt: "2026-03-15T16:00:00Z",
    updatedBy: "admin@example.com",
  },
  {
    id: rcId(6),
    key: "feature.chat.enabled",
    valueType: "boolean",
    value: "false",
    description: "인게임 채팅 기능 활성화 플래그",
    target: "client",
    tags: ["feature", "chat"],
    status: "active",
    createdAt: "2026-02-10T14:30:00Z",
    createdBy: "admin@example.com",
    updatedAt: "2026-03-01T09:00:00Z",
    updatedBy: "planner@example.com",
  },
  {
    id: rcId(7),
    key: "game.difficulty.base_hp",
    valueType: "number",
    value: "1000",
    description: "기본 난이도 몬스터 HP",
    target: "client",
    tags: ["game", "difficulty"],
    status: "pending_approval",
    createdAt: "2026-02-15T10:00:00Z",
    createdBy: "planner@example.com",
    updatedAt: "2026-03-18T11:00:00Z",
    updatedBy: "admin@example.com",
  },
  {
    id: rcId(8),
    key: "game.shop.discount_rate",
    valueType: "number",
    value: "15",
    description: "상점 기본 할인율 (%)",
    target: "client",
    tags: ["game", "shop", "economy"],
    status: "active",
    createdAt: "2026-02-20T09:00:00Z",
    createdBy: "admin@example.com",
    updatedAt: "2026-03-22T14:00:00Z",
    updatedBy: "admin@example.com",
  },
  // --- Server configs ---
  {
    id: rcId(9),
    key: "game.match.max_players",
    valueType: "number",
    value: "50",
    description: "매칭당 최대 플레이어 수",
    target: "server",
    tags: ["server", "match"],
    status: "active",
    createdAt: "2026-01-20T10:00:00Z",
    createdBy: "admin@example.com",
    updatedAt: "2026-03-05T15:00:00Z",
    updatedBy: "admin@example.com",
  },
  {
    id: rcId(10),
    key: "server.match.timeout_seconds",
    valueType: "number",
    value: "30",
    description: "매칭 타임아웃 (초)",
    target: "server",
    tags: ["server", "match"],
    status: "active",
    createdAt: "2026-01-20T10:30:00Z",
    createdBy: "admin@example.com",
    updatedAt: "2026-01-20T10:30:00Z",
    updatedBy: "admin@example.com",
  },
  {
    id: rcId(11),
    key: "server.rate_limit.requests_per_minute",
    valueType: "number",
    value: "60",
    description: "분당 API 요청 제한",
    target: "server",
    tags: ["server", "security"],
    status: "active",
    createdAt: "2026-01-25T09:00:00Z",
    createdBy: "admin@example.com",
    updatedAt: "2026-02-28T11:00:00Z",
    updatedBy: "admin@example.com",
  },
  {
    id: rcId(12),
    key: "server.maintenance.message",
    valueType: "string",
    value: "정기 점검 중입니다. 잠시 후 다시 이용해주세요.",
    description: "서버 점검 안내 메시지",
    target: "server",
    tags: ["server", "maintenance"],
    status: "active",
    createdAt: "2026-02-01T08:00:00Z",
    createdBy: "admin@example.com",
    updatedAt: "2026-03-28T06:00:00Z",
    updatedBy: "admin@example.com",
  },
  // --- Both configs ---
  {
    id: rcId(13),
    key: "app.version.minimum",
    valueType: "string",
    value: "2.1.0",
    description: "최소 지원 앱 버전",
    target: "both",
    tags: ["app", "version"],
    status: "active",
    createdAt: "2026-01-10T09:00:00Z",
    createdBy: "admin@example.com",
    updatedAt: "2026-03-15T10:00:00Z",
    updatedBy: "admin@example.com",
  },
  {
    id: rcId(14),
    key: "app.feature_flags",
    valueType: "json",
    value: JSON.stringify({
      new_shop: true,
      guild_system: false,
      daily_quest_v2: true,
    }),
    description: "전역 기능 플래그 설정",
    target: "both",
    tags: ["app", "feature"],
    status: "active",
    createdAt: "2026-02-01T09:00:00Z",
    createdBy: "admin@example.com",
    updatedAt: "2026-03-26T14:00:00Z",
    updatedBy: "planner@example.com",
  },
  {
    id: rcId(15),
    key: "game.season.current",
    valueType: "number",
    value: "3",
    description: "현재 시즌 번호",
    target: "both",
    tags: ["game", "season"],
    status: "active",
    createdAt: "2026-01-05T09:00:00Z",
    createdBy: "admin@example.com",
    updatedAt: "2026-03-01T00:00:00Z",
    updatedBy: "admin@example.com",
  },
  {
    id: rcId(16),
    key: "game.event.active_ids",
    valueType: "json",
    value: JSON.stringify(["evt-spring-2026", "evt-cherry-blossom"]),
    description: "현재 활성화된 이벤트 ID 목록",
    target: "both",
    tags: ["game", "event"],
    status: "active",
    createdAt: "2026-02-15T09:00:00Z",
    createdBy: "planner@example.com",
    updatedAt: "2026-03-28T10:00:00Z",
    updatedBy: "admin@example.com",
  },
];

let changeLogs: RemoteConfigChangeLog[] = [
  // rc-001: daily_coin — created, then value updated twice
  {
    id: "cl-001",
    configId: rcId(1),
    action: "created",
    field: null,
    previousValue: null,
    newValue: null,
    changedBy: "admin@example.com",
    changedAt: "2026-01-15T09:00:00Z",
  },
  {
    id: "cl-002",
    configId: rcId(1),
    action: "updated",
    field: "value",
    previousValue: "50",
    newValue: "80",
    changedBy: "admin@example.com",
    changedAt: "2026-02-10T11:00:00Z",
  },
  {
    id: "cl-003",
    configId: rcId(1),
    action: "updated",
    field: "value",
    previousValue: "80",
    newValue: "100",
    changedBy: "admin@example.com",
    changedAt: "2026-03-10T14:30:00Z",
  },
  // rc-002: multiplier — created, value updated
  {
    id: "cl-004",
    configId: rcId(2),
    action: "created",
    field: null,
    previousValue: null,
    newValue: null,
    changedBy: "admin@example.com",
    changedAt: "2026-01-15T09:10:00Z",
  },
  {
    id: "cl-005",
    configId: rcId(2),
    action: "updated",
    field: "value",
    previousValue: "1.0",
    newValue: "1.5",
    changedBy: "planner@example.com",
    changedAt: "2026-03-20T10:00:00Z",
  },
  // rc-003: welcome_text — created, text updated twice
  {
    id: "cl-006",
    configId: rcId(3),
    action: "created",
    field: null,
    previousValue: null,
    newValue: null,
    changedBy: "planner@example.com",
    changedAt: "2026-02-01T10:00:00Z",
  },
  {
    id: "cl-007",
    configId: rcId(3),
    action: "updated",
    field: "value",
    previousValue: "환영합니다!",
    newValue: "봄 이벤트에 참여하세요!",
    changedBy: "admin@example.com",
    changedAt: "2026-03-10T09:00:00Z",
  },
  {
    id: "cl-008",
    configId: rcId(3),
    action: "updated",
    field: "value",
    previousValue: "봄 이벤트에 참여하세요!",
    newValue: "새 시즌이 시작되었습니다! 지금 참여하세요.",
    changedBy: "admin@example.com",
    changedAt: "2026-03-25T09:00:00Z",
  },
  // rc-004: dark_mode — created
  {
    id: "cl-009",
    configId: rcId(4),
    action: "created",
    field: null,
    previousValue: null,
    newValue: null,
    changedBy: "admin@example.com",
    changedAt: "2026-02-05T11:00:00Z",
  },
  // rc-005: pvp.enabled — created, toggled
  {
    id: "cl-010",
    configId: rcId(5),
    action: "created",
    field: null,
    previousValue: null,
    newValue: null,
    changedBy: "admin@example.com",
    changedAt: "2026-02-10T14:00:00Z",
  },
  {
    id: "cl-011",
    configId: rcId(5),
    action: "updated",
    field: "value",
    previousValue: "false",
    newValue: "true",
    changedBy: "admin@example.com",
    changedAt: "2026-03-15T16:00:00Z",
  },
  // rc-006: chat.enabled — created, toggled
  {
    id: "cl-012",
    configId: rcId(6),
    action: "created",
    field: null,
    previousValue: null,
    newValue: null,
    changedBy: "admin@example.com",
    changedAt: "2026-02-10T14:30:00Z",
  },
  {
    id: "cl-013",
    configId: rcId(6),
    action: "updated",
    field: "value",
    previousValue: "true",
    newValue: "false",
    changedBy: "planner@example.com",
    changedAt: "2026-03-01T09:00:00Z",
  },
  // rc-007: base_hp — created, updated
  {
    id: "cl-014",
    configId: rcId(7),
    action: "created",
    field: null,
    previousValue: null,
    newValue: null,
    changedBy: "planner@example.com",
    changedAt: "2026-02-15T10:00:00Z",
  },
  {
    id: "cl-015",
    configId: rcId(7),
    action: "updated",
    field: "value",
    previousValue: "800",
    newValue: "1000",
    changedBy: "admin@example.com",
    changedAt: "2026-03-18T11:00:00Z",
  },
  // rc-008: discount_rate — created, updated twice
  {
    id: "cl-016",
    configId: rcId(8),
    action: "created",
    field: null,
    previousValue: null,
    newValue: null,
    changedBy: "admin@example.com",
    changedAt: "2026-02-20T09:00:00Z",
  },
  {
    id: "cl-017",
    configId: rcId(8),
    action: "updated",
    field: "value",
    previousValue: "10",
    newValue: "20",
    changedBy: "admin@example.com",
    changedAt: "2026-03-10T14:00:00Z",
  },
  {
    id: "cl-018",
    configId: rcId(8),
    action: "updated",
    field: "value",
    previousValue: "20",
    newValue: "15",
    changedBy: "admin@example.com",
    changedAt: "2026-03-22T14:00:00Z",
  },
  // rc-009: max_players — created, updated
  {
    id: "cl-019",
    configId: rcId(9),
    action: "created",
    field: null,
    previousValue: null,
    newValue: null,
    changedBy: "admin@example.com",
    changedAt: "2026-01-20T10:00:00Z",
  },
  {
    id: "cl-020",
    configId: rcId(9),
    action: "updated",
    field: "value",
    previousValue: "30",
    newValue: "50",
    changedBy: "admin@example.com",
    changedAt: "2026-03-05T15:00:00Z",
  },
  // rc-010: timeout_seconds — created only
  {
    id: "cl-021",
    configId: rcId(10),
    action: "created",
    field: null,
    previousValue: null,
    newValue: null,
    changedBy: "admin@example.com",
    changedAt: "2026-01-20T10:30:00Z",
  },
  // rc-011: requests_per_minute — created, updated
  {
    id: "cl-022",
    configId: rcId(11),
    action: "created",
    field: null,
    previousValue: null,
    newValue: null,
    changedBy: "admin@example.com",
    changedAt: "2026-01-25T09:00:00Z",
  },
  {
    id: "cl-023",
    configId: rcId(11),
    action: "updated",
    field: "value",
    previousValue: "30",
    newValue: "60",
    changedBy: "admin@example.com",
    changedAt: "2026-02-28T11:00:00Z",
  },
  // rc-012: maintenance.message — created, updated
  {
    id: "cl-024",
    configId: rcId(12),
    action: "created",
    field: null,
    previousValue: null,
    newValue: null,
    changedBy: "admin@example.com",
    changedAt: "2026-02-01T08:00:00Z",
  },
  {
    id: "cl-025",
    configId: rcId(12),
    action: "updated",
    field: "value",
    previousValue: "서버 점검 중입니다.",
    newValue: "정기 점검 중입니다. 잠시 후 다시 이용해주세요.",
    changedBy: "admin@example.com",
    changedAt: "2026-03-28T06:00:00Z",
  },
  // rc-013: app.version.minimum — created, updated twice
  {
    id: "cl-026",
    configId: rcId(13),
    action: "created",
    field: null,
    previousValue: null,
    newValue: null,
    changedBy: "admin@example.com",
    changedAt: "2026-01-10T09:00:00Z",
  },
  {
    id: "cl-027",
    configId: rcId(13),
    action: "updated",
    field: "value",
    previousValue: "1.9.0",
    newValue: "2.0.0",
    changedBy: "admin@example.com",
    changedAt: "2026-02-15T10:00:00Z",
  },
  {
    id: "cl-028",
    configId: rcId(13),
    action: "updated",
    field: "value",
    previousValue: "2.0.0",
    newValue: "2.1.0",
    changedBy: "admin@example.com",
    changedAt: "2026-03-15T10:00:00Z",
  },
  // rc-014: feature_flags — created, updated
  {
    id: "cl-029",
    configId: rcId(14),
    action: "created",
    field: null,
    previousValue: null,
    newValue: null,
    changedBy: "admin@example.com",
    changedAt: "2026-02-01T09:00:00Z",
  },
  {
    id: "cl-030",
    configId: rcId(14),
    action: "updated",
    field: "value",
    previousValue: JSON.stringify({ new_shop: false, guild_system: false }),
    newValue: JSON.stringify({
      new_shop: true,
      guild_system: false,
      daily_quest_v2: true,
    }),
    changedBy: "planner@example.com",
    changedAt: "2026-03-26T14:00:00Z",
  },
  // rc-015: season.current — created, updated twice
  {
    id: "cl-031",
    configId: rcId(15),
    action: "created",
    field: null,
    previousValue: null,
    newValue: null,
    changedBy: "admin@example.com",
    changedAt: "2026-01-05T09:00:00Z",
  },
  {
    id: "cl-032",
    configId: rcId(15),
    action: "updated",
    field: "value",
    previousValue: "1",
    newValue: "2",
    changedBy: "admin@example.com",
    changedAt: "2026-02-01T00:00:00Z",
  },
  {
    id: "cl-033",
    configId: rcId(15),
    action: "updated",
    field: "value",
    previousValue: "2",
    newValue: "3",
    changedBy: "admin@example.com",
    changedAt: "2026-03-01T00:00:00Z",
  },
  // rc-016: event.active_ids — created, updated
  {
    id: "cl-034",
    configId: rcId(16),
    action: "created",
    field: null,
    previousValue: null,
    newValue: null,
    changedBy: "planner@example.com",
    changedAt: "2026-02-15T09:00:00Z",
  },
  {
    id: "cl-035",
    configId: rcId(16),
    action: "updated",
    field: "value",
    previousValue: JSON.stringify(["evt-winter-2025"]),
    newValue: JSON.stringify(["evt-spring-2026", "evt-cherry-blossom"]),
    changedBy: "admin@example.com",
    changedAt: "2026-03-28T10:00:00Z",
  },
];

// --- CRUD operations ---

export function getAllConfigs(): RemoteConfigEntry[] {
  return [...configs];
}

export function getConfigById(id: string): RemoteConfigEntry | undefined {
  return configs.find((c) => c.id === id);
}

export function getChangeLog(configId: string): RemoteConfigChangeLog[] {
  return changeLogs.filter((l) => l.configId === configId);
}

export function createConfig(
  req: CreateRemoteConfigRequest,
): RemoteConfigEntry {
  const now = new Date().toISOString();
  const id = rcId(nextId++);
  const entry: RemoteConfigEntry = {
    id,
    key: req.key,
    valueType: req.valueType,
    value: req.value,
    description: req.description,
    target: req.target,
    tags: req.tags,
    status: "draft",
    createdAt: now,
    createdBy: CURRENT_USER,
    updatedAt: now,
    updatedBy: CURRENT_USER,
  };
  configs = [entry, ...configs];

  changeLogs = [
    ...changeLogs,
    {
      id: logId(),
      configId: id,
      action: "created",
      field: null,
      previousValue: null,
      newValue: null,
      changedBy: CURRENT_USER,
      changedAt: now,
    },
  ];

  return entry;
}

export function updateConfig(
  id: string,
  req: UpdateRemoteConfigRequest,
): RemoteConfigEntry | undefined {
  const index = configs.findIndex((c) => c.id === id);
  if (index === -1) return undefined;

  const existing = configs[index];
  const now = new Date().toISOString();
  const fieldsToCheck: (keyof UpdateRemoteConfigRequest)[] = [
    "valueType",
    "value",
    "description",
    "target",
    "tags",
  ];

  // Create a change log entry for each changed field
  for (const field of fieldsToCheck) {
    if (req[field] === undefined) continue;

    const oldVal =
      field === "tags"
        ? JSON.stringify(existing[field])
        : String(existing[field]);
    const newVal =
      field === "tags" ? JSON.stringify(req[field]) : String(req[field]);

    if (oldVal !== newVal) {
      changeLogs = [
        ...changeLogs,
        {
          id: logId(),
          configId: id,
          action: "updated",
          field,
          previousValue: oldVal,
          newValue: newVal,
          changedBy: CURRENT_USER,
          changedAt: now,
        },
      ];
    }
  }

  const updated: RemoteConfigEntry = {
    ...existing,
    ...req,
    tags: req.tags ?? existing.tags,
    updatedAt: now,
    updatedBy: CURRENT_USER,
  };
  configs = configs.map((c) => (c.id === id ? updated : c));
  return updated;
}

export function deleteConfig(id: string): boolean {
  const target = configs.find((c) => c.id === id);
  if (!target) return false;

  const now = new Date().toISOString();

  // Add a "deleted" change log entry
  changeLogs = [
    ...changeLogs,
    {
      id: logId(),
      configId: id,
      action: "deleted",
      field: null,
      previousValue: null,
      newValue: null,
      changedBy: CURRENT_USER,
      changedAt: now,
    },
  ];

  // Remove from array
  const len = configs.length;
  configs = configs.filter((c) => c.id !== id);
  return configs.length < len;
}

export function isKeyUnique(key: string, excludeId?: string): boolean {
  return !configs.some((c) => c.key === key && c.id !== excludeId);
}

export function transitionConfig(
  id: string,
  action: ConfigTransitionAction,
  reason?: string,
): RemoteConfigEntry | undefined {
  const config = configs.find((c) => c.id === id);
  if (!config) return undefined;

  const now = new Date().toISOString();
  const actor = "admin@example.com";

  if (action === "request_approval" && config.status === "draft") {
    config.status = "pending_approval";
    config.updatedAt = now;
    config.updatedBy = actor;
    changeLogs = [
      {
        id: logId(),
        configId: id,
        action: "updated",
        field: "status",
        previousValue: "draft",
        newValue: "pending_approval",
        changedBy: actor,
        changedAt: now,
      },
      ...changeLogs,
    ];
  } else if (action === "approve" && config.status === "pending_approval") {
    config.status = "active";
    config.updatedAt = now;
    config.updatedBy = actor;
    changeLogs = [
      {
        id: logId(),
        configId: id,
        action: "updated",
        field: "status",
        previousValue: "pending_approval",
        newValue: "active",
        changedBy: actor,
        changedAt: now,
      },
      ...changeLogs,
    ];
  } else if (action === "reject" && config.status === "pending_approval") {
    config.status = "draft";
    config.updatedAt = now;
    config.updatedBy = actor;
    changeLogs = [
      {
        id: logId(),
        configId: id,
        action: "updated",
        field: "status",
        previousValue: "pending_approval",
        newValue: `draft (반려: ${reason ?? ""})`,
        changedBy: actor,
        changedAt: now,
      },
      ...changeLogs,
    ];
  }

  return config;
}
