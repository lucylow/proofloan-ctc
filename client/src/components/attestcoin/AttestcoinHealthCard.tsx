import { Activity, CheckCircle2, Clock3 } from "lucide-react";

import type { AttestcoinHealth } from "@shared/attestcoin";

export function AttestcoinHealthCard({
  health,
}: {
  health?: AttestcoinHealth;
}) {
  if (!health) {
    return (
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 text-xs text-slate-600">
        Attestcoin service health is loading…
      </div>
    );
  }

  const items = [
    ["Creditcoin RPC", health.creditcoinRpc],
    ["Proof Builder", health.proofBuilder],
    ["Source RPC", health.sourceRpc],
  ] as const;

  return (
    <section className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-white">
            Attestcoin infrastructure
          </div>
          <div className="mt-1 text-xs text-slate-600">
            Cross-chain proof dependencies
          </div>
        </div>
        <Activity className="h-4 w-4 text-cyan-300" />
      </div>

      <div className="mt-5 space-y-2">
        {items.map(([label, status]) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-xl border border-white/[0.05] p-3"
          >
            {status === "healthy" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            ) : (
              <Clock3 className="h-4 w-4 text-amber-300" />
            )}
            <span className="text-xs text-slate-300">
              {label}
            </span>
            <span className="ml-auto text-[10px] uppercase text-slate-600">
              {status}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 text-[10px] text-slate-700">
        Last checked {new Date(health.lastCheckedAt).toLocaleTimeString()}
        {" · "}
        {health.latencyMs}ms
        {health.message ? ` · ${health.message}` : ""}
      </div>
    </section>
  );
}
