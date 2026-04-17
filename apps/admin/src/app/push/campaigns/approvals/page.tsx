"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCampaigns } from "@/features/push/hooks/use-push-queries";
import { CampaignStatusBadge } from "@/features/push/components/CampaignStatusBadge";

export default function PushApprovalsPage() {
  const router = useRouter();
  const { data: campaigns, isLoading } = useCampaigns({ status: "pending_approval" });
  const pending = campaigns ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">승인 대기 목록</h2>
        <p className="text-sm text-muted-foreground">{pending.length}건 대기 중</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-muted" />
          ))}
        </div>
      ) : pending.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <p className="text-lg font-medium text-muted-foreground">
            승인 대기 중인 캠페인이 없습니다
          </p>
          <p className="text-sm text-muted-foreground">
            모든 캠페인이 처리되었습니다.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>캠페인명</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>요청자</TableHead>
              <TableHead>요청 일시</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pending.map((campaign) => (
              <TableRow
                key={campaign.id}
                className="cursor-pointer"
                onClick={() => router.push(`/push/campaigns/${campaign.id}`)}
              >
                <TableCell className="font-medium">
                  {campaign.name}
                </TableCell>
                <TableCell>
                  <CampaignStatusBadge status={campaign.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {campaign.createdBy}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(campaign.updatedAt).toLocaleString("ko-KR")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
