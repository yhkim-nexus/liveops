"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Loader2, AlertTriangle, Users, X } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { CharacterCounter } from "@/features/push/components/CharacterCounter";
import { DevicePreviewFrame } from "@/features/push/components/DevicePreviewFrame";
import { CampaignStatusBadge } from "@/features/push/components/CampaignStatusBadge";
import {
  useCampaign,
  useUpdateCampaign,
  useEstimateReach,
} from "@/features/push/hooks/use-push-queries";
import { useAudiences } from "@/features/segments/hooks/use-segment-queries";
import type {
  AudienceType,
  PlatformFilter,
  PushScheduleType,
  CampaignPriority,
  UpdateCampaignRequest,
} from "@/features/push/types/push";
import {
  PLATFORM_OPTIONS,
  SCHEDULE_TYPE_OPTIONS,
  PRIORITY_OPTIONS,
} from "@/features/push/types/push";

// ── Constants ──────────────────────────────────────────────────────────

const TIMEZONE_OPTIONS = [
  { value: "Asia/Seoul", label: "Asia/Seoul (KST, UTC+9)" },
  { value: "America/New_York", label: "America/New_York (EST, UTC-5)" },
  { value: "Europe/London", label: "Europe/London (GMT, UTC+0)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (PST, UTC-8)" },
  { value: "UTC", label: "UTC" },
];

const WEEKDAY_OPTIONS = [
  { value: "MO", label: "월" },
  { value: "TU", label: "화" },
  { value: "WE", label: "수" },
  { value: "TH", label: "목" },
  { value: "FR", label: "금" },
  { value: "SA", label: "토" },
  { value: "SU", label: "일" },
];

type StepId = 1 | 2 | 3 | 4 | 5;

const STEP_LABELS: Record<StepId, string> = {
  1: "메시지",
  2: "오디언스",
  3: "스케줄",
  4: "옵션",
  5: "검토",
};

// ── Helpers ────────────────────────────────────────────────────────────

function buildRrule(
  frequency: "daily" | "weekly" | "monthly",
  weekdays: string[],
  sendTime: string,
): string {
  const parts: string[] = [];
  if (frequency === "daily") parts.push("FREQ=DAILY");
  else if (frequency === "weekly") {
    parts.push("FREQ=WEEKLY");
    if (weekdays.length > 0) parts.push(`BYDAY=${weekdays.join(",")}`);
  } else {
    parts.push("FREQ=MONTHLY");
  }
  if (sendTime) {
    const [h, m] = sendTime.split(":");
    parts.push(`BYHOUR=${h};BYMINUTE=${m}`);
  }
  return parts.join(";");
}

function formatScheduleSummary(
  scheduleType: PushScheduleType,
  scheduledAt: string,
  timezone: string,
  rrule: string,
): string {
  if (scheduleType === "immediate") return "즉시 발송";
  if (scheduleType === "scheduled") {
    if (!scheduledAt) return "예약 시간 미설정";
    return `${new Date(scheduledAt).toLocaleString("ko-KR")} (${timezone})`;
  }
  if (scheduleType === "recurring") {
    return rrule ? `반복: ${rrule}` : "반복 규칙 미설정";
  }
  return "-";
}

// ── Step Indicator ─────────────────────────────────────────────────────

interface StepIndicatorProps {
  currentStep: StepId;
  completedSteps: Set<number>;
  onStepClick: (step: StepId) => void;
}

