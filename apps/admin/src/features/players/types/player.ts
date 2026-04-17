export type PlayerStatus = "active" | "banned" | "suspended";
export type Platform = "iOS" | "Android" | "PC";

export interface Player {
  id: string;
  nickname: string;
  walletAddress: string;
  level: number;
  status: PlayerStatus;
  platform: Platform;
  country: string;
  totalSpent: number;
  lastLoginAt: string;
  createdAt: string;
  lastDeviceModel: string; // e.g., "iPhone 14 Pro", "Samsung Galaxy S23", "PC-Windows"
  lastDeviceOS: string; // e.g., "iOS 17.4", "Android 14", "Windows 11"
  logicVersion: number; // e.g., 15, 16, 17
  banReason?: string;
  bannedAt?: string;
  suspendReason?: string;
  suspendedAt?: string;      // ISO 8601
  suspendedUntil?: string;   // ISO 8601 (만료일)
  audiences: string[]; // audience names
}

export const PLAYER_STATUS_CONFIG: Record<PlayerStatus, { label: string; bg: string; text: string }> = {
  active: { label: "활성", bg: "bg-green-100", text: "text-green-700" },
  banned: { label: "차단됨", bg: "bg-red-100", text: "text-red-600" },
  suspended: { label: "정지됨", bg: "bg-orange-100", text: "text-orange-600" },
};
