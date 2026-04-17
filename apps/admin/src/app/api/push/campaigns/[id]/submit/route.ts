import { NextRequest, NextResponse } from "next/server";
import { transitionStatus } from "@/features/push/lib/mock-push";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const campaign = transitionStatus(id, "submit");

  if (!campaign) {
    return NextResponse.json(
      {
        success: false,
        error: "캠페인을 찾을 수 없거나 초안 상태가 아닙니다. 초안 상태에서만 승인 요청이 가능합니다.",
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
