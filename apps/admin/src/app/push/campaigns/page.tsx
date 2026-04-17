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
  useCampaigns,
  useDeleteCampaign,
  useDuplicateCampaign,
  useCancelCampaign,
} from "@/features/push/hooks/use-push-queries";
import { CampaignStatusBadge } from "@/features/push/components/CampaignStatusBadge";
import { CAMPAIGN_STATUS_OPTIONS } from "@/features/push/types/push";
import type { CampaignStatus } from "@/features/push/types/push";
import { useAuth } from "@/features/auth/hooks/use-auth";

const SORT_OPTIONS = [
  { value: "created_at", label: "최신순" },
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

export default function CampaignListPage() {
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

  const { data: campaigns, isLoading } = useCampaigns(filters);
  const deleteMutation = useDeleteCampaign();
  const duplicateMutation = useDuplicateCampaign();
  const cancelMutation = useCancelCampaign();

  // Client-side name search filtering
  const filteredCampaigns = useMemo(() => {
    if (!campaigns) return [];
    if (!debouncedSearch.trim()) return campaigns;
    const q = debouncedSearch.trim().toLowerCase();
    return campaigns.filter((c) => c.name.toLowerCase().includes(q));
  }, [campaigns, debouncedSearch]);

  const totalPages = Math.ceil(filteredCampaigns.length / pageSize);
  void totalPages; // used by PaginationBar via totalItems
  const paginatedCampaigns = filteredCampaigns.slice(
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
      onSuccess: (data) => router.push(`/push/campaigns/${data.id}`),
    });
  };

  const handleDelete = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`'${name}'을(를) 삭제합니다.\n이 작업은 되돌릴 수 없습니다.`)) return;
    deleteMutation.mutate(id);
  };

  const handleCancel = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`'${name}' 캠페인을 취소하시겠습니까?`)) return;
    cancelMutation.mutate(id);
  };

  const formatScheduledAt = (scheduledAt: string | null, scheduleType: string) => {
    if (scheduleType === "immediate") return "즉시";
    if (!scheduledAt) return "-";
    return new Date(scheduledAt).toLocaleString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAudience = (
    audienceType: string,
    audienceName: string | null,
    playerIds: string[] | null,
  ) => {
    if (audienceType === "all") return "전체";
    if (audienceType === "individual") return "개별 지정";
    return audienceName ?? "-";
  };

  const getHoverActions = (
    status: CampaignStatus,
    id: string,
    name: string,
  ) => {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/push/campaigns/${id}`);
          }}
        >
          상세 보기
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={(e) => handleDuplicate(id, e)}
        >
          복제
        </Button>
        {status === "draft" && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/push/campaigns/${id}/edit`);
              }}
            >
              편집
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-destructive"
              onClick={(e) => handleDelete(id, name, e)}
            >
              삭제
            </Button>
          </>
        )}
        {status === "scheduled" && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-destructive"
            onClick={(e) => handleCancel(id, name, e)}
          >
            취소
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">푸시 알림 목록</h2>
        {can("editor") && (
          <Link
            href="/push/campaigns/new"
            className={buttonVariants({ variant: "default" })}
          >
            <Plus className="mr-1 h-4 w-4" />
            새 캠페인
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="캠페인명 검색..."
            className="w-[220px] pl-9"
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
            <SelectItem value="all">전체</SelectItem>
            {CAMPAIGN_STATUS_OPTIONS.map((opt) => (
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
          <SelectTrigger className="w-[120px]">
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

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <RotateCcw className="mr-1 h-4 w-4" />
            초기화
          </Button>
        )}
      </div>



      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-muted" />
          ))}
        </div>
      ) : filteredCampaigns.length === 0 ? (
        hasActiveFilters ? (
          /* Empty filter state */
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <p className="text-lg font-medium text-muted-foreground">
              검색 결과가 없습니다
            </p>
            <p className="text-sm text-muted-foreground">
              현재 필터 조건에 해당하는 캠페인을 찾을 수 없습니다.
            </p>
            <Button variant="outline" onClick={resetFilters}>
              <RotateCcw className="mr-1 h-4 w-4" />
              필터 초기화
            </Button>
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <p className="text-lg font-medium text-muted-foreground">
              캠페인이 없습니다.
            </p>
            <p className="text-sm text-muted-foreground">
              첫 번째 푸시 알림 캠페인을 만들어 보세요.
            </p>
            {can("editor") && (
              <Link
                href="/push/campaigns/new"
                className={buttonVariants({ variant: "default" })}
              >
                <Plus className="mr-1 h-4 w-4" />
                새 캠페인
              </Link>
            )}
          </div>
        )
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>캠페인명</TableHead>
              <TableHead>메시지</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>오디언스</TableHead>
              <TableHead>예약시간</TableHead>
              <TableHead>발송/오픈</TableHead>
              {can("editor") && <TableHead className="w-[1%]" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCampaigns.map((campaign) => (
              <TableRow
                key={campaign.id}
                className="group cursor-pointer"
                onClick={() => router.push(`/push/campaigns/${campaign.id}`)}
              >
                <TableCell className="font-medium max-w-[200px] truncate">
                  {campaign.name}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                  {campaign.title}
                </TableCell>
                <TableCell>
                  <CampaignStatusBadge status={campaign.status} />
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatAudience(
                    campaign.audienceType,
                    campaign.audienceName,
                    campaign.playerIds,
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatScheduledAt(campaign.scheduledAt, campaign.scheduleType)}
                </TableCell>
                <TableCell className="tabular-nums text-sm text-muted-foreground">
                  {campaign.sentCount.toLocaleString("ko-KR")} /{" "}
                  {campaign.openedCount.toLocaleString("ko-KR")}
                </TableCell>
                {can("editor") && (
                  <TableCell className="whitespace-nowrap">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      {getHoverActions(campaign.status, campaign.id, campaign.name)}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {filteredCampaigns.length > 0 && (
        <PaginationBar
          totalItems={filteredCampaigns.length}
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
