import { PLAYER_STATUS_CONFIG, type PlayerStatus } from "../types/player";

export function PlayerStatusBadge({ status }: { status: PlayerStatus }) {
  const config = PLAYER_STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
}
