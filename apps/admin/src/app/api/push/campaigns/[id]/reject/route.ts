import { NextRequest, NextResponse } from "next/server";
import { transitionStatus } from "@/features/push/lib/mock-push";

interface RejectBody {
  reason: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json()) as RejectBody;

  if (!body.reason || body.reason.trim() === "") {
    return NextResponse.json(
      { success: false, error: "반려 사유(reason)를 입력해주세요." },
      { status: 400 }
    );
  }

  const campaign = transitionStatus(id, "reject", {
    reason: body.reason,
    by: "manager@example.com",
  });

  if (!campaign) {
    return NextResponse.json(
      {
        success: false,
        error: "캠페인을 찾을 수 없거나 승인 대기 상태가 아닙니다. 승인 대기 상태에서만 반려가 가능합니다.",
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
