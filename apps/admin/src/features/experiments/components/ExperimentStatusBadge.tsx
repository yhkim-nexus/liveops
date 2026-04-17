import type { ExperimentStatus } from "../types/experiment";
import { EXPERIMENT_STATUS_CONFIG } from "../types/experiment";

interface ExperimentStatusBadgeProps {
  status: ExperimentStatus;
}

export function ExperimentStatusBadge({ status }: ExperimentStatusBadgeProps) {
  const config = EXPERIMENT_STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
}
