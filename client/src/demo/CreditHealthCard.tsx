import {
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import { useDemo } from "./DemoProvider";

export function CreditHealthCard() {
  const { data } = useDemo();

  const metrics = [
    {
      label: "Evidence coverage",
      value: data.creditFile.evidenceCoverage,
    },
    {
      label: "Freshness",
      value:
        data.creditFile.freshnessScore / 100,
    },
    {
      label: "Liquidity coverage",
      value: Math.min(
        data.creditFile.liquidityCoverage / 2,
        1,
      ),
    },
  ];

  return (
    <section className="pl-panel pl-panel-accent rounded-3xl p-6">
      <div className="flex items-start gap-4">
        <div className="pl-icon-well h-11 w-11 rounded-2xl">
          <ShieldCheck className="h-5 w-5" />
        </div>

        <div>
          <div className="pl-kicker">
            Credit health
          </div>

          <h3 className="mt-1 text-lg font-semibold text-white">
            <span className="pl-num">{data.creditFile.score || "No score"}</span>
            {" "}
            <span className="text-xs font-normal text-slate-500">
              / 850 · tier {data.creditFile.riskTier}
            </span>
          </h3>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {metrics.map(metric => (
          <div key={metric.label}>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">
                {metric.label}
              </span>

              <span className="font-mono text-slate-400">
                {Math.round(
                  metric.value * 100,
                )}
                %
              </span>
            </div>

            <div className="pl-progress mt-2">
              <div
                className="pl-progress-fill"
                style={{
                  width: `${Math.min(
                    100,
                    metric.value * 100,
                  )}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
          <TrendingUp className="h-4 w-4 text-emerald-300" />

          <div className="mt-3 text-[10px] uppercase tracking-wider text-slate-500">
            Repayments
          </div>

          <div className="pl-num mt-1 text-xl font-extrabold text-white">
            {data.creditFile.repaymentCount}
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
          <CheckCircle2 className="h-4 w-4 text-cyan-300" />

          <div className="mt-3 text-[10px] uppercase tracking-wider text-slate-500">
            Late payments
          </div>

          <div className="pl-num mt-1 text-xl font-extrabold text-white">
            {data.creditFile.latePaymentCount}
          </div>
        </div>
      </div>
    </section>
  );
}
