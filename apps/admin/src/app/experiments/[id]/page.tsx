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
  useExperiment,
  useDeleteExperiment,
  useDuplicateExperiment,
  useTransitionExperiment,
  useExperimentStateLog,
} from "@/features/experiments/hooks/use-experiment-queries";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { ExperimentStatusBadge } from "@/features/experiments/components/ExperimentStatusBadge";
import { ExperimentTypeBadge } from "@/features/experiments/components/ExperimentTypeBadge";
import { VariantResultsTable } from "@/features/experiments/components/VariantResultsTable";
import type { ExperimentStatus, TransitionAction } from "@/features/experiments/types/experiment";

type DetailTab = "settings" | "results" | "history";

const ACTION_LABELS: Record<string, string> = {
  start_testing: "사전 테스트 시작",
  request_approval: "승인 요청",
  approve: "승인",
  reject: "반려",
  pause: "일시 중단",
  resume: "재개",
  stop: "종료",
  archive: "보관",
};

function getStatusActions(status: ExperimentStatus): {
  action: TransitionAction;
  label: string;
  variant: "default" | "secondary" | "outline" | "destructive";
  needsReason?: boolean;
}[] {
  switch (status) {
    case "draft":
      return [
        { action: "start_testing", label: "사전 테스트 시작", variant: "default" },
      ];
    case "testing":
      return [
        { action: "request_approval", label: "승인 요청", variant: "default" },
      ];
    case "pending_approval":
      return [
        { action: "approve", label: "승인", variant: "default" },
        { action: "reject", label: "반려", variant: "destructive", needsReason: true },
      ];
    case "running":
      return [
        { action: "pause", label: "일시 중단", variant: "secondary", needsReason: true },
        { action: "stop", label: "종료", variant: "destructive", needsReason: true },
      ];
    case "paused":
      return [
        { action: "resume", label: "재개", variant: "default" },
        { action: "stop", label: "종료", variant: "destructive", needsReason: true },
      ];
    case "stopped":
    case "completed":
      return [
        { action: "archive", label: "보관", variant: "secondary" },
      ];
    default:
      return [];
  }
}

const METRIC_TYPE_LABELS: Record<string, string> = {
  conversion_rate: "전환율",
  average_value: "평균값",
  count: "횟수",
};

