"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ValueType } from "../types/remote-config";

const HELPER_TEXT: Record<ValueType, string> = {
  string: "텍스트 값을 입력하세요.",
  number: "정수 또는 소수점 숫자를 입력하세요.",
  boolean: "true 또는 false를 선택하세요.",
  json: "유효한 JSON 형식으로 입력하세요.",
};

interface RemoteConfigValueInputProps {
  valueType: ValueType;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function RemoteConfigValueInput({
  valueType,
  value,
  onChange,
  error,
}: RemoteConfigValueInputProps) {
  return (
    <div className="space-y-2">
      <Label>값 *</Label>

      {valueType === "string" && (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="텍스트 값"
        />
      )}

      {valueType === "number" && (
        <Input
          type="number"
          step="any"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
        />
      )}

      {valueType === "boolean" && (
        <Select
          value={value}
          onValueChange={(v) => {
            if (v) onChange(v);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="선택하세요" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">True</SelectItem>
            <SelectItem value="false">False</SelectItem>
          </SelectContent>
        </Select>
      )}

      {valueType === "json" && (
        <Textarea
          rows={6}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder='{"key": "value"}'
        />
      )}

      <p className="text-xs text-muted-foreground">{HELPER_TEXT[valueType]}</p>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
