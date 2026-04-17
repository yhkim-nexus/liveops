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
import { Badge } from "@/components/ui/badge";
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
  useCampaign,
  useSubmitCampaign,
  useApproveCampaign,
  useRejectCampaign,
  useCancelCampaign,
} from "@/features/push/hooks/use-push-queries";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { CampaignStatusBadge } from "@/features/push/components/CampaignStatusBadge";
import { SCHEDULE_TYPE_OPTIONS, PLATFORM_OPTIONS } from "@/features/push/types/push";
import type { CampaignStatus } from "@/features/push/types/push";

function getPlatformLabel(value: string): string {
  return PLATFORM_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

function getScheduleTypeLabel(value: string): string {
  return SCHEDULE_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

function formatDatetime(iso: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATS_STATUSES = new Set<CampaignStatus>(["sending", "sent", "failed"]);

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { can } = useAuth();

  const { data: campaign, isLoading } = useCampaign(id);
  const submitMutation = useSubmitCampaign();
  const approveMutation = useApproveCampaign();
  const rejectMutation = useRejectCampaign();
  const cancelMutation = useCancelCampaign();

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const isOperator = can("operator");

  const handleSubmit = () => {
    submitMutation.mutate(id);
  };

  const handleApprove = () => {
    approveMutation.mutate(id);
  };

  const handleRejectOpen = () => {
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = () => {
    if (rejectReason.trim().length < 5) return;
    rejectMutation.mutate(
      { id, reason: rejectReason.trim() },
      {
        onSuccess: () => {
          setRejectDialogOpen(false);
          setRejectReason("");
        },
      },
    );
  };

  const handleCancel = () => {
    if (!confirm("이 캠페인을 취소하시겠습니까?")) return;
    cancelMutation.mutate(id);
  };

  if (isLoading) {
    return <p className="text-muted-foreground">로딩 중...</p>;
  }

  if (!campaign) {
    return <p className="text-muted-foreground">캠페인을 찾을 수 없습니다.</p>;
  }

  const isRejectReasonValid = rejectReason.trim().length >= 5;
  const isMutating =
    submitMutation.isPending ||
    approveMutation.isPending ||
    cancelMutation.isPending;

  const audienceLabel =
    campaign.audienceType === "all"
      ? "전체"
      : campaign.audienceType === "individual"
        ? "개별 지정"
        : campaign.audienceName ?? "-";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/push/campaigns"
            className={buttonVariants({ variant: "ghost", size: "icon" })}
          >
            <ArrowLeft />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{campaign.name}</h2>
              <CampaignStatusBadge status={campaign.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              생성: {formatDatetime(campaign.createdAt)} · {campaign.createdBy}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        {can("editor") && (
          <div className="flex shrink-0 items-center gap-2">
            {/* draft: Editor+ can submit; Operator+ can also directly approve */}
            {campaign.status === "draft" && (
              <>
                <Link
                  href={`/push/campaigns/${id}/edit`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  편집
                </Link>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={isMutating}
                >
                  {submitMutation.isPending ? "처리 중..." : "승인 요청"}
                </Button>
                {isOperator && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleApprove}
                    disabled={isMutating}
                  >
                    {approveMutation.isPending ? "처리 중..." : "승인 후 발송"}
                  </Button>
                )}
              </>
            )}

            {/* pending_approval: Operator+ can approve or reject */}
            {campaign.status === "pending_approval" && isOperator && (
              <>
                <Button
                  size="sm"
                  onClick={handleApprove}
                  disabled={isMutating}
                >
                  {approveMutation.isPending ? "처리 중..." : "승인"}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRejectOpen}
                  disabled={isMutating}
                >
                  반려
                </Button>
              </>
            )}

            {/* scheduled or sending: Operator+ can cancel */}
            {(campaign.status === "scheduled" || campaign.status === "sending") &&
              isOperator && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isMutating || cancelMutation.isPending}
                >
                  {cancelMutation.isPending ? "처리 중..." : "취소"}
                </Button>
              )}
          </div>
        )}
      </div>

      {/* Error feedback */}
      {(submitMutation.isError ||
        approveMutation.isError ||
        rejectMutation.isError ||
        cancelMutation.isError) && (
        <p className="text-sm text-destructive">
          작업 처리에 실패했습니다. 다시 시도해 주세요.
        </p>
      )}

      {/* Info grid */}
      <div className="grid grid-cols-1 gap-4">
        {/* Card 1 — 메시지 */}
        <Card>
          <CardHeader>
            <CardTitle>메시지</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground mb-0.5">제목</dt>
                <dd className="font-medium">{campaign.title}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground mb-0.5">본문</dt>
                <dd className="whitespace-pre-wrap">{campaign.body}</dd>
              </div>
              {campaign.deepLinkUrl && (
                <div>
                  <dt className="text-muted-foreground mb-0.5">딥링크 URL</dt>
                  <dd className="font-mono text-xs break-all">
                    {campaign.deepLinkUrl}
                  </dd>
                </div>
              )}
              {campaign.imageUrl && (
                <div>
                  <dt className="text-muted-foreground mb-0.5">이미지 URL</dt>
                  <dd className="font-mono text-xs break-all">
                    {campaign.imageUrl}
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        {/* Card 2 — 오디언스 */}
        <Card>
          <CardHeader>
            <CardTitle>오디언스</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground mb-0.5">오디언스 유형</dt>
                <dd>
                  {campaign.audienceType === "all"
                    ? "전체"
                    : campaign.audienceType === "individual"
                      ? "개별 지정"
                      : "세그먼트"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground mb-0.5">대상</dt>
                <dd>{audienceLabel}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground mb-0.5">플랫폼</dt>
                <dd>{getPlatformLabel(campaign.platformFilter)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground mb-0.5">푸시 수신 동의 필터</dt>
                <dd>
                  <Badge variant={campaign.pushOptInFilter ? "default" : "secondary"}>
                    {campaign.pushOptInFilter ? "적용" : "미적용"}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground mb-0.5">예상 도달 수</dt>
                <dd className="tabular-nums font-medium">
                  {campaign.estimatedReach.toLocaleString("ko-KR")}명
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Card 3 — 스케줄 */}
        <Card>
          <CardHeader>
            <CardTitle>스케줄</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground mb-0.5">발송 유형</dt>
                <dd>{getScheduleTypeLabel(campaign.scheduleType)}</dd>
              </div>
              {campaign.scheduleType !== "immediate" && (
                <div>
                  <dt className="text-muted-foreground mb-0.5">예약 시간</dt>
                  <dd>{formatDatetime(campaign.scheduledAt)}</dd>
                </div>
              )}
              <div>
                <dt className="text-muted-foreground mb-0.5">타임존</dt>
                <dd>{campaign.timezone}</dd>
              </div>
              {campaign.rrule && (
                <div>
                  <dt className="text-muted-foreground mb-0.5">반복 규칙 (rrule)</dt>
                  <dd className="font-mono text-xs">{campaign.rrule}</dd>
                </div>
              )}
              <div>
                <dt className="text-muted-foreground mb-0.5">플레이어 타임존 사용</dt>
                <dd>
                  <Badge variant={campaign.usePlayerTimezone ? "default" : "secondary"}>
                    {campaign.usePlayerTimezone ? "사용" : "미사용"}
                  </Badge>
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Card 4 — 옵션 */}
        <Card>
          <CardHeader>
            <CardTitle>옵션</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground mb-0.5">우선순위</dt>
                <dd>
                  <Badge
                    variant={
                      campaign.priority === "critical" ? "destructive" : "secondary"
                    }
                  >
                    {campaign.priority === "critical" ? "Critical" : "Normal"}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground mb-0.5">캠페인 ID</dt>
                <dd className="font-mono text-xs text-muted-foreground">
                  {campaign.id}
                </dd>
              </div>
              {campaign.approvedBy && (
                <div>
                  <dt className="text-muted-foreground mb-0.5">승인자</dt>
                  <dd>{campaign.approvedBy}</dd>
                </div>
              )}
              {campaign.sentAt && (
                <div>
                  <dt className="text-muted-foreground mb-0.5">발송 시간</dt>
                  <dd>{formatDatetime(campaign.sentAt)}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* Card 5 — 통계 (sent / sending / failed only) */}
      {STATS_STATUSES.has(campaign.status) && (
        <Card>
          <CardHeader>
            <CardTitle>발송 통계</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg border p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">발송</p>
                <p className="text-2xl font-bold tabular-nums">
                  {campaign.sentCount.toLocaleString("ko-KR")}
                </p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">전달</p>
                <p className="text-2xl font-bold tabular-nums">
                  {campaign.deliveredCount.toLocaleString("ko-KR")}
                </p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">오픈</p>
                <p className="text-2xl font-bold tabular-nums">
                  {campaign.openedCount.toLocaleString("ko-KR")}
                </p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <p className="text-xs text-muted-foreground mb-1">실패</p>
                <p className="text-2xl font-bold tabular-nums text-destructive">
                  {campaign.failedCount.toLocaleString("ko-KR")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Card 6 — 반려 사유 */}
      {campaign.rejectionReason && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">반려 사유</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{campaign.rejectionReason}</p>
            {campaign.rejectedBy && (
              <p className="mt-2 text-xs text-muted-foreground">
                반려자: {campaign.rejectedBy}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onOpenChange={(open) => !open && setRejectDialogOpen(false)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>캠페인 반려</DialogTitle>
            <DialogDescription>
              반려 사유를 입력해 주세요. (최소 5자 이상)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-reason">반려 사유</Label>
            <Textarea
              id="reject-reason"
              placeholder="반려 사유를 입력하세요..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
            {rejectReason.length > 0 && !isRejectReasonValid && (
              <p className="text-xs text-destructive">
                최소 5자 이상 입력해 주세요.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={!isRejectReasonValid || rejectMutation.isPending}
            >
              {rejectMutation.isPending ? "처리 중..." : "반려 확인"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
