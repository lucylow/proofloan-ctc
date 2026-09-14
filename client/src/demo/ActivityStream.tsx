import {
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react";

import { useDemo } from "./DemoProvider";

export function ActivityStream() {
  const { data } = useDemo();

  return (
    <section className="pl-panel rounded-3xl">
      <div className="border-b border-white/[0.06] p-5">
        <div className="text-sm font-semibold text-white">
          Live activity stream
        </div>

        <div className="mt-1 text-xs text-slate-500">
          Recent application, proof and policy activity
        </div>
      </div>

      <div className="divide-y divide-white/[0.05]">
        {data.activity.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No activity in this demo scenario.
          </div>
        ) : (
          data.activity
            .slice(0, 7)
            .map(event => {
            const Icon =
              event.severity === "success"
                ? CheckCircle2
                : event.severity ===
                    "warning"
                  ? AlertTriangle
                  : Info;

            const color =
              event.severity ===
              "success"
                ? "text-emerald-300"
                : event.severity ===
                    "warning"
                  ? "text-amber-300"
                  : "text-cyan-300";

            return (
              <div
                key={event.id}
                className="flex gap-3 p-4 transition-colors hover:bg-white/[0.02]"
              >
                <div
                  className={[
                    "grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/[0.04]",
                    color,
                  ].join(" ")}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs font-medium text-slate-200">
                      {event.title}
                    </div>

                    <div className="text-[10px] text-slate-500">
                      {new Date(
                        event.timestamp,
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  <div className="mt-1 text-[11px] leading-5 text-slate-500">
                    {event.description}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