function StepIndicator({ currentStep, completedSteps, onStepClick }: StepIndicatorProps) {
  return (
    <nav className="flex gap-1 border-b pb-0">
      {([1, 2, 3, 4, 5] as StepId[]).map((step) => {
        const isCompleted = completedSteps.has(step);
        const isCurrent = step === currentStep;
        return (
          <button
            key={step}
            type="button"
            onClick={() => onStepClick(step)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              isCurrent
                ? "border-primary text-primary"
                : isCompleted
                  ? "border-green-500 text-green-700 hover:text-green-800"
                  : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {isCompleted && !isCurrent ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                  isCurrent
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step}
              </span>
            )}
            <span>{STEP_LABELS[step]}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ── Step 1: 메시지 작성 ────────────────────────────────────────────────

interface Step1Props {
  name: string; setName: (v: string) => void;
  title: string; setTitle: (v: string) => void;
  body: string; setBody: (v: string) => void;
  deepLinkUrl: string; setDeepLinkUrl: (v: string) => void;
  imageUrl: string; setImageUrl: (v: string) => void;
  customData: string; setCustomData: (v: string) => void;
}

function Step1Message({
  name, setName,
  title, setTitle,
  body, setBody,
  deepLinkUrl, setDeepLinkUrl,
  imageUrl, setImageUrl,
  customData, setCustomData,
}: Step1Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">메시지 작성</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="campaign-name">캠페인명 *</Label>
          <Input
            id="campaign-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 주간 이벤트 알림 #1"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="push-title">제목 *</Label>
            <CharacterCounter current={title.length} max={50} />
          </div>
          <Input
            id="push-title"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 50))}
            placeholder="푸시 알림 제목"
            maxLength={50}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="push-body">본문 *</Label>
            <CharacterCounter current={body.length} max={200} />
          </div>
          <Textarea
            id="push-body"
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, 200))}
            placeholder="푸시 알림 본문 내용"
            rows={4}
            maxLength={200}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="deep-link">딥링크 URL</Label>
          <Input
            id="deep-link"
            value={deepLinkUrl}
            onChange={(e) => setDeepLinkUrl(e.target.value)}
            placeholder="myapp://screen/reward"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image-url">이미지 URL</Label>
          <Input
            id="image-url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://cdn.example.com/banner.jpg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="custom-data">커스텀 데이터 (JSON)</Label>
          <Textarea
            id="custom-data"
            value={customData}
            onChange={(e) => setCustomData(e.target.value)}
            placeholder='{"key": "value"}'
            rows={3}
            className="font-mono text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ── Step 2: 오디언스 선택 ──────────────────────────────────────────────

interface Step2Props {
  audienceType: AudienceType; setAudienceType: (v: AudienceType) => void;
  audienceIds: string[]; setAudienceIds: (v: string[]) => void;
  playerIds: string; setPlayerIds: (v: string) => void;
  pushOptInFilter: boolean; setPushOptInFilter: (v: boolean) => void;
  platformFilter: PlatformFilter; setPlatformFilter: (v: PlatformFilter) => void;
  audiences: Array<{ id: string; name: string; memberCount: number }> | undefined;
  estimatedReach: number | undefined;
  isEstimating: boolean;
}

