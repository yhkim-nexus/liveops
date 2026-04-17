import { NextResponse } from "next/server";
import { unbanPlayer } from "@/features/players/lib/mock-players";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const player = unbanPlayer(id);
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
