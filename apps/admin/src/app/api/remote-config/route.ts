import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getAllConfigs,
  createConfig,
} from "@/features/remote-config/lib/mock-remote-config";
import type {
  ConfigTarget,
  ConfigStatus,
  ValueType,
} from "@/features/remote-config/types/remote-config";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const target = searchParams.get("target") as ConfigTarget | null;
  const valueType = searchParams.get("valueType") as ValueType | null;
  const tag = searchParams.get("tag");
  const status = searchParams.get("status") as ConfigStatus | null;
  const sort = searchParams.get("sort") ?? "key_asc";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const size = Math.max(1, parseInt(searchParams.get("size") ?? "20", 10));

  let data = getAllConfigs();

  if (search) {
    const q = search.toLowerCase();
    data = data.filter(
      (c) =>
        c.key.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q),
    );
  }

  if (target) {
    data = data.filter((c) => c.target === target);
  }

  if (valueType) {
    data = data.filter((c) => c.valueType === valueType);
  }

  if (tag) {
    data = data.filter((c) => c.tags.includes(tag));
  }

  if (status) {
    data = data.filter((c) => c.status === status);
  }

  if (sort === "updated_desc") {
    data.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  } else {
    // default: key_asc
    data.sort((a, b) => a.key.localeCompare(b.key));
  }

  const total = data.length;
  const paginatedItems = data.slice((page - 1) * size, page * size);

  return NextResponse.json({
    success: true,
    data: paginatedItems,
    meta: {
      generatedAt: new Date().toISOString(),
      total,
      page,
      size,
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const config = createConfig(body);
  return NextResponse.json(
    {
      success: true,
      data: config,
      meta: { generatedAt: new Date().toISOString() },
    },
    { status: 201 },
  );
}
