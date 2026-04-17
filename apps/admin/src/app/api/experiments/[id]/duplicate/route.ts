import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { duplicateExperiment } from "@/features/experiments/lib/mock-experiments";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const duplicated = duplicateExperiment(id);

  if (!duplicated) {
    return NextResponse.json(
      { success: false, error: "Not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(
    {
      success: true,
      data: duplicated,
      meta: { generatedAt: new Date().toISOString() },
    },
    { status: 201 },
  );
}
