"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useRemoteConfig,
  useDeleteRemoteConfig,
  useTransitionRemoteConfig,
} from "@/features/remote-config/hooks/use-remote-config-queries";
import { RemoteConfigTargetBadge } from "@/features/remote-config/components/RemoteConfigTargetBadge";
import { RemoteConfigTypeBadge } from "@/features/remote-config/components/RemoteConfigTypeBadge";
import { RemoteConfigStatusBadge } from "@/features/remote-config/components/RemoteConfigStatusBadge";
import { ChangeLogTable } from "@/features/remote-config/components/ChangeLogTable";
import { useAuth } from "@/features/auth/hooks/use-auth";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatValue(value: string, valueType: string): string {
  if (valueType === "json") {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }
  return value;
}

export default function RemoteConfigDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { can } = useAuth();
  const { data, isLoading } = useRemoteConfig(id);
  const deleteMutation = useDeleteRemoteConfig();
  const transitionMutation = useTransitionRemoteConfig();

  const handleDelete = () => {
    if (
      !confirm(
        `'${data?.config.key}'을(를) 삭제합니다.\n이 작업은 되돌릴 수 없습니다.`,
      )
    )
      return;
    deleteMutation.mutate(id, {
      onSuccess: () => router.push("/remote-config"),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded bg-muted" />
        ))}
      </div>
    );
  }

  if (!data?.config) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        설정을 찾을 수 없습니다.
      </div>
    );
  }

  const { config, changeLog } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/remote-config"
            className={buttonVariants({ variant: "ghost", size: "icon" })}
          >
            <ArrowLeft />
          </Link>
          <h2 className="text-lg font-semibold font-mono">{config.key}</h2>
          <RemoteConfigStatusBadge status={config.status} />
          <RemoteConfigTargetBadge target={config.target} />
          <RemoteConfigTypeBadge valueType={config.valueType} />
        </div>
        <div className="flex items-center gap-2">
          {/* draft: Editor+ can edit, delete, request approval */}
          {can("editor") && config.status === "draft" && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  if (confirm("이 설정을 승인 요청하시겠습니까?")) {
                    transitionMutation.mutate(
                      { id, action: "request_approval" },
                      { onSuccess: () => {} },
                    );
                  }
                }}
                disabled={transitionMutation.isPending}
              >
                승인 요청
              </Button>
              <Link
                href={`/remote-config/${id}/edit`}
                className={buttonVariants({ variant: "outline" })}
              >
                편집
              </Link>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "삭제 중..." : "삭제"}
              </Button>
            </>
          )}

          {/* pending_approval: Operator+ can approve/reject */}
          {can("operator") && config.status === "pending_approval" && (
            <>
              <Button
                size="sm"
                onClick={() => {
                  if (confirm("이 설정을 승인하시겠습니까?\n승인 시 설정값이 즉시 반영됩니다.")) {
                    transitionMutation.mutate(
                      { id, action: "approve" },
                      { onSuccess: () => {} },
                    );
                  }
                }}
                disabled={transitionMutation.isPending}
              >
                {transitionMutation.isPending ? "처리 중..." : "승인"}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  const reason = prompt("반려 사유를 입력해주세요. (최소 10자)");
                  if (!reason || reason.trim().length < 10) {
                    if (reason !== null) alert("반려 사유는 최소 10자 이상이어야 합니다.");
                    return;
                  }
                  transitionMutation.mutate(
                    { id, action: "reject", reason: reason.trim() },
                    { onSuccess: () => {} },
                  );
                }}
                disabled={transitionMutation.isPending}
              >
                반려
              </Button>
            </>
          )}

          {/* active: Editor+ can edit */}
          {can("editor") && config.status === "active" && (
            <Link
              href={`/remote-config/${id}/edit`}
              className={buttonVariants({ variant: "outline" })}
            >
              편집
            </Link>
          )}
        </div>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>설정 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-4 text-sm">
            <dt className="text-muted-foreground">Key</dt>
            <dd className="font-mono">{config.key}</dd>

            <dt className="text-muted-foreground">Value</dt>
            <dd>
              {config.valueType === "json" ? (
                <pre className="whitespace-pre-wrap rounded bg-muted p-3 font-mono text-xs">
                  {formatValue(config.value, config.valueType)}
                </pre>
              ) : (
                <span className="font-mono">
                  {formatValue(config.value, config.valueType)}
                </span>
              )}
            </dd>

            <dt className="text-muted-foreground">설명</dt>
            <dd>{config.description || "-"}</dd>

            <dt className="text-muted-foreground">Target</dt>
            <dd>
              <RemoteConfigTargetBadge target={config.target} />
            </dd>

            <dt className="text-muted-foreground">Type</dt>
            <dd>
              <RemoteConfigTypeBadge valueType={config.valueType} />
            </dd>

            <dt className="text-muted-foreground">Tags</dt>
            <dd>
              {config.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {config.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : (
                "-"
              )}
            </dd>

            <dt className="text-muted-foreground">생성자</dt>
            <dd>{config.createdBy}</dd>

            <dt className="text-muted-foreground">생성일</dt>
            <dd>{formatDate(config.createdAt)}</dd>

            <dt className="text-muted-foreground">수정자</dt>
            <dd>{config.updatedBy}</dd>

            <dt className="text-muted-foreground">수정일</dt>
            <dd>{formatDate(config.updatedAt)}</dd>
          </dl>
        </CardContent>
      </Card>

      {/* Change Log */}
      <Card>
        <CardHeader>
          <CardTitle>변경 이력</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangeLogTable logs={changeLog} />
        </CardContent>
      </Card>
    </div>
  );
}
