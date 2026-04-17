import type { Player } from "../types/player";

let players: Player[] = [
  {
    id: "p-10001",
    nickname: "Player_Alpha",
    walletAddress: "0x1a2B3c4D5e6F7890aBcDeF1234567890AbCdEf01",
    level: 45,
    status: "active",
    platform: "iOS",
    country: "KR",
    totalSpent: 1250,
    lastLoginAt: "2026-03-27T08:30:00Z",
    createdAt: "2025-06-15T10:00:00Z",
    lastDeviceModel: "iPhone 14 Pro",
    lastDeviceOS: "iOS 17.4",
    logicVersion: 17,
    audiences: ["활성 플레이어", "결제 경험자", "국내 플레이어"],
  },
  {
    id: "p-10002",
    nickname: "Player_Bravo",
    walletAddress: "0x2b3C4d5E6f7A8901bCdEf2345678901BcDeFa02",
    level: 72,
    status: "active",
    platform: "Android",
    country: "KR",
    totalSpent: 3200,
    lastLoginAt: "2026-03-26T22:15:00Z",
    createdAt: "2025-03-10T14:00:00Z",
    lastDeviceModel: "Samsung Galaxy S23",
    lastDeviceOS: "Android 14",
    logicVersion: 17,
    audiences: ["활성 플레이어", "결제 경험자", "하드코어 플레이어", "국내 플레이어"],
  },
  {
    id: "p-10003",
    nickname: "SakuraMaster",
    walletAddress: "0x3C4d5E6F7a8B9012CdEf3456789012cDeFaB03",
    level: 88,
    status: "banned",
    platform: "PC",
    country: "JP",
    totalSpent: 5200,
    lastLoginAt: "2026-03-15T01:45:00Z",
    createdAt: "2025-01-20T09:00:00Z",
    lastDeviceModel: "PC-Windows",
    lastDeviceOS: "Windows 11",
    logicVersion: 16,
    banReason: "부정 결제 의심으로 계정 차단",
    bannedAt: "2026-03-20T10:00:00Z",
    audiences: ["결제 경험자", "하드코어 플레이어"],
  },
  {
    id: "p-10004",
    nickname: "StarGazer99",
    walletAddress: "0x4D5e6F7A8b9C0123dEf4567890123DeFaBc04",
    level: 12,
    status: "suspended",
    platform: "iOS",
    country: "US",
    totalSpent: 0,
    lastLoginAt: "2026-03-22T18:00:00Z",
    createdAt: "2026-03-20T11:00:00Z",
    lastDeviceModel: "iPhone 13",
    lastDeviceOS: "iOS 16.5",
    logicVersion: 16,
    suspendReason: "비정상 접속 패턴 감지로 임시 정지",
    suspendedAt: "2026-03-24T10:00:00Z",
    suspendedUntil: "2026-03-31T10:00:00Z",
    audiences: ["신규 플레이어"],
  },
  {
    id: "p-10005",
    nickname: "드래곤슬레이어",
    walletAddress: "0x5E6f7A8B9c0D1234eF5678901234EfAbCd05",
    level: 99,
    status: "active",
    platform: "PC",
    country: "KR",
    totalSpent: 4800,
    lastLoginAt: "2026-03-27T07:00:00Z",
    createdAt: "2024-11-01T08:00:00Z",
    lastDeviceModel: "PC-Windows",
    lastDeviceOS: "Windows 11",
    logicVersion: 17,
    audiences: ["활성 플레이어", "결제 경험자", "하드코어 플레이어", "국내 플레이어"],
  },
  {
    id: "p-10006",
    nickname: "CoolHunter",
    walletAddress: "0x6F7a8B9C0d1E2345fA6789012345FaBcDe06",
    level: 34,
    status: "active",
    platform: "Android",
    country: "DE",
    totalSpent: 150,
    lastLoginAt: "2026-03-26T14:20:00Z",
    createdAt: "2025-09-05T16:00:00Z",
    lastDeviceModel: "Samsung Galaxy S24",
    lastDeviceOS: "Android 14",
    logicVersion: 17,
    audiences: ["활성 플레이어", "결제 경험자"],
  },
  {
    id: "p-10007",
    nickname: "해커왕",
    walletAddress: "0x7A8b9C0D1e2F3456aB7890123456AbCdEf07",
    level: 95,
    status: "banned",
    platform: "PC",
    country: "CN",
    totalSpent: 0,
    lastLoginAt: "2026-02-10T03:00:00Z",
    createdAt: "2025-12-01T12:00:00Z",
    lastDeviceModel: "PC-Windows",
    lastDeviceOS: "Windows 10",
    logicVersion: 15,
    banReason: "치트 프로그램 사용 확인 (스피드핵, 자동사냥)",
    bannedAt: "2026-02-10T05:30:00Z",
    audiences: [],
  },
  {
    id: "p-10008",
    nickname: "NightOwl_BR",
    walletAddress: "0x8B9c0D1E2f3A4567bC8901234567BcDeFa08",
    level: 56,
    status: "active",
    platform: "Android",
    country: "BR",
    totalSpent: 320,
    lastLoginAt: "2026-03-27T04:10:00Z",
    createdAt: "2025-07-22T20:00:00Z",
    lastDeviceModel: "Xiaomi Redmi Note 12",
    lastDeviceOS: "Android 13",
    logicVersion: 16,
    audiences: ["활성 플레이어", "결제 경험자"],
  },
  {
    id: "p-10009",
    nickname: "김테스트",
    walletAddress: "0x9C0d1E2F3a4B5678cD9012345678CdEfAb09",
    level: 5,
    status: "active",
    platform: "iOS",
    country: "KR",
    totalSpent: 0,
    lastLoginAt: "2026-03-26T09:00:00Z",
    createdAt: "2026-03-25T15:00:00Z",
    lastDeviceModel: "iPhone 15",
    lastDeviceOS: "iOS 17.3",
    logicVersion: 17,
    audiences: ["신규 플레이어", "국내 플레이어"],
  },
  {
    id: "p-10010",
    nickname: "ProGamer_X",
    walletAddress: "0xA0d1E2F3a4B5C6789De0123456789dEfAbC10",
    level: 78,
    status: "active",
    platform: "PC",
    country: "US",
    totalSpent: 890,
    lastLoginAt: "2026-03-26T20:45:00Z",
    createdAt: "2025-04-18T13:00:00Z",
    lastDeviceModel: "PC-Windows",
    lastDeviceOS: "Windows 11",
    logicVersion: 17,
    audiences: ["활성 플레이어", "결제 경험자", "하드코어 플레이어"],
  },
  {
    id: "p-10011",
    nickname: "악성플레이어123",
    walletAddress: "0xB1e2F3A4b5C6D7890Ef1234567890eFaBcD11",
    level: 41,
    status: "banned",
    platform: "Android",
    country: "KR",
    totalSpent: 50,
    lastLoginAt: "2026-01-15T11:00:00Z",
    createdAt: "2025-08-30T09:00:00Z",
    lastDeviceModel: "Samsung Galaxy A54",
    lastDeviceOS: "Android 13",
    logicVersion: 14,
    banReason: "다수 이용자 대상 욕설 및 비매너 행위 반복 신고 접수",
    bannedAt: "2026-01-15T14:00:00Z",
    audiences: [],
  },
  {
    id: "p-10012",
    nickname: "LuckyCharm",
    walletAddress: "0xC2f3A4B5c6D7E8901Fa2345678901fAbCdE12",
    level: 63,
    status: "active",
    platform: "iOS",
    country: "US",
    totalSpent: 2100,
    lastLoginAt: "2026-03-24T16:30:00Z",
    createdAt: "2025-05-12T07:00:00Z",
    lastDeviceModel: "iPhone 14",
    lastDeviceOS: "iOS 17.2",
    logicVersion: 16,
    audiences: ["활성 플레이어", "결제 경험자"],
  },
  {
    id: "p-10013",
    nickname: "田中太郎",
    walletAddress: "0xD3a4B5C6d7E8F9012Ab3456789012aBcDeF13",
    level: 29,
    status: "active",
    platform: "Android",
    country: "JP",
    totalSpent: 400,
    lastLoginAt: "2026-03-27T06:20:00Z",
    createdAt: "2025-10-08T11:00:00Z",
    lastDeviceModel: "Google Pixel 8",
    lastDeviceOS: "Android 14",
    logicVersion: 17,
    audiences: ["활성 플레이어", "결제 경험자"],
  },
  {
    id: "p-10014",
    nickname: "불사조",
    walletAddress: "0xE4b5C6D7e8F9A0123Bc4567890123bCdEfA14",
    level: 50,
    status: "suspended",
    platform: "PC",
    country: "KR",
    totalSpent: 600,
    lastLoginAt: "2026-03-20T10:00:00Z",
    createdAt: "2025-06-01T08:00:00Z",
    lastDeviceModel: "PC-Mac",
    lastDeviceOS: "macOS 14.3",
    logicVersion: 16,
    suspendReason: "비정상 접속 패턴 감지로 임시 정지",
    suspendedAt: "2026-03-24T10:00:00Z",
    suspendedUntil: "2026-03-31T10:00:00Z",
    audiences: ["국내 플레이어"],
  },
  {
    id: "p-10015",
    nickname: "GamerDude42",
    walletAddress: "0xF5c6D7E8f9A0B1234Cd5678901234cDeFaB15",
    level: 18,
    status: "active",
    platform: "iOS",
    country: "US",
    totalSpent: 25,
    lastLoginAt: "2026-03-25T12:00:00Z",
    createdAt: "2026-02-14T19:00:00Z",
    lastDeviceModel: "iPhone 12",
    lastDeviceOS: "iOS 16.7",
    logicVersion: 16,
    audiences: ["활성 플레이어"],
  },
  {
    id: "p-10016",
    nickname: "용사크리스",
    walletAddress: "0x06d7E8F9a0B1C2345De6789012345dEfAbC16",
    level: 67,
    status: "active",
    platform: "Android",
    country: "KR",
    totalSpent: 1800,
    lastLoginAt: "2026-03-27T09:15:00Z",
    createdAt: "2025-02-28T10:00:00Z",
    lastDeviceModel: "Samsung Galaxy S24 Ultra",
    lastDeviceOS: "Android 14",
    logicVersion: 17,
    audiences: ["활성 플레이어", "결제 경험자", "국내 플레이어"],
  },
  {
    id: "p-10017",
    nickname: "WangWei",
    walletAddress: "0x17e8F9A0b1C2D3456Ef7890123456eFaBcD17",
    level: 83,
    status: "active",
    platform: "PC",
    country: "CN",
    totalSpent: 3500,
    lastLoginAt: "2026-03-26T23:00:00Z",
    createdAt: "2025-01-05T06:00:00Z",
    lastDeviceModel: "PC-Windows",
    lastDeviceOS: "Windows 11",
    logicVersion: 16,
    audiences: ["활성 플레이어", "결제 경험자", "하드코어 플레이어"],
  },
  {
    id: "p-10018",
    nickname: "SilverFox",
    walletAddress: "0x28f9A0B1c2D3E4567Fa8901234567fAbCdE18",
    level: 41,
    status: "active",
    platform: "Android",
    country: "DE",
    totalSpent: 75,
    lastLoginAt: "2026-03-23T17:30:00Z",
    createdAt: "2025-11-20T14:00:00Z",
    lastDeviceModel: "Google Pixel 7",
    lastDeviceOS: "Android 14",
    logicVersion: 15,
    audiences: ["활성 플레이어"],
  },
  {
    id: "p-10019",
    nickname: "마법사루나",
    walletAddress: "0x39a0B1C2d3E4F5678Ab9012345678aBcDeF19",
    level: 55,
    status: "active",
    platform: "iOS",
    country: "KR",
    totalSpent: 920,
    lastLoginAt: "2026-03-27T07:45:00Z",
    createdAt: "2025-08-15T09:00:00Z",
    lastDeviceModel: "iPhone 15 Pro Max",
    lastDeviceOS: "iOS 17.4",
    logicVersion: 17,
    audiences: ["활성 플레이어", "결제 경험자", "국내 플레이어"],
  },
  {
    id: "p-10020",
    nickname: "PedroGaming",
    walletAddress: "0x4Ab1C2D3e4F5A6789Bc0123456789bCdEfA20",
    level: 22,
    status: "active",
    platform: "Android",
    country: "BR",
    totalSpent: 0,
    lastLoginAt: "2026-03-26T21:00:00Z",
    createdAt: "2026-01-10T16:00:00Z",
    lastDeviceModel: "Motorola Edge 40",
    lastDeviceOS: "Android 13",
    logicVersion: 16,
    audiences: ["활성 플레이어"],
  },
  {
    id: "p-10021",
    nickname: "어둠의기사",
    walletAddress: "0x5Bc2D3E4f5A6B7890Cd1234567890cDeFaB21",
    level: 91,
    status: "active",
    platform: "PC",
    country: "KR",
    totalSpent: 4200,
    lastLoginAt: "2026-03-27T02:30:00Z",
    createdAt: "2024-12-15T10:00:00Z",
    lastDeviceModel: "PC-Windows",
    lastDeviceOS: "Windows 11",
    logicVersion: 17,
    audiences: ["활성 플레이어", "결제 경험자", "하드코어 플레이어", "국내 플레이어"],
  },
  {
    id: "p-10022",
    nickname: "NewbieJohn",
    walletAddress: "0x6Cd3E4F5a6B7C8901De2345678901dEfAbC22",
    level: 1,
    status: "active",
    platform: "iOS",
    country: "US",
    totalSpent: 0,
    lastLoginAt: "2026-03-27T10:00:00Z",
    createdAt: "2026-03-27T09:30:00Z",
    lastDeviceModel: "iPhone 16",
    lastDeviceOS: "iOS 17.4",
    logicVersion: 17,
    audiences: ["신규 플레이어"],
  },
];

