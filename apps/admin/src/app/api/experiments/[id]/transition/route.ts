import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  transitionExperimentStatus,
  getStateLog,
  getExperimentById,
} from "@/features/experiments/lib/mock-experiments";
import { TRANSITION_MAP } from "@/features/experiments/lib/mock-experiments";
import type { TransitionAction } from "@/features/experiments/types/experiment";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const { action, reason } = body as {
    action: TransitionAction;
    reason?: string;
  };

  const experiment = getExperimentById(id);
  if (!experiment) {
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 },
    );
  }

  const allowed = TRANSITION_MAP[experiment.status];
  if (!allowed || !allowed[action]) {
    return NextResponse.json(
      {
        success: false,
        error: `Invalid transition: ${experiment.status} -> ${action}`,
      },
      { status: 400 },
    );
  }

  const updated = transitionExperimentStatus(
    id,
    action,
    "admin@example.com",
    reason ?? null,
  );

  if (!updated) {
    return NextResponse.json(
      { success: false, error: "Transition failed" },
      { status: 400 },
    );
  }

  return NextResponse.json({
    success: true,
    data: updated,
    meta: { generatedAt: new Date().toISOString() },
  });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const experiment = getExperimentById(id);
  if (!experiment) {
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 },
    );
  }

  const logs = getStateLog(id);
  return NextResponse.json({
    success: true,
    data: logs,
    meta: { generatedAt: new Date().toISOString() },
  });
}
