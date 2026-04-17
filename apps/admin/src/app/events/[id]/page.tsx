"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Copy } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useEvent,
  useDeleteEvent,
  useDuplicateEvent,
  useTransitionEvent,
  useEventStateLog,
} from "@/features/events/hooks/use-event-queries";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { EventStatusBadge } from "@/features/events/components/EventStatusBadge";
import { EventTypeBadge } from "@/features/events/components/EventTypeBadge";
import { PriorityBadge } from "@/features/events/components/PriorityBadge";
import type { EventStatus, TransitionAction } from "@/features/events/types/event";

type ModalType = "reason" | "extend" | null;

const ACTION_LABELS: Record<string, string> = {
  request_approval: "승인 요청",
  approve: "승인",
  reject: "반려",
  pause: "일시정지 (Pause)",
  resume: "재개 (Resume)",
  kill: "긴급 종료 (Kill)",
  extend: "기간 연장 (Extend)",
  archive: "보관 (Archive)",
};

function getStatusActions(status: EventStatus): {
  action: TransitionAction;
  label: string;
  variant: "default" | "secondary" | "outline" | "destructive";
  needsReason?: boolean;
  needsExtend?: boolean;
}[] {
  switch (status) {
    case "draft":
      return [
        { action: "request_approval", label: "승인 요청", variant: "default" },
      ];
    case "pending_approval":
      return [
        { action: "approve", label: "승인", variant: "default" },
        { action: "reject", label: "반려", variant: "destructive", needsReason: true },
      ];
    case "active":
      return [
        { action: "pause", label: "일시정지 (Pause)", variant: "secondary", needsReason: true },
        { action: "kill", label: "긴급 종료 (Kill)", variant: "destructive", needsReason: true },
        { action: "extend", label: "기간 연장 (Extend)", variant: "outline", needsExtend: true },
      ];
    case "paused":
      return [
        { action: "resume", label: "재개 (Resume)", variant: "default" },
        { action: "kill", label: "긴급 종료 (Kill)", variant: "destructive", needsReason: true },
      ];
    case "ended":
      return [
        { action: "archive", label: "보관 (Archive)", variant: "secondary" },
      ];
    default:
      return [];
  }
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { can } = useAuth();
  const { data: event, isLoading } = useEvent(id);
  const { data: stateLog } = useEventStateLog(id);
  const deleteMutation = useDeleteEvent();
  const duplicateMutation = useDuplicateEvent();
  const transitionMutation = useTransitionEvent();

  const [modalType, setModalType] = useState<ModalType>(null);
  const [pendingAction, setPendingAction] = useState<TransitionAction | null>(null);
  const [reason, setReason] = useState("");
  const [newEndAt, setNewEndAt] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = () => {
    if (!event) return;
    if (event.status !== "draft") {
      setDeleteError("초안(draft) 상태의 이벤트만 삭제할 수 있습니다.");
      return;
    }
    if (!confirm("이 이벤트를 삭제하시겠습니까?")) return;
    setDeleteError(null);
    deleteMutation.mutate(id, {
      onSuccess: () => router.push("/events"),
    });
  };

  const handleDuplicate = () => {
    duplicateMutation.mutate(id, {
      onSuccess: (data) => router.push(`/events/${data.id}`),
    });
  };

  const handleActionClick = (
    action: TransitionAction,
    needsReason?: boolean,
    needsExtend?: boolean,
  ) => {
    setPendingAction(action);
    if (needsReason) {
      setReason("");
      setModalType("reason");
    } else if (needsExtend) {
      setNewEndAt("");
      setModalType("extend");
    } else {
      // Direct transition
      transitionMutation.mutate({ id, action });
    }
  };

  const handleModalConfirm = () => {
    if (!pendingAction) return;
    if (modalType === "reason") {
      transitionMutation.mutate(
        { id, action: pendingAction, reason: reason.trim() || undefined },
        { onSuccess: () => closeModal() },
      );
    } else if (modalType === "extend") {
      transitionMutation.mutate(
        {
          id,
          action: pendingAction,
          newEndAt: newEndAt ? new Date(newEndAt).toISOString() : undefined,
        },
        { onSuccess: () => closeModal() },
      );
    }
  };

  const closeModal = () => {
    setModalType(null);
    setPendingAction(null);
    setReason("");
    setNewEndAt("");
  };

  const isReasonValid =
    pendingAction === "reject" || pendingAction === "pause" || pendingAction === "kill"
      ? reason.trim().length >= 10
      : true;

  if (isLoading) {
    return <p className="text-muted-foreground">로딩 중...</p>;
  }

  if (!event) {
    return <p className="text-muted-foreground">이벤트를 찾을 수 없습니다.</p>;
  }

  const OPERATOR_ONLY_ACTIONS = new Set(["approve", "reject", "pause", "resume", "kill", "extend"]);
  const actions = getStatusActions(event.status).filter(
    (act) => !OPERATOR_ONLY_ACTIONS.has(act.action) || can("operator"),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/events"
            className={buttonVariants({ variant: "ghost", size: "icon" })}
          >
            <ArrowLeft />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{event.name}</h2>
              <EventStatusBadge status={event.status} />
              <EventTypeBadge type={event.eventType} />
              <PriorityBadge priority={event.priority} />
            </div>
            <p className="text-sm text-muted-foreground">
              {event.description}
            </p>
          </div>
        </div>
        {can("editor") && (
          <div className="flex items-center gap-2">
            {/* Status-based action buttons */}
            {event.status === "scheduled" && (
              <p className="text-sm text-muted-foreground mr-2">
                예정됨 - {event.startAt ? new Date(event.startAt).toLocaleString("ko-KR") : ""}에 자동 활성화
              </p>
            )}
            {actions.map((act) => (
              <Button
                key={act.action}
                variant={act.variant}
                size="sm"
                disabled={transitionMutation.isPending}
                onClick={() =>
                  handleActionClick(act.action, act.needsReason, act.needsExtend)
                }
              >
                {act.label}
              </Button>
            ))}

            {/* Duplicate - hide for pending_approval */}
            {event.status !== "pending_approval" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDuplicate}
                disabled={duplicateMutation.isPending}
              >
                <Copy className="mr-1 h-4 w-4" />
                복제
              </Button>
            )}

            {/* Delete - only for draft */}
            {event.status === "draft" && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                삭제
              </Button>
            )}
          </div>
        )}
      </div>

      {deleteError && (
        <p className="text-sm text-destructive">{deleteError}</p>
      )}

      {transitionMutation.isError && (
        <p className="text-sm text-destructive">
          상태 전환 실패: {(transitionMutation.error as Error).message}
        </p>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>참여자 수</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {event.participantCount.toLocaleString("ko-KR")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>대상 오디언스</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {event.audienceName ?? "전체 회원"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>시작일</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {event.startAt
                ? new Date(event.startAt).toLocaleString("ko-KR")
                : "미설정"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>종료일</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {event.endAt
                ? new Date(event.endAt).toLocaleString("ko-KR")
                : "없음"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Info */}
      <Card>
        <CardHeader>
          <CardTitle>스케줄 정보</CardTitle>
          <CardDescription>이벤트 스케줄링 설정</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">스케줄 유형</dt>
              <dd>
                <Badge variant="outline">
                  {event.scheduleType === "recurring" ? "반복 스케줄" : "단순 스케줄"}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">타임존</dt>
              <dd>{event.displayTimezone}</dd>
            </div>
            {event.rrule && (
              <>
                <div>
                  <dt className="text-muted-foreground">반복 규칙 (rrule)</dt>
                  <dd className="font-mono text-xs">{event.rrule}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">인스턴스 지속 시간</dt>
                  <dd>{event.rruleDurationMinutes}분</dd>
                </div>
              </>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Targeting Card */}
      <Card>
        <CardHeader>
          <CardTitle>타겟팅</CardTitle>
          <CardDescription>대상 오디언스 및 멤버십 설정</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">대상 오디언스</dt>
              <dd>{event.audienceName ?? "전체 회원"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">고정 멤버십 (Sticky Membership)</dt>
              <dd>
                {event.stickyMembership ? (
                  <Badge variant="default">활성</Badge>
                ) : (
                  <Badge variant="secondary">비활성</Badge>
                )}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Metadata Card */}
      <Card>
        <CardHeader>
          <CardTitle>메타데이터</CardTitle>
          <CardDescription>이벤트 메타데이터 및 스키마 버전</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm">
            <dt className="text-muted-foreground mb-1">Payload Schema Version</dt>
            <dd className="font-mono">{event.payloadSchemaVersion ?? "없음"}</dd>
          </div>
          <div className="text-sm">
            <dt className="text-muted-foreground mb-1">Metadata</dt>
            <dd>
              <pre className="rounded-md bg-muted p-3 text-xs font-mono overflow-auto max-h-48">
                {JSON.stringify(event.metadata, null, 2)}
              </pre>
            </dd>
          </div>
        </CardContent>
      </Card>

      {/* Reward Info */}
      <Card>
        <CardHeader>
          <CardTitle>보상 정보</CardTitle>
          <CardDescription>이벤트 참여 시 지급되는 보상</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{event.rewards}</p>
        </CardContent>
      </Card>

      {/* State History */}
      <Card>
        <CardHeader>
          <CardTitle>상태 변경 이력</CardTitle>
          <CardDescription>이벤트 상태 전환 기록</CardDescription>
        </CardHeader>
        <CardContent>
          {stateLog && stateLog.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>시간</TableHead>
                  <TableHead>이전 상태</TableHead>
                  <TableHead>변경 상태</TableHead>
                  <TableHead>실행자</TableHead>
                  <TableHead>사유</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stateLog.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleString("ko-KR")}
                    </TableCell>
                    <TableCell>
                      {log.fromStatus ? (
                        <EventStatusBadge status={log.fromStatus} />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <EventStatusBadge status={log.toStatus} />
                    </TableCell>
                    <TableCell className="text-xs">{log.actorId}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {log.reason ?? "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">상태 변경 이력이 없습니다.</p>
          )}
        </CardContent>
      </Card>

      {/* Meta Info */}
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">이벤트 ID</dt>
              <dd className="font-mono">{event.id}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">생성자</dt>
              <dd>{event.createdBy}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">생성일</dt>
              <dd>{new Date(event.createdAt).toLocaleString("ko-KR")}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">최종 수정일</dt>
              <dd>{new Date(event.updatedAt).toLocaleString("ko-KR")}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Reason Modal */}
      <Dialog open={modalType === "reason"} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingAction ? ACTION_LABELS[pendingAction] ?? pendingAction : ""}
            </DialogTitle>
            <DialogDescription>
              사유를 입력해 주세요.
              {(pendingAction === "reject" || pendingAction === "pause" || pendingAction === "kill") &&
                " (최소 10자 이상)"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">사유</Label>
            <Textarea
              id="reason"
              placeholder="사유를 입력하세요..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              취소
            </Button>
            <Button
              onClick={handleModalConfirm}
              disabled={!isReasonValid || transitionMutation.isPending}
            >
              {transitionMutation.isPending ? "처리 중..." : "확인"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extend Modal */}
      <Dialog open={modalType === "extend"} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>기간 연장</DialogTitle>
            <DialogDescription>
              새로운 종료일시를 선택해 주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="newEndAt">새 종료일시 (UTC)</Label>
            <Input
              id="newEndAt"
              type="datetime-local"
              value={newEndAt}
              onChange={(e) => setNewEndAt(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              취소
            </Button>
            <Button
              onClick={handleModalConfirm}
              disabled={!newEndAt || transitionMutation.isPending}
            >
              {transitionMutation.isPending ? "처리 중..." : "연장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
