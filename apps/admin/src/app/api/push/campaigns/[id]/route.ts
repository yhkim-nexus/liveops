import { NextRequest, NextResponse } from "next/server";
import {
  getCampaign,
  updateCampaign,
  deleteCampaign,
} from "@/features/push/lib/mock-push";
import type { UpdateCampaignRequest } from "@/features/push/types/push";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const campaign = getCampaign(id);

  if (!campaign) {
    return NextResponse.json(
      { success: false, error: "캠페인을 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: campaign,
    meta: { generatedAt: new Date().toISOString() },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json()) as UpdateCampaignRequest;

  const campaign = updateCampaign(id, body);

  if (!campaign) {
    return NextResponse.json(
      { success: false, error: "캠페인을 찾을 수 없거나 수정할 수 없는 상태입니다." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: campaign,
    meta: { generatedAt: new Date().toISOString() },
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const success = deleteCampaign(id);

  if (!success) {
    return NextResponse.json(
      {
        success: false,
        error: "캠페인을 찾을 수 없거나 초안 상태가 아닙니다. 초안 상태의 캠페인만 삭제할 수 있습니다.",
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    data: null,
    meta: { generatedAt: new Date().toISOString() },
  });
}
