import type {
  Experiment,
  ExperimentStateLog,
  ExperimentStatus,
  TransitionAction,
  CreateExperimentRequest,
  UpdateExperimentRequest,
} from "../types/experiment";

// --- Transition map ---

export const TRANSITION_MAP: Record<
  string,
  Partial<Record<TransitionAction, ExperimentStatus>>
> = {
  draft: { start_testing: "testing", archive: "archived" },
  testing: { request_approval: "pending_approval" },
  pending_approval: { approve: "running", reject: "draft" },
  running: { pause: "paused", stop: "stopped" },
  paused: { resume: "running", stop: "stopped" },
  stopped: { archive: "archived" },
  completed: { archive: "archived" },
};

// --- State logs ---

let stateLogs: ExperimentStateLog[] = [
  {
    id: "log-001",
    experimentId: "exp-001",
    fromStatus: null,
    toStatus: "draft",
    actorId: "admin@example.com",
    reason: null,
    createdAt: "2026-03-18T09:00:00Z",
  },
  {
    id: "log-002",
    experimentId: "exp-001",
    fromStatus: "draft",
    toStatus: "testing",
    actorId: "admin@example.com",
    reason: "QA 사전 테스트 시작",
    createdAt: "2026-03-18T15:00:00Z",
  },
  {
    id: "log-003",
    experimentId: "exp-001",
    fromStatus: "testing",
    toStatus: "pending_approval",
    actorId: "admin@example.com",
    reason: "QA 확인 완료, 승인 요청",
    createdAt: "2026-03-19T10:00:00Z",
  },
  {
    id: "log-004",
    experimentId: "exp-001",
    fromStatus: "pending_approval",
    toStatus: "running",
    actorId: "approver@example.com",
    reason: "승인 완료",
    createdAt: "2026-03-20T00:00:00Z",
  },
  {
    id: "log-005",
    experimentId: "exp-002",
    fromStatus: null,
    toStatus: "draft",
    actorId: "admin@example.com",
    reason: null,
    createdAt: "2026-02-25T09:00:00Z",
  },
  {
    id: "log-006",
    experimentId: "exp-002",
    fromStatus: "draft",
    toStatus: "running",
    actorId: "admin@example.com",
    reason: null,
    createdAt: "2026-03-01T00:00:00Z",
  },
  {
    id: "log-007",
    experimentId: "exp-006",
    fromStatus: "running",
    toStatus: "paused",
    actorId: "admin@example.com",
    reason: "지표 이상 감지, 일시 중단",
    createdAt: "2026-03-20T15:00:00Z",
  },
];

let nextLogId = 8;

// --- Mock data store ---

