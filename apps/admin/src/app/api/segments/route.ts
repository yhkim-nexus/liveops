import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getAllAudiences,
  createAudience,
} from "@/features/segments/lib/mock-segments";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const sort = searchParams.get("sort");
  const search = searchParams.get("search");

  let audiences = getAllAudiences();

  // Filter by status
  if (status && status !== "all") {
    audiences = audiences.filter((a) => a.status === status);
  }

  // Filter by search
  if (search) {
    const q = search.toLowerCase();
    audiences = audiences.filter((a) => a.name.toLowerCase().includes(q));
  }

  // Sort
  if (sort === "member_count") {
    audiences.sort((a, b) => b.memberCount - a.memberCount);
  } else if (sort === "name") {
    audiences.sort((a, b) => a.name.localeCompare(b.name, "ko"));
  } else {
    // Default: updated_at desc
    audiences.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }

  return NextResponse.json({
    success: true,
    data: audiences,
    meta: { generatedAt: new Date().toISOString() },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const audience = createAudience(body);
  return NextResponse.json(
    {
      success: true,
      data: audience,
      meta: { generatedAt: new Date().toISOString() },
    },
    { status: 201 },
  );
}
