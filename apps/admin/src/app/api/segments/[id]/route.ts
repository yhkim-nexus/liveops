import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getAudienceById,
  updateAudience,
  deleteAudience,
} from "@/features/segments/lib/mock-segments";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const audience = getAudienceById(id);
  if (!audience) {
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 },
    );
  }
  return NextResponse.json({
    success: true,
    data: audience,
    meta: { generatedAt: new Date().toISOString() },
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const audience = updateAudience(id, body);
  if (!audience) {
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 },
    );
  }
  return NextResponse.json({
    success: true,
    data: audience,
    meta: { generatedAt: new Date().toISOString() },
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const deleted = deleteAudience(id);
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
