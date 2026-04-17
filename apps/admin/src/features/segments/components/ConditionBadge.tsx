import { Badge } from "@/components/ui/badge";
import type { AudienceCondition, ConditionGroup } from "../types/segment";
import { formatCondition, formatConditionGroup } from "../lib/mock-segments";

interface ConditionBadgeProps {
  condition: AudienceCondition;
}

export function ConditionBadge({ condition }: ConditionBadgeProps) {
  return <Badge variant="outline">{formatCondition(condition)}</Badge>;
}

interface ConditionGroupBadgeProps {
  group: ConditionGroup;
  index: number;
}

export function ConditionGroupBadge({ group, index }: ConditionGroupBadgeProps) {
  return (
    <div className="flex items-center gap-1">
      {index > 0 && (
        <span className="text-[10px] font-semibold text-orange-600 bg-orange-50 rounded px-1 py-0.5">
          OR
        </span>
      )}
      <Badge variant="outline" className="font-mono text-xs">
        {formatConditionGroup(group)}
      </Badge>
    </div>
  );
}