export default function ExperimentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { can } = useAuth();
  const { data: experiment, isLoading } = useExperiment(id);
  const { data: stateLog } = useExperimentStateLog(id);
  const deleteMutation = useDeleteExperiment();
  const duplicateMutation = useDuplicateExperiment();
  const transitionMutation = useTransitionExperiment();

  const [activeTab, setActiveTab] = useState<DetailTab>("settings");
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<TransitionAction | null>(null);
  const [reason, setReason] = useState("");

  const handleDelete = () => {
    if (!experiment) return;
    if (experiment.status !== "draft") return;
    if (!confirm("이 실험을 삭제하시겠습니까?")) return;
    deleteMutation.mutate(id, {
      onSuccess: () => router.push("/experiments"),
    });
  };

  const handleDuplicate = () => {
    duplicateMutation.mutate(id, {
      onSuccess: (data) => router.push(`/experiments/${data.id}`),
    });
  };

  const handleActionClick = (action: TransitionAction, needsReason?: boolean) => {
    setPendingAction(action);
    if (needsReason) {
      setReason("");
      setShowReasonModal(true);
    } else {
      transitionMutation.mutate({ id, action });
    }
  };

  const handleReasonConfirm = () => {
    if (!pendingAction) return;
    transitionMutation.mutate(
      { id, action: pendingAction, reason: reason.trim() || undefined },
      {
        onSuccess: () => {
          setShowReasonModal(false);
          setPendingAction(null);
          setReason("");
        },
      },
    );
  };

  const closeReasonModal = () => {
    setShowReasonModal(false);
    setPendingAction(null);
    setReason("");
  };

  const isReasonValid =
    pendingAction === "reject" || pendingAction === "stop" || pendingAction === "pause"
      ? reason.trim().length >= 10
      : true;

  if (isLoading) {
    return <p className="text-muted-foreground">로딩 중...</p>;
  }

  if (!experiment) {
    return <p className="text-muted-foreground">실험을 찾을 수 없습니다.</p>;
  }

  const OPERATOR_ONLY_ACTIONS = new Set(["approve", "reject", "pause", "resume", "stop"]);
  const actions = getStatusActions(experiment.status).filter(
    (act) => !OPERATOR_ONLY_ACTIONS.has(act.action) || can("operator"),
  );
  const hasResults = experiment.variants.some(
    (v) => v.result != null && v.result.sampleSize > 0,
  );
  const showResultsTab = ["running", "analyzing", "completed"].includes(experiment.status);

  const DETAIL_TABS: { id: DetailTab; label: string; show: boolean }[] = [
    { id: "settings", label: "설정 요약", show: true },
    { id: "results", label: "실시간 현황", show: showResultsTab },
    { id: "history", label: "상태 이력", show: true },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/experiments"
            className={buttonVariants({ variant: "ghost", size: "icon" })}
          >
            <ArrowLeft />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{experiment.name}</h2>
              <ExperimentStatusBadge status={experiment.status} />
              <ExperimentTypeBadge type={experiment.type} />
            </div>
            <p className="text-sm text-muted-foreground">
              {experiment.hypothesisWhat}
            </p>
          </div>
        </div>
        {can("editor") && (
          <div className="flex items-center gap-2">
            {/* Status-based action buttons */}
            {actions.map((act) => (
              <Button
                key={act.action}
                variant={act.variant}
                size="sm"
                disabled={transitionMutation.isPending}
                onClick={() => handleActionClick(act.action, act.needsReason)}
              >
                {act.label}
              </Button>
            ))}

            {/* Edit - only for draft/testing */}
            {(experiment.status === "draft" || experiment.status === "testing") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/experiments/${id}/edit`)}
              >
                설정 수정
              </Button>
            )}

            {/* Duplicate - hide for pending_approval */}
            {experiment.status !== "pending_approval" && (
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
            {experiment.status === "draft" && (
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

      {transitionMutation.isError && (
        <p className="text-sm text-destructive">
          상태 전환 실패: {(transitionMutation.error as Error).message}
        </p>
      )}

      {/* Detail Tabs */}
      <div className="flex gap-1 border-b">
        {DETAIL_TABS.filter((t) => t.show).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Settings Summary */}
      {activeTab === "settings" && (
        <div className="space-y-4">
          {/* Hypothesis */}
          <Card>
            <CardHeader>
              <CardTitle>가설</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">무엇을 (What)</dt>
                  <dd className="font-medium">{experiment.hypothesisWhat}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">왜 (Why)</dt>
                  <dd className="font-medium">{experiment.hypothesisWhy}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">예상 결과 (Expected)</dt>
                  <dd className="font-medium">{experiment.hypothesisExpected}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Variants */}
          <Card>
            <CardHeader>
              <CardTitle>변형 (Variants)</CardTitle>
              <CardDescription>
                {experiment.variants.length}개 변형
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VariantResultsTable
                variants={experiment.variants}
                showResults={false}
              />
            </CardContent>
          </Card>

          {/* Goals */}
          <Card>
            <CardHeader>
              <CardTitle>목표 지표</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {experiment.goals.map((goal) => (
                  <div
                    key={goal.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium font-mono">{goal.metricName}</span>
                      {goal.isPrimary && (
                        <Badge variant="default" className="text-[10px]">
                          Primary
                        </Badge>
                      )}
                    </div>
                    <span className="text-muted-foreground">
                      {METRIC_TYPE_LABELS[goal.metricType] ?? goal.metricType} | MDE {goal.mde}%
                    </span>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  유의수준: {experiment.significanceLevel}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Audience & Schedule */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>오디언스</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{experiment.audienceName ?? "전체 플레이어"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>스케줄</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div>
                    <dt className="text-muted-foreground">시작일</dt>
                    <dd>
                      {experiment.startAt
                        ? new Date(experiment.startAt).toLocaleString("ko-KR")
                        : "미설정"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">종료일</dt>
                    <dd>
                      {experiment.endAt
                        ? new Date(experiment.endAt).toLocaleString("ko-KR")
                        : "미설정"}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>

          {/* Meta Info */}
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">실험 ID</dt>
                  <dd className="font-mono">{experiment.id}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">생성자</dt>
                  <dd>{experiment.createdBy}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">생성일</dt>
                  <dd>{new Date(experiment.createdAt).toLocaleString("ko-KR")}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">최종 수정일</dt>
                  <dd>{new Date(experiment.updatedAt).toLocaleString("ko-KR")}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Results */}
      {activeTab === "results" && showResultsTab && (
        <Card>
          <CardHeader>
            <CardTitle>실시간 현황</CardTitle>
            <CardDescription>
              {experiment.variants.length}개 변형 | 주요 지표:{" "}
              {experiment.goals.find((g) => g.isPrimary)?.metricName ?? "-"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasResults ? (
              <VariantResultsTable
                variants={experiment.variants}
                showResults
              />
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">
                아직 결과 데이터가 없습니다.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 3: State History */}
      {activeTab === "history" && (
        <Card>
          <CardHeader>
            <CardTitle>상태 변경 이력</CardTitle>
            <CardDescription>실험 상태 전환 기록</CardDescription>
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
                          <ExperimentStatusBadge status={log.fromStatus} />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <ExperimentStatusBadge status={log.toStatus} />
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
      )}

      {/* Reason Modal */}
      <Dialog open={showReasonModal} onOpenChange={(open) => !open && closeReasonModal()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingAction ? ACTION_LABELS[pendingAction] ?? pendingAction : ""}
            </DialogTitle>
            <DialogDescription>
              사유를 입력해 주세요. (최소 10자 이상)
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
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {reason.length} / 500자
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeReasonModal}>
              취소
            </Button>
            <Button
              onClick={handleReasonConfirm}
              disabled={!isReasonValid || transitionMutation.isPending}
            >
              {transitionMutation.isPending ? "처리 중..." : "확인"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
