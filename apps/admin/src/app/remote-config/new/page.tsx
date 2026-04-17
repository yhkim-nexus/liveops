"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { RemoteConfigForm } from "@/features/remote-config/components/RemoteConfigForm";
import { useCreateRemoteConfig } from "@/features/remote-config/hooks/use-remote-config-queries";
import type { CreateRemoteConfigRequest } from "@/features/remote-config/types/remote-config";

export default function RemoteConfigCreatePage() {
  const router = useRouter();
  const createMutation = useCreateRemoteConfig();

  const handleSubmit = (data: CreateRemoteConfigRequest) => {
    createMutation.mutate(data, {
      onSuccess: () => router.push("/remote-config"),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/remote-config"
          className={buttonVariants({ variant: "ghost", size: "icon" })}
        >
          <ArrowLeft />
        </Link>
        <h2 className="text-lg font-semibold">새 설정 추가</h2>
      </div>
      <RemoteConfigForm
        mode="create"
        onSubmit={handleSubmit}
        isPending={createMutation.isPending}
      />
    </div>
  );
}