export function searchPlayers(query: string): Player[] {
  if (!query.trim()) return [...players];
  const q = query.trim().toLowerCase();
  return players.filter(
    (p) =>
      p.id.toLowerCase().includes(q) ||
      p.walletAddress.toLowerCase().includes(q) ||
      p.nickname.toLowerCase().includes(q),
  );
}

export function getPlayerById(id: string): Player | undefined {
  return players.find((p) => p.id === id);
}

export function banPlayer(id: string, reason: string): Player | undefined {
  const index = players.findIndex((p) => p.id === id);
  if (index === -1) return undefined;
  const player = players[index];
  if (player.status !== "active" && player.status !== "suspended") return undefined;
  const updated: Player = {
    ...player,
    status: "banned",
    banReason: reason,
    bannedAt: new Date().toISOString(),
    suspendReason: undefined,
    suspendedAt: undefined,
    suspendedUntil: undefined,
  };
  players = players.map((p) => (p.id === id ? updated : p));
  return updated;
}

export function unbanPlayer(id: string): Player | undefined {
  const index = players.findIndex((p) => p.id === id);
  if (index === -1) return undefined;
  const updated: Player = {
    ...players[index],
    status: "active",
    banReason: undefined,
    bannedAt: undefined,
  };
  players = players.map((p) => (p.id === id ? updated : p));
  return updated;
}

export function suspendPlayer(id: string, reason: string, durationDays: number): boolean {
  const player = players.find((p) => p.id === id);
  if (!player || player.status !== "active") return false;
  const now = new Date();
  const until = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
  player.status = "suspended";
  player.suspendReason = reason;
  player.suspendedAt = now.toISOString();
  player.suspendedUntil = until.toISOString();
  return true;
}

export function unsuspendPlayer(id: string): boolean {
  const player = players.find((p) => p.id === id);
  if (!player || player.status !== "suspended") return false;
  player.status = "active";
  player.suspendReason = undefined;
  player.suspendedAt = undefined;
  player.suspendedUntil = undefined;
  return true;
}

export function changeNickname(id: string, nickname: string): Player | undefined {
  const index = players.findIndex((p) => p.id === id);
  if (index === -1) return undefined;
  const updated: Player = {
    ...players[index],
    nickname,
  };
  players = players.map((p) => (p.id === id ? updated : p));
  return updated;
}
