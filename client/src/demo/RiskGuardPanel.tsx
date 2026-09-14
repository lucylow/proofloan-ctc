import {
  CheckCircle2,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { useDemo } from "./DemoProvider";

export function RiskGuardPanel({
  applicationId,
}: {
  applicationId?: string;
}) {
  const { data } = useDemo();

  const application =
    data.applications.find(
      item =>
        item.id === applicationId,
    ) ?? data.applications[0];

  const decision =
    data.decisions.find(
      item =>
        item.applicationId ===
        application?.id,
    ) ?? data.decisions[0];

  if (!decision || !application) {
    return null;
  }

  const checks = [
    [
      "Amount within limit",
      decision.policyChecks.amount,
    ],
    [
      "LTV within policy",
      decision.policyChecks.ltv,
    ],
    [
      "Evidence freshness",
      decision.policyChecks.freshness,
    ],
    [
      "Model confidence",
      decision.policyChecks.confidence,
    ],
    [
      "Pool liquidity",
      decision.policyChecks.liquidity,
    ],
  ] as const;

  return (
    <section className="rounded-3xl border border-white/[0.07] bg-[#0b121d] p-6">
      <div className="flex items-start gap-4">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-400/10">
          <ShieldCheck className="h-5 w-5 text-emerald-300" />
        </div>

        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
            RiskGuard
          </div>

          <h3 className="mt-1 text-lg font-semibold text-white">
            Policy evaluation
          </h3>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {checks.map(
          ([label, passed]) => (
            <div
              key={String(label)}
              className="flex items-center gap-3 rounded-xl border border-white/[0.05] p-3"
            >
              {passed ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              ) : (
                <XCircle className="h-4 w-4 text-rose-300" />
              )}

              <span className="text-xs text-slate-300">
                {label}
              </span>

              <span
                className={[
                  "ml-auto text-[10px] font-medium",
                  passed
                    ? "text-emerald-300"
                    : "text-rose-300",
                ].join(" ")}
              >
                {passed ? "PASS" : "BLOCK"}
              </span>
            </div>
          ),
        )}
      </div>

      <div className="mt-5 rounded-2xl bg-white/[0.025] p-4">
        <div className="text-[10px] uppercase tracking-wider text-slate-600">
          Policy version
        </div>

        <div className="mt-2 font-mono text-xs text-slate-300">
          {decision.policyHash}
        </div>
      </div>
    </section>
  );
}
