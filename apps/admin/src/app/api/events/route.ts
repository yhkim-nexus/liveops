import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getAllEvents,
  createEvent,
} from "@/features/events/lib/mock-events";
import type { LiveEvent } from "@/features/events/types/event";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const eventType = searchParams.get("eventType");
  const priority = searchParams.get("priority");
  const sort = searchParams.get("sort");

  let data: LiveEvent[] = getAllEvents();

  if (status) {
    data = data.filter((e) => e.status === status);
  }
  if (eventType) {
    data = data.filter((e) =>
      e.eventType.toLowerCase().includes(eventType.toLowerCase()),
    );
  }
  if (priority) {
    data = data.filter((e) => e.priority === priority);
  }

  if (sort === "start_at") {
    data.sort((a, b) => (a.startAt ?? "").localeCompare(b.startAt ?? ""));
  } else if (sort === "name") {
    data.sort((a, b) => a.name.localeCompare(b.name, "ko"));
  } else {
    // default: created_at desc
    data.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  return NextResponse.json({
    success: true,
    data,
    meta: { generatedAt: new Date().toISOString() },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const event = createEvent(body);
  return NextResponse.json(
    {
      success: true,
      data: event,
      meta: { generatedAt: new Date().toISOString() },
    },
    { status: 201 },
  );
}