let experiments: Experiment[] = [
  // 1. running — remote_config
  {
    id: "exp-001",
    name: "보상량 최적화",
    hypothesisWhat: "스테이지 클리어 보상을 200으로 변경",
    hypothesisWhy: "보상 증가 시 유저 참여도가 높아질 것으로 기대",
    hypothesisExpected: "유저당 매출이 15% 증가할 것이다",
    type: "remote_config",
    status: "running",
    audienceId: "aud-001",
    audienceName: "고래 회원",
    variants: [
      {
        id: "var-001-a",
        name: "Control",
        description: "기본 보상 100",
        isControl: true,
        trafficPercent: 50,
        configOverrides: { reward: 100 },
        sortOrder: 0,
        result: {
          sampleSize: 5230,
          conversions: 1046,
          conversionRate: 20.0,
          pValue: null,
          ciLower: null,
          ciUpper: null,
          relativeImprovement: null,
          isWinner: false,
        },
      },
      {
        id: "var-001-b",
        name: "Variant A",
        description: "보상 200으로 증가",
        isControl: false,
        trafficPercent: 50,
        configOverrides: { reward: 200 },
        sortOrder: 1,
        result: {
          sampleSize: 5180,
          conversions: 1295,
          conversionRate: 25.0,
          pValue: 0.002,
          ciLower: 2.1,
          ciUpper: 7.9,
          relativeImprovement: 25.0,
          isWinner: false,
        },
      },
    ],
    goals: [
      {
        id: "goal-001",
        metricName: "revenue_per_user",
        metricType: "average_value",
        isPrimary: true,
        mde: 10,
      },
    ],
    significanceLevel: 0.05,
    startAt: "2026-03-20T00:00:00Z",
    endAt: "2026-04-20T23:59:59Z",
    createdBy: "admin@example.com",
    createdAt: "2026-03-18T09:00:00Z",
    updatedAt: "2026-03-20T00:00:00Z",
  },
  // 2. running — feature_flag
  {
    id: "exp-002",
    name: "신규 UI 활성화",
    hypothesisWhat: "신규 UI를 활성화",
    hypothesisWhy: "현대적인 UI가 사용자 경험을 개선할 것으로 기대",
    hypothesisExpected: "7일 리텐션이 10% 향상될 것이다",
    type: "feature_flag",
    status: "running",
    audienceId: null,
    audienceName: null,
    variants: [
      {
        id: "var-002-a",
        name: "Control",
        description: "기존 UI 유지",
        isControl: true,
        trafficPercent: 50,
        configOverrides: { new_ui_enabled: false },
        sortOrder: 0,
        result: {
          sampleSize: 8200,
          conversions: 3280,
          conversionRate: 40.0,
          pValue: null,
          ciLower: null,
          ciUpper: null,
          relativeImprovement: null,
          isWinner: false,
        },
      },
      {
        id: "var-002-b",
        name: "Variant A",
        description: "신규 UI 활성화",
        isControl: false,
        trafficPercent: 50,
        configOverrides: { new_ui_enabled: true },
        sortOrder: 1,
        result: {
          sampleSize: 8150,
          conversions: 3586,
          conversionRate: 44.0,
          pValue: 0.018,
          ciLower: 1.2,
          ciUpper: 6.8,
          relativeImprovement: 10.0,
          isWinner: false,
        },
      },
    ],
    goals: [
      {
        id: "goal-002",
        metricName: "retention_d7",
        metricType: "conversion_rate",
        isPrimary: true,
        mde: 5,
      },
    ],
    significanceLevel: 0.05,
    startAt: "2026-03-01T00:00:00Z",
    endAt: "2026-04-01T23:59:59Z",
    createdBy: "admin@example.com",
    createdAt: "2026-02-25T09:00:00Z",
    updatedAt: "2026-03-01T00:00:00Z",
  },
  // 3. completed — with full results
  {
    id: "exp-003",
    name: "이벤트 기간 테스트",
    hypothesisWhat: "이벤트 기간을 3일에서 7일로 변경",
    hypothesisWhy: "기간이 길수록 참여 기회가 늘어 참여율이 높아질 것으로 기대",
    hypothesisExpected: "참여율이 25% 향상될 것이다",
    type: "event_variant",
    status: "completed",
    audienceId: null,
    audienceName: null,
    variants: [
      {
        id: "var-003-a",
        name: "Control",
        description: "이벤트 기간 3일",
        isControl: true,
        trafficPercent: 50,
        configOverrides: { event_duration_days: 3 },
        sortOrder: 0,
        result: {
          sampleSize: 12400,
          conversions: 3720,
          conversionRate: 30.0,
          pValue: null,
          ciLower: null,
          ciUpper: null,
          relativeImprovement: null,
          isWinner: false,
        },
      },
      {
        id: "var-003-b",
        name: "Variant A",
        description: "이벤트 기간 7일",
        isControl: false,
        trafficPercent: 50,
        configOverrides: { event_duration_days: 7 },
        sortOrder: 1,
        result: {
          sampleSize: 12350,
          conversions: 4940,
          conversionRate: 40.0,
          pValue: 0.0001,
          ciLower: 7.2,
          ciUpper: 12.8,
          relativeImprovement: 33.3,
          isWinner: true,
        },
      },
    ],
    goals: [
      {
        id: "goal-003",
        metricName: "participation_rate",
        metricType: "conversion_rate",
        isPrimary: true,
        mde: 5,
      },
      {
        id: "goal-003b",
        metricName: "revenue_per_user",
        metricType: "average_value",
        isPrimary: false,
        mde: 10,
      },
    ],
    significanceLevel: 0.05,
    startAt: "2026-02-01T00:00:00Z",
    endAt: "2026-03-01T23:59:59Z",
    createdBy: "admin@example.com",
    createdAt: "2026-01-28T10:00:00Z",
    updatedAt: "2026-03-02T00:00:00Z",
  },
  // 4. draft
  {
    id: "exp-004",
    name: "난이도 밸런스",
    hypothesisWhat: "난이도 계수를 0.8로 낮추기",
    hypothesisWhy: "초반 난이도가 높아 이탈율이 높다",
    hypothesisExpected: "세션 시간이 20% 증가할 것이다",
    type: "remote_config",
    status: "draft",
    audienceId: "aud-003",
    audienceName: "신규 회원",
    variants: [
      {
        id: "var-004-a",
        name: "Control",
        description: "기본 난이도 1.0",
        isControl: true,
        trafficPercent: 34,
        configOverrides: { difficulty: 1.0 },
        sortOrder: 0,
      },
      {
        id: "var-004-b",
        name: "Variant A",
        description: "난이도 0.8로 하향",
        isControl: false,
        trafficPercent: 33,
        configOverrides: { difficulty: 0.8 },
        sortOrder: 1,
      },
      {
        id: "var-004-c",
        name: "Variant B",
        description: "난이도 1.2로 상향",
        isControl: false,
        trafficPercent: 33,
        configOverrides: { difficulty: 1.2 },
        sortOrder: 2,
      },
    ],
    goals: [
      {
        id: "goal-004",
        metricName: "session_time",
        metricType: "average_value",
        isPrimary: true,
        mde: 10,
      },
    ],
    significanceLevel: 0.05,
    startAt: null,
    endAt: null,
    createdBy: "planner@example.com",
    createdAt: "2026-03-25T10:00:00Z",
    updatedAt: "2026-03-25T10:00:00Z",
  },
  // 5. testing
  {
    id: "exp-005",
    name: "온보딩 플로우",
    hypothesisWhat: "온보딩 튜토리얼 스킵 옵션과 보상 증가를 함께 적용",
    hypothesisWhy: "강제 튜토리얼이 이탈의 주요 원인으로 지목됨",
    hypothesisExpected: "D1 리텐션이 12% 향상될 것이다",
    type: "composite",
    status: "testing",
    audienceId: "aud-003",
    audienceName: "신규 회원",
    variants: [
      {
        id: "var-005-a",
        name: "Control",
        description: "기본 온보딩 플로우",
        isControl: true,
        trafficPercent: 50,
        configOverrides: { tutorial_skip: false, welcome_reward: 100 },
        sortOrder: 0,
      },
      {
        id: "var-005-b",
        name: "Variant A",
        description: "스킵 가능 + 보상 증가",
        isControl: false,
        trafficPercent: 50,
        configOverrides: { tutorial_skip: true, welcome_reward: 300 },
        sortOrder: 1,
      },
    ],
    goals: [
      {
        id: "goal-005",
        metricName: "d1_retention",
        metricType: "conversion_rate",
        isPrimary: true,
        mde: 5,
      },
    ],
    significanceLevel: 0.05,
    startAt: "2026-03-25T00:00:00Z",
    endAt: "2026-04-10T23:59:59Z",
    createdBy: "planner@example.com",
    createdAt: "2026-03-24T09:00:00Z",
    updatedAt: "2026-03-25T00:00:00Z",
  },
  // 6. pending_approval
  {
    id: "exp-006",
    name: "상점 할인율 테스트",
    hypothesisWhat: "상점 할인율을 20%에서 30%로 변경",
    hypothesisWhy: "할인율 증가 시 구매 전환이 늘어날 것으로 기대",
    hypothesisExpected: "구매 전환율이 18% 증가할 것이다",
    type: "remote_config",
    status: "pending_approval",
    audienceId: "aud-002",
    audienceName: "이탈 위험",
    variants: [
      {
        id: "var-006-a",
        name: "Control",
        description: "할인율 20%",
        isControl: true,
        trafficPercent: 50,
        configOverrides: { discount_rate: 20 },
        sortOrder: 0,
      },
      {
        id: "var-006-b",
        name: "Variant A",
        description: "할인율 30%",
        isControl: false,
        trafficPercent: 50,
        configOverrides: { discount_rate: 30 },
        sortOrder: 1,
      },
    ],
    goals: [
      {
        id: "goal-006",
        metricName: "conversion_rate",
        metricType: "conversion_rate",
        isPrimary: true,
        mde: 5,
      },
    ],
    significanceLevel: 0.05,
    startAt: "2026-03-28T00:00:00Z",
    endAt: "2026-04-15T23:59:59Z",
    createdBy: "admin@example.com",
    createdAt: "2026-03-12T11:00:00Z",
    updatedAt: "2026-03-26T10:00:00Z",
  },
  // 7. pending_approval (second)
  {
    id: "exp-007",
    name: "푸시 알림 문구 테스트",
    hypothesisWhat: "푸시 알림 문구에 이모지 추가",
    hypothesisWhy: "이모지가 시각적 주목도를 높여 클릭률을 올릴 것으로 기대",
    hypothesisExpected: "클릭률이 8% 높아질 것이다",
    type: "remote_config",
    status: "pending_approval",
    audienceId: null,
    audienceName: null,
    variants: [
      {
        id: "var-007-a",
        name: "Control",
        description: "기본 문구",
        isControl: true,
        trafficPercent: 50,
        configOverrides: { push_text: "보상이 기다리고 있어요!" },
        sortOrder: 0,
      },
      {
        id: "var-007-b",
        name: "Variant A",
        description: "이모지 포함 문구",
        isControl: false,
        trafficPercent: 50,
        configOverrides: { push_text: "보상이 기다리고 있어요! \uD83C\uDF81" },
        sortOrder: 1,
      },
    ],
    goals: [
      {
        id: "goal-007",
        metricName: "push_click_rate",
        metricType: "conversion_rate",
        isPrimary: true,
        mde: 3,
      },
    ],
    significanceLevel: 0.1,
    startAt: "2026-03-29T00:00:00Z",
    endAt: "2026-04-05T23:59:59Z",
    createdBy: "planner@example.com",
    createdAt: "2026-03-08T16:00:00Z",
    updatedAt: "2026-03-26T09:00:00Z",
  },
  // 8. paused
  {
    id: "exp-008",
    name: "세션 보상 빈도 실험",
    hypothesisWhat: "세션 보상 지급 빈도를 30분에서 15분으로 단축",
    hypothesisWhy: "보상 빈도 증가 시 세션 유지 시간이 늘어날 것으로 기대",
    hypothesisExpected: "평균 세션 시간이 15% 증가할 것이다",
    type: "remote_config",
    status: "paused",
    audienceId: "aud-001",
    audienceName: "고래 회원",
    variants: [
      {
        id: "var-008-a",
        name: "Control",
        description: "30분 간격 보상",
        isControl: true,
        trafficPercent: 50,
        configOverrides: { reward_interval_min: 30 },
        sortOrder: 0,
        result: {
          sampleSize: 3200,
          conversions: 640,
          conversionRate: 20.0,
          pValue: null,
          ciLower: null,
          ciUpper: null,
          relativeImprovement: null,
          isWinner: false,
        },
      },
      {
        id: "var-008-b",
        name: "Variant A",
        description: "15분 간격 보상",
        isControl: false,
        trafficPercent: 50,
        configOverrides: { reward_interval_min: 15 },
        sortOrder: 1,
        result: {
          sampleSize: 3150,
          conversions: 756,
          conversionRate: 24.0,
          pValue: 0.042,
          ciLower: 0.5,
          ciUpper: 7.5,
          relativeImprovement: 20.0,
          isWinner: false,
        },
      },
    ],
    goals: [
      {
        id: "goal-008",
        metricName: "session_time",
        metricType: "average_value",
        isPrimary: true,
        mde: 10,
      },
    ],
    significanceLevel: 0.05,
    startAt: "2026-03-15T00:00:00Z",
    endAt: "2026-04-15T23:59:59Z",
    createdBy: "admin@example.com",
    createdAt: "2026-03-12T11:00:00Z",
    updatedAt: "2026-03-20T15:00:00Z",
  },
  // 9. archived
  {
    id: "exp-009",
    name: "초기 보석 지급량 테스트",
    hypothesisWhat: "초기 보석 지급량을 100에서 500으로 변경",
    hypothesisWhy: "풍부한 초기 자원이 신규 유저 이탈을 줄일 것으로 기대",
    hypothesisExpected: "D3 리텐션이 8% 향상될 것이다",
    type: "remote_config",
    status: "archived",
    audienceId: "aud-003",
    audienceName: "신규 회원",
    variants: [
      {
        id: "var-009-a",
        name: "Control",
        description: "초기 보석 100개",
        isControl: true,
        trafficPercent: 50,
        configOverrides: { initial_gems: 100 },
        sortOrder: 0,
        result: {
          sampleSize: 10000,
          conversions: 3500,
          conversionRate: 35.0,
          pValue: null,
          ciLower: null,
          ciUpper: null,
          relativeImprovement: null,
          isWinner: false,
        },
      },
      {
        id: "var-009-b",
        name: "Variant A",
        description: "초기 보석 500개",
        isControl: false,
        trafficPercent: 50,
        configOverrides: { initial_gems: 500 },
        sortOrder: 1,
        result: {
          sampleSize: 10050,
          conversions: 3920,
          conversionRate: 39.0,
          pValue: 0.003,
          ciLower: 1.5,
          ciUpper: 6.5,
          relativeImprovement: 11.4,
          isWinner: true,
        },
      },
    ],
    goals: [
      {
        id: "goal-009",
        metricName: "d3_retention",
        metricType: "conversion_rate",
        isPrimary: true,
        mde: 5,
      },
    ],
    significanceLevel: 0.05,
    startAt: "2026-01-10T00:00:00Z",
    endAt: "2026-02-10T23:59:59Z",
    createdBy: "planner@example.com",
    createdAt: "2026-01-05T09:00:00Z",
    updatedAt: "2026-02-15T10:00:00Z",
  },
  // 10. draft — feature_flag
  {
    id: "exp-010",
    name: "상점 UI 개편 테스트",
    hypothesisWhat: "상점 UI를 새로운 카드형 레이아웃으로 변경",
    hypothesisWhy: "기존 리스트형 UI의 구매 전환율이 낮아 시각적 개선이 필요",
    hypothesisExpected: "상점 페이지 체류 시간이 20% 증가할 것이다",
    type: "feature_flag",
    status: "draft",
    audienceId: null,
    audienceName: null,
    variants: [
      {
        id: "var-010-a",
        name: "Control",
        description: "기존 리스트형 상점 UI",
        isControl: true,
        trafficPercent: 50,
        configOverrides: { shop_ui_v2: false },
        sortOrder: 0,
      },
      {
        id: "var-010-b",
        name: "Variant A",
        description: "카드형 상점 UI",
        isControl: false,
        trafficPercent: 50,
        configOverrides: { shop_ui_v2: true },
        sortOrder: 1,
      },
    ],
    goals: [
      {
        id: "goal-010",
        metricName: "shop_page_time",
        metricType: "average_value",
        isPrimary: true,
        mde: 10,
      },
    ],
    significanceLevel: 0.05,
    startAt: null,
    endAt: null,
    createdBy: "planner@example.com",
    createdAt: "2026-03-24T11:00:00Z",
    updatedAt: "2026-03-24T11:00:00Z",
  },
  // 11. testing — remote_config
  {
    id: "exp-011",
    name: "튜토리얼 스킵 실험",
    hypothesisWhat: "튜토리얼 스킵 버튼을 3단계부터 제공",
    hypothesisWhy: "강제 튜토리얼이 신규 유저 이탈의 주요 원인으로 분석됨",
    hypothesisExpected: "튜토리얼 완료율이 15% 향상될 것이다",
    type: "remote_config",
    status: "testing",
    audienceId: "aud-001",
    audienceName: "신규 플레이어",
    variants: [
      {
        id: "var-011-a",
        name: "Control",
        description: "스킵 불가 (기존)",
        isControl: true,
        trafficPercent: 50,
        configOverrides: { tutorial_skip_stage: -1 },
        sortOrder: 0,
      },
      {
        id: "var-011-b",
        name: "Variant A",
        description: "3단계부터 스킵 가능",
        isControl: false,
        trafficPercent: 50,
        configOverrides: { tutorial_skip_stage: 3 },
        sortOrder: 1,
      },
    ],
    goals: [
      {
        id: "goal-011",
        metricName: "tutorial_completion_rate",
        metricType: "conversion_rate",
        isPrimary: true,
        mde: 5,
      },
    ],
    significanceLevel: 0.05,
    startAt: "2026-03-25T00:00:00Z",
    endAt: "2026-04-08T23:59:59Z",
    createdBy: "admin@example.com",
    createdAt: "2026-03-23T14:00:00Z",
    updatedAt: "2026-03-25T00:00:00Z",
  },
  // 12. completed — event_variant with results
  {
    id: "exp-012",
    name: "푸시 알림 시간 최적화",
    hypothesisWhat: "푸시 알림 발송 시간을 오후 6시에서 오후 8시로 변경",
    hypothesisWhy: "유저 활동 데이터 분석 결과 오후 8시 접속률이 가장 높음",
    hypothesisExpected: "푸시 클릭률이 12% 향상될 것이다",
    type: "event_variant",
    status: "completed",
    audienceId: "aud-002",
    audienceName: "활성 플레이어",
    variants: [
      {
        id: "var-012-a",
        name: "Control",
        description: "오후 6시 발송",
        isControl: true,
        trafficPercent: 50,
        configOverrides: { push_hour: 18 },
        sortOrder: 0,
        result: {
          sampleSize: 15200,
          conversions: 2280,
          conversionRate: 15.0,
          pValue: null,
          ciLower: null,
          ciUpper: null,
          relativeImprovement: null,
          isWinner: false,
        },
      },
      {
        id: "var-012-b",
        name: "Variant A",
        description: "오후 8시 발송",
        isControl: false,
        trafficPercent: 50,
        configOverrides: { push_hour: 20 },
        sortOrder: 1,
        result: {
          sampleSize: 15150,
          conversions: 2878,
          conversionRate: 19.0,
          pValue: 0.0003,
          ciLower: 2.1,
          ciUpper: 5.9,
          relativeImprovement: 26.7,
          isWinner: true,
        },
      },
    ],
    goals: [
      {
        id: "goal-012",
        metricName: "push_click_rate",
        metricType: "conversion_rate",
        isPrimary: true,
        mde: 5,
      },
    ],
    significanceLevel: 0.05,
    startAt: "2026-02-15T00:00:00Z",
    endAt: "2026-03-15T23:59:59Z",
    createdBy: "admin@example.com",
    createdAt: "2026-02-10T09:00:00Z",
    updatedAt: "2026-03-16T00:00:00Z",
  },
];

