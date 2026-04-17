import { NextResponse } from "next/server";
import { changeNickname } from "@/features/players/lib/mock-players";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const { nickname } = body as { nickname: string };

  if (!nickname || nickname.trim().length === 0) {
    return NextResponse.json(
      { success: false, error: "Nickname is required" },
      { status: 400 },
    );
  }

  const player = changeNickname(id, nickname.trim());
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
