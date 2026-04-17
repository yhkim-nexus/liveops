"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { RemoteConfigValueInput } from "./RemoteConfigValueInput";
import { remoteConfigFormSchema } from "../lib/validation";
import type {
  ConfigTarget,
  CreateRemoteConfigRequest,
  RemoteConfigEntry,
  ValueType,
} from "../types/remote-config";

const TARGET_OPTIONS: { value: ConfigTarget; label: string }[] = [
  { value: "client", label: "클라이언트" },
  { value: "server", label: "서버" },
  { value: "both", label: "양쪽" },
];

const VALUE_TYPE_OPTIONS: { value: ValueType; label: string }[] = [
  { value: "string", label: "문자열" },
  { value: "number", label: "숫자" },
  { value: "boolean", label: "불린" },
  { value: "json", label: "JSON" },
];

interface RemoteConfigFormProps {
  mode: "create" | "edit";
  defaultValues?: Partial<RemoteConfigEntry>;
  onSubmit: (data: CreateRemoteConfigRequest) => void;
  isPending: boolean;
}

export function RemoteConfigForm({
  mode,
  defaultValues,
  onSubmit,
  isPending,
}: RemoteConfigFormProps) {
  // Field states
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState<ConfigTarget>("client");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [valueType, setValueType] = useState<ValueType>("string");
  const [value, setValue] = useState("");

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize from defaultValues in edit mode
  useEffect(() => {
    if (defaultValues) {
      if (defaultValues.key) setKey(defaultValues.key);
      if (defaultValues.description) setDescription(defaultValues.description);
      if (defaultValues.target) setTarget(defaultValues.target);
      if (defaultValues.tags) setTags(defaultValues.tags);
      if (defaultValues.valueType) setValueType(defaultValues.valueType);
      if (defaultValues.value) setValue(defaultValues.value);
    }
  }, [defaultValues]);

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleValueTypeChange = (newType: string) => {
    if (newType) {
      setValueType(newType as ValueType);
      setValue("");
      setErrors((prev) => {
        const next = { ...prev };
        delete next.value;
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = {
      key,
      description,
      target,
      valueType,
      value,
      tags,
    };

    const result = remoteConfigFormSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path.join(".");
        if (!fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    onSubmit(result.data as CreateRemoteConfigRequest);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Section 1: 기본 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Key */}
          <div className="space-y-2">
            <Label htmlFor="config-key">키 *</Label>
            <Input
              id="config-key"
              placeholder="예: game.reward.daily_coin"
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                setErrors((prev) => {
                  const next = { ...prev };
                  delete next.key;
                  return next;
                });
              }}
              readOnly={mode === "edit"}
              className={mode === "edit" ? "bg-muted" : ""}
            />
            {errors.key && (
              <p className="text-xs text-red-600">{errors.key}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="config-description">설명</Label>
            <Input
              id="config-description"
              placeholder="이 설정의 용도를 간단히 설명하세요"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Target */}
          <div className="space-y-3">
            <Label>적용 대상 *</Label>
            <div className="flex flex-col gap-3">
              {TARGET_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="target"
                    checked={target === opt.value}
                    onChange={() => setTarget(opt.value)}
                    className="accent-primary"
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
            {errors.target && (
              <p className="text-xs text-red-600">{errors.target}</p>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>태그</Label>
            <div className="flex gap-2">
              <Input
                placeholder="태그를 입력하세요"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
              >
                추가
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 inline-flex items-center"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 2: 값 설정 */}
      <Card>
        <CardHeader>
          <CardTitle>값 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Type */}
          <div className="space-y-2">
            <Label>타입 *</Label>
            <Select value={valueType} onValueChange={(v) => { if (v) handleValueTypeChange(v); }}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VALUE_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.valueType && (
              <p className="text-xs text-red-600">{errors.valueType}</p>
            )}
          </div>

          {/* Value */}
          <RemoteConfigValueInput
            valueType={valueType}
            value={value}
            onChange={(v) => {
              setValue(v);
              setErrors((prev) => {
                const next = { ...prev };
                delete next.value;
                return next;
              });
            }}
            error={errors.value}
          />
        </CardContent>
      </Card>

      {/* Bottom actions */}
      <div className="flex justify-end gap-2 border-t pt-4">
        <Link
          href="/remote-config"
          className={buttonVariants({ variant: "ghost" })}
        >
          취소
        </Link>
        <Button type="submit" disabled={isPending}>
          {isPending ? "저장 중..." : "저장"}
        </Button>
      </div>
    </form>
  );
}