let nextId = 13;

// --- CRUD operations ---

export function getAllExperiments(): Experiment[] {
  return [...experiments];
}

export function getExperimentById(id: string): Experiment | undefined {
  return experiments.find((e) => e.id === id);
}

export function createExperiment(req: CreateExperimentRequest): Experiment {
  const now = new Date().toISOString();
  const expId = `exp-${String(nextId++).padStart(3, "0")}`;
  const experiment: Experiment = {
    id: expId,
    name: req.name,
    hypothesisWhat: req.hypothesisWhat,
    hypothesisWhy: req.hypothesisWhy,
    hypothesisExpected: req.hypothesisExpected,
    type: req.type,
    status: "draft",
    audienceId: req.audienceId,
    audienceName: req.audienceName,
    variants: req.variants.map((v, i) => ({
      ...v,
      id: `var-${expId}-${i}`,
    })),
    goals: req.goals.map((g, i) => ({
      ...g,
      id: `goal-${expId}-${i}`,
    })),
    significanceLevel: req.significanceLevel,
    startAt: req.startAt,
    endAt: req.endAt,
    createdBy: "admin@example.com",
    createdAt: now,
    updatedAt: now,
  };
  experiments = [experiment, ...experiments];
  addStateLog(experiment.id, null, "draft", "admin@example.com", null);
  return experiment;
}

