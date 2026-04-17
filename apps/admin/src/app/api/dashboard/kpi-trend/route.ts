import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { generateKpiTrend } from "@/features/dashboard/lib/mock-data";
import type { Period } from "@/features/dashboard/types/dashboard";

export async function GET(request: NextRequest) {
  const period = (request.nextUrl.searchParams.get("period") ?? "30d") as Period;
  return NextResponse.json({
    success: true,
    data: generateKpiTrend(period),
    meta: { generatedAt: new Date().toISOString(), period },
  });
}
