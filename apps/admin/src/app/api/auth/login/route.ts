import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { findUserByEmail, verifyPassword, updateLastLogin } from "@/features/auth/lib/mock-users";
import { createSession } from "@/features/auth/lib/session";
import { addAuditEntry } from "@/features/auth/lib/audit";
import type { LoginRequest, SessionPayload } from "@/features/auth/types/auth";

export async function POST(request: NextRequest) {
  const body: LoginRequest = await request.json();

  const user = findUserByEmail(body.email);
  if (!user || !verifyPassword(user, body.password)) {
    return NextResponse.json(
      { success: false, error: "이메일 또는 비밀번호가 올바르지 않습니다" },
      { status: 401 }
    );
  }

  if (user.status === "suspended") {
    return NextResponse.json(
      { success: false, error: "정지된 계정입니다. 관리자에게 문의하세요." },
      { status: 403 }
    );
  }

  const payload: SessionPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };

  await createSession(payload);
  updateLastLogin(user.id);

  addAuditEntry({
    actorId: user.id,
    actorEmail: user.email,
    action: "login",
    targetType: "session",
    targetId: user.id,
    ipAddress: request.headers.get("x-forwarded-for") ?? "127.0.0.1",
  });

  return NextResponse.json({
    success: true,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
}
