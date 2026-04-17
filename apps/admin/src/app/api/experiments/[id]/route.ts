import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getExperimentById,
  updateExperiment,
  deleteExperiment,
} from "@/features/experiments/lib/mock-experiments";

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
  return NextResponse.json({
    success: true,
    data: experiment,
    meta: { generatedAt: new Date().toISOString() },
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const experiment = updateExperiment(id, body);
  if (!experiment) {
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 },
    );
  }
  return NextResponse.json({
    success: true,
    data: experiment,
    meta: { generatedAt: new Date().toISOString() },
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const deleted = deleteExperiment(id);
  if (!deleted) {
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 },
    );
  }
  return NextResponse.json({
    success: true,
    data: { deleted: true },
    meta: { generatedAt: new Date().toISOString() },
  });
}
