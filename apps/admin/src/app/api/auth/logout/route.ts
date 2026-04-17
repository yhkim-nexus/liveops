import { NextResponse } from "next/server";
import { getSession, deleteSession } from "@/features/auth/lib/session";
import { addAuditEntry } from "@/features/auth/lib/audit";

export async function POST() {
  const session = await getSession();
  if (session) {
    addAuditEntry({
      actorId: session.userId,
      actorEmail: session.email,
      action: "logout",
      targetType: "session",
      targetId: session.userId,
    });
  }
  await deleteSession();
  return NextResponse.json({ success: true });
}
