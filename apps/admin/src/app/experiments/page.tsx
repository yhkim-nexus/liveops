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
  useExperiments,
  useDeleteExperiment,
  useDuplicateExperiment,
  useTransitionExperiment,
} from "@/features/experiments/hooks/use-experiment-queries";
import { ExperimentStatusBadge } from "@/features/experiments/components/ExperimentStatusBadge";
import { ExperimentTypeBadge } from "@/features/experiments/components/ExperimentTypeBadge";
import type { ExperimentStatus } from "@/features/experiments/types/experiment";
import { useAuth } from "@/features/auth/hooks/use-auth";

const STATUS_OPTIONS = [
  { value: "all", label: "전체 상태" },
  { value: "draft", label: "초안" },
  { value: "testing", label: "사전 테스트" },
  { value: "pending_approval", label: "승인 대기" },
  { value: "running", label: "실행 중" },
  { value: "paused", label: "일시 중단" },
  { value: "stopped", label: "중단됨" },
  { value: "analyzing", label: "분석 중" },
  { value: "completed", label: "완료" },
  { value: "archived", label: "보관" },
] as const;

const SORT_OPTIONS = [
  { value: "created_at", label: "생성일순" },
  { value: "start_at", label: "시작일순" },
  { value: "name", label: "이름순" },
] as const;

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function ExperimentListPage() {
  const router = useRouter();
  const { can } = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState("created_at");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const debouncedSearch = useDebounce(searchInput, 300);

  const filters: Record<string, string> = {};
  if (statusFilter !== "all") filters.status = statusFilter;
  if (sort !== "created_at") filters.sort = sort;

  const { data: experiments, isLoading } = useExperiments(filters);
  const deleteMutation = useDeleteExperiment();
  const duplicateMutation = useDuplicateExperiment();
  const archiveMutation = useTransitionExperiment();

  // Client-side name search filtering
  const filteredExperiments = useMemo(() => {
    if (!experiments) return [];
    if (!debouncedSearch.trim()) return experiments;
    const q = debouncedSearch.trim().toLowerCase();
    return experiments.filter((e) => e.name.toLowerCase().includes(q));
  }, [experiments, debouncedSearch]);

  const totalPages = Math.ceil(filteredExperiments.length / pageSize);
  const paginatedExperiments = filteredExperiments.slice(
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
    setSort("created_at");
  };

  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateMutation.mutate(id, {
      onSuccess: (data) => router.push(`/experiments/${data.id}`),
    });
  };

  const handleDelete = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`'${name}'을(를) 삭제합니다.\n이 작업은 되돌릴 수 없습니다.`)) return;
    deleteMutation.mutate(id);
  };

  const handleArchive = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("이 실험을 보관 처리하시겠습니까?")) return;
    archiveMutation.mutate({ id, action: "archive" });
  };

  const getHoverActions = (status: ExperimentStatus, id: string, name: string) => {
    if (status === "draft") {
      return (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/experiments/${id}/edit`);
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
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-destructive"
            onClick={(e) => handleDelete(id, name, e)}
          >
            삭제
          </Button>
        </div>
      );
    }

    if (status === "testing") {
      return (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/experiments/${id}`);
            }}
          >
            상세
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={(e) => handleDuplicate(id, e)}
          >
            복제
          </Button>
        </div>
      );
    }

    if (status === "pending_approval") {
      return (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/experiments/${id}`);
            }}
          >
            상세
          </Button>
        </div>
      );
    }

    if (status === "running" || status === "paused") {
      return (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/experiments/${id}`);
            }}
          >
            상세
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={(e) => handleDuplicate(id, e)}
          >
            복제
          </Button>
        </div>
      );
    }

    if (status === "completed" || status === "stopped") {
      return (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/experiments/${id}`);
            }}
          >
            상세
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={(e) => handleDuplicate(id, e)}
          >
            복제
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={(e) => handleArchive(id, e)}
          >
            보관
          </Button>
        </div>
      );
    }

    if (status === "archived") {
      return (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/experiments/${id}`);
            }}
          >
            상세
          </Button>
        </div>
      );
    }

    // analyzing or other
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/experiments/${id}`);
          }}
        >
          상세
        </Button>
      </div>
    );
  };

  const formatVariantCount = (variants: { isControl: boolean }[]) => {
    const controlCount = variants.filter((v) => v.isControl).length;
    const variantCount = variants.length - controlCount;
    return `C+${variantCount}`;
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">실험 목록</h2>
        {can("editor") && (
          <Link
            href="/experiments/new"
            className={buttonVariants({ variant: "default" })}
          >
            <Plus className="mr-1 h-4 w-4" />
            새 실험
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="실험명 검색..."
            className="w-[220px] pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={(v) => { if (v) setStatusFilter(v); }}>
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

        <Select value={sort} onValueChange={(v) => { if (v) setSort(v); }}>
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
      ) : filteredExperiments.length === 0 ? (
        hasActiveFilters ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <p className="text-lg font-medium text-muted-foreground">
              검색 결과가 없습니다
            </p>
            <p className="text-sm text-muted-foreground">
              현재 필터 조건에 해당하는 실험을 찾을 수 없습니다.
            </p>
            <Button variant="outline" onClick={resetFilters}>
              <RotateCcw className="mr-1 h-4 w-4" />
              필터 초기화
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <p className="text-lg font-medium text-muted-foreground">
              실험이 없습니다.
            </p>
            <p className="text-sm text-muted-foreground">
              첫 번째 A/B 테스트를 생성해 보세요.
            </p>
            {can("editor") && (
              <Link
                href="/experiments/new"
                className={buttonVariants({ variant: "default" })}
              >
                <Plus className="mr-1 h-4 w-4" />
                새 실험 생성하기
              </Link>
            )}
          </div>
        )
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>실험명</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>유형</TableHead>
              <TableHead>오디언스</TableHead>
              <TableHead>변형 수</TableHead>
              <TableHead>시작일</TableHead>
              <TableHead>종료일</TableHead>
              {can("editor") && <TableHead className="w-[1%]" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedExperiments.map((experiment) => (
              <TableRow
                key={experiment.id}
                className="group cursor-pointer"
                onClick={() => router.push(`/experiments/${experiment.id}`)}
              >
                <TableCell className="font-medium">
                  {experiment.name}
                </TableCell>
                <TableCell>
                  <ExperimentStatusBadge status={experiment.status} />
                </TableCell>
                <TableCell>
                  <ExperimentTypeBadge type={experiment.type} />
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {experiment.audienceName ?? "전체"}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatVariantCount(experiment.variants)}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {experiment.startAt
                    ? new Date(experiment.startAt).toLocaleDateString("ko-KR", {
                        month: "2-digit",
                        day: "2-digit",
                      })
                    : "-"}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {experiment.endAt
                    ? new Date(experiment.endAt).toLocaleDateString("ko-KR", {
                        month: "2-digit",
                        day: "2-digit",
                      })
                    : "-"}
                </TableCell>
                {can("editor") && (
                  <TableCell className="whitespace-nowrap">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      {getHoverActions(experiment.status, experiment.id, experiment.name)}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {filteredExperiments.length > 0 && (
        <PaginationBar
          totalItems={filteredExperiments.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
        />
      )}
    </div>
  );
}
