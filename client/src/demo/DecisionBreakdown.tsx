import {
  ArrowDown,
  ArrowUp,
  Minus,
} from "lucide-react";

import { useDemo } from "./DemoProvider";

export function DecisionBreakdown({
  applicationId,
}: {
  applicationId?: string;
}) {
  const { data } = useDemo();

  const decision =
    data.decisions.find(
      item =>
        item.applicationId ===
        applicationId,
    ) ?? data.decisions[0];

  if (!decision) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-600">
        No decision data available.
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6">
      <div className="text-sm font-semibold text-white">
        Decision breakdown
      </div>

      <div className="mt-5 space-y-3">
        {decision.reasons.map(reason => {
          const positive =
            reason.severity === "positive";

          const negative =
            reason.severity === "negative";

          const Icon = positive
            ? ArrowUp
            : negative
              ? ArrowDown
              : Minus;

          return (
            <div
              key={reason.code}
              className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-black/[0.08] p-3"
            >
              <div
                className={[
                  "grid h-8 w-8 place-items-center rounded-lg",
                  positive
                    ? "bg-emerald-400/10 text-emerald-300"
                    : negative
                      ? "bg-rose-400/10 text-rose-300"
                      : "bg-white/[0.04] text-slate-500",
                ].join(" ")}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-slate-300">
                  {reason.label}
                </div>

                <div className="mt-1 font-mono text-[10px] text-slate-700">
                  {reason.code}
                </div>
              </div>

              <div className="font-mono text-xs text-slate-400">
                {reason.contribution > 0
                  ? "+"
                  : ""}
                {reason.contribution}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
