import { Activity, Server } from "lucide-react";
import { useOptionalMockAttestcoin } from "@/mock-attestcoin/hooks";
import { buildHealthSummary } from "@/mock-attestcoin/presentation";

export function MockHealthStrip() {
  const mock = useOptionalMockAttestcoin();
  if (!mock) return null;

  const health = buildHealthSummary(mock.dataset);

  return (
    <section className="pl-panel rounded-3xl p-5">
      <div className="flex items-start gap-3">
        <div className="pl-icon-well h-9 w-9">
          <Server className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-white">
            Presentation protocol health
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Mock infrastructure status for this scenario. Live prove/verify still uses the production adapter.
          </div>
        </div>
        <Activity className={`h-4 w-4 ${health.degraded ? "text-amber-300" : "text-emerald-300"}`} />
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <HealthCell label="Creditcoin RPC" status={health.creditcoinRpc} />
        <HealthCell label="Proof Builder" status={health.proofBuilder} />
        <HealthCell label="Source RPC" status={health.sourceRpc} />
      </div>
      {health.message ? (
        <p className="mt-3 text-xs leading-5 text-slate-400">{health.message}</p>
      ) : null}
    </section>
  );
}

function HealthCell({
  label,
  status,
}: {
  label: string;
  status: string;
}) {
  const tone = status === "healthy"
    ? "text-emerald-300"
    : status === "degraded"
      ? "text-amber-300"
      : "text-rose-300";

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
      <div className="text-[10px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className={`mt-1 flex items-center gap-2 text-xs font-medium capitalize ${tone}`}>
        <span className={`pl-status-dot ${status === "healthy" ? "pl-status-live" : ""}`} />
        {status}
      </div>
    </div>
  );
}
