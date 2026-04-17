import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS, type Role } from "../types/auth";

const ROLE_VARIANT: Record<Role, "default" | "secondary" | "outline"> = {
  admin: "default",
  operator: "secondary",
  editor: "outline",
  viewer: "outline",
};

export function RoleBadge({ role }: { role: Role }) {
  return <Badge variant={ROLE_VARIANT[role]}>{ROLE_LABELS[role]}</Badge>;
}
