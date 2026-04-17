import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAllUsers, createUser, findUserByEmail } from "@/features/auth/lib/mock-users";
import { addAuditEntry } from "@/features/auth/lib/audit";
import type { InviteUserRequest } from "@/features/auth/types/auth";

export async function GET() {
  return NextResponse.json({ success: true, data: getAllUsers() });
}

export async function POST(request: NextRequest) {
  const body: InviteUserRequest = await request.json();
  const actorId = request.headers.get("x-user-id") ?? "unknown";
  const actorEmail = request.headers.get("x-user-email") ?? "unknown";

  if (findUserByEmail(body.email)) {
    return NextResponse.json(
      { success: false, error: "이미 등록된 이메일입니다" },
      { status: 409 }
    );
  }

  const newUser = createUser({ email: body.email, name: body.name, role: body.role });

  addAuditEntry({
    actorId,
    actorEmail,
    action: "user_created",
    targetType: "admin_user",
    targetId: newUser.id,
    details: { email: body.email, role: body.role },
  });

  const { passwordHash: _, ...safeUser } = newUser;
  return NextResponse.json({ success: true, data: safeUser }, { status: 201 });
}
