import { NextResponse } from "next/server";
import { banPlayer } from "@/features/players/lib/mock-players";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const { reason } = body as { reason: string };

  if (!reason || reason.length < 10) {
    return NextResponse.json(
      { success: false, error: "Reason must be at least 10 characters" },
      { status: 400 },
    );
  }

  const player = banPlayer(id, reason);
  if (!player) {
    return NextResponse.json(
      { success: false, error: "Player not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    data: player,
    meta: { generatedAt: new Date().toISOString() },
  });
}
