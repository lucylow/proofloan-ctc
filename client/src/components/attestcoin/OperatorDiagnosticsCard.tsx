import { Activity, AlertTriangle, CheckCircle2, Clock3 } from "lucide-react";

import { trpc } from "@/lib/trpc";

function tone(ok: boolean | undefined) {
  return ok ? "text-emerald-300" : "text-amber-300";
}

export function OperatorDiagnosticsCard() {
  const summaryQuery = trpc.attestorOperator.summary.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });
  const readinessQuery = trpc.attestorOperator.readiness.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });
  const healthQuery = trpc.attestorOperator.health.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });

  if (summaryQuery.isError || readinessQuery.isError || healthQuery.isError) {
    return (
      <section className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5">
        <div className="text-sm font-semibold text-white">Attestor operator</div>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          Operator diagnostics are unavailable. This layer validates readiness and never submits Attestor extrinsics.
        </p>
      </section>
    );
  }

  const summary = summaryQuery.data;
  const readiness = readinessQuery.data;
  const health = healthQuery.data;

  if (!summary || !readiness || !health) {
    return (
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 text-xs text-slate-600">
        Attestor operator diagnostics are loading…
      </div>
    );
  }

  const blocking = readiness.checks.filter(check => !check.ok).slice(0, 4);
  const items = [
    ["Election", summary.electionMode],
    ["Status", summary.status],
    ["CC3 RPC", health.cc3Healthy ? "healthy" : "missing"],
    ["Ethereum RPC", health.ethereumHealthy ? "healthy" : "missing"],
  ] as const;

  return (
    <section className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-white">Attestor operator</div>
          <div className="mt-1 text-xs text-slate-600">
            Hot Attestor / cold Stash readiness · AuthorizedOnly
          </div>
        </div>
        <Activity className="h-4 w-4 text-cyan-300" />
      </div>

      <div className="mt-5 space-y-2">
        {items.map(([label, value]) => (
          <div key={label} className="flex items-center gap-3 rounded-xl border border-white/[0.05] p-3">
            {String(value).includes("missing") || value === "unregistered" ? (
              <Clock3 className={`h-4 w-4 ${tone(false)}`} />
            ) : (
              <CheckCircle2 className={`h-4 w-4 ${tone(true)}`} />
            )}
            <span className="text-xs text-slate-300">{label}</span>
            <span className="ml-auto text-[10px] uppercase text-slate-600">{value}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 text-[10px] text-slate-700">
        Readiness {summary.readiness} · {(readiness.scoreBps / 100).toFixed(0)}% · chain key {summary.chainKey}
      </div>

      {blocking.length > 0 ? (
        <div className="mt-4 space-y-2">
          {blocking.map(check => (
            <div key={check.id} className="flex items-start gap-2 text-[11px] leading-5 text-slate-500">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" />
              <span>{check.message}</span>
            </div>
          ))}
        </div>
      ) : null}

      <p className="mt-4 text-[10px] leading-4 text-slate-700">
        Production registration still requires first-party authorization, official boot nodes, and the gluwa/creditcoin3 Attestor binary.
      </p>
    </section>
  );
}
