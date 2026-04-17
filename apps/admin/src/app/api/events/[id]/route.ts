import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getEventById,
  updateEvent,
  deleteEvent,
} from "@/features/events/lib/mock-events";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const event = getEventById(id);
  if (!event) {
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 },
    );
  }
  return NextResponse.json({
    success: true,
    data: event,
    meta: { generatedAt: new Date().toISOString() },
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const event = updateEvent(id, body);
  if (!event) {
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 },
    );
  }
  return NextResponse.json({
    success: true,
    data: event,
    meta: { generatedAt: new Date().toISOString() },
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const deleted = deleteEvent(id);
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
