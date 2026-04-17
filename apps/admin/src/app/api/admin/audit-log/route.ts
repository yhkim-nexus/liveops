import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuditLog } from "@/features/auth/lib/audit";
import type { AuditAction } from "@/features/auth/types/auth";

export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get("action") as AuditAction | null;
  const log = getAuditLog(action ? { action } : undefined);
  return NextResponse.json({ success: true, data: log });
}