function Step2Audience({
  audienceType, setAudienceType,
  audienceIds, setAudienceIds,
  playerIds, setPlayerIds,
  pushOptInFilter, setPushOptInFilter,
  platformFilter, setPlatformFilter,
  audiences,
  estimatedReach,
  isEstimating,
}: Step2Props) {
  const [pendingAudienceId, setPendingAudienceId] = useState("");

  const addAudience = (id: string) => {
    if (!id || audienceIds.includes(id)) return;
    setAudienceIds([...audienceIds, id]);
    setPendingAudienceId("");
  };

  const removeAudience = (id: string) => {
    setAudienceIds(audienceIds.filter((a) => a !== id));
  };

  const getAudienceName = (id: string) =>
    audiences?.find((a) => a.id === id)?.name ?? id;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">오디언스 선택</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          <Label>발송 대상</Label>
          <div className="flex flex-col gap-2">
            {(["all", "audience", "individual"] as AudienceType[]).map((type) => {
              const labels: Record<AudienceType, string> = {
                all: "전체 회원",
                audience: "특정 오디언스",
                individual: "개별 지정",
              };
              return (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="audienceType"
                    checked={audienceType === type}
                    onChange={() => setAudienceType(type)}
                    className="accent-primary"
                  />
                  <span className="text-sm">{labels[type]}</span>
                </label>
              );
            })}
          </div>
        </div>

        {audienceType === "audience" && (
          <div className="space-y-3">
            <Label>오디언스 선택</Label>
            <Select
              value={pendingAudienceId}
              onValueChange={(v) => { if (v) addAudience(v); }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="오디언스를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {audiences
                  ?.filter((a) => !audienceIds.includes(a.id))
                  .map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({a.memberCount.toLocaleString()}명)
                      </span>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {audienceIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {audienceIds.map((id) => (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                  >
                    {getAudienceName(id)}
                    <button
                      type="button"
                      onClick={() => removeAudience(id)}
                      className="ml-0.5 rounded-full hover:bg-primary/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {audienceType === "individual" && (
          <div className="space-y-2">
            <Label htmlFor="player-ids">플레이어 ID 목록</Label>
            <Textarea
              id="player-ids"
              value={playerIds}
              onChange={(e) => setPlayerIds(e.target.value)}
              placeholder="플레이어 ID를 쉼표(,) 또는 줄바꿈으로 구분하여 입력하세요 (최대 1,000개)"
              rows={5}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              {playerIds.split(/[,\n]/).filter((s) => s.trim()).length} / 1,000개
            </p>
          </div>
        )}

        <div className="space-y-4 rounded-md border p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-opt-in">푸시 수신 동의 회원만</Label>
              <p className="text-xs text-muted-foreground">수신 거부 플레이어는 발송에서 제외됩니다.</p>
            </div>
            <Switch
              id="push-opt-in"
              checked={pushOptInFilter}
              onCheckedChange={setPushOptInFilter}
            />
          </div>

          <div className="space-y-2">
            <Label>플랫폼 필터</Label>
            <Select
              value={platformFilter}
              onValueChange={(v) => { if (v) setPlatformFilter(v as PlatformFilter); }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLATFORM_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border bg-muted/30 p-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">예상 도달 수</span>
          </div>
          <div className="mt-2">
            {isEstimating ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>계산 중...</span>
              </div>
            ) : estimatedReach !== undefined ? (
              <p className="text-2xl font-bold">
                약 {estimatedReach.toLocaleString()}명
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                오디언스를 선택하면 예상 도달 수가 표시됩니다.
              </p>
            )}
          </div>
          {estimatedReach === 0 && !isEstimating && (
            <div className="mt-2 flex items-center gap-2 text-sm text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              <span>예상 도달 수가 0명입니다. 오디언스 설정을 확인해 주세요.</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Step 3: 스케줄링 ───────────────────────────────────────────────────

interface Step3Props {
  scheduleType: PushScheduleType; setScheduleType: (v: PushScheduleType) => void;
  scheduledAt: string; setScheduledAt: (v: string) => void;
  timezone: string; setTimezone: (v: string) => void;
  rrule: string; setRrule: (v: string) => void;
  usePlayerTimezone: boolean; setUsePlayerTimezone: (v: boolean) => void;
}

function Step3Schedule({
  scheduleType, setScheduleType,
  scheduledAt, setScheduledAt,
  timezone, setTimezone,
  rrule, setRrule,
  usePlayerTimezone, setUsePlayerTimezone,
}: Step3Props) {
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("daily");
  const [weekdays, setWeekdays] = useState<string[]>([]);
  const [sendTime, setSendTime] = useState("09:00");

  useEffect(() => {
    if (scheduleType === "recurring") {
      setRrule(buildRrule(frequency, weekdays, sendTime));
    }
  }, [scheduleType, frequency, weekdays, sendTime, setRrule]);

  const toggleWeekday = (day: string) => {
    setWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">스케줄링</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          <Label>발송 방식</Label>
          <div className="flex flex-col gap-2">
            {SCHEDULE_TYPE_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="scheduleType"
                  checked={scheduleType === opt.value}
                  onChange={() => setScheduleType(opt.value)}
                  className="accent-primary"
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {scheduleType === "scheduled" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scheduled-at">예약 일시 *</Label>
              <Input
                id="scheduled-at"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>타임존</Label>
              <Select value={timezone} onValueChange={(v) => { if (v) setTimezone(v); }}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {scheduleType === "recurring" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>반복 주기</Label>
              <Select
                value={frequency}
                onValueChange={(v) => { if (v) setFrequency(v as typeof frequency); }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">매일</SelectItem>
                  <SelectItem value="weekly">매주</SelectItem>
                  <SelectItem value="monthly">매월</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {frequency === "weekly" && (
              <div className="space-y-2">
                <Label>요일 선택</Label>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAY_OPTIONS.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleWeekday(day.value)}
                      className={`h-9 w-9 rounded-full text-sm font-medium transition-colors ${
                        weekdays.includes(day.value)
                          ? "bg-primary text-primary-foreground"
                          : "border border-input bg-background text-foreground hover:bg-muted"
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="send-time">발송 시간</Label>
              <Input
                id="send-time"
                type="time"
                value={sendTime}
                onChange={(e) => setSendTime(e.target.value)}
                className="w-[160px]"
              />
            </div>

            <div className="space-y-2">
              <Label>타임존</Label>
              <Select value={timezone} onValueChange={(v) => { if (v) setTimezone(v); }}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {rrule && (
              <div className="rounded-md bg-muted px-3 py-2">
                <p className="text-xs text-muted-foreground">생성된 rrule:</p>
                <p className="font-mono text-xs mt-0.5">{rrule}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between rounded-md border p-4">
          <div className="space-y-0.5">
            <Label htmlFor="player-timezone">플레이어 로컬 타임존 기준 발송</Label>
            <p className="text-xs text-muted-foreground">
              각 플레이어의 기기 타임존에 맞춰 발송합니다.
            </p>
          </div>
          <Switch
            id="player-timezone"
            checked={usePlayerTimezone}
            onCheckedChange={setUsePlayerTimezone}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ── Step 4: 옵션 ───────────────────────────────────────────────────────

interface Step4Props {
  priority: CampaignPriority;
  setPriority: (v: CampaignPriority) => void;
}

function Step4Options({ priority, setPriority }: Step4Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">발송 옵션</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label>우선순위</Label>
          <Select
            value={priority}
            onValueChange={(v) => { if (v) setPriority(v as CampaignPriority); }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {priority === "critical" && (
          <div className="flex items-start gap-3 rounded-md border border-orange-300 bg-orange-50 p-4">
            <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-orange-800">
                Critical 알림은 빈도 제한을 무시하고 발송됩니다.
              </p>
              <p className="text-orange-700 mt-0.5">
                긴급 공지나 서비스 중단 안내 등 반드시 전달해야 하는 경우에만 사용하세요.
              </p>
            </div>
          </div>
        )}

        <div className="rounded-md bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          빈도 제한: 플레이어당 일일 최대 3회 (설정에서 변경 가능)
        </div>
      </CardContent>
    </Card>
  );
}

// ── Step 5: 검토 및 저장 ───────────────────────────────────────────────

interface Step5Props {
  name: string; title: string; body: string;
  deepLinkUrl: string; imageUrl: string; customData: string;
  audienceType: AudienceType; audienceIds: string[]; playerIds: string;
  pushOptInFilter: boolean; platformFilter: PlatformFilter;
  scheduleType: PushScheduleType; scheduledAt: string;
  timezone: string; rrule: string; usePlayerTimezone: boolean;
  priority: CampaignPriority;
  estimatedReach: number | undefined;
  audiences: Array<{ id: string; name: string }> | undefined;
  isSaving: boolean;
  onGoToStep: (step: StepId) => void;
  onSave: () => void;
}

function Step5Review({
  name, title, body, deepLinkUrl, imageUrl, customData,
  audienceType, audienceIds, playerIds,
  pushOptInFilter, platformFilter,
  scheduleType, scheduledAt, timezone, rrule, usePlayerTimezone,
  priority,
  estimatedReach,
  audiences,
  isSaving,
  onGoToStep,
  onSave,
}: Step5Props) {
  const audienceLabel =
    audienceType === "all"
      ? "전체 회원"
      : audienceType === "individual"
        ? `개별 지정 (${playerIds.split(/[,\n]/).filter((s) => s.trim()).length}명)`
        : audienceIds
            .map((id) => audiences?.find((a) => a.id === id)?.name ?? id)
            .join(", ") || "미선택";

  const platformLabel =
    PLATFORM_OPTIONS.find((o) => o.value === platformFilter)?.label ?? platformFilter;

  const scheduleSummary = formatScheduleSummary(scheduleType, scheduledAt, timezone, rrule);
  const priorityLabel =
    PRIORITY_OPTIONS.find((o) => o.value === priority)?.label ?? priority;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">메시지</CardTitle>
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => onGoToStep(1)}>
            수정
          </Button>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            <dt className="text-muted-foreground">캠페인명</dt>
            <dd className="font-medium">{name || "-"}</dd>
            <dt className="text-muted-foreground">제목</dt>
            <dd className="font-medium">{title || "-"}</dd>
            <dt className="text-muted-foreground">본문</dt>
            <dd className="text-muted-foreground">{body || "-"}</dd>
            {deepLinkUrl && (
              <>
                <dt className="text-muted-foreground">딥링크</dt>
                <dd className="font-mono text-xs">{deepLinkUrl}</dd>
              </>
            )}
            {imageUrl && (
              <>
                <dt className="text-muted-foreground">이미지</dt>
                <dd className="font-mono text-xs truncate">{imageUrl}</dd>
              </>
            )}
            {customData && (
              <>
                <dt className="text-muted-foreground">커스텀 데이터</dt>
                <dd className="font-mono text-xs">설정됨</dd>
              </>
            )}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">오디언스</CardTitle>
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => onGoToStep(2)}>
            수정
          </Button>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            <dt className="text-muted-foreground">대상</dt>
            <dd className="font-medium">{audienceLabel}</dd>
            <dt className="text-muted-foreground">플랫폼</dt>
            <dd className="font-medium">{platformLabel}</dd>
            <dt className="text-muted-foreground">수신 동의 필터</dt>
            <dd className="font-medium">{pushOptInFilter ? "적용" : "미적용"}</dd>
            <dt className="text-muted-foreground">예상 도달</dt>
            <dd className="font-medium">
              {estimatedReach !== undefined
                ? `약 ${estimatedReach.toLocaleString()}명`
                : "-"}
            </dd>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">스케줄</CardTitle>
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => onGoToStep(3)}>
            수정
          </Button>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            <dt className="text-muted-foreground">발송 방식</dt>
            <dd className="font-medium">
              {SCHEDULE_TYPE_OPTIONS.find((o) => o.value === scheduleType)?.label ?? scheduleType}
            </dd>
            <dt className="text-muted-foreground">일정</dt>
            <dd className="font-medium">{scheduleSummary}</dd>
            <dt className="text-muted-foreground">플레이어 타임존</dt>
            <dd className="font-medium">{usePlayerTimezone ? "적용" : "미적용"}</dd>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">옵션</CardTitle>
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => onGoToStep(4)}>
            수정
          </Button>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            <dt className="text-muted-foreground">우선순위</dt>
            <dd className="font-medium">{priorityLabel}</dd>
          </dl>
        </CardContent>
      </Card>

      {/* Save only — submit/approve happen on the detail page */}
      <div className="flex justify-end border-t pt-4">
        <Button onClick={onSave} disabled={isSaving}>
          {isSaving ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />저장 중...</>
          ) : (
            "저장"
          )}
        </Button>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────

export default function CampaignEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const { data: campaign, isLoading } = useCampaign(id);
  const updateMutation = useUpdateCampaign();
  const estimateReach = useEstimateReach();
  const { data: audiences } = useAudiences({});

  const [step, setStep] = useState<StepId>(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(
    new Set([1, 2, 3, 4]),
  );
  const [initialized, setInitialized] = useState(false);

  // Step 1
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [deepLinkUrl, setDeepLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [customData, setCustomData] = useState("");

  // Step 2
  const [audienceType, setAudienceType] = useState<AudienceType>("all");
  const [audienceIds, setAudienceIds] = useState<string[]>([]);
  const [playerIds, setPlayerIds] = useState("");
  const [pushOptInFilter, setPushOptInFilter] = useState(true);
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("all");

  // Step 3
  const [scheduleType, setScheduleType] = useState<PushScheduleType>("immediate");
  const [scheduledAt, setScheduledAt] = useState("");
  const [timezone, setTimezone] = useState("Asia/Seoul");
  const [rrule, setRrule] = useState("");
  const [usePlayerTimezone, setUsePlayerTimezone] = useState(false);

  // Step 4
  const [priority, setPriority] = useState<CampaignPriority>("normal");

  // Pre-fill state from existing campaign data
  useEffect(() => {
    if (!campaign || initialized) return;

    setName(campaign.name);
    setTitle(campaign.title);
    setBody(campaign.body);
    setDeepLinkUrl(campaign.deepLinkUrl ?? "");
    setImageUrl(campaign.imageUrl ?? "");
    setCustomData(
      campaign.customData ? JSON.stringify(campaign.customData, null, 2) : "",
    );
    setAudienceType(campaign.audienceType);
    setAudienceIds(campaign.audienceIds ?? []);
    setPlayerIds(campaign.playerIds?.join("\n") ?? "");
    setPushOptInFilter(campaign.pushOptInFilter);
    setPlatformFilter(campaign.platformFilter);
    setScheduleType(campaign.scheduleType);
    if (campaign.scheduledAt) {
      const d = new Date(campaign.scheduledAt);
      setScheduledAt(d.toISOString().slice(0, 16));
    }
    setTimezone(campaign.timezone);
    setRrule(campaign.rrule ?? "");
    setUsePlayerTimezone(campaign.usePlayerTimezone);
    setPriority(campaign.priority);

    setInitialized(true);
  }, [campaign, initialized]);

  // Redirect if not draft
  useEffect(() => {
    if (campaign && campaign.status !== "draft") {
      router.replace(`/push/campaigns/${id}`);
    }
  }, [campaign, id, router]);

  // Estimate reach on audience change
  useEffect(() => {
    const timer = setTimeout(() => {
      estimateReach.mutate({
        audienceType,
        audienceIds: audienceType === "audience" ? audienceIds : undefined,
        platformFilter,
      });
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audienceType, audienceIds, platformFilter]);

  // Validation
  const step1Valid = name.trim().length > 0 && title.trim().length > 0;
  const step2Valid =
    audienceType !== "audience" || audienceIds.length > 0;
  const step3Valid =
    scheduleType !== "scheduled" || scheduledAt.length > 0;

  const canProceed = useCallback(
    (fromStep: StepId): boolean => {
      if (fromStep === 1) return step1Valid;
      if (fromStep === 2) return step2Valid;
      if (fromStep === 3) return step3Valid;
      return true;
    },
    [step1Valid, step2Valid, step3Valid],
  );

  const goNext = () => {
    if (!canProceed(step)) return;
    setCompletedSteps((prev) => new Set([...prev, step]));
    setStep((prev) => Math.min(prev + 1, 5) as StepId);
  };

  const goPrev = () => {
    setStep((prev) => Math.max(prev - 1, 1) as StepId);
  };

  const handleStepClick = (target: StepId) => {
    if (target <= step || completedSteps.has(target - 1)) {
      setStep(target);
    }
  };

  const buildPayload = useCallback((): UpdateCampaignRequest => {
    let parsedCustomData: Record<string, unknown> | null = null;
    if (customData.trim()) {
      try {
        parsedCustomData = JSON.parse(customData);
      } catch {
        parsedCustomData = null;
      }
    }

    const parsedPlayerIds =
      audienceType === "individual"
        ? playerIds.split(/[,\n]/).map((s) => s.trim()).filter(Boolean)
        : null;

    const audienceName =
      audienceType === "audience" && audienceIds.length > 0
        ? audienceIds
            .map((aid) => audiences?.find((a) => a.id === aid)?.name ?? aid)
            .join(", ")
        : null;

    return {
      name: name.trim(),
      title: title.trim(),
      body: body.trim(),
      deepLinkUrl: deepLinkUrl.trim() || null,
      imageUrl: imageUrl.trim() || null,
      customData: parsedCustomData,
      audienceType,
      audienceIds: audienceType === "audience" ? audienceIds : null,
      audienceName,
      playerIds: parsedPlayerIds,
      pushOptInFilter,
      platformFilter,
      scheduleType,
      scheduledAt:
        scheduleType === "scheduled" && scheduledAt
          ? new Date(scheduledAt).toISOString()
          : null,
      timezone,
      rrule: scheduleType === "recurring" ? rrule || null : null,
      usePlayerTimezone,
      priority,
    };
  }, [
    name, title, body, deepLinkUrl, imageUrl, customData,
    audienceType, audienceIds, playerIds, audiences,
    pushOptInFilter, platformFilter,
    scheduleType, scheduledAt, timezone, rrule, usePlayerTimezone,
    priority,
  ]);

  const isSaving = updateMutation.isPending;

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({ id, data: buildPayload() });
      router.push(`/push/campaigns/${id}`);
    } catch {
      // Handled by mutation state
    }
  };

  // ── Loading / guard states ─────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>로딩 중...</span>
      </div>
    );
  }

  if (!campaign) {
    return (
      <p className="text-muted-foreground">캠페인을 찾을 수 없습니다.</p>
    );
  }

  // If status is not draft, the useEffect redirect handles navigation;
  // render nothing while redirecting to avoid flicker.
  if (campaign.status !== "draft") return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/push/campaigns/${id}`}
          className={buttonVariants({ variant: "ghost", size: "icon" })}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold truncate">{campaign.name}</h2>
            <CampaignStatusBadge status={campaign.status} />
          </div>
          <p className="text-sm text-muted-foreground">캠페인 편집</p>
        </div>
      </div>

      {/* Step indicator */}
      <StepIndicator
        currentStep={step}
        completedSteps={completedSteps}
        onStepClick={handleStepClick}
      />

      {/* Error banner */}
      {updateMutation.error && (
        <div className="flex items-center gap-2 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{updateMutation.error.message}</span>
        </div>
      )}

      {/* Two-column layout */}
      <div className="flex gap-6 items-start">
        {/* Left: step content */}
        <div className="flex-1 min-w-0 space-y-4">
          {step === 1 && (
            <Step1Message
              name={name} setName={setName}
              title={title} setTitle={setTitle}
              body={body} setBody={setBody}
              deepLinkUrl={deepLinkUrl} setDeepLinkUrl={setDeepLinkUrl}
              imageUrl={imageUrl} setImageUrl={setImageUrl}
              customData={customData} setCustomData={setCustomData}
            />
          )}

          {step === 2 && (
            <Step2Audience
              audienceType={audienceType} setAudienceType={setAudienceType}
              audienceIds={audienceIds} setAudienceIds={setAudienceIds}
              playerIds={playerIds} setPlayerIds={setPlayerIds}
              pushOptInFilter={pushOptInFilter} setPushOptInFilter={setPushOptInFilter}
              platformFilter={platformFilter} setPlatformFilter={setPlatformFilter}
              audiences={audiences}
              estimatedReach={estimateReach.data?.estimatedReach}
              isEstimating={estimateReach.isPending}
            />
          )}

          {step === 3 && (
            <Step3Schedule
              scheduleType={scheduleType} setScheduleType={setScheduleType}
              scheduledAt={scheduledAt} setScheduledAt={setScheduledAt}
              timezone={timezone} setTimezone={setTimezone}
              rrule={rrule} setRrule={setRrule}
              usePlayerTimezone={usePlayerTimezone} setUsePlayerTimezone={setUsePlayerTimezone}
            />
          )}

          {step === 4 && (
            <Step4Options priority={priority} setPriority={setPriority} />
          )}

          {step === 5 && (
            <Step5Review
              name={name} title={title} body={body}
              deepLinkUrl={deepLinkUrl} imageUrl={imageUrl} customData={customData}
              audienceType={audienceType} audienceIds={audienceIds} playerIds={playerIds}
              pushOptInFilter={pushOptInFilter} platformFilter={platformFilter}
              scheduleType={scheduleType} scheduledAt={scheduledAt}
              timezone={timezone} rrule={rrule} usePlayerTimezone={usePlayerTimezone}
              priority={priority}
              estimatedReach={estimateReach.data?.estimatedReach}
              audiences={audiences}
              isSaving={isSaving}
              onGoToStep={(s) => setStep(s)}
              onSave={handleSave}
            />
          )}

          {/* Bottom navigation (steps 1–4) */}
          {step < 5 && (
            <div className="flex items-center justify-between border-t pt-4">
              <div>
                {step > 1 && (
                  <Button variant="outline" onClick={goPrev}>
                    &larr; 이전
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/push/campaigns/${id}`}
                  className={buttonVariants({ variant: "ghost" })}
                >
                  취소
                </Link>
                <Button onClick={goNext} disabled={!canProceed(step)}>
                  다음 &rarr;
                </Button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="border-t pt-4">
              <Button variant="outline" onClick={goPrev}>
                &larr; 이전
              </Button>
            </div>
          )}
        </div>

        {/* Right: sticky preview panel */}
        <div className="w-[35%] min-w-[260px] sticky top-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground font-medium">
                미리보기
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <DevicePreviewFrame
                title={title}
                body={body}
                imageUrl={imageUrl || null}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
