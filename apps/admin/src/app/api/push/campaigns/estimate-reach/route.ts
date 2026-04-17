import { NextRequest, NextResponse } from "next/server";
import { estimateReach } from "@/features/push/lib/mock-push";
import type { AudienceType, PlatformFilter } from "@/features/push/types/push";

interface EstimateReachBody {
  audienceType: AudienceType;
  audienceIds: string[] | null;
  platformFilter: PlatformFilter;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as EstimateReachBody;

  const { audienceType, audienceIds, platformFilter } = body;

  if (!audienceType || !platformFilter) {
    return NextResponse.json(
      { success: false, error: "audienceType과 platformFilter는 필수 항목입니다." },
      { status: 400 }
    );
  }

  const reach = estimateReach(audienceType, audienceIds, platformFilter);

  return NextResponse.json({
    success: true,
    data: { estimatedReach: reach },
    meta: { generatedAt: new Date().toISOString() },
  });
}
