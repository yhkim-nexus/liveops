"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, Pencil } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAudience,
  useDeleteAudience,
  useRefreshAudience,
  useAudienceUsages,
  useAudienceSampleMembers,
} from "@/features/segments/hooks/use-segment-queries";
import { ConditionGroupBadge } from "@/features/segments/components/ConditionBadge";
import { useAuth } from "@/features/auth/hooks/use-auth";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTimeAgo(dateStr: string | null): string {
  if (!dateStr) return "갱신 없음";
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

type TabKey = "conditions" | "usages" | "members";

const TABS: { key: TabKey; label: string }[] = [
  { key: "conditions", label: "조건" },
  { key: "usages", label: "사용처" },
  { key: "members", label: "멤버 샘플" },
];

const USAGE_TYPE_LABELS: Record<string, string> = {
  live_event: "라이브 이벤트",
  experiment: "실험",
  feature_flag: "기능 플래그",
  message: "메시지",
};

export default function SegmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { can } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("conditions");

  const { data: audience, isLoading } = useAudience(id);
  const deleteMutation = useDeleteAudience();
  const refreshMutation = useRefreshAudience();
  const { data: usages } = useAudienceUsages(id);
  const { data: members } = useAudienceSampleMembers(id);

  const handleDelete = () => {
    if (!confirm("이 오디언스를 삭제하시겠습니까?")) return;
    deleteMutation.mutate(id, {
      onSuccess: () => router.push("/segments"),
    });
  };

  const handleRefresh = () => {
    refreshMutation.mutate(id);
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

  if (!audience) {
    return (
      <p className="text-muted-foreground">
        오디언스를 찾을 수 없습니다.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/segments"
            className={buttonVariants({ variant: "ghost", size: "icon" })}
          >
            <ArrowLeft />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{audience.name}</h2>
              {audience.usageCount > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  In Use
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  Unused
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {audience.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshMutation.isPending}
          >
            <RefreshCw
              className={`mr-1 h-4 w-4 ${refreshMutation.isPending ? "animate-spin" : ""}`}
            />
            새로고침
          </Button>
          {can("editor") && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/segments/${id}/edit`)}
              >
                <Pencil className="mr-1 h-4 w-4" />
                편집
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleteMutation.isPending || audience.usageCount > 0}
              >
                삭제
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              멤버 수
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {audience.memberCount.toLocaleString("ko-KR")}
            </p>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              상태
            </CardTitle>
          </CardHeader>
          <CardContent>
            {audience.usageCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                In Use
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                Unused
              </span>
            )}
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              사용처
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">
              {audience.usageCount}건
            </p>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              마지막 갱신
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {formatTimeAgo(audience.lastRefreshedAt)}
            </p>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              생성일
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{formatDate(audience.createdAt)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            {tab.key === "usages" && audience.usageCount > 0 && (
              <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-100 px-1.5 text-[11px] font-semibold text-blue-700">
                {audience.usageCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "conditions" && (
        <Card>
          <CardHeader>
            <CardTitle>조건</CardTitle>
            <CardDescription>
              이 오디언스에 포함되기 위한 조건 ({audience.conditionGroups.length}
              개 그룹)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {audience.conditionGroups.map((group, i) => (
                <ConditionGroupBadge key={i} group={group} index={i} />
              ))}
            </div>
            {audience.filterExpression && (
              <div className="mt-4">
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  DSL 표현식
                </p>
                <pre className="rounded-lg bg-muted p-3 text-sm font-mono overflow-x-auto">
                  {audience.filterExpression}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "usages" && (
        <Card>
          <CardHeader>
            <CardTitle>사용처</CardTitle>
            <CardDescription>
              이 오디언스를 참조하는 LiveOps 기능 목록
            </CardDescription>
          </CardHeader>
          <CardContent>
            {usages && usages.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>유형</TableHead>
                    <TableHead>이름</TableHead>
                    <TableHead>ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usages.map((ref) => (
                    <TableRow key={ref.id}>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                          {USAGE_TYPE_LABELS[ref.type] ?? ref.type}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">
                        {ref.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {ref.id}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">
                이 오디언스를 사용 중인 기능이 없습니다.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "members" && (
        <Card>
          <CardHeader>
            <CardTitle>멤버 샘플</CardTitle>
            <CardDescription>
              최근 포함된 플레이어 5명 (샘플)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {members && members.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>플레이어 ID</TableHead>
                    <TableHead>이름</TableHead>
                    <TableHead>국가</TableHead>
                    <TableHead>플랫폼</TableHead>
                    <TableHead className="text-right">세션 수</TableHead>
                    <TableHead>최근 접속</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-mono text-xs">
                        {member.id}
                      </TableCell>
                      <TableCell>{member.name}</TableCell>
                      <TableCell>{member.countryCode}</TableCell>
                      <TableCell>{member.platform}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {member.sessionCount}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {member.lastLogin}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">
                멤버 데이터를 불러오는 중...
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
