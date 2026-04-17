"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import type { ChangeAction, RemoteConfigChangeLog } from "../types/remote-config";

const ACTION_BADGE: Record<ChangeAction, { label: string; className: string }> =
  {
    created: {
      label: "생성",
      className: "bg-green-100 text-green-700",
    },
    updated: {
      label: "수정",
      className: "bg-blue-100 text-blue-700",
    },
    deleted: {
      label: "삭제",
      className: "bg-red-100 text-red-700",
    },
  };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface ChangeLogTableProps {
  logs: RemoteConfigChangeLog[];
}

export function ChangeLogTable({ logs }: ChangeLogTableProps) {
  if (logs.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        변경 이력이 없습니다.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>시각</TableHead>
          <TableHead>변경자</TableHead>
          <TableHead>유형</TableHead>
          <TableHead>필드</TableHead>
          <TableHead>이전 값</TableHead>
          <TableHead>새 값</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => {
          const badge = ACTION_BADGE[log.action];
          return (
            <TableRow key={log.id}>
              <TableCell>{formatDate(log.changedAt)}</TableCell>
              <TableCell>{log.changedBy}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}
                >
                  {badge.label}
                </span>
              </TableCell>
              <TableCell>{log.field ?? "-"}</TableCell>
              <TableCell className="max-w-40 truncate">
                {log.previousValue ?? "(없음)"}
              </TableCell>
              <TableCell className="max-w-40 truncate">
                {log.newValue ?? "(없음)"}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
