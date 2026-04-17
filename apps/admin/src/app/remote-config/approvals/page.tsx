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
import { useRemoteConfigs } from "@/features/remote-config/hooks/use-remote-config-queries";
import { RemoteConfigTypeBadge } from "@/features/remote-config/components/RemoteConfigTypeBadge";
import { RemoteConfigTargetBadge } from "@/features/remote-config/components/RemoteConfigTargetBadge";

export default function RemoteConfigApprovalsPage() {
  const router = useRouter();
  const { data: configs, isLoading } = useRemoteConfigs({ status: "pending_approval" });
  const pending = configs ?? [];

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
            승인 대기 중인 설정이 없습니다
          </p>
          <p className="text-sm text-muted-foreground">
            모든 설정이 처리되었습니다.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>키</TableHead>
              <TableHead>타입</TableHead>
              <TableHead>대상</TableHead>
              <TableHead>요청자</TableHead>
              <TableHead>요청 일시</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pending.map((config) => (
              <TableRow
                key={config.id}
                className="cursor-pointer"
                onClick={() => router.push(`/remote-config/${config.id}`)}
              >
                <TableCell className="font-mono text-sm font-medium">
                  {config.key}
                </TableCell>
                <TableCell>
                  <RemoteConfigTypeBadge valueType={config.valueType} />
                </TableCell>
                <TableCell>
                  <RemoteConfigTargetBadge target={config.target} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {config.updatedBy}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(config.updatedAt).toLocaleString("ko-KR")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
