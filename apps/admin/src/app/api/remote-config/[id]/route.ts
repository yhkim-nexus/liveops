import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getConfigById,
  getChangeLog,
  updateConfig,
  deleteConfig,
} from "@/features/remote-config/lib/mock-remote-config";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const config = getConfigById(id);
  if (!config) {
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 },
    );
  }
  const changeLog = getChangeLog(id);
  return NextResponse.json({
    success: true,
    data: { config, changeLog },
    meta: { generatedAt: new Date().toISOString() },
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const config = updateConfig(id, body);
  if (!config) {
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 },
    );
  }
  return NextResponse.json({
    success: true,
    data: config,
    meta: { generatedAt: new Date().toISOString() },
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const deleted = deleteConfig(id);
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
