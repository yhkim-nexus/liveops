"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, AlertCircle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  useCreateEvent,
  useTransitionEvent,
} from "@/features/events/hooks/use-event-queries";
import { useAudiences } from "@/features/segments/hooks/use-segment-queries";
import {
  EVENT_TYPE_PRESETS,
  PRIORITY_OPTIONS,
  type EventPriority,
  type ScheduleType,
} from "@/features/events/types/event";

type TabId = "basic" | "schedule" | "targeting" | "review";

const TABS: { id: TabId; label: string }[] = [
  { id: "basic", label: "기본 정보" },
  { id: "schedule", label: "스케줄링" },
  { id: "targeting", label: "타겟팅" },
  { id: "review", label: "검토 및 저장" },
];

export default function EventCreatePage() {
  const router = useRouter();
  const createMutation = useCreateEvent();
  const transitionMutation = useTransitionEvent();
  const { data: audiences } = useAudiences();

  const [currentTab, setCurrentTab] = useState<TabId>("basic");

  // Tab 1: Basic Info
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState("");
  const [customEventType, setCustomEventType] = useState("");
  const [priority, setPriority] = useState<EventPriority>("medium");
  const [metadataStr, setMetadataStr] = useState("{}");
  const [metadataError, setMetadataError] = useState("");
  const [payloadSchemaVersion, setPayloadSchemaVersion] = useState("");

  // Tab 2: Scheduling
  const [scheduleType, setScheduleType] = useState<ScheduleType>("once");
  const [displayTimezone, setDisplayTimezone] = useState("Asia/Seoul");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [rrule, setRrule] = useState("");
  const [rruleDuration, setRruleDuration] = useState("");
  // Recurring builder
  const [rruleFreq, setRruleFreq] = useState("WEEKLY");
  const [rruleDays, setRruleDays] = useState<string[]>([]);
  const [rruleStartTime, setRruleStartTime] = useState("09:00");

  // Tab 3: Targeting
  const [audienceMode, setAudienceMode] = useState<"all" | "specific">("all");
  const [audienceId, setAudienceId] = useState<string>("");
  const [stickyMembership, setStickyMembership] = useState(false);

  const resolvedEventType = eventType === "__custom__" ? customEventType : eventType;

  const selectedAudience = useMemo(() => {
    if (audienceMode === "all") return null;
    return audiences?.find((a) => a.id === audienceId) ?? null;
  }, [audienceMode, audienceId, audiences]);

  // Build rrule string from builder
  const builtRrule = useMemo(() => {
    let rule = `FREQ=${rruleFreq}`;
    if (rruleFreq === "WEEKLY" && rruleDays.length > 0) {
      rule += `;BYDAY=${rruleDays.join(",")}`;
    }
    return rule;
  }, [rruleFreq, rruleDays]);

  const effectiveRrule = scheduleType === "recurring" ? (rrule || builtRrule) : null;

  // Validation
  const isNameValid = name.trim().length > 0;
  const isEventTypeValid = resolvedEventType.trim().length > 0;
  const isStartValid = startAt.length > 0;
  const isRecurringValid =
    scheduleType === "recurring"
      ? (effectiveRrule?.trim().length ?? 0) > 0 && rruleDuration.length > 0
      : true;

  const canRequestApproval = isNameValid && isEventTypeValid && isStartValid && isRecurringValid;

  const handleSaveDraft = () => {
    if (!isNameValid || !isEventTypeValid) return;

    const audData =
      audienceMode === "all"
        ? { audienceId: null, audienceName: null }
        : { audienceId, audienceName: selectedAudience?.name ?? null };

    createMutation.mutate(
      {
        name: name.trim(),
        description: description.trim(),
        eventType: resolvedEventType.trim(),
        priority,
        ...audData,
        scheduleType,
        startAt: startAt ? new Date(startAt).toISOString() : null,
        endAt: scheduleType === "once" && endAt ? new Date(endAt).toISOString() : null,
        rrule: effectiveRrule ? effectiveRrule.trim() : null,
        rruleDurationMinutes: scheduleType === "recurring" && rruleDuration ? parseInt(rruleDuration, 10) : null,
        displayTimezone,
        rewards: "",
        metadata: (() => { try { return JSON.parse(metadataStr); } catch { return {}; } })(),
        stickyMembership,
        payloadSchemaVersion: payloadSchemaVersion.trim() || null,
      },
      {
        onSuccess: () => router.push("/events"),
      },
    );
  };

  const handleRequestApproval = () => {
    if (!canRequestApproval) return;

    const audData =
      audienceMode === "all"
        ? { audienceId: null, audienceName: null }
        : { audienceId, audienceName: selectedAudience?.name ?? null };

    createMutation.mutate(
      {
        name: name.trim(),
        description: description.trim(),
        eventType: resolvedEventType.trim(),
        priority,
        ...audData,
        scheduleType,
        startAt: new Date(startAt).toISOString(),
        endAt: scheduleType === "once" && endAt ? new Date(endAt).toISOString() : null,
        rrule: effectiveRrule ? effectiveRrule.trim() : null,
        rruleDurationMinutes: scheduleType === "recurring" && rruleDuration ? parseInt(rruleDuration, 10) : null,
        displayTimezone,
        rewards: "",
        metadata: (() => { try { return JSON.parse(metadataStr); } catch { return {}; } })(),
        stickyMembership,
        payloadSchemaVersion: payloadSchemaVersion.trim() || null,
      },
      {
        onSuccess: (data) => {
          transitionMutation.mutate(
            { id: data.id, action: "request_approval" },
            { onSuccess: () => router.push("/events") },
          );
        },
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

  const DAY_OPTIONS = [
    { value: "MO", label: "월" },
    { value: "TU", label: "화" },
    { value: "WE", label: "수" },
    { value: "TH", label: "목" },
    { value: "FR", label: "금" },
    { value: "SA", label: "토" },
    { value: "SU", label: "일" },
  ];

  const toggleDay = (day: string) => {
    setRruleDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/events"
          className={buttonVariants({ variant: "ghost", size: "icon" })}
        >
          <ArrowLeft />
        </Link>
        <h2 className="text-lg font-semibold">새 이벤트</h2>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b">
        {TABS.map((tab) => (
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
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Basic Info */}
      {currentTab === "basic" && (
        <Card>
          <CardContent className="space-y-5 pt-6">
            <div className="space-y-2">
              <Label htmlFor="name">이벤트명 *</Label>
              <Input
                id="name"
                placeholder="이벤트명을 입력하세요 (최대 128자)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={128}
              />
              <p className="text-xs text-muted-foreground">{name.length} / 128자</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                placeholder="이벤트 설명을 입력하세요 (선택, 최대 1,000자)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">{description.length} / 1,000자</p>
            </div>

            <div className="space-y-2">
              <Label>이벤트 타입 *</Label>
              <Select
                value={
                  EVENT_TYPE_PRESETS.some((p) => p.value === eventType)
                    ? eventType
                    : eventType === "__custom__"
                      ? "__custom__"
                      : ""
                }
                onValueChange={(v) => {
                  if (v === "__custom__") {
                    setEventType("__custom__");
                    setCustomEventType("");
                  } else if (v) {
                    setEventType(v);
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="이벤트 유형 선택" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPE_PRESETS.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.label} ({preset.value})
                    </SelectItem>
                  ))}
                  <SelectItem value="__custom__">직접 입력</SelectItem>
                </SelectContent>
              </Select>
              {eventType === "__custom__" && (
                <Input
                  placeholder="예: my_custom_event"
                  value={customEventType}
                  onChange={(e) => setCustomEventType(e.target.value)}
                  maxLength={64}
                />
              )}
              <p className="text-xs text-muted-foreground">
                영문 소문자/숫자/언더스코어 (예: login_bonus, seasonal)
              </p>
            </div>

            <div className="space-y-2">
              <Label>우선순위 *</Label>
              <Select
                value={priority}
                onValueChange={(v) => { if (v) setPriority(v as EventPriority); }}
              >
                <SelectTrigger className="w-full">
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
              <p className="text-xs text-muted-foreground">low / medium / high / critical</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="metadata">메타데이터 (JSON)</Label>
              <Textarea
                id="metadata"
                placeholder='{"rewardItemId": "item_001", "rewardAmount": 100}'
                value={metadataStr}
                onChange={(e) => {
                  setMetadataStr(e.target.value);
                  try {
                    JSON.parse(e.target.value);
                    setMetadataError("");
                  } catch {
                    setMetadataError("유효하지 않은 JSON 형식입니다.");
                  }
                }}
                rows={5}
                className="font-mono text-sm"
              />
              {metadataError && (
                <p className="text-xs text-red-600">{metadataError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                최대 64KB. 현재 크기: {new Blob([metadataStr]).size} bytes
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="schemaVersion">스키마 버전</Label>
              <Input
                id="schemaVersion"
                placeholder="v1.0"
                value={payloadSchemaVersion}
                onChange={(e) => setPayloadSchemaVersion(e.target.value)}
                maxLength={32}
              />
              <p className="text-xs text-muted-foreground">최대 32자 (선택)</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Scheduling */}
      {currentTab === "schedule" && (
        <Card>
          <CardContent className="space-y-5 pt-6">
            <div className="space-y-3">
              <Label>스케줄 타입 *</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="scheduleType"
                    checked={scheduleType === "once"}
                    onChange={() => setScheduleType("once")}
                    className="accent-primary"
                  />
                  <span className="text-sm">단순 스케줄</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="scheduleType"
                    checked={scheduleType === "recurring"}
                    onChange={() => setScheduleType("recurring")}
                    className="accent-primary"
                  />
                  <span className="text-sm">반복 스케줄</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">타임존 *</Label>
              <Input
                id="timezone"
                placeholder="Asia/Seoul"
                value={displayTimezone}
                onChange={(e) => setDisplayTimezone(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">IANA 타임존 (예: Asia/Seoul, UTC+9)</p>
            </div>

            {scheduleType === "once" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="startAt">시작 일시 *</Label>
                  <Input
                    id="startAt"
                    type="datetime-local"
                    value={startAt}
                    onChange={(e) => setStartAt(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">{displayTimezone} 기준 입력</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endAt">종료 일시</Label>
                  <Input
                    id="endAt"
                    type="datetime-local"
                    value={endAt}
                    onChange={(e) => setEndAt(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">비워두면 종료일 미정 (수동 종료 필요)</p>
                </div>
                {startAt && (
                  <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800">
                    <p className="font-medium">UTC 저장값:</p>
                    <p>{new Date(startAt).toISOString()}{endAt ? ` ~ ${new Date(endAt).toISOString()}` : ""}</p>
                  </div>
                )}
              </>
            )}

            {scheduleType === "recurring" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="startAt">시작 일시 *</Label>
                  <Input
                    id="startAt"
                    type="datetime-local"
                    value={startAt}
                    onChange={(e) => setStartAt(e.target.value)}
                  />
                </div>

                <div className="rounded-md border p-4 space-y-4">
                  <h4 className="text-sm font-medium">반복 규칙 빌더</h4>

                  <div className="space-y-2">
                    <Label>빈도</Label>
                    <Select value={rruleFreq} onValueChange={(v) => { if (v) setRruleFreq(v); }}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DAILY">매일 (DAILY)</SelectItem>
                        <SelectItem value="WEEKLY">매주 (WEEKLY)</SelectItem>
                        <SelectItem value="MONTHLY">매월 (MONTHLY)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {rruleFreq === "WEEKLY" && (
                    <div className="space-y-2">
                      <Label>요일</Label>
                      <div className="flex gap-2">
                        {DAY_OPTIONS.map((day) => (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => toggleDay(day.value)}
                            className={`h-8 w-8 rounded text-xs font-medium border transition-colors ${
                              rruleDays.includes(day.value)
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background hover:bg-muted border-input"
                            }`}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>시작 시간</Label>
                      <Input
                        type="time"
                        value={rruleStartTime}
                        onChange={(e) => setRruleStartTime(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>지속 시간 (분) *</Label>
                      <Input
                        type="number"
                        placeholder="예: 1440 (24시간)"
                        value={rruleDuration}
                        onChange={(e) => setRruleDuration(e.target.value)}
                        min={1}
                      />
                    </div>
                  </div>
                </div>

                {/* rrule preview */}
                <div className="rounded-md bg-muted p-3 space-y-1">
                  <p className="text-sm font-medium">생성된 rrule:</p>
                  <p className="text-sm font-mono">{builtRrule}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rruleManual">직접 입력 (위 빌더 대신 수동 입력)</Label>
                  <Input
                    id="rruleManual"
                    placeholder="예: FREQ=WEEKLY;BYDAY=FR"
                    value={rrule}
                    onChange={(e) => setRrule(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    빌더 대신 rrule 문자열을 직접 입력하면 직접 입력값이 우선됩니다.
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Targeting */}
      {currentTab === "targeting" && (
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
                  <span className="text-sm">전체 플레이어 (오디언스 없음)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="audienceMode"
                    checked={audienceMode === "specific"}
                    onChange={() => setAudienceMode("specific")}
                    className="accent-primary"
                  />
                  <span className="text-sm">특정 오디언스 선택</span>
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

            <div className="flex items-center justify-between rounded-md border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="stickyMembership">Sticky Membership</Label>
                <p className="text-xs text-muted-foreground">
                  이벤트 시작 시점의 오디언스 멤버십을 고정합니다. 이후 오디언스 조건을 이탈한 플레이어도 참여 자격을 유지합니다.
                </p>
              </div>
              <Switch
                id="stickyMembership"
                checked={stickyMembership}
                onCheckedChange={setStickyMembership}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Review & Save */}
      {currentTab === "review" && (
        <div className="space-y-4">
          {/* Basic Info Summary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">기본 정보</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentTab("basic")}
                className="text-xs"
              >
                수정 &rarr;
              </Button>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">이벤트명</dt>
                  <dd className="font-medium">{name || "-"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">이벤트 타입</dt>
                  <dd className="font-medium">{resolvedEventType || "-"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">우선순위</dt>
                  <dd className="font-medium">{priority}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">메타데이터</dt>
                  <dd className="font-mono text-xs truncate max-w-[300px]">{metadataStr}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Schedule Summary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">스케줄</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentTab("schedule")}
                className="text-xs"
              >
                수정 &rarr;
              </Button>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">타입</dt>
                  <dd className="font-medium">{scheduleType === "once" ? "단순 스케줄" : "반복 스케줄"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">타임존</dt>
                  <dd className="font-medium">{displayTimezone}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">시작</dt>
                  <dd className="font-medium">{startAt ? `${startAt} (${displayTimezone})` : "-"}</dd>
                </div>
                {scheduleType === "once" && (
                  <div>
                    <dt className="text-muted-foreground">종료</dt>
                    <dd className="font-medium">{endAt ? `${endAt} (${displayTimezone})` : "미설정"}</dd>
                  </div>
                )}
                {scheduleType === "recurring" && (
                  <>
                    <div>
                      <dt className="text-muted-foreground">반복 규칙</dt>
                      <dd className="font-mono text-xs">{effectiveRrule || "-"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">지속 시간</dt>
                      <dd className="font-medium">{rruleDuration ? `${rruleDuration}분` : "-"}</dd>
                    </div>
                  </>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* Targeting Summary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">타겟팅</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentTab("targeting")}
                className="text-xs"
              >
                수정 &rarr;
              </Button>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">오디언스</dt>
                  <dd className="font-medium">
                    {audienceMode === "all"
                      ? "전체 플레이어"
                      : selectedAudience?.name ?? "미선택"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Sticky Membership</dt>
                  <dd className="font-medium">{stickyMembership ? "활성" : "비활성"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Checklist */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-2 mb-3">
                <AlertCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                <span className="text-sm font-medium">승인 요청 전 확인사항</span>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  {isNameValid ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <span className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                  )}
                  <span className={isNameValid ? "" : "text-muted-foreground"}>
                    이벤트명이 입력되어 있어야 합니다.
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  {isEventTypeValid ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <span className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                  )}
                  <span className={isEventTypeValid ? "" : "text-muted-foreground"}>
                    이벤트 타입이 설정되어 있어야 합니다.
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  {isStartValid ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <span className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                  )}
                  <span className={isStartValid ? "" : "text-muted-foreground"}>
                    스케줄이 설정되어 있어야 합니다.
                  </span>
                </li>
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
              &larr; 이전: {TABS[tabIndex - 1].label}
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {currentTab === "review" ? (
            <>
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={createMutation.isPending || transitionMutation.isPending}
              >
                {createMutation.isPending ? "저장 중..." : "초안 저장"}
              </Button>
              <Button
                onClick={handleRequestApproval}
                disabled={!canRequestApproval || createMutation.isPending || transitionMutation.isPending}
              >
                {transitionMutation.isPending ? "요청 중..." : "승인 요청"}
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/events"
                className={buttonVariants({ variant: "ghost" })}
              >
                취소
              </Link>
              <Button onClick={goNext}>
                다음: {TABS[tabIndex + 1]?.label ?? ""} &rarr;
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
