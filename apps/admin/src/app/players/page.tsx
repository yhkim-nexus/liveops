"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePlayerSearch } from "@/features/players/hooks/use-player-queries";
import { PlayerStatusBadge } from "@/features/players/components/PlayerStatusBadge";
import { PaginationBar } from "@/components/ui/pagination-bar";

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}

export default function PlayersPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const debouncedSearch = useDebounce(searchInput, 300);

  const { data: players, isLoading } = usePlayerSearch(debouncedSearch);

  const paginatedPlayers = useMemo(() => {
    if (!players) return [];
    return players.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize,
    );
  }, [players, currentPage, pageSize]);

  const totalPages = Math.ceil((players?.length ?? 0) / pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">플레이어</h1>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="플레이어 ID, 지갑주소 또는 닉네임으로 검색..."
          className="w-[420px] pl-9"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="플레이어 검색"
        />
      </div>

      {/* Result count */}

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-muted" />
          ))}
        </div>
      ) : !debouncedSearch.trim() && (!players || players.length === 0) ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16">
          <p className="text-lg font-medium text-muted-foreground">
            검색어를 입력하세요
          </p>
          <p className="text-sm text-muted-foreground">
            플레이어 ID, 이메일 또는 닉네임으로 검색할 수 있습니다.
          </p>
        </div>
      ) : players && players.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16">
          <p className="text-lg font-medium text-muted-foreground">
            검색 결과가 없습니다
          </p>
          <p className="text-sm text-muted-foreground">
            &ldquo;{debouncedSearch}&rdquo;에 해당하는 플레이어를 찾을 수 없습니다.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">닉네임</TableHead>
              <TableHead scope="col">지갑주소</TableHead>
              <TableHead scope="col">레벨</TableHead>
              <TableHead scope="col">상태</TableHead>
              <TableHead scope="col">플랫폼</TableHead>
              <TableHead scope="col">국가</TableHead>
              <TableHead scope="col">총 결제액</TableHead>
              <TableHead scope="col">마지막 로그인</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPlayers.map((player) => (
              <TableRow
                key={player.id}
                className="cursor-pointer"
                onClick={() => router.push(`/players/${player.id}`)}
              >
                <TableCell className="font-medium truncate">
                  {player.nickname}
                </TableCell>
                <TableCell className="truncate text-muted-foreground text-sm font-mono">
                  {player.walletAddress.slice(0, 6)}...{player.walletAddress.slice(-4)}
                </TableCell>
                <TableCell className="tabular-nums">
                  {player.level}
                </TableCell>
                <TableCell>
                  <PlayerStatusBadge status={player.status} />
                </TableCell>
                <TableCell>{player.platform}</TableCell>
                <TableCell>{player.country}</TableCell>
                <TableCell className="tabular-nums">
                  {formatCurrency(player.totalSpent)}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(player.lastLoginAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Pagination */}
      {players && players.length > 0 && (
        <PaginationBar
          totalItems={players.length}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
          unit="명"
        />
      )}
    </div>
  );
}
