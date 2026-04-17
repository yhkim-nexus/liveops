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
import { Badge } from "@/components/ui/badge";
import {
  useRemoteConfigs,
  useDeleteRemoteConfig,
} from "@/features/remote-config/hooks/use-remote-config-queries";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { RemoteConfigTargetBadge } from "@/features/remote-config/components/RemoteConfigTargetBadge";
import { RemoteConfigTypeBadge } from "@/features/remote-config/components/RemoteConfigTypeBadge";
import { RemoteConfigStatusBadge } from "@/features/remote-config/components/RemoteConfigStatusBadge";
import type {
  ConfigTarget,
  ValueType,
  RemoteConfigEntry,
} from "@/features/remote-config/types/remote-config";

const TARGET_OPTIONS = [
  { value: "all", label: "전체 대상" },
  { value: "client", label: "클라이언트" },
  { value: "server", label: "서버" },
  { value: "both", label: "양쪽" },
] as const;

const TYPE_OPTIONS = [
  { value: "all", label: "전체 타입" },
  { value: "string", label: "문자열" },
  { value: "number", label: "숫자" },
  { value: "boolean", label: "불린" },
  { value: "json", label: "JSON" },
] as const;

const STATUS_OPTIONS = [
  { value: "all", label: "전체 상태" },
  { value: "draft", label: "초안" },
  { value: "pending_approval", label: "승인 대기" },
  { value: "active", label: "활성" },
] as const;

const SORT_OPTIONS = [
  { value: "key_asc", label: "키순" },
  { value: "updated_desc", label: "최신 수정순" },
] as const;

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

function truncateValue(value: string, valueType: ValueType): string {
  if (valueType === "boolean") return value;
  if (value.length <= 30) return value;
  return value.slice(0, 30) + "...";
}

export default function RemoteConfigListPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [targetFilter, setTargetFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState("key_asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const debouncedSearch = useDebounce(searchInput, 300);

  const { can } = useAuth();
  const { data: configs, isLoading } = useRemoteConfigs();
  const deleteMutation = useDeleteRemoteConfig();

  // Client-side filtering, sorting, and pagination
  const filteredConfigs = useMemo(() => {
    if (!configs) return [];

    let result = [...configs];

    // Search filter
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase();
      result = result.filter(
        (c) =>
          c.key.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q),
      );
    }

    // Target filter
    if (targetFilter !== "all") {
      result = result.filter((c) => c.target === targetFilter);
    }

    // Type filter
    if (typeFilter !== "all") {
      result = result.filter((c) => c.valueType === typeFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter);
    }

    // Sort
    if (sort === "key_asc") {
      result.sort((a, b) => a.key.localeCompare(b.key));
    } else if (sort === "updated_desc") {
      result.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    }

    return result;
  }, [configs, debouncedSearch, targetFilter, typeFilter, statusFilter, sort]);

  const totalPages = Math.ceil(filteredConfigs.length / pageSize);
  const paginatedConfigs = filteredConfigs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, targetFilter, typeFilter, statusFilter]);

  const hasActiveFilters =
    targetFilter !== "all" ||
    typeFilter !== "all" ||
    statusFilter !== "all" ||
    debouncedSearch.trim() !== "";

  const resetFilters = () => {
    setSearchInput("");
    setTargetFilter("all");
    setTypeFilter("all");
    setStatusFilter("all");
    setSort("key_asc");
  };

  const handleDelete = (
    id: string,
    key: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    if (!confirm(`'${key}'을(를) 삭제합니다.\n이 작업은 되돌릴 수 없습니다.`))
      return;
    deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Remote Config 목록</h2>
        {can("editor") && (
          <Link
            href="/remote-config/new"
            className={buttonVariants({ variant: "default" })}
          >
            <Plus className="mr-1 h-4 w-4" />
            새 설정
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="키 또는 설명 검색..."
            className="w-[220px] pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <Select
          value={targetFilter}
          onValueChange={(v) => {
            if (v) setTargetFilter(v);
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="대상" />
          </SelectTrigger>
          <SelectContent>
            {TARGET_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={typeFilter}
          onValueChange={(v) => {
            if (v) setTypeFilter(v);
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="타입" />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
      ) : filteredConfigs.length === 0 ? (
        hasActiveFilters ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <p className="text-lg font-medium text-muted-foreground">
              검색 결과가 없습니다
            </p>
            <p className="text-sm text-muted-foreground">
              현재 필터 조건에 해당하는 설정을 찾을 수 없습니다.
            </p>
            <Button variant="outline" onClick={resetFilters}>
              <RotateCcw className="mr-1 h-4 w-4" />
              필터 초기화
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <p className="text-lg font-medium text-muted-foreground">
              설정이 없습니다
            </p>
            <p className="text-sm text-muted-foreground">
              첫 번째 원격 설정을 추가해 보세요.
            </p>
            <Link
              href="/remote-config/new"
              className={buttonVariants({ variant: "default" })}
            >
              <Plus className="mr-1 h-4 w-4" />
              새 설정 만들기
            </Link>
          </div>
        )
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>키</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>값</TableHead>
              <TableHead>타입</TableHead>
              <TableHead>대상</TableHead>
              <TableHead>태그</TableHead>
              <TableHead>수정일</TableHead>
              {can("editor") && <TableHead className="w-[1%]" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedConfigs.map((config) => (
              <TableRow
                key={config.id}
                className="group cursor-pointer"
                onClick={() => router.push(`/remote-config/${config.id}`)}
              >
                <TableCell className="font-medium font-mono text-sm">
                  {config.key}
                </TableCell>
                <TableCell>
                  <RemoteConfigStatusBadge status={config.status} />
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                  {truncateValue(config.value, config.valueType)}
                </TableCell>
                <TableCell>
                  <RemoteConfigTypeBadge valueType={config.valueType} />
                </TableCell>
                <TableCell>
                  <RemoteConfigTargetBadge target={config.target} />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {config.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                    {config.tags.length > 2 && (
                      <span className="text-xs text-muted-foreground">
                        +{config.tags.length - 2}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatRelativeTime(config.updatedAt)}
                </TableCell>
                {can("editor") && (
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/remote-config/${config.id}/edit`);
                        }}
                      >
                        편집
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-destructive"
                        onClick={(e) =>
                          handleDelete(config.id, config.key, e)
                        }
                      >
                        삭제
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {filteredConfigs.length > 0 && (
        <PaginationBar
          totalItems={filteredConfigs.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      )}
    </div>
  );
}
