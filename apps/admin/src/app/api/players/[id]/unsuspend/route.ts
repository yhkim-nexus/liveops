import { NextResponse } from "next/server";
import { unsuspendPlayer } from "@/features/players/lib/mock-players";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const success = unsuspendPlayer(id);
  if (!success) {
    return NextResponse.json(
      { success: false, error: "Player not found or not in suspended state" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    data: { id },
    meta: { generatedAt: new Date().toISOString() },
  });
}
