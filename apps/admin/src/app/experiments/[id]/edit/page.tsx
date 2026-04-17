"use client";

import { use, useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, AlertCircle, Plus, X, AlertTriangle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useExperiment,
  useUpdateExperiment,
} from "@/features/experiments/hooks/use-experiment-queries";
import { useAudiences } from "@/features/segments/hooks/use-segment-queries";
import type {
  ExperimentType,
  ExperimentVariant,
  MetricType,
  SignificanceLevel,
} from "@/features/experiments/types/experiment";

type TabId = "basic" | "variants" | "audience" | "goals" | "review";

const TABS: { id: TabId; label: string }[] = [
  { id: "basic", label: "기본 정보" },
  { id: "variants", label: "변형 정의" },
  { id: "audience", label: "오디언스 선택" },
  { id: "goals", label: "목표 지표" },
  { id: "review", label: "검토 및 저장" },
];

const EXPERIMENT_TYPE_OPTIONS: { value: ExperimentType; label: string }[] = [
  { value: "remote_config", label: "원격 설정" },
  { value: "feature_flag", label: "Feature Flag" },
  { value: "event_variant", label: "이벤트 변형" },
  { value: "composite", label: "복합" },
];

const METRIC_TYPE_OPTIONS: { value: MetricType; label: string }[] = [
  { value: "conversion_rate", label: "전환율" },
  { value: "average_value", label: "평균값" },
  { value: "count", label: "횟수" },
];

const SIGNIFICANCE_OPTIONS: { value: string; label: string }[] = [
  { value: "0.01", label: "0.01 (99%)" },
  { value: "0.05", label: "0.05 (95%)" },
  { value: "0.1", label: "0.10 (90%)" },
];

interface VariantRow {
  key: string;
  name: string;
  description: string;
  isControl: boolean;
  trafficPercent: string;
  configEntries: { key: string; value: string }[];
}

interface GoalRow {
  key: string;
  metricName: string;
  metricType: MetricType;
  mde: string;
  isPrimary: boolean;
}

