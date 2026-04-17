import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getAllEventDefinitions,
  createEventDefinition,
} from "@/features/segments/lib/mock-segments";

export async function GET() {
  const events = getAllEventDefinitions();
  return NextResponse.json({
    success: true,
    data: events,
    meta: { generatedAt: new Date().toISOString() },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const event = createEventDefinition(body);
  return NextResponse.json(
    {
      success: true,
      data: event,
      meta: { generatedAt: new Date().toISOString() },
    },
    { status: 201 },
  );
}
