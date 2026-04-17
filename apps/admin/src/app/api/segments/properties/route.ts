import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getAllProperties,
  getPropertiesByCategory,
  createCustomProperty,
} from "@/features/segments/lib/mock-segments";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  const properties =
    category && (category === "default" || category === "computed" || category === "custom")
      ? getPropertiesByCategory(category)
      : getAllProperties();

  return NextResponse.json({
    success: true,
    data: properties,
    meta: { generatedAt: new Date().toISOString() },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const property = createCustomProperty(body);
  return NextResponse.json(
    {
      success: true,
      data: property,
      meta: { generatedAt: new Date().toISOString() },
    },
    { status: 201 },
  );
}
