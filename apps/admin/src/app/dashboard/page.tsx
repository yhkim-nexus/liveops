"use client";

import { useState } from "react";
import { KpiSummaryCards } from "@/features/dashboard/components/KpiSummaryCards";
import { ActivityTrendChart } from "@/features/dashboard/components/ActivityTrendChart";
import { RetentionCurveChart } from "@/features/dashboard/components/RetentionCurveChart";
import { RevenueTrendChart } from "@/features/dashboard/components/RevenueTrendChart";
import { PeriodToggle } from "@/features/dashboard/components/PeriodToggle";
import {
  useDashboardSummary,
  useActivityTrend,
  useRetention,
  useRevenueTrend,
} from "@/features/dashboard/hooks/use-dashboard-queries";
import type { Period } from "@/features/dashboard/types/dashboard";
import { DEFAULT_PERIOD } from "@/features/dashboard/constants/chart-config";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>(DEFAULT_PERIOD);

  const summary = useDashboardSummary();
  const activityTrend = useActivityTrend(period);
  const retention = useRetention();
  const revenueTrend = useRevenueTrend(period);

  const isLoading =
    summary.isLoading || activityTrend.isLoading || retention.isLoading || revenueTrend.isLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">대시보드 로딩 중...</p>
      </div>
    );
  }

  const hasError =
    summary.isError || activityTrend.isError || retention.isError || revenueTrend.isError;

  if (hasError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-600">데이터를 불러오는 중 오류가 발생했습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">KPI 대시보드</h1>
        <PeriodToggle value={period} onChange={setPeriod} />
      </div>

      {summary.data && <KpiSummaryCards data={summary.data} />}

      {activityTrend.data && (
        <Card>
          <CardContent className="pt-6">
            <ActivityTrendChart data={activityTrend.data} />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {retention.data && (
          <Card>
            <CardContent className="pt-6">
              <RetentionCurveChart data={retention.data} />
            </CardContent>
          </Card>
        )}

        {revenueTrend.data && (
          <Card>
            <CardContent className="pt-6">
              <RevenueTrendChart data={revenueTrend.data} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
