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
import { useEvents } from "@/features/events/hooks/use-event-queries";
import { EventStatusBadge } from "@/features/events/components/EventStatusBadge";
import { PriorityBadge } from "@/features/events/components/PriorityBadge";

export default function EventApprovalsPage() {
  const router = useRouter();
  const { data: events, isLoading } = useEvents({ status: "pending_approval" });
  const pending = events ?? [];

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
            승인 대기 중인 이벤트가 없습니다
          </p>
          <p className="text-sm text-muted-foreground">
            모든 이벤트가 처리되었습니다.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이벤트명</TableHead>
              <TableHead>우선순위</TableHead>
              <TableHead>요청자</TableHead>
              <TableHead>요청 일시</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pending.map((event) => (
              <TableRow
                key={event.id}
                className="cursor-pointer"
                onClick={() => router.push(`/events/${event.id}`)}
              >
                <TableCell className="font-medium">
                  {event.name}
                </TableCell>
                <TableCell>
                  <PriorityBadge priority={event.priority} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {event.createdBy}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(event.updatedAt).toLocaleString("ko-KR")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
