import { NextRequest, NextResponse } from "next/server";
import { searchPlayers } from "@/features/players/lib/mock-players";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  const players = searchPlayers(q);
  return NextResponse.json({
    success: true,
    data: players,
    meta: { generatedAt: new Date().toISOString() },
  });
}
