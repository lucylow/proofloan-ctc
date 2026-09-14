import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Gauge,
  ShieldCheck,
} from "lucide-react";

import { useDemo } from "./DemoProvider";

export function DemoAnalytics() {
  const { data } = useDemo();

  const executedRate =
    data.portfolio.totalApplications === 0
      ? 0
      : Math.round(
          (data.portfolio.executedLoans /
            data.portfolio.totalApplications) *
            100,
        );

  const averageEvidenceFreshness =
    data.applications.length === 0
      ? 0
      : Math.round(
          data.applications.reduce(
            (sum, application) =>
              sum + application.evidenceFreshness,
            0,
          ) /
            data.applications.length,
        );

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MiniMetric
        label="Applications"
        value={String(
          data.portfolio.totalApplications,
        )}
        trend="+18%"
        direction="up"
        icon={Activity}
      />

      <MiniMetric
        label="Executed rate"
        value={`${executedRate}%`}
        trend="+6%"
        direction="up"
        icon={ArrowUpRight}
      />

      <MiniMetric
        label="Evidence freshness"
        value={`${averageEvidenceFreshness}%`}
        trend="Stable"
        direction="up"
        icon={ShieldCheck}
      />

      <MiniMetric
        label="Risk confidence"
        value={`${data.portfolio.averageConfidence}%`}
        trend="-2%"
        direction="down"
        icon={Gauge}
      />
    </div>
  );
}

function MiniMetric({
  label,
  value,
  trend,
  direction,
  icon: Icon,
}: {
  label: string;
  value: string;
  trend: string;
  direction: "up" | "down";
  icon: typeof Gauge;
}) {
  return (
    <div className="pl-panel rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
          {label}
        </div>

        <Icon className="h-4 w-4 text-slate-500" />
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="text-2xl font-extrabold tracking-tight text-white">
          {value}
        </div>

        <div
          className={[
            "flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold",
            direction === "up"
              ? "bg-emerald-400/10 text-emerald-300"
              : "bg-amber-400/10 text-amber-300",
          ].join(" ")}
        >
          {direction === "up" ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}

          {trend}
        </div>
      </div>
    </div>
  );
}
