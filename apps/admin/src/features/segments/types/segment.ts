// Property system (3-layer)
export type PropertyCategory = "default" | "computed" | "custom";
export type PropertyValueType = "string" | "numeric";

export interface PropertyDefinition {
  key: string;
  label: string;
  category: PropertyCategory;
  valueType: PropertyValueType;
  description: string;
  // For computed: source event + aggregation type
  computedRule?: {
    eventName: string;
    aggregation:
      | "count"
      | "seen_last"
      | "value_sum"
      | "value_high"
      | "value_low";
    parameterName?: string;
  };
}

// Computed Property Rule (links events to computed properties)
export interface ComputedPropertyRule {
  id: string;
  propertyKey: string;       // which computed property this updates
  eventName: string;         // which event triggers the update
  aggregationType: "count" | "seen_last" | "value_sum" | "value_high" | "value_low";
  parameterName?: string;    // event parameter to aggregate (for value_sum/high/low)
}

// Filter expression (simplified DSL for MVP)
export type FilterOperator =
  | "eq"
  | "neq"
  | "gt"
  | "lt"
  | "gte"
  | "lte"
  | "in"
  | "not_in"
  | "contains"
  | "between"
  | "within_days";

export interface AudienceCondition {
  property: string;
  operator: FilterOperator;
  value: string | number | string[];
}

export interface ConditionGroup {
  logic: "and" | "or";
  conditions: AudienceCondition[];
}

// Audience
export type AudienceStatus = "active" | "paused" | "draft" | "archived";

export interface Audience {
  id: string;
  name: string;
  description: string;
  status: AudienceStatus;
  conditionGroups: ConditionGroup[]; // Include groups (AND between groups, OR within)
  filterExpression?: string; // Raw DSL string (for query mode)
  memberCount: number;
  lastRefreshedAt: string | null;
  usageCount: number; // how many LiveOps features reference this
  isPredefined: boolean;
  createdAt: string;
  updatedAt: string;
}

// Event Taxonomy
export interface EventDefinition {
  name: string;
  displayName: string;
  description: string;
  category: "builtin" | "custom";
  parameters: EventParameter[];
  computedProperties: string[]; // property keys that use this event
  computedRules: ComputedPropertyRule[]; // detailed rules linking events to computed properties
  createdAt: string;
}

export interface EventParameter {
  name: string;
  type: "string" | "number" | "boolean";
  required: boolean;
}

// Requests
export type CreateAudienceRequest = Pick<
  Audience,
  "name" | "description" | "conditionGroups"
> & {
  filterExpression?: string;
};
export type UpdateAudienceRequest = Partial<
  CreateAudienceRequest & { status: AudienceStatus }
>;

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: { generatedAt: string };
}

// Status config
export const AUDIENCE_STATUS_CONFIG: Record<
  AudienceStatus,
  { label: string; bg: string; text: string }
> = {
  active: { label: "활성", bg: "bg-green-100", text: "text-green-700" },
  paused: { label: "일시정지", bg: "bg-yellow-100", text: "text-yellow-700" },
  draft: { label: "초안", bg: "bg-gray-100", text: "text-gray-600" },
  archived: { label: "보관", bg: "bg-purple-100", text: "text-purple-600" },
};

// Operator labels for display
export const OPERATOR_LABELS: Record<FilterOperator, string> = {
  eq: "=",
  neq: "!=",
  gt: ">",
  lt: "<",
  gte: ">=",
  lte: "<=",
  in: "포함",
  not_in: "미포함",
  contains: "포함(문자열)",
  between: "사이",
  within_days: "이내(일)",
};
