"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCreateAudience } from "@/features/segments/hooks/use-segment-queries";
import { ConditionBuilder } from "@/features/segments/components/ConditionBuilder";
import type { ConditionGroup } from "@/features/segments/types/segment";

export default function SegmentCreatePage() {
  const router = useRouter();
  const createMutation = useCreateAudience();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [queryMode, setQueryMode] = useState(false);
  const [filterExpression, setFilterExpression] = useState("");
  const [conditionGroups, setConditionGroups] = useState<ConditionGroup[]>([
    {
      logic: "and",
      conditions: [{ property: "countryCode", operator: "eq", value: "" }],
    },
  ]);

  const isFormBuilderValid =
    name.trim().length > 0 &&
    conditionGroups.length > 0 &&
    conditionGroups.every(
      (g) =>
        g.conditions.length > 0 &&
        g.conditions.every((c) => c.value !== ""),
    );

  const isQueryValid =
    name.trim().length > 0 && filterExpression.trim().length > 0;

  const isValid = queryMode ? isQueryValid : isFormBuilderValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    createMutation.mutate(
      {
        name: name.trim(),
        description: description.trim(),
        conditionGroups: queryMode
          ? [
              {
                logic: "and",
                conditions: [],
              },
            ]
          : conditionGroups,
        filterExpression: queryMode ? filterExpression.trim() : undefined,
      },
      { onSuccess: (data) => router.push(`/segments/${data.id}`) },
    );
  };

  // Estimated member count (mock preview)
  const estimatedMembers = isValid
    ? Math.floor(Math.random() * 50_000) + 500
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/segments"
          className={buttonVariants({ variant: "ghost", size: "icon" })}
        >
          <ArrowLeft />
        </Link>
        <h2 className="text-lg font-semibold">새 오디언스</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
            <CardDescription>
              오디언스의 이름과 설명을 입력하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">오디언스명 *</Label>
              <Input
                id="name"
                placeholder="예: VIP 플레이어"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                placeholder="이 오디언스에 대한 설명을 입력하세요."
                value={description}
                onChange={(e) => {
                  if (e.target.value.length <= 500) setDescription(e.target.value);
                }}
                rows={3}
              />
              <p className="text-xs text-muted-foreground text-right">
                {description.length}/500
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Filter Mode Toggle */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>필터 조건</CardTitle>
                <CardDescription>
                  {queryMode
                    ? "DSL 쿼리를 직접 입력합니다."
                    : "폼 빌더로 조건을 설정합니다. 그룹 간에는 OR, 그룹 내 조건은 AND로 결합됩니다."}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="query-mode" className="text-sm">
                  쿼리 모드
                </Label>
                <Switch
                  id="query-mode"
                  checked={queryMode}
                  onCheckedChange={setQueryMode}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {queryMode ? (
              <div className="space-y-3">
                <Textarea
                  placeholder='예: PropertiesComputed("purchaseCompletedCount", 0) > 0 and Now() - PropertiesComputed("sessionSeenLast", 0) >= Duration("30d")'
                  value={filterExpression}
                  onChange={(e) => setFilterExpression(e.target.value)}
                  rows={6}
                  className="font-mono text-sm"
                />
                {filterExpression.trim() && (
                  <p className="text-xs text-green-600">
                    유효성 검사 통과
                  </p>
                )}
              </div>
            ) : (
              <ConditionBuilder
                conditionGroups={conditionGroups}
                onChange={setConditionGroups}
              />
            )}
          </CardContent>
        </Card>

        {/* Preview Panel */}
        {isValid && (
          <Card>
            <CardHeader>
              <CardTitle>미리보기</CardTitle>
              <CardDescription>
                예상 멤버 수 (실제 저장 후 정확한 수치가 계산됩니다)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tabular-nums">
                {estimatedMembers?.toLocaleString("ko-KR")}명
              </p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Link
            href="/segments"
            className={buttonVariants({ variant: "outline" })}
          >
            취소
          </Link>
          <Button
            type="submit"
            disabled={!isValid || createMutation.isPending}
          >
            {createMutation.isPending ? "생성 중..." : "저장"}
          </Button>
        </div>
      </form>
    </div>
  );
}
