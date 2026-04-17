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
import { useExperiments } from "@/features/experiments/hooks/use-experiment-queries";
import { ExperimentTypeBadge } from "@/features/experiments/components/ExperimentTypeBadge";

export default function ExperimentApprovalsPage() {
  const router = useRouter();
  const { data: experiments, isLoading } = useExperiments({ status: "pending_approval" });
  const pending = experiments ?? [];

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
            승인 대기 중인 실험이 없습니다
          </p>
          <p className="text-sm text-muted-foreground">
            모든 실험이 처리되었습니다.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>실험명</TableHead>
              <TableHead>유형</TableHead>
              <TableHead>요청자</TableHead>
              <TableHead>요청 일시</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pending.map((experiment) => (
              <TableRow
                key={experiment.id}
                className="cursor-pointer"
                onClick={() => router.push(`/experiments/${experiment.id}`)}
              >
                <TableCell className="font-medium">
                  {experiment.name}
                </TableCell>
                <TableCell>
                  <ExperimentTypeBadge type={experiment.type} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {experiment.createdBy}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(experiment.updatedAt).toLocaleString("ko-KR")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
