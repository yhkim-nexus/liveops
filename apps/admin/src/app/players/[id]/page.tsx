"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  usePlayer,
  useBanPlayer,
  useUnbanPlayer,
  useSuspendPlayer,
  useUnsuspendPlayer,
  useChangeNickname,
} from "@/features/players/hooks/use-player-queries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlayerStatusBadge } from "@/features/players/components/PlayerStatusBadge";
import { useAuth } from "@/features/auth/hooks/use-auth";

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString("en-US")}`;
}

export default function PlayerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { can } = useAuth();
  const { data: player, isLoading } = usePlayer(id);
  const banMutation = useBanPlayer();
  const unbanMutation = useUnbanPlayer();
  const suspendMutation = useSuspendPlayer();
  const unsuspendMutation = useUnsuspendPlayer();
  const nicknameMutation = useChangeNickname();

  const [banReason, setBanReason] = useState("");
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendDuration, setSuspendDuration] = useState("7");
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [newNickname, setNewNickname] = useState("");
  const [nicknameDialogOpen, setNicknameDialogOpen] = useState(false);

  const SUSPEND_DURATION_OPTIONS = [
    { value: "1", label: "1일" },
    { value: "3", label: "3일" },
    { value: "7", label: "7일" },
    { value: "30", label: "30일" },
  ];

  const handleBan = () => {
    if (banReason.length < 10) return;
    banMutation.mutate(
      { id, reason: banReason },
      {
        onSuccess: () => {
          setBanDialogOpen(false);
          setBanReason("");
        },
      },
    );
  };

  const handleUnban = () => {
    unbanMutation.mutate(id);
  };

  const handleSuspend = () => {
    if (suspendReason.length < 10) return;
    suspendMutation.mutate(
      { id, reason: suspendReason, durationDays: Number(suspendDuration) },
      {
        onSuccess: () => {
          setSuspendDialogOpen(false);
          setSuspendReason("");
          setSuspendDuration("7");
        },
      },
    );
  };

  const handleUnsuspend = () => {
    unsuspendMutation.mutate(id);
  };

  const handleChangeNickname = () => {
    if (!newNickname.trim()) return;
    nicknameMutation.mutate(
      { id, nickname: newNickname.trim() },
      {
        onSuccess: () => {
          setNicknameDialogOpen(false);
          setNewNickname("");
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <p className="text-muted-foreground">
        플레이어를 찾을 수 없습니다.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/players"
          className={buttonVariants({ variant: "ghost", size: "icon" })}
          aria-label="플레이어 목록으로 돌아가기"
        >
          <ArrowLeft />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{player.nickname}</h2>
            <PlayerStatusBadge status={player.status} />
          </div>
          <p className="text-sm text-muted-foreground font-mono">
            {player.id}
          </p>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              레벨
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{player.level}</p>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              총 결제액
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {formatCurrency(player.totalSpent)}
            </p>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              마지막 로그인
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{formatDate(player.lastLoginAt)}</p>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              가입일
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{formatDate(player.createdAt)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>프로필 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4 md:grid-cols-4">
            <div>
              <dt className="text-sm text-muted-foreground">지갑주소</dt>
              <dd className="text-sm font-medium font-mono">{player.walletAddress.slice(0, 10)}...{player.walletAddress.slice(-6)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">플랫폼</dt>
              <dd className="text-sm font-medium">{player.platform}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">국가</dt>
              <dd className="text-sm font-medium">{player.country}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">계정 상태</dt>
              <dd className="text-sm">
                <PlayerStatusBadge status={player.status} />
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Device & Version Info */}
      <Card>
        <CardHeader>
          <CardTitle>기기 및 버전 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4 md:grid-cols-3">
            <div>
              <dt className="text-sm text-muted-foreground">마지막 기기</dt>
              <dd className="text-sm font-medium">{player.lastDeviceModel}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">마지막 OS</dt>
              <dd className="text-sm font-medium">{player.lastDeviceOS}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Logic Version</dt>
              <dd className="text-sm font-medium">{player.logicVersion}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Audiences Section */}
      <Card>
        <CardHeader>
          <CardTitle>소속 오디언스</CardTitle>
        </CardHeader>
        <CardContent>
          {player.audiences.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {player.audiences.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700"
                >
                  {name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              소속된 오디언스가 없습니다.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Account Actions Section - Operator+ only */}
      {can("operator") && (
        <Card>
          <CardHeader>
            <CardTitle>계정 관리</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Ban info (if banned) */}
            {player.status === "banned" && player.banReason && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-800">차단 사유</p>
                <p className="mt-1 text-sm text-red-700">{player.banReason}</p>
                {player.bannedAt && (
                  <p className="mt-2 text-xs text-red-500">
                    차단일: {formatDateTime(player.bannedAt)}
                  </p>
                )}
              </div>
            )}

            {/* Suspend info (if suspended) */}
            {player.status === "suspended" && (
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                <p className="text-sm font-medium text-orange-800">정지 사유</p>
                {player.suspendReason && (
                  <p className="mt-1 text-sm text-orange-700">{player.suspendReason}</p>
                )}
                {player.suspendedAt && (
                  <p className="mt-2 text-xs text-orange-500">
                    정지일: {formatDateTime(player.suspendedAt)}
                  </p>
                )}
                {player.suspendedUntil && (
                  <>
                    <p className="mt-1 text-xs text-orange-500">
                      만료일: {formatDateTime(player.suspendedUntil)}
                    </p>
                    <p className="mt-1 text-xs text-orange-600 font-medium">
                      남은 기간: {(() => {
                        const remaining = new Date(player.suspendedUntil).getTime() - Date.now();
                        if (remaining <= 0) return "만료됨";
                        const days = Math.ceil(remaining / (1000 * 60 * 60 * 24));
                        return `${days}일`;
                      })()}
                    </p>
                  </>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              {/* Active: Suspend + Ban buttons */}
              {player.status === "active" && (
                <>
                  <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
                    <DialogTrigger
                      render={
                        <Button variant="secondary" size="sm" className="min-h-[44px] min-w-[44px]" aria-label="플레이어 임시 정지" />
                      }
                    >
                      임시 정지
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>플레이어 임시 정지</DialogTitle>
                        <DialogDescription>
                          {player.nickname} ({player.id})을(를) 임시 정지합니다.
                          정지 사유와 기간을 입력해 주세요.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="suspend-reason">정지 사유 (최소 10자)</Label>
                          <Textarea
                            id="suspend-reason"
                            placeholder="정지 사유를 입력하세요..."
                            value={suspendReason}
                            onChange={(e) => setSuspendReason(e.target.value)}
                            rows={3}
                          />
                          {suspendReason.length > 0 && suspendReason.length < 10 && (
                            <p className="text-xs text-destructive">
                              최소 10자 이상 입력해 주세요. ({suspendReason.length}/10)
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label>정지 기간</Label>
                          <Select value={suspendDuration} onValueChange={(v) => { if (v) setSuspendDuration(v); }}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="정지 기간 선택" />
                            </SelectTrigger>
                            <SelectContent>
                              {SUSPEND_DURATION_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose
                          render={
                            <Button variant="outline" size="sm" />
                          }
                        >
                          취소
                        </DialogClose>
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={suspendReason.length < 10 || suspendMutation.isPending}
                          onClick={handleSuspend}
                        >
                          {suspendMutation.isPending ? "처리 중..." : "확인"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
                    <DialogTrigger
                      render={
                        <Button variant="destructive" size="sm" className="min-h-[44px] min-w-[44px]" aria-label="플레이어 영구 차단" />
                      }
                    >
                      영구 차단
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>플레이어 영구 차단</DialogTitle>
                        <DialogDescription>
                          {player.nickname} ({player.id})을(를) 영구 차단합니다.
                          차단 사유를 입력해 주세요.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-2">
                        <Label htmlFor="ban-reason">차단 사유 (최소 10자)</Label>
                        <Textarea
                          id="ban-reason"
                          placeholder="차단 사유를 입력하세요..."
                          value={banReason}
                          onChange={(e) => setBanReason(e.target.value)}
                          rows={3}
                        />
                        {banReason.length > 0 && banReason.length < 10 && (
                          <p className="text-xs text-destructive">
                            최소 10자 이상 입력해 주세요. ({banReason.length}/10)
                          </p>
                        )}
                      </div>
                      <DialogFooter>
                        <DialogClose
                          render={
                            <Button variant="outline" size="sm" />
                          }
                        >
                          취소
                        </DialogClose>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={banReason.length < 10 || banMutation.isPending}
                          onClick={handleBan}
                        >
                          {banMutation.isPending ? "처리 중..." : "영구 차단"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}

              {/* Suspended: Unsuspend + Ban buttons */}
              {player.status === "suspended" && (
                <>
                  <Button
                    size="sm"
                    className="min-h-[44px] min-w-[44px]"
                    aria-label="플레이어 정지 해제"
                    onClick={handleUnsuspend}
                    disabled={unsuspendMutation.isPending}
                  >
                    {unsuspendMutation.isPending ? "처리 중..." : "정지 해제"}
                  </Button>

                  <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
                    <DialogTrigger
                      render={
                        <Button variant="destructive" size="sm" className="min-h-[44px] min-w-[44px]" aria-label="플레이어 영구 차단" />
                      }
                    >
                      영구 차단
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>플레이어 영구 차단</DialogTitle>
                        <DialogDescription>
                          {player.nickname} ({player.id})을(를) 영구 차단합니다.
                          차단 사유를 입력해 주세요.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-2">
                        <Label htmlFor="ban-reason-suspended">차단 사유 (최소 10자)</Label>
                        <Textarea
                          id="ban-reason-suspended"
                          placeholder="차단 사유를 입력하세요..."
                          value={banReason}
                          onChange={(e) => setBanReason(e.target.value)}
                          rows={3}
                        />
                        {banReason.length > 0 && banReason.length < 10 && (
                          <p className="text-xs text-destructive">
                            최소 10자 이상 입력해 주세요. ({banReason.length}/10)
                          </p>
                        )}
                      </div>
                      <DialogFooter>
                        <DialogClose
                          render={
                            <Button variant="outline" size="sm" />
                          }
                        >
                          취소
                        </DialogClose>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={banReason.length < 10 || banMutation.isPending}
                          onClick={handleBan}
                        >
                          {banMutation.isPending ? "처리 중..." : "영구 차단"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}

              {/* Banned: Unban button */}
              {player.status === "banned" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="min-h-[44px] min-w-[44px]"
                  aria-label="플레이어 차단 해제"
                  onClick={handleUnban}
                  disabled={unbanMutation.isPending}
                >
                  {unbanMutation.isPending ? "처리 중..." : "차단 해제"}
                </Button>
              )}

              {/* Nickname change */}
              <Dialog open={nicknameDialogOpen} onOpenChange={setNicknameDialogOpen}>
                <DialogTrigger
                  render={
                    <Button variant="outline" size="sm" className="min-h-[44px] min-w-[44px]" aria-label="플레이어 닉네임 변경" />
                  }
                >
                  닉네임 변경
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>닉네임 변경</DialogTitle>
                    <DialogDescription>
                      {player.nickname}의 닉네임을 변경합니다.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2">
                    <Label htmlFor="new-nickname">새 닉네임</Label>
                    <Input
                      id="new-nickname"
                      placeholder="새 닉네임을 입력하세요"
                      value={newNickname}
                      onChange={(e) => setNewNickname(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <DialogClose
                      render={
                        <Button variant="outline" size="sm" />
                      }
                    >
                      취소
                    </DialogClose>
                    <Button
                      size="sm"
                      disabled={!newNickname.trim() || nicknameMutation.isPending}
                      onClick={handleChangeNickname}
                    >
                      {nicknameMutation.isPending ? "처리 중..." : "변경"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
