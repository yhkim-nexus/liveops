import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { findUserById, updateUserRole } from "@/features/auth/lib/mock-users";
import { addAuditEntry } from "@/features/auth/lib/audit";
import type { ChangeRoleRequest } from "@/features/auth/types/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body: ChangeRoleRequest = await request.json();
  const actorId = request.headers.get("x-user-id") ?? "unknown";
  const actorEmail = request.headers.get("x-user-email") ?? "unknown";

  const user = findUserById(id);
  if (!user) {
    return NextResponse.json({ success: false, error: "관리자를 찾을 수 없습니다" }, { status: 404 });
  }

  const previousRole = user.role;
  const success = updateUserRole(id, body.role);

  if (success) {
    addAuditEntry({
      actorId,
      actorEmail,
      action: "role_changed",
      targetType: "role",
      targetId: id,
      details: { previousRole, newRole: body.role, targetEmail: user.email },
    });
  }

  return NextResponse.json({ success });
}
