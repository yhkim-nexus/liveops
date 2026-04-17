import { NextRequest, NextResponse } from "next/server";
import { getPushSettings, updatePushSettings } from "@/features/push/lib/mock-push";
import type { PushSettings } from "@/features/push/types/push";

export async function GET() {
  const settings = getPushSettings();

  return NextResponse.json({
    success: true,
    data: settings,
    meta: { generatedAt: new Date().toISOString() },
  });
}

export async function PATCH(request: NextRequest) {
  const body = (await request.json()) as Partial<PushSettings>;

  if (
    body.dailyMaxPerPlayer !== undefined &&
    (body.dailyMaxPerPlayer < 1 || body.dailyMaxPerPlayer > 10)
  ) {
    return NextResponse.json(
      {
        success: false,
        error: "dailyMaxPerPlayer는 1~10 사이의 값이어야 합니다.",
      },
      { status: 400 }
    );
  }

  const settings = updatePushSettings(body);

  return NextResponse.json({
    success: true,
    data: settings,
    meta: { generatedAt: new Date().toISOString() },
  });
}
