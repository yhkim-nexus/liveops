import { NextResponse } from "next/server";
import { suspendPlayer } from "@/features/players/lib/mock-players";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const { reason, durationDays } = body as { reason: string; durationDays: number };

  if (!reason || reason.length < 10) {
    return NextResponse.json(
      { success: false, error: "Reason must be at least 10 characters" },
      { status: 400 },
    );
  }

  if (!durationDays || durationDays < 1) {
    return NextResponse.json(
      { success: false, error: "Duration must be at least 1 day" },
      { status: 400 },
    );
  }

  const success = suspendPlayer(id, reason, durationDays);
  if (!success) {
    return NextResponse.json(
      { success: false, error: "Player not found or not in active state" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    data: { id },
    meta: { generatedAt: new Date().toISOString() },
  });
}