export function updateExperiment(
  id: string,
  req: UpdateExperimentRequest,
): Experiment | undefined {
  const index = experiments.findIndex((e) => e.id === id);
  if (index === -1) return undefined;
  const existing = experiments[index];

  const { variants: reqVariants, goals: reqGoals, ...rest } = req;

  const updatedVariants = reqVariants
    ? reqVariants.map((v, i) => ({ ...v, id: `var-${id}-${i}` }))
    : existing.variants;

  const updatedGoals = reqGoals
    ? reqGoals.map((g, i) => ({ ...g, id: `goal-${id}-${i}` }))
    : existing.goals;

  const updated: Experiment = {
    ...existing,
    ...rest,
    variants: updatedVariants,
    goals: updatedGoals,
    updatedAt: new Date().toISOString(),
  };
  experiments = experiments.map((e) => (e.id === id ? updated : e));
  return updated;
}

export function deleteExperiment(id: string): boolean {
  const target = experiments.find((e) => e.id === id);
  if (!target || target.status !== "draft") return false;
  const len = experiments.length;
  experiments = experiments.filter((e) => e.id !== id);
  return experiments.length < len;
}

export function duplicateExperiment(id: string): Experiment | undefined {
  const original = experiments.find((e) => e.id === id);
  if (!original) return undefined;

  const now = new Date().toISOString();
  const expId = `exp-${String(nextId++).padStart(3, "0")}`;
  const duplicated: Experiment = {
    ...original,
    id: expId,
    name: `${original.name} (복사본)`,
    status: "draft",
    variants: original.variants.map((v, i) => ({
      ...v,
      id: `var-${expId}-${i}`,
      result: undefined,
    })),
    goals: original.goals.map((g, i) => ({
      ...g,
      id: `goal-${expId}-${i}`,
    })),
    createdAt: now,
    updatedAt: now,
  };
  experiments = [duplicated, ...experiments];
  addStateLog(duplicated.id, null, "draft", "admin@example.com", "복제됨");
  return duplicated;
}

