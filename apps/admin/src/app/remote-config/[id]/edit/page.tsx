"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { RemoteConfigForm } from "@/features/remote-config/components/RemoteConfigForm";
import {
  useRemoteConfig,
  useUpdateRemoteConfig,
} from "@/features/remote-config/hooks/use-remote-config-queries";
import type { CreateRemoteConfigRequest } from "@/features/remote-config/types/remote-config";

export default function RemoteConfigEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { can } = useAuth();
  const { data, isLoading } = useRemoteConfig(id);

  if (!can("editor")) {
    router.replace("/forbidden");
    return null;
  }
  const updateMutation = useUpdateRemoteConfig();

  const handleSubmit = (formData: CreateRemoteConfigRequest) => {
    // Exclude key (immutable) from update payload
    const { key, ...updateData } = formData;
    updateMutation.mutate(
      { id, data: updateData },
      {
        onSuccess: () => router.push(`/remote-config/${id}`),
      },
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded bg-muted" />
        ))}
      </div>
    );
  }

  if (!data?.config) {
    return (
      <div className="py-16 text-center text-muted-foreground">
        설정을 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/remote-config/${id}`}
          className={buttonVariants({ variant: "ghost", size: "icon" })}
        >
          <ArrowLeft />
        </Link>
        <h2 className="text-lg font-semibold">설정 편집</h2>
      </div>
      <RemoteConfigForm
        mode="edit"
        defaultValues={data.config}
        onSubmit={handleSubmit}
        isPending={updateMutation.isPending}
      />
    </div>
  );
}