function toLocalDatetime(iso: string): string {
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export default function ExperimentEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: experiment, isLoading } = useExperiment(id);
  const updateMutation = useUpdateExperiment();
  const { data: audiences } = useAudiences();

  const [initialized, setInitialized] = useState(false);
  const [currentTab, setCurrentTab] = useState<TabId>("basic");

  // Step 1: Basic Info
  const [name, setName] = useState("");
  const [hypothesisWhat, setHypothesisWhat] = useState("");
  const [hypothesisWhy, setHypothesisWhy] = useState("");
  const [hypothesisExpected, setHypothesisExpected] = useState("");
  const [experimentType, setExperimentType] = useState<ExperimentType>("remote_config");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");

  // Step 2: Variants
  const [variants, setVariants] = useState<VariantRow[]>([]);

  // Step 3: Audience
  const [audienceMode, setAudienceMode] = useState<"all" | "specific">("all");
  const [audienceId, setAudienceId] = useState("");

  // Step 4: Goals
  const [goals, setGoals] = useState<GoalRow[]>([]);
  const [significanceLevel, setSignificanceLevel] = useState("0.05");

  // Initialize from experiment data
  useEffect(() => {
    if (!experiment || initialized) return;

    setName(experiment.name);
    setHypothesisWhat(experiment.hypothesisWhat);
    setHypothesisWhy(experiment.hypothesisWhy);
    setHypothesisExpected(experiment.hypothesisExpected);
    setExperimentType(experiment.type);
    setStartAt(experiment.startAt ? toLocalDatetime(experiment.startAt) : "");
    setEndAt(experiment.endAt ? toLocalDatetime(experiment.endAt) : "");

    setVariants(
      experiment.variants.map((v) => ({
        key: v.id,
        name: v.name,
        description: v.description,
        isControl: v.isControl,
        trafficPercent: String(v.trafficPercent),
        configEntries: Object.entries(v.configOverrides).map(([k, val]) => ({
          key: k,
          value: String(val),
        })),
      })),
    );

    if (experiment.audienceId) {
      setAudienceMode("specific");
      setAudienceId(experiment.audienceId);
    } else {
      setAudienceMode("all");
    }

    setGoals(
      experiment.goals.map((g) => ({
        key: g.id,
        metricName: g.metricName,
        metricType: g.metricType,
        mde: String(g.mde),
        isPrimary: g.isPrimary,
      })),
    );

    setSignificanceLevel(String(experiment.significanceLevel));
    setInitialized(true);
  }, [experiment, initialized]);

  const selectedAudience = useMemo(() => {
    if (audienceMode === "all") return null;
    return audiences?.find((a) => a.id === audienceId) ?? null;
  }, [audienceMode, audienceId, audiences]);

  const trafficTotal = useMemo(
    () => variants.reduce((sum, v) => sum + (parseInt(v.trafficPercent, 10) || 0), 0),
    [variants],
  );

  // Variant helpers
  const addVariant = () => {
    if (variants.length >= 4) return;
    const nextLabel = `Variant ${String.fromCharCode(64 + variants.filter((v) => !v.isControl).length + 1)}`;
    setVariants([...variants, {
      key: crypto.randomUUID(),
      name: nextLabel,
      description: "",
      isControl: false,
      trafficPercent: "0",
      configEntries: [{ key: "", value: "" }],
    }]);
  };

  const removeVariant = (key: string) => {
    setVariants(variants.filter((v) => v.key !== key));
  };

  const updateVariant = (key: string, field: keyof VariantRow, value: string) => {
    setVariants(
      variants.map((v) => (v.key === key ? { ...v, [field]: value } : v)),
    );
  };

  const addConfigEntry = (variantKey: string) => {
    setVariants(
      variants.map((v) =>
        v.key === variantKey
          ? { ...v, configEntries: [...v.configEntries, { key: "", value: "" }] }
          : v,
      ),
    );
  };

  const removeConfigEntry = (variantKey: string, index: number) => {
    setVariants(
      variants.map((v) =>
        v.key === variantKey
          ? { ...v, configEntries: v.configEntries.filter((_, i) => i !== index) }
          : v,
      ),
    );
  };

  const updateConfigEntry = (
    variantKey: string,
    index: number,
    field: "key" | "value",
    value: string,
  ) => {
    setVariants(
      variants.map((v) =>
        v.key === variantKey
          ? {
              ...v,
              configEntries: v.configEntries.map((entry, i) =>
                i === index ? { ...entry, [field]: value } : entry,
              ),
            }
          : v,
      ),
    );
  };

  // Goal helpers
  const addSecondaryGoal = () => {
    const secondaryCount = goals.filter((g) => !g.isPrimary).length;
    if (secondaryCount >= 3) return;
    setGoals([...goals, {
      key: crypto.randomUUID(),
      metricName: "",
      metricType: "conversion_rate",
      mde: "5",
      isPrimary: false,
    }]);
  };

  const removeGoal = (key: string) => {
    setGoals(goals.filter((g) => g.key !== key));
  };

  const updateGoal = (key: string, field: keyof GoalRow, value: string) => {
    setGoals(
      goals.map((g) => (g.key === key ? { ...g, [field]: value } : g)),
    );
  };

  // Validation
  const isNameValid = name.trim().length > 0;
  const isHypothesisValid =
    hypothesisWhat.trim().length > 0 &&
    hypothesisWhy.trim().length > 0 &&
    hypothesisExpected.trim().length > 0;
  const isVariantsValid = variants.length >= 2;
  const isTrafficValid = trafficTotal === 100;
  const isGoalsValid = goals.some((g) => g.isPrimary && g.metricName.trim().length > 0);

  const canSave = isNameValid && isHypothesisValid && isVariantsValid;

  const handleSave = () => {
    if (!canSave || !experiment) return;

    const audData =
      audienceMode === "all"
        ? { audienceId: null, audienceName: null }
        : { audienceId, audienceName: selectedAudience?.name ?? null };

    const builtVariants: Omit<ExperimentVariant, "id" | "result">[] = variants.map(
      (v, i) => {
        const configOverrides: Record<string, string | number | boolean> = {};
        for (const entry of v.configEntries) {
          if (entry.key.trim()) {
            const val = entry.value.trim();
            if (val === "true") configOverrides[entry.key.trim()] = true;
            else if (val === "false") configOverrides[entry.key.trim()] = false;
            else if (val !== "" && !isNaN(Number(val)))
              configOverrides[entry.key.trim()] = Number(val);
            else configOverrides[entry.key.trim()] = val;
          }
        }
        return {
          name: v.name,
          description: v.description,
          isControl: v.isControl,
          trafficPercent: parseInt(v.trafficPercent, 10) || 0,
          configOverrides,
          sortOrder: i,
        };
      },
    );

    const builtGoals = goals
      .filter((g) => g.metricName.trim().length > 0)
      .map((g) => ({
        metricName: g.metricName.trim(),
        metricType: g.metricType,
        isPrimary: g.isPrimary,
        mde: parseFloat(g.mde) || 5,
      }));

    updateMutation.mutate(
      {
        id,
        data: {
          name: name.trim(),
          hypothesisWhat: hypothesisWhat.trim(),
          hypothesisWhy: hypothesisWhy.trim(),
          hypothesisExpected: hypothesisExpected.trim(),
          type: experimentType,
          ...audData,
          significanceLevel: parseFloat(significanceLevel) as SignificanceLevel,
          variants: builtVariants,
          goals: builtGoals,
          startAt: startAt ? new Date(startAt).toISOString() : null,
          endAt: endAt ? new Date(endAt).toISOString() : null,
          status: "draft",
        },
      },
      {
        onSuccess: () => router.push(`/experiments/${id}`),
      },
    );
  };

  const tabIndex = TABS.findIndex((t) => t.id === currentTab);

  const goNext = () => {
    const next = TABS[tabIndex + 1];
    if (next) setCurrentTab(next.id);
  };

  const goPrev = () => {
    const prev = TABS[tabIndex - 1];
    if (prev) setCurrentTab(prev.id);
  };

  if (isLoading || !initialized) {
    return <p className="text-muted-foreground">로딩 중...</p>;
  }

  if (!experiment) {
    return <p className="text-muted-foreground">실험을 찾을 수 없습니다.</p>;
  }

  const isNotDraft = experiment.status !== "draft";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/experiments/${id}`}
          className={buttonVariants({ variant: "ghost", size: "icon" })}
        >
          <ArrowLeft />
        </Link>
        <h2 className="text-lg font-semibold">실험 수정</h2>
      </div>

      {/* Warning banner for non-draft */}
      {isNotDraft && (
        <div className="flex items-start gap-3 rounded-md border border-orange-300 bg-orange-50 p-4">
          <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-orange-800">
              수정 시 상태가 draft로 되돌아갑니다
            </p>
            <p className="text-xs text-orange-700 mt-1">
              현재 상태: {experiment.status}. 저장하면 실험이 초안 상태로 전환되며, 다시 승인 절차를 거쳐야 합니다.
            </p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b">
        {TABS.map((tab, i) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setCurrentTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              currentTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {i + 1}. {tab.label}
          </button>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {currentTab === "basic" && (
        <Card>
          <CardContent className="space-y-5 pt-6">
            <div className="space-y-2">
              <Label htmlFor="name">실험명 *</Label>
              <Input
                id="name"
                placeholder="예: 보상량 최적화 테스트"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={128}
              />
              <p className="text-xs text-muted-foreground">{name.length} / 128자</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hypothesisWhat">가설 - 무엇을 (What) *</Label>
              <Textarea
                id="hypothesisWhat"
                value={hypothesisWhat}
                onChange={(e) => setHypothesisWhat(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hypothesisWhy">가설 - 왜 (Why) *</Label>
              <Textarea
                id="hypothesisWhy"
                value={hypothesisWhy}
                onChange={(e) => setHypothesisWhy(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hypothesisExpected">가설 - 예상 결과 (Expected) *</Label>
              <Textarea
                id="hypothesisExpected"
                value={hypothesisExpected}
                onChange={(e) => setHypothesisExpected(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>실험 유형 *</Label>
              <Select
                value={experimentType}
                onValueChange={(v) => { if (v) setExperimentType(v as ExperimentType); }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIMENT_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startAt">시작일</Label>
                <Input
                  id="startAt"
                  type="datetime-local"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endAt">종료일</Label>
                <Input
                  id="endAt"
                  type="datetime-local"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Variants */}
      {currentTab === "variants" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>변형 정의</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addVariant}
              disabled={variants.length >= 4}
            >
              <Plus className="mr-1 h-4 w-4" />
              변형 추가
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className={`rounded-md p-3 text-sm ${trafficTotal === 100 ? "bg-green-50 text-green-800" : "bg-orange-50 text-orange-800"}`}>
              트래픽 합계: <span className="font-bold">{trafficTotal}%</span>
              {trafficTotal !== 100 && " (100%가 되어야 합니다)"}
            </div>

            {variants.map((variant) => (
              <div key={variant.key} className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {variant.isControl ? "Control (대조군)" : variant.name}
                  </span>
                  {!variant.isControl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeVariant(variant.key)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label>이름</Label>
                    <Input
                      value={variant.name}
                      onChange={(e) => updateVariant(variant.key, "name", e.target.value)}
                      readOnly={variant.isControl}
                      className={variant.isControl ? "bg-muted" : ""}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>설명</Label>
                    <Input
                      placeholder="변형 설명"
                      value={variant.description}
                      onChange={(e) => updateVariant(variant.key, "description", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>트래픽 %</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={variant.trafficPercent}
                      onChange={(e) => updateVariant(variant.key, "trafficPercent", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>설정 오버라이드 (Key-Value)</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => addConfigEntry(variant.key)}
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      추가
                    </Button>
                  </div>
                  {variant.configEntries.map((entry, entryIndex) => (
                    <div key={entryIndex} className="flex items-center gap-2">
                      <Input
                        placeholder="key"
                        value={entry.key}
                        onChange={(e) => updateConfigEntry(variant.key, entryIndex, "key", e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="value"
                        value={entry.value}
                        onChange={(e) => updateConfigEntry(variant.key, entryIndex, "value", e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeConfigEntry(variant.key, entryIndex)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Audience */}
      {currentTab === "audience" && (
        <Card>
          <CardContent className="space-y-5 pt-6">
            <div className="space-y-3">
              <Label>타겟 오디언스</Label>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="audienceMode"
                    checked={audienceMode === "all"}
                    onChange={() => setAudienceMode("all")}
                    className="accent-primary"
                  />
                  <span className="text-sm">전체 플레이어</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="audienceMode"
                    checked={audienceMode === "specific"}
                    onChange={() => setAudienceMode("specific")}
                    className="accent-primary"
                  />
                  <span className="text-sm">특정 오디언스</span>
                </label>
              </div>
            </div>

            {audienceMode === "specific" && (
              <div className="space-y-3">
                <Label>오디언스 선택 *</Label>
                <Select
                  value={audienceId}
                  onValueChange={(v) => { if (v) setAudienceId(v); }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="오디언스를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {audiences
                      ?.filter((a) => a.status === "active")
                      .map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                {selectedAudience && (
                  <div className="rounded-md bg-muted p-3 text-sm">
                    선택된 오디언스: <span className="font-medium">{selectedAudience.name}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Goals */}
      {currentTab === "goals" && (
        <Card>
          <CardContent className="space-y-6 pt-6">
            {goals.map((goal, goalIndex) => (
              <div key={goal.key} className="space-y-3 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {goal.isPrimary ? "주요 지표 (Primary)" : `보조 지표 ${goalIndex}`}
                  </span>
                  {!goal.isPrimary && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeGoal(goal.key)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label>지표 이름 {goal.isPrimary && "*"}</Label>
                    <Input
                      placeholder="예: conversion_rate"
                      value={goal.metricName}
                      onChange={(e) => updateGoal(goal.key, "metricName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>지표 유형</Label>
                    <Select
                      value={goal.metricType}
                      onValueChange={(v) => { if (v) updateGoal(goal.key, "metricType", v); }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {METRIC_TYPE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>MDE %</Label>
                    <Input
                      type="number"
                      min={0}
                      step={0.1}
                      value={goal.mde}
                      onChange={(e) => updateGoal(goal.key, "mde", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSecondaryGoal}
              disabled={goals.filter((g) => !g.isPrimary).length >= 3}
            >
              <Plus className="mr-1 h-4 w-4" />
              보조 지표 추가
            </Button>

            <div className="space-y-2">
              <Label>유의수준</Label>
              <Select
                value={significanceLevel}
                onValueChange={(v) => { if (v) setSignificanceLevel(v); }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SIGNIFICANCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Review */}
      {currentTab === "review" && (
        <div className="space-y-4">
          {isNotDraft && (
            <div className="flex items-start gap-3 rounded-md border border-orange-300 bg-orange-50 p-4">
              <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
              <p className="text-sm text-orange-800">
                저장 시 실험 상태가 <strong>draft</strong>로 되돌아갑니다.
              </p>
            </div>
          )}

          {/* Basic Info Summary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">기본 정보</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setCurrentTab("basic")} className="text-xs">
                수정 &rarr;
              </Button>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">실험명</dt>
                  <dd className="font-medium">{name || "-"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">실험 유형</dt>
                  <dd className="font-medium">
                    {EXPERIMENT_TYPE_OPTIONS.find((o) => o.value === experimentType)?.label ?? "-"}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Variants Summary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">변형 ({variants.length}개)</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setCurrentTab("variants")} className="text-xs">
                수정 &rarr;
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {variants.map((v) => (
                  <div key={v.key} className="flex items-center justify-between rounded-md border px-3 py-2">
                    <span className="font-medium">
                      {v.name} {v.isControl && "(Control)"}
                    </span>
                    <span className="text-muted-foreground">{v.trafficPercent}%</span>
                  </div>
                ))}
                <div className={`text-xs font-medium ${trafficTotal === 100 ? "text-green-600" : "text-orange-600"}`}>
                  트래픽 합계: {trafficTotal}%
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Checklist */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-2 mb-3">
                <AlertCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                <span className="text-sm font-medium">저장 전 확인사항</span>
              </div>
              <ul className="space-y-2 text-sm">
                {[
                  { ok: isNameValid, text: "이름이 입력되었습니다." },
                  { ok: isHypothesisValid, text: "가설이 입력되었습니다." },
                  { ok: isVariantsValid, text: "변형이 2개 이상입니다." },
                  { ok: isTrafficValid, text: "트래픽 합계가 100%입니다." },
                  { ok: isGoalsValid, text: "주요 지표가 설정되었습니다." },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    {item.ok ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <span className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                    )}
                    <span className={item.ok ? "" : "text-muted-foreground"}>
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="flex justify-between border-t pt-4">
        <div>
          {tabIndex > 0 && (
            <Button variant="outline" onClick={goPrev}>
              &larr; 이전
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {currentTab === "review" ? (
            <>
              <Link
                href={`/experiments/${id}`}
                className={buttonVariants({ variant: "ghost" })}
              >
                취소
              </Link>
              <Button
                onClick={handleSave}
                disabled={!canSave || updateMutation.isPending}
              >
                {updateMutation.isPending ? "저장 중..." : "저장"}
              </Button>
            </>
          ) : (
            <>
              <Link
                href={`/experiments/${id}`}
                className={buttonVariants({ variant: "ghost" })}
              >
                취소
              </Link>
              <Button onClick={goNext}>
                다음 단계로 &rarr;
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
