"use client";

import { VALUE_TYPE_CONFIG, type ValueType } from "../types/remote-config";

export function RemoteConfigTypeBadge({
  valueType,
}: {
  valueType: ValueType;
}) {
  const cfg = VALUE_TYPE_CONFIG[valueType];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.text}`}
    >
      {cfg.label}
    </span>
  );
}
