// Union types
export type ValueType = "string" | "number" | "boolean" | "json";
export type ConfigTarget = "client" | "server" | "both";
export type ChangeAction = "created" | "updated" | "deleted";
export type ConfigStatus = "draft" | "pending_approval" | "active";
export type ConfigTransitionAction = "request_approval" | "approve" | "reject";

// Main entity
export interface RemoteConfigEntry {
  id: string;
  key: string; // dot notation, e.g. "game.reward.daily_coin"
  valueType: ValueType;
  value: string; // serialized value
  description: string;
  target: ConfigTarget;
  tags: string[];
  status: ConfigStatus;
  createdAt: string; // ISO 8601
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

// Change log
export interface RemoteConfigChangeLog {
  id: string;
  configId: string;
  action: ChangeAction;
  field: string | null; // which field changed (for "updated" action)
  previousValue: string | null;
  newValue: string | null;
  changedBy: string;
  changedAt: string; // ISO 8601
}

// Request types
export type CreateRemoteConfigRequest = Pick<
  RemoteConfigEntry,
  "key" | "valueType" | "value" | "description" | "target" | "tags"
>;

export type UpdateRemoteConfigRequest = Partial<
  Omit<CreateRemoteConfigRequest, "key"> // key is immutable
>;

// Re-export ApiResponse (same shape used across features)
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: { generatedAt: string; total?: number; page?: number; size?: number };
}

// Badge config constants
export const VALUE_TYPE_CONFIG: Record<
  ValueType,
  { label: string; bg: string; text: string }
> = {
  string: { label: "String", bg: "bg-blue-100", text: "text-blue-700" },
  number: { label: "Number", bg: "bg-green-100", text: "text-green-700" },
  boolean: { label: "Boolean", bg: "bg-purple-100", text: "text-purple-700" },
  json: { label: "JSON", bg: "bg-orange-100", text: "text-orange-700" },
};

export const TARGET_CONFIG: Record<
  ConfigTarget,
  { label: string; bg: string; text: string }
> = {
  client: { label: "클라이언트", bg: "bg-cyan-100", text: "text-cyan-700" },
  server: { label: "서버", bg: "bg-amber-100", text: "text-amber-700" },
  both: { label: "클라이언트 · 서버", bg: "bg-gray-100", text: "text-gray-700" },
};

export const CONFIG_STATUS_CONFIG: Record<
  ConfigStatus,
  { label: string; bg: string; text: string }
> = {
  draft: { label: "초안", bg: "bg-gray-100", text: "text-gray-600" },
  pending_approval: { label: "승인 대기", bg: "bg-orange-100", text: "text-orange-600" },
  active: { label: "활성", bg: "bg-green-100", text: "text-green-700" },
};
