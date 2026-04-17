import { NextResponse } from "next/server";
import { generateRetention } from "@/features/dashboard/lib/mock-data";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: generateRetention(),
    meta: { generatedAt: new Date().toISOString() },
  });
}
