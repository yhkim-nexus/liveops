import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  transitionEventStatus,
  getStateLog,
} from "@/features/events/lib/mock-events";
import type { TransitionAction } from "@/features/events/types/event";

const VALID_ACTIONS: TransitionAction[] = [
  "request_approval",
  "approve",
  "reject",
  "pause",
  "resume",
  "kill",
  "extend",
  "archive",
];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const { action, reason, newEndAt } = body as {
    action: TransitionAction;
    reason?: string;
    newEndAt?: string;
  };

  if (!action || !VALID_ACTIONS.includes(action)) {
    return NextResponse.json(
      { success: false, error: `유효하지 않은 액션: ${action}` },
      { status: 400 },
    );
  }

  const result = transitionEventStatus(id, action, "admin@liveops.dev", reason, newEndAt);

  if ("error" in result) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 400 },
    );
  }

  return NextResponse.json({
    success: true,
    data: { event: result.event, log: result.log },
    meta: { generatedAt: new Date().toISOString() },
  });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const logs = getStateLog(id);
  return NextResponse.json({
    success: true,
    data: logs,
    meta: { generatedAt: new Date().toISOString() },
  });
}
