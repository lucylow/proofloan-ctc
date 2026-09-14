import {
  Activity,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

import { useDemo } from "./DemoProvider";

export function SystemHealth() {
  const { data } = useDemo();

  const healthy =
    data.services.filter(
      item => item.status === "healthy",
    ).length;

  const degraded =
    data.services.filter(
      item => item.status === "degraded",
    ).length;

  return (
    <section className="pl-panel rounded-3xl p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-white">
            System health
          </div>

          <div className="mt-1 text-xs text-slate-500">
            Demo service dependency overview
          </div>
        </div>

        <div className="flex items-center gap-3 text-[10px] font-semibold">
          <span className="inline-flex items-center gap-1.5 text-emerald-300">
            <span className="pl-status-dot pl-status-live bg-emerald-300" />
            {healthy} healthy
          </span>

          {degraded > 0 && (
            <span className="text-amber-300">
              {degraded} degraded
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {data.services.map(service => {
          const Icon =
            service.status === "healthy"
              ? CheckCircle2
              : service.status === "degraded"
                ? Clock3
                : XCircle;

          const tone =
            service.status === "healthy"
              ? "text-emerald-300"
              : service.status === "degraded"
                ? "text-amber-300"
                : "text-rose-300";

          return (
            <div
              key={service.id}
              className="rounded-xl border border-white/[0.06] bg-black/[0.12] p-3"
            >
              <div className="flex items-center gap-2">
                <Icon
                  className={[
                    "h-3.5 w-3.5",
                    tone,
                  ].join(" ")}
                />

                <span className="truncate text-xs text-slate-300">
                  {service.name}
                </span>
              </div>

              <div className="mt-2 flex justify-between text-[10px]">
                <span className={`capitalize ${tone}`}>
                  {service.status}
                </span>

                <span className="font-mono text-slate-500">
                  {service.latencyMs}ms
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-500">
        <Activity className="h-3 w-3" />
        Demo health values are intentionally non-authoritative.
      </div>
    </section>
  );
}
