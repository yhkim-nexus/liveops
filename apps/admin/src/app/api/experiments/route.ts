import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getAllExperiments,
  createExperiment,
} from "@/features/experiments/lib/mock-experiments";
import type { ExperimentStatus } from "@/features/experiments/types/experiment";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as ExperimentStatus | null;
  const search = searchParams.get("search");
  const sort = searchParams.get("sort");

  let data = getAllExperiments();

  if (status) {
    data = data.filter((e) => e.status === status);
  }

  if (search) {
    const q = search.toLowerCase();
    data = data.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.hypothesisWhat.toLowerCase().includes(q) ||
        e.hypothesisWhy.toLowerCase().includes(q) ||
        e.hypothesisExpected.toLowerCase().includes(q),
    );
  }

  if (sort) {
    const [field, direction] = sort.split(":");
    const dir = direction === "asc" ? 1 : -1;
    data.sort((a, b) => {
      let aVal: string;
      let bVal: string;
      switch (field) {
        case "name":
          aVal = a.name;
          bVal = b.name;
          break;
        case "status":
          aVal = a.status;
          bVal = b.status;
          break;
        case "startAt":
          aVal = a.startAt ?? "";
          bVal = b.startAt ?? "";
          break;
        case "createdAt":
        default:
          aVal = a.createdAt;
          bVal = b.createdAt;
          break;
      }
      return aVal.localeCompare(bVal) * dir;
    });
  }

  return NextResponse.json({
    success: true,
    data,
    meta: { generatedAt: new Date().toISOString() },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const experiment = createExperiment(body);
  return NextResponse.json(
    {
      success: true,
      data: experiment,
      meta: { generatedAt: new Date().toISOString() },
    },
    { status: 201 },
  );
}
