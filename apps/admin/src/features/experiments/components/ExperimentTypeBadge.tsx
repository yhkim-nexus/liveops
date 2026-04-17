import { Badge } from "@/components/ui/badge";
import type { ExperimentType } from "../types/experiment";

const TYPE_CONFIG: Record<ExperimentType, { label: string }> = {
  remote_config: { label: "원격 설정" },
  feature_flag: { label: "Feature Flag" },
  event_variant: { label: "이벤트 변형" },
  composite: { label: "복합" },
};

interface ExperimentTypeBadgeProps {
  type: ExperimentType;
}

export function ExperimentTypeBadge({ type }: ExperimentTypeBadgeProps) {
  const config = TYPE_CONFIG[type];
  return <Badge variant="outline">{config.label}</Badge>;
}
