"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ROLE_LEVELS, type Role } from "../types/auth";

interface AuthUser {
  userId: string;
  email: string;
  name: string;
  role: Role;
}

interface AuthContext {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  can: (minimumRole: Role) => boolean;
  logout: () => Promise<void>;
}

export function useAuth(): AuthContext {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) return null;
      const json = await res.json();
      return json.authenticated ? (json.user as AuthUser) : null;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const user = data ?? null;

  const can = (minimumRole: Role): boolean => {
    if (!user) return false;
    return ROLE_LEVELS[user.role] >= ROLE_LEVELS[minimumRole];
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    queryClient.setQueryData(["auth", "me"], null);
    queryClient.clear();
    router.push("/login");
  };

  return { user, isLoading, isAuthenticated: !!user, can, logout };
}
