import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { duplicateEvent } from "@/features/events/lib/mock-events";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const event = duplicateEvent(id);
  if (!event) {
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 },
    );
  }
  return NextResponse.json(
    {
      success: true,
      data: event,
      meta: { generatedAt: new Date().toISOString() },
    },
    { status: 201 },
  );
}
