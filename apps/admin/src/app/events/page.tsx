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
  useEvents,
  useDeleteEvent,
  useDuplicateEvent,
  useTransitionEvent,
} from "@/features/events/hooks/use-event-queries";
import { EventStatusBadge } from "@/features/events/components/EventStatusBadge";
import { PriorityBadge } from "@/features/events/components/PriorityBadge";
import { PRIORITY_OPTIONS } from "@/features/events/types/event";
import type { EventStatus } from "@/features/events/types/event";
import { useAuth } from "@/features/auth/hooks/use-auth";

const STATUS_OPTIONS = [
  { value: "all", label: "전체 상태" },
  { value: "draft", label: "초안" },
  { value: "pending_approval", label: "승인 대기" },
  { value: "scheduled", label: "예정" },
  { value: "active", label: "활성" },
  { value: "paused", label: "일시정지" },
  { value: "ended", label: "종료" },
  { value: "archived", label: "보관" },
] as const;

const SORT_OPTIONS = [
  { value: "created_at", label: "최신 생성순" },
  { value: "start_at", label: "시작일순" },
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

export default function EventListPage() {
  const router = useRouter();
  const { can } = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sort, setSort] = useState("created_at");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const debouncedSearch = useDebounce(searchInput, 300);

  const filters: Record<string, string> = {};
  if (statusFilter !== "all") filters.status = statusFilter;
  if (priorityFilter !== "all") filters.priority = priorityFilter;
  if (sort !== "created_at") filters.sort = sort;

  const { data: events, isLoading } = useEvents(filters);
  const deleteMutation = useDeleteEvent();
  const duplicateMutation = useDuplicateEvent();
  const archiveMutation = useTransitionEvent();

  // Client-side name search filtering
  const filteredEvents = useMemo(() => {
    if (!events) return [];
    if (!debouncedSearch.trim()) return events;
    const q = debouncedSearch.trim().toLowerCase();
    return events.filter((e) => e.name.toLowerCase().includes(q));
  }, [events, debouncedSearch]);

  const totalPages = Math.ceil(filteredEvents.length / pageSize);
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, priorityFilter]);

  const hasActiveFilters =
    statusFilter !== "all" ||
    priorityFilter !== "all" ||
    debouncedSearch.trim() !== "";

  const resetFilters = () => {
    setSearchInput("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setSort("created_at");
  };

  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateMutation.mutate(id, {
      onSuccess: (data) => router.push(`/events/${data.id}`),
    });
  };

  const handleDelete = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`'${name}'을(를) 삭제합니다.\n이 작업은 되돌릴 수 없습니다.`)) return;
    deleteMutation.mutate(id);
  };

  const handleArchive = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("이 이벤트를 보관 처리하시겠습니까?")) return;
    archiveMutation.mutate({ id, action: "archive" });
  };

  const getHoverActions = (status: EventStatus, id: string, name: string) => {
    if (status === "draft") {
      return (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/events/${id}/edit`);
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

    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/events/${id}`);
          }}
        >
          상세
        </Button>
        {status !== "pending_approval" && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={(e) => handleDuplicate(id, e)}
          >
            복제
          </Button>
        )}
        {status === "ended" && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={(e) => handleArchive(id, e)}
          >
            보관
          </Button>
        )}
      </div>
    );
  };

  const formatSchedule = (event: (typeof filteredEvents)[number]) => {
    if (event.scheduleType === "recurring" && event.rrule) {
      // Simple rrule summary
      if (event.rrule.includes("DAILY")) return "매일 반복";
      if (event.rrule.includes("WEEKLY")) {
        const dayMatch = event.rrule.match(/BYDAY=([A-Z,]+)/);
        return dayMatch ? `매주 ${dayMatch[1]}` : "매주 반복";
      }
      if (event.rrule.includes("MONTHLY")) return "매월 반복";
      return "반복";
    }
    const start = event.startAt
      ? new Date(event.startAt).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" })
      : "-";
    const end = event.endAt
      ? new Date(event.endAt).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" })
      : "";
    return end ? `${start}~${end}` : start;
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">이벤트 목록</h2>
        {can("editor") && (
          <Link
            href="/events/new"
            className={buttonVariants({ variant: "default" })}
          >
            <Plus className="mr-1 h-4 w-4" />
            새 이벤트
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="이벤트명 검색..."
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

        <Select value={priorityFilter} onValueChange={(v) => { if (v) setPriorityFilter(v); }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="우선순위" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 우선순위</SelectItem>
            {PRIORITY_OPTIONS.map((opt) => (
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
      ) : filteredEvents.length === 0 ? (
        hasActiveFilters ? (
          /* Empty filter state */
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <p className="text-lg font-medium text-muted-foreground">
              검색 결과가 없습니다
            </p>
            <p className="text-sm text-muted-foreground">
              현재 필터 조건에 해당하는 이벤트를 찾을 수 없습니다.
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
              이벤트가 없습니다.
            </p>
            <p className="text-sm text-muted-foreground">
              첫 번째 라이브 이벤트를 생성해 보세요.
            </p>
            {can("editor") && (
              <Link
                href="/events/new"
                className={buttonVariants({ variant: "default" })}
              >
                <Plus className="mr-1 h-4 w-4" />
                새 이벤트 만들기
              </Link>
            )}
          </div>
        )
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이벤트명</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>스케줄</TableHead>
              <TableHead>타겟 오디언스</TableHead>
              <TableHead>우선순위</TableHead>
              <TableHead>생성일</TableHead>
              {can("editor") && <TableHead className="w-[1%]" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEvents.map((event) => (
              <TableRow
                key={event.id}
                className="group cursor-pointer"
                onClick={() => router.push(`/events/${event.id}`)}
              >
                <TableCell className="font-medium">
                  {event.name}
                </TableCell>
                <TableCell>
                  <EventStatusBadge status={event.status} />
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatSchedule(event)}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {event.audienceName ?? "전체"}
                </TableCell>
                <TableCell>
                  <PriorityBadge priority={event.priority} />
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(event.createdAt).toLocaleDateString("ko-KR", {
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </TableCell>
                {can("editor") && (
                  <TableCell className="whitespace-nowrap">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      {getHoverActions(event.status, event.id, event.name)}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {filteredEvents.length > 0 && (
        <PaginationBar
          totalItems={filteredEvents.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
        />
      )}
    </div>
  );
}