export function transitionExperimentStatus(
  id: string,
  action: TransitionAction,
  actorId: string,
  reason: string | null,
): Experiment | undefined {
  const experiment = experiments.find((e) => e.id === id);
  if (!experiment) return undefined;

  const allowed = TRANSITION_MAP[experiment.status];
  if (!allowed) return undefined;

  const nextStatus = allowed[action];
  if (!nextStatus) return undefined;

  const fromStatus = experiment.status;
  const updated: Experiment = {
    ...experiment,
    status: nextStatus,
    updatedAt: new Date().toISOString(),
  };
  experiments = experiments.map((e) => (e.id === id ? updated : e));
  addStateLog(id, fromStatus, nextStatus, actorId, reason);
  return updated;
}

export function addStateLog(
  experimentId: string,
  fromStatus: ExperimentStatus | null,
  toStatus: ExperimentStatus,
  actorId: string,
  reason: string | null,
): ExperimentStateLog {
  const log: ExperimentStateLog = {
    id: `log-${String(nextLogId++).padStart(3, "0")}`,
    experimentId,
    fromStatus,
    toStatus,
    actorId,
    reason,
    createdAt: new Date().toISOString(),
  };
  stateLogs = [...stateLogs, log];
  return log;
}

export function getStateLog(experimentId: string): ExperimentStateLog[] {
  return stateLogs.filter((l) => l.experimentId === experimentId);
}
