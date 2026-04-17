import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { generateSummary } from "@/features/dashboard/lib/mock-data";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date") ?? new Date().toISOString().slice(0, 10);
  return NextResponse.json({
    success: true,
    data: generateSummary(),
    meta: { generatedAt: new Date().toISOString(), date },
  });
}
