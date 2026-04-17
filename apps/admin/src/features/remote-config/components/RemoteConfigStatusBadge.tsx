"use client";

import { CONFIG_STATUS_CONFIG, type ConfigStatus } from "../types/remote-config";

export function RemoteConfigStatusBadge({ status }: { status: ConfigStatus }) {
  const cfg = CONFIG_STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.text}`}
    >
      {cfg.label}
    </span>
  );
}
