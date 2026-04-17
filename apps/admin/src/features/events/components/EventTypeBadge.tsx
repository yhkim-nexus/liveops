import { Badge } from "@/components/ui/badge";

interface EventTypeBadgeProps {
  type: string;
}

export function EventTypeBadge({ type }: EventTypeBadgeProps) {
  return <Badge variant="outline">{type}</Badge>;
}
