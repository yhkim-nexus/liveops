import type {
  DashboardSummary,
  ActivityTrendPoint,
  RetentionResponse,
  RevenueTrendPoint,
  KpiTrendPoint,
  Period,
} from "../types/dashboard";
import { RETENTION_DAYS } from "../constants/chart-config";

function daysForPeriod(period: Period): number {
  return period === "7d" ? 7 : period === "30d" ? 30 : 90;
}

function dateString(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function jitter(base: number, pct: number): number {
  return Math.round(base * (1 + (Math.random() - 0.5) * 2 * pct));
}

export function generateSummary(): DashboardSummary {
  const nruToday = jitter(163, 0.15);
  const nruYesterday = jitter(163, 0.15);
  const dauToday = jitter(4769, 0.1);
  const dauYesterday = jitter(4769, 0.1);
  const mcuToday = jitter(1491, 0.12);
  const mcuYesterday = jitter(1491, 0.12);
  const puToday = jitter(20, 0.2);
  const puYesterday = jitter(20, 0.2);
  const purToday = +((puToday / dauToday) * 100).toFixed(2);
  const purYesterday = +((puYesterday / dauYesterday) * 100).toFixed(2);
  const revToday = +(jitter(60761, 0.15) / 100).toFixed(2);
  const revYesterday = +(jitter(60761, 0.15) / 100).toFixed(2);
  const arppuToday = puToday > 0 ? +(revToday / puToday).toFixed(2) : 0;
  const arppuYesterday = puYesterday > 0 ? +(revYesterday / puYesterday).toFixed(2) : 0;

  return {
    nru: {
      value: nruToday,
      unit: "count",
      changeRate: +((nruToday / nruYesterday - 1) * 100).toFixed(1),
      comparisonValue: nruYesterday,
    },
    dau: {
      value: dauToday,
      unit: "count",
      changeRate: +((dauToday / dauYesterday - 1) * 100).toFixed(1),
      comparisonValue: dauYesterday,
    },
    mcu: {
      value: mcuToday,
      unit: "count",
      changeRate: +((mcuToday / mcuYesterday - 1) * 100).toFixed(1),
      comparisonValue: mcuYesterday,
      subLabel: `/DAU ${((mcuToday / dauToday) * 100).toFixed(1)}%`,
    },
    pu: {
      value: puToday,
      unit: "count",
      changeRate: +((puToday / Math.max(puYesterday, 1) - 1) * 100).toFixed(1),
      comparisonValue: puYesterday,
    },
    pur: {
      value: purToday,
      unit: "percent",
      changeRate: +(purToday - purYesterday).toFixed(2),
      comparisonValue: purYesterday,
    },
    revenue: {
      value: revToday,
      unit: "currency",
      changeRate: +((revToday / revYesterday - 1) * 100).toFixed(1),
      comparisonValue: revYesterday,
    },
    arppu: {
      value: arppuToday,
      unit: "currency",
      changeRate: +((arppuToday / Math.max(arppuYesterday, 0.01) - 1) * 100).toFixed(1),
      comparisonValue: arppuYesterday,
    },
  };
}

export function generateActivityTrend(period: Period): ActivityTrendPoint[] {
  const days = daysForPeriod(period);
  return Array.from({ length: days }, (_, i) => ({
    date: dateString(days - 1 - i),
    nru: jitter(163, 0.2),
    dau: jitter(4769, 0.15),
    sessions: jitter(14000, 0.15),
    avgSessionMinutes: +(15 + Math.random() * 10).toFixed(1),
  }));
}

export function generateRetention(): RetentionResponse {
  const makePoints = (base: number) =>
    RETENTION_DAYS.map((day) => {
      const rate = day === 0 ? 100 : Math.max(5, base * Math.exp(-0.05 * day) + (Math.random() - 0.5) * 5);
      return {
        day,
        rate: +rate.toFixed(1),
        count: Math.round((rate / 100) * 2000),
      };
    });

  return {
    currentCohort: {
      cohortDate: dateString(7),
      cohortSize: jitter(2000, 0.1),
      points: makePoints(45),
    },
    previousCohort: {
      cohortDate: dateString(14),
      cohortSize: jitter(1800, 0.1),
      points: makePoints(42),
    },
  };
}

export function generateKpiTrend(period: Period): KpiTrendPoint[] {
  const days = daysForPeriod(period);
  return Array.from({ length: days }, (_, i) => {
    const dau = jitter(4769, 0.15);
    const pu = jitter(20, 0.25);
    const rev = +(jitter(60761, 0.2) / 100).toFixed(2);
    return {
      date: dateString(days - 1 - i),
      nru: jitter(163, 0.2),
      dau,
      mcu: jitter(1491, 0.15),
      pu,
      pur: +((pu / dau) * 100).toFixed(2),
      revenue: rev,
      arppu: pu > 0 ? +(rev / pu).toFixed(2) : 0,
    };
  });
}

export function generateRevenueTrend(period: Period): RevenueTrendPoint[] {
  const days = daysForPeriod(period);
  return Array.from({ length: days }, (_, i) => {
    const dau = jitter(4769, 0.1);
    const payers = jitter(20, 0.15);
    const rev = +(jitter(60761, 0.15) / 100).toFixed(2);
    return {
      date: dateString(days - 1 - i),
      revenue: rev,
      payments: jitter(25, 0.15),
      payers,
      arpu: +(rev / dau).toFixed(2),
      arppu: payers > 0 ? +(rev / payers).toFixed(2) : 0,
      conversionRate: +((payers / dau) * 100).toFixed(2),
    };
  });
}
