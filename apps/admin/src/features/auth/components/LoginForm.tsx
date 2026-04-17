"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const QUICK_LOGIN_ACCOUNTS = [
  { label: "관리자 (Admin)", email: "admin@liveops.dev", password: "admin123", role: "admin" },
  { label: "운영자 (Operator)", email: "operator@liveops.dev", password: "oper123", role: "operator" },
  { label: "에디터 (Editor)", email: "editor@liveops.dev", password: "editor123", role: "editor" },
  { label: "뷰어 (Viewer)", email: "viewer@liveops.dev", password: "view123", role: "viewer" },
] as const;

export function LoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const doLogin = async (loginEmail: string, loginPassword: string) => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "로그인에 실패했습니다");
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      router.push("/dashboard");
    } catch {
      setError("서버와 통신할 수 없습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await doLogin(email, password);
  };

  const handleQuickLogin = (account: typeof QUICK_LOGIN_ACCOUNTS[number]) => {
    setEmail(account.email);
    setPassword(account.password);
    doLogin(account.email, account.password);
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-center text-2xl">LiveOps Admin</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Login Buttons */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground text-center">테스트 계정으로 빠른 로그인</p>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_LOGIN_ACCOUNTS.map((account) => (
              <Button
                key={account.role}
                type="button"
                variant="outline"
                size="default"
                className="flex-1 text-xs h-12"
                disabled={loading}
                onClick={() => handleQuickLogin(account)}
              >
                {account.label}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Manual Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@liveops.dev" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
