import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { duplicateAudience } from "@/features/segments/lib/mock-segments";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const audience = duplicateAudience(id);
  if (!audience) {
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 },
    );
  }
  return NextResponse.json({
    success: true,
    data: audience,
    meta: { generatedAt: new Date().toISOString() },
  });
}
