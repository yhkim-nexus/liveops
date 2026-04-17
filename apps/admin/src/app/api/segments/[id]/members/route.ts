import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSampleMembers } from "@/features/segments/lib/mock-segments";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const members = getSampleMembers(id);
  return NextResponse.json({
    success: true,
    data: members,
    meta: { generatedAt: new Date().toISOString() },
  });
}
