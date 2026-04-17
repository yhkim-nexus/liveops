import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAudienceUsages } from "@/features/segments/lib/mock-segments";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const usages = getAudienceUsages(id);
  return NextResponse.json({
    success: true,
    data: usages,
    meta: { generatedAt: new Date().toISOString() },
  });
}
