"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaginationBar } from "@/components/ui/pagination-bar";
import type { AuditLogEntry, AuditAction } from "@/features/auth/types/auth";

const ACTION_LABELS: Record<AuditAction, string> = {
  login: "로그인",
  logout: "로그아웃",
  role_changed: "역할 변경",
  user_created: "계정 생성",
  user_suspended: "계정 정지",
  user_activated: "계정 활성화",
};

export default function AuditLogPage() {
  const [filter, setFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: entries, isLoading } = useQuery({
    queryKey: ["admin", "audit-log", filter],
    queryFn: async () => {
      const params = filter !== "all" ? `?action=${filter}` : "";
      const res = await fetch(`/api/admin/audit-log${params}`);
      const json = await res.json();
      return json.data as AuditLogEntry[];
    },
  });

  const allEntries = entries ?? [];
  const totalPages = Math.ceil(allEntries.length / pageSize);
  const paginatedEntries = allEntries.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  if (isLoading) return <p className="text-muted-foreground">로딩 중...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">감사 로그</h2>
        <Select value={filter} onValueChange={(v) => setFilter(v ?? "all")}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="login">로그인</SelectItem>
            <SelectItem value="role_changed">역할 변경</SelectItem>
            <SelectItem value="user_created">계정 생성</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>시간</TableHead>
            <TableHead>실행자</TableHead>
            <TableHead>액션</TableHead>
            <TableHead>대상</TableHead>
            <TableHead>상세</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allEntries.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">로그가 없습니다</TableCell>
            </TableRow>
          )}
          {paginatedEntries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="text-xs">{new Date(entry.timestamp).toLocaleString("ko")}</TableCell>
              <TableCell>{entry.actorEmail}</TableCell>
              <TableCell>{ACTION_LABELS[entry.action] ?? entry.action}</TableCell>
              <TableCell>{entry.targetId}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{JSON.stringify(entry.details)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {(entries && entries.length > 0) && (
        <PaginationBar
          totalItems={allEntries.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
        />
      )}
    </div>
  );
}
