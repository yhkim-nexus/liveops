// 9 statuses per PRD/DIA
export type ExperimentStatus =
  | "draft"
  | "testing"
  | "pending_approval"
  | "running"
  | "paused"
  | "stopped"
  | "analyzing"
  | "completed"
  | "archived";

export type ExperimentType =
  | "remote_config"
  | "feature_flag"
  | "event_variant"
  | "composite";

export type MetricType = "conversion_rate" | "average_value" | "count";
export type SignificanceLevel = 0.01 | 0.05 | 0.1;

export interface Experiment {
  id: string;
  name: string;
  hypothesisWhat: string;
  hypothesisWhy: string;
  hypothesisExpected: string;
  type: ExperimentType;
  status: ExperimentStatus;
  audienceId: string | null;
  audienceName: string | null;
  variants: ExperimentVariant[];
  goals: ExperimentGoal[];
  significanceLevel: SignificanceLevel;
  startAt: string | null;
  endAt: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExperimentVariant {
  id: string;
  name: string;
  description: string;
  isControl: boolean;
  trafficPercent: number;
  configOverrides: Record<string, string | number | boolean>;
  sortOrder: number;
  result?: ExperimentResult;
}

export interface ExperimentGoal {
  id: string;
  metricName: string;
  metricType: MetricType;
  isPrimary: boolean;
  mde: number;
}

export interface ExperimentResult {
  sampleSize: number;
  conversions: number;
  conversionRate: number;
  meanValue?: number;
  pValue: number | null;
  ciLower: number | null;
  ciUpper: number | null;
  relativeImprovement: number | null;
  isWinner: boolean;
}

export interface ExperimentApproval {
  id: string;
  experimentId: string;
  requestedBy: string;
  requestedAt: string;
  processedBy: string | null;
  processedAt: string | null;
  decision: "pending" | "approved" | "rejected";
  rejectionReason: string | null;
  versionSnapshot: Record<string, unknown>;
}

export interface ExperimentStateLog {
  id: string;
  experimentId: string;
  fromStatus: ExperimentStatus | null;
  toStatus: ExperimentStatus;
  actorId: string;
  reason: string | null;
  createdAt: string;
}

export type TransitionAction =
  | "start_testing"
  | "request_approval"
  | "approve"
  | "reject"
  | "pause"
  | "resume"
  | "stop"
  | "archive";

export type CreateExperimentRequest = Pick<
  Experiment,
  | "name"
  | "hypothesisWhat"
  | "hypothesisWhy"
  | "hypothesisExpected"
  | "type"
  | "audienceId"
  | "audienceName"
  | "significanceLevel"
  | "startAt"
  | "endAt"
> & {
  variants: Omit<ExperimentVariant, "id" | "result">[];
  goals: Omit<ExperimentGoal, "id">[];
};

export type UpdateExperimentRequest = Partial<
  CreateExperimentRequest & { status: ExperimentStatus }
>;

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta: { generatedAt: string };
}

export const EXPERIMENT_STATUS_CONFIG: Record<
  ExperimentStatus,
  { label: string; bg: string; text: string }
> = {
  draft: { label: "초안", bg: "bg-gray-100", text: "text-gray-600" },
  testing: { label: "사전 테스트", bg: "bg-cyan-100", text: "text-cyan-700" },
  pending_approval: {
    label: "승인 대기",
    bg: "bg-orange-100",
    text: "text-orange-600",
  },
  running: { label: "실행 중", bg: "bg-blue-100", text: "text-blue-600" },
  paused: { label: "일시 중단", bg: "bg-yellow-100", text: "text-yellow-700" },
  stopped: { label: "중단됨", bg: "bg-red-100", text: "text-red-600" },
  analyzing: { label: "분석 중", bg: "bg-purple-100", text: "text-purple-600" },
  completed: { label: "완료", bg: "bg-green-100", text: "text-green-700" },
  archived: { label: "보관", bg: "bg-gray-200", text: "text-gray-500" },
};
