"use client";

import { Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AudienceCondition, ConditionGroup, FilterOperator } from "../types/segment";
import { OPERATOR_LABELS } from "../types/segment";
import { getAllProperties, getPropertiesByCategory } from "../lib/mock-segments";
import { SelectGroup, SelectLabel } from "@/components/ui/select";

interface ConditionBuilderProps {
  conditionGroups: ConditionGroup[];
  onChange: (groups: ConditionGroup[]) => void;
}

const EMPTY_CONDITION: AudienceCondition = {
  property: "countryCode",
  operator: "eq",
  value: "",
};

const OPERATORS = Object.entries(OPERATOR_LABELS) as [FilterOperator, string][];

export function ConditionBuilder({
  conditionGroups,
  onChange,
}: ConditionBuilderProps) {
  const properties = getAllProperties();
  const defaultProps = getPropertiesByCategory("default");
  const computedProps = getPropertiesByCategory("computed");
  const customProps = getPropertiesByCategory("custom");

  const handleAddGroup = () => {
    onChange([
      ...conditionGroups,
      { logic: "and", conditions: [{ ...EMPTY_CONDITION }] },
    ]);
  };

  const handleRemoveGroup = (groupIndex: number) => {
    onChange(conditionGroups.filter((_, i) => i !== groupIndex));
  };

  const handleAddCondition = (groupIndex: number) => {
    const updated = conditionGroups.map((g, i) =>
      i === groupIndex
        ? { ...g, conditions: [...g.conditions, { ...EMPTY_CONDITION }] }
        : g,
    );
    onChange(updated);
  };

  const handleRemoveCondition = (
    groupIndex: number,
    condIndex: number,
  ) => {
    const updated = conditionGroups.map((g, i) => {
      if (i !== groupIndex) return g;
      const conditions = g.conditions.filter((_, ci) => ci !== condIndex);
      return { ...g, conditions };
    });
    onChange(updated);
  };

  const handleConditionChange = (
    groupIndex: number,
    condIndex: number,
    field: keyof AudienceCondition,
    value: string,
  ) => {
    const updated = conditionGroups.map((g, gi) => {
      if (gi !== groupIndex) return g;
      const conditions = g.conditions.map((c, ci) => {
        if (ci !== condIndex) return c;
        if (field === "value") {
          const propDef = properties.find((p) => p.key === c.property);
          const numericValue =
            propDef?.valueType === "numeric" ? Number(value) || value : value;
          return { ...c, value: numericValue };
        }
        return { ...c, [field]: value };
      });
      return { ...g, conditions };
    });
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {conditionGroups.length === 0 && (
        <p className="text-sm text-muted-foreground">
          조건 그룹을 추가해 오디언스를 정의하세요.
        </p>
      )}

      {conditionGroups.map((group, gi) => (
        <div key={gi} className="space-y-3">
          {gi > 0 && (
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-semibold text-orange-600 bg-orange-50 rounded px-2 py-0.5">
                OR
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
          )}

          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                조건 그룹 {gi + 1}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddCondition(gi)}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  조건 추가
                </Button>
                {conditionGroups.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveGroup(gi)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {group.conditions.map((condition, ci) => (
              <div key={ci} className="flex items-center gap-2">
                {ci > 0 && (
                  <span className="text-xs font-medium text-muted-foreground w-8 text-center">
                    AND
                  </span>
                )}
                {ci === 0 && <span className="w-8" />}

                <Select
                  value={condition.property}
                  onValueChange={(val) => {
                    if (val) handleConditionChange(gi, ci, "property", val);
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Default</SelectLabel>
                      {defaultProps.map((opt) => (
                        <SelectItem key={opt.key} value={opt.key}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Computed</SelectLabel>
                      {computedProps.map((opt) => (
                        <SelectItem key={opt.key} value={opt.key}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel>Custom</SelectLabel>
                      {customProps.map((opt) => (
                        <SelectItem key={opt.key} value={opt.key}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <Select
                  value={condition.operator}
                  onValueChange={(val) => {
                    if (val) handleConditionChange(gi, ci, "operator", val);
                  }}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATORS.map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  type="text"
                  placeholder="값"
                  value={String(condition.value)}
                  onChange={(e) =>
                    handleConditionChange(gi, ci, "value", e.target.value)
                  }
                  className="w-36"
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveCondition(gi, ci)}
                  aria-label="조건 삭제"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" onClick={handleAddGroup}>
        <Plus className="mr-1 h-4 w-4" />
        조건 그룹 추가 (OR)
      </Button>
    </div>
  );
}
