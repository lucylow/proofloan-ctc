import { Flame, Coins, Shield, AlertTriangle } from "lucide-react";

import { trpc } from "@/lib/trpc";
import { formatAtcAmount } from "@shared/atc";
import { Button } from "@/components/ui/button";

function formatShare(bps: number | undefined): string {
  if (typeof bps !== "number" || !Number.isFinite(bps)) return "—";
  return `${(bps / 100).toFixed(0)}%`;
}

function formatVolume(atomic: string | undefined): string {
  if (!atomic) return "—";
  try {
    return `${formatAtcAmount(atomic)} ATC`;
  } catch {
    return "—";
  }
}

export function AtcEconomicsCard() {
  const policyQuery = trpc.attestcoin.feePolicy.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });
  const healthQuery = trpc.attestcoin.health.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });
  const summaryQuery = trpc.attestcoin.summary.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 15_000,
  });
  const capabilitiesQuery = trpc.attestcoin.atcCapabilities.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });

  const policy = policyQuery.data;
  const health = healthQuery.data;
  const summary = summaryQuery.data;
  const capabilities = capabilitiesQuery.data;
  const loadError =
    policyQuery.error ?? healthQuery.error ?? summaryQuery.error ?? capabilitiesQuery.error;

  const retry = () => {
    void policyQuery.refetch();
    void healthQuery.refetch();
    void summaryQuery.refetch();
    void capabilitiesQuery.refetch();
  };

  return (
    <section className="rounded-3xl border border-amber-300/10 bg-amber-300/[0.03] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200">
            ATC economics
          </div>
          <div className="mt-1 text-sm font-semibold text-white">
            Reads are free. Cross-chain actions consume ATC.
          </div>
          <p className="mt-2 max-w-xl text-xs leading-5 text-slate-500">
            Action fees fund independent operators and include a burn
            allocation. ProofLoan never mints ATC. The operator/burn split
            below is demo configuration, not official Attestcoin tokenomics.
          </p>
        </div>
        <Coins className="h-4 w-4 text-amber-200" />
      </div>

      {loadError ? (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-rose-300/20 bg-rose-400/10 p-3"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-300" />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-rose-100">
                ATC economics could not be loaded
              </div>
              <p className="mt-1 break-words text-[11px] leading-5 text-rose-200/80">
                {loadError.message.replace(/^\[ATC:[^\]]+\]\s*/, "")}
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={retry}
                className="mt-3 min-h-9 rounded-lg border-rose-300/25 px-3 text-xs text-rose-100 hover:bg-rose-400/10"
              >
                Retry ATC status
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        <Metric
          label="Operator share"
          value={formatShare(policy?.operatorRewardBps)}
        />
        <Metric
          label="Burn share"
          value={formatShare(policy?.burnBps)}
        />
        <Metric
          label="Minting"
          value={capabilities?.minting === false ? "Disabled" : "—"}
        />
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <Metric
          label="Paid volume"
          value={formatVolume(summary?.paidVolumeAtomic)}
        />
        <Metric
          label="Burned"
          value={formatVolume(summary?.burnedVolumeAtomic)}
          icon={Flame}
        />
        <Metric
          label="Operator rewards"
          value={formatVolume(summary?.operatorRewardsAtomic)}
        />
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-xl border border-white/[0.05] p-3">
        <Shield className="mt-0.5 h-3.5 w-3.5 text-amber-200" />
        <div className="text-[10px] leading-5 text-slate-500">
          Mode {health?.mode ?? "…"}
          {health?.liveProtocolEnabled ? " · live protocol enabled" : " · simulated adapter"}
          {health?.message ? ` · ${health.message}` : ""}
        </div>
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: typeof Flame;
}) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-slate-600">
        {Icon ? <Icon className="h-3 w-3 text-amber-200" /> : null}
        {label}
      </div>
      <div className="mt-2 text-sm font-medium text-white">{value}</div>
    </div>
  );
}
