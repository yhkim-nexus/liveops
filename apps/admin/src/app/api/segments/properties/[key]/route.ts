import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { deleteCustomProperty } from "@/features/segments/lib/mock-segments";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params;
  const deleted = deleteCustomProperty(key);
  if (!deleted) {
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 },
    );
  }
  return NextResponse.json({
    success: true,
    data: { deleted: true },
    meta: { generatedAt: new Date().toISOString() },
  });
}
