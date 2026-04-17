import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { transitionConfig } from "@/features/remote-config/lib/mock-remote-config";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { action, reason } = await request.json();

  const config = transitionConfig(id, action, reason);
  if (!config) {
    return NextResponse.json(
      { success: false, error: "Config not found or invalid transition" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    success: true,
    data: config,
    meta: { generatedAt: new Date().toISOString() },
  });
}
