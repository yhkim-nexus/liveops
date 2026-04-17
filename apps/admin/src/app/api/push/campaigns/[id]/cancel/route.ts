import { NextRequest, NextResponse } from "next/server";
import { transitionStatus } from "@/features/push/lib/mock-push";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const campaign = transitionStatus(id, "cancel");

  if (!campaign) {
    return NextResponse.json(
      {
        success: false,
        error:
          "캠페인을 찾을 수 없거나 취소할 수 없는 상태입니다. 승인됨·예약됨·발송 중 상태에서만 취소가 가능합니다.",
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    data: campaign,
    meta: { generatedAt: new Date().toISOString() },
  });
}
