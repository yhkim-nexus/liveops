import { Badge } from "@/components/ui/badge";
import type { EventPriority } from "../types/event";

const CONFIG: Record<EventPriority, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  critical: { label: "Critical", variant: "destructive" },
  high: { label: "High", variant: "default" },
  medium: { label: "Medium", variant: "secondary" },
  low: { label: "Low", variant: "outline" },
};

export function PriorityBadge({ priority }: { priority: EventPriority }) {
  const config = CONFIG[priority];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
