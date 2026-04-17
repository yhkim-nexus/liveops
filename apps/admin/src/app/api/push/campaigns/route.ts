import { NextRequest, NextResponse } from "next/server";
import {
  getAllCampaigns,
  createCampaign,
  type GetCampaignsFilters,
} from "@/features/push/lib/mock-push";
import type { CampaignStatus, CreateCampaignRequest } from "@/features/push/types/push";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const filters: GetCampaignsFilters = {
    status: (searchParams.get("status") as CampaignStatus) || undefined,
    search: searchParams.get("search") || undefined,
    sortBy: (searchParams.get("sortBy") as keyof ReturnType<typeof getAllCampaigns>[number]) || undefined,
    sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || undefined,
  };

  const data = getAllCampaigns(filters);

  return NextResponse.json({
    success: true,
    data,
    meta: { generatedAt: new Date().toISOString() },
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as CreateCampaignRequest;

  const campaign = createCampaign(body);

  return NextResponse.json(
    {
      success: true,
      data: campaign,
      meta: { generatedAt: new Date().toISOString() },
    },
    { status: 201 }
  );
}
