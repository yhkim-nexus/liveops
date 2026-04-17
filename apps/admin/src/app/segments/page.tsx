"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Plus, RotateCcw } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaginationBar } from "@/components/ui/pagination-bar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAudiences,
  useDeleteAudience,
  useDuplicateAudience,
} from "@/features/segments/hooks/use-segment-queries";
import type { Audience } from "@/features/segments/types/segment";
import { useAuth } from "@/features/auth/hooks/use-auth";

const STATUS_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "in_use", label: "In Use" },
  { value: "unused", label: "Unused" },
] as const;

const SORT_OPTIONS = [
  { value: "updated_at", label: "최신 수정순" },
  { value: "member_count", label: "플레이어 수 많은 순" },
  { value: "name", label: "이름 오름차순" },
] as const;

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function formatTimeAgo(dateStr: string | null): string {
  if (!dateStr) return "-";
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

export default function SegmentListPage() {
  const router = useRouter();
  const { can } = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState("updated_at");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const debouncedSearch = useDebounce(searchInput, 300);

  const filters: Record<string, string> = {};
  if (sort !== "updated_at") filters.sort = sort;

  const { data: audiences, isLoading } = useAudiences(filters);
  const deleteMutation = useDeleteAudience();
  const duplicateMutation = useDuplicateAudience();

  // Client-side filtering: name search + In Use / Unused
  const filteredAudiences = useMemo(() => {
    if (!audiences) return [];
    let results = audiences;
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase();
      results = results.filter((a) => a.name.toLowerCase().includes(q));
    }
    if (statusFilter === "in_use") {
      results = results.filter((a) => a.usageCount > 0);
    } else if (statusFilter === "unused") {
      results = results.filter((a) => a.usageCount === 0);
    }
    return results;
  }, [audiences, debouncedSearch, statusFilter]);

  const totalPages = Math.ceil(filteredAudiences.length / pageSize);
  const paginatedAudiences = filteredAudiences.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  const hasActiveFilters =
    statusFilter !== "all" || debouncedSearch.trim() !== "";

  const resetFilters = () => {
    setSearchInput("");
    setStatusFilter("all");
    setSort("updated_at");
  };

  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateMutation.mutate(id);
  };

  const handleDelete = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      !confirm(`'${name}' 오디언스를 삭제합니다.\n이 작업은 되돌릴 수 없습니다.`)
    )
      return;
    deleteMutation.mutate(id);
  };

  const handleArchive = (
    id: string,
    name: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    if (!confirm(`'${name}' 오디언스를 보관 처리하시겠습니까?`)) return;
    // Archive = status change
    fetch(`/api/segments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "archived" }),
    }).then(() => {
      window.location.reload();
    });
  };

  const getHoverActions = (
    status: Audience["status"],
    id: string,
    name: string,
    usageCount: number,
  ) => {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/segments/${id}`);
          }}
        >
          편집
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={(e) => handleDuplicate(id, e)}
        >
          복제
        </Button>
        {status !== "archived" ? (
          usageCount === 0 ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-destructive"
              onClick={(e) => handleDelete(id, name, e)}
            >
              삭제
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={(e) => handleArchive(id, name, e)}
            >
              보관
            </Button>
          )
        ) : null}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">오디언스</h2>
        {can("editor") && (
          <Link
            href="/segments/new"
            className={buttonVariants({ variant: "default" })}
          >
            <Plus className="mr-1 h-4 w-4" />
            오디언스 생성
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="검색어를 입력하세요 (오디언스명)..."
            className="w-[260px] pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(v) => {
            if (v) setStatusFilter(v);
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="상태" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sort}
          onValueChange={(v) => {
            if (v) setSort(v);
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="정렬" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>


      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-muted" />
          ))}
        </div>
      ) : filteredAudiences.length === 0 ? (
        hasActiveFilters ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <p className="text-lg font-medium text-muted-foreground">
              검색 결과가 없습니다
            </p>
            <p className="text-sm text-muted-foreground">
              {debouncedSearch
                ? `"${debouncedSearch}"에 해당하는 오디언스를 찾을 수 없습니다.`
                : "현재 필터 조건에 해당하는 오디언스를 찾을 수 없습니다."}
            </p>
            <Button variant="outline" onClick={resetFilters}>
              <RotateCcw className="mr-1 h-4 w-4" />
              검색어 초기화
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <p className="text-lg font-medium text-muted-foreground">
              오디언스가 없습니다
            </p>
            <p className="text-sm text-muted-foreground">
              첫 번째 오디언스를 생성해 보세요.
            </p>
            <Link
              href="/segments/new"
              className={buttonVariants({ variant: "default" })}
            >
              <Plus className="mr-1 h-4 w-4" />
              오디언스 생성하기
            </Link>
          </div>
        )
      ) : (
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">오디언스명</TableHead>
              <TableHead className="w-[15%] text-right">플레이어 수</TableHead>
              <TableHead className="w-[12%] text-right">상태</TableHead>
              <TableHead className="w-[10%] text-right">사용처</TableHead>
              <TableHead className="w-[15%] text-right">갱신</TableHead>
              {can("editor") && <TableHead className="w-[18%]" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAudiences.map((audience) => (
              <TableRow
                key={audience.id}
                className="group cursor-pointer"
                onClick={() => router.push(`/segments/${audience.id}`)}
              >
                <TableCell className="font-medium">
                  {audience.name}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {audience.memberCount.toLocaleString("ko-KR")}
                </TableCell>
                <TableCell className="text-right">
                  {audience.usageCount > 0 ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      In Use
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      Unused
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  <span
                    className={
                      audience.usageCount > 0
                        ? "text-blue-600 font-medium"
                        : "text-muted-foreground"
                    }
                  >
                    {audience.usageCount > 0
                      ? `${audience.usageCount}건`
                      : "0건"}
                  </span>
                </TableCell>
                <TableCell className="text-right text-muted-foreground text-sm">
                  {formatTimeAgo(audience.lastRefreshedAt)}
                </TableCell>
                {can("editor") && (
                  <TableCell className="whitespace-nowrap">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      {getHoverActions(
                        audience.status,
                        audience.id,
                        audience.name,
                        audience.usageCount,
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {filteredAudiences.length > 0 && (
        <PaginationBar
          totalItems={filteredAudiences.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
        />
      )}
    </div>
  );
}
