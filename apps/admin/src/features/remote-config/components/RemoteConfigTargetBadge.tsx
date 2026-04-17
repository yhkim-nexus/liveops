"use client";

import { TARGET_CONFIG, type ConfigTarget } from "../types/remote-config";

export function RemoteConfigTargetBadge({ target }: { target: ConfigTarget }) {
  const cfg = TARGET_CONFIG[target];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.text}`}
    >
      {cfg.label}
    </span>
  );
}
