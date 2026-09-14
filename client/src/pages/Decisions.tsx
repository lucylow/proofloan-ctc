import {
  Activity,
  ArrowRight,
  Fingerprint,
  Gauge,
  GitBranch,
  ShieldCheck,
} from "lucide-react";

import { Link } from "wouter";
import { useMemo } from "react";

import { PageShell } from "@/components/navigation/PageShell";
import { Button } from "@/components/ui/button";
import { skipToken } from "@tanstack/react-query";
import { trpc } from "@/lib/trpc";
import { cleanProofLoanErrorMessage } from "@shared/proofloan";

import { useDemo } from "@/demo/DemoProvider";
import { DecisionBreakdown } from "@/demo/DecisionBreakdown";
import { RiskGuardPanel } from "@/demo/RiskGuardPanel";
import { shortenHash } from "@/demo/utils";

export default function Decisions() {
  const { data } = useDemo();

  const application =
    data.applications.find(
      item => item.id === "PL-7F42A91C",
    ) ?? data.applications[0];

  const decision =
    data.decisions.find(
      item => item.applicationId === application?.id,
    ) ?? data.decisions[0];

  return (
    <PageShell
      eyebrow="Credit"
      title="Underwriting decisions"
      description="Review advisory model outputs alongside the identifiers and deterministic controls that bound them."
      actions={
        application ? (
          <Button asChild className="rounded-xl bg-cyan-300 text-slate-950 hover:bg-cyan-200">
            <Link href={`/applications/${application.id}/decision`}>
              Open application
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : null
      }
    >
      {!decision || !application ? (
        <div className="rounded-3xl border border-dashed border-cyan-300/15 bg-cyan-300/[0.03] p-12 text-center text-sm text-slate-400">
          No underwriting decisions in this demo scenario.
        </div>
      ) : (
        <>
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="pl-panel rounded-3xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                    Latest decision
                  </div>

                  <h2 className="mt-2 text-2xl font-bold text-white">
                    Risk tier {decision.riskTier}
                  </h2>

                  <p className="mt-2 text-xs leading-5 text-slate-600">
                    Advisory underwriting output bounded by RiskGuard.
                  </p>
                </div>

                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-300/10">
                  <Gauge className="h-5 w-5 text-cyan-300" />
                </div>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <Metric label="30d PD" value={`${decision.probability30d}%`} />
                <Metric label="90d PD" value={`${decision.probability90d}%`} />
                <Metric label="Confidence" value={`${decision.confidence}%`} />
              </div>

              <div className="mt-6 rounded-2xl border border-white/[0.06] bg-black/10 p-4">
                <div className="text-xs font-medium text-slate-400">
                  Reason codes
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {decision.reasons.map(reason => (
                    <span
                      key={reason.code}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[10px] text-slate-300"
                    >
                      {reason.code}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <RiskGuardPanel applicationId={application.id} />
          </div>

          <div className="mt-6">
            <DecisionBreakdown applicationId={application.id} />
          </div>

          <BlockchainFeaturePanel />

          <section className="pl-panel mt-6 p-6">
            <div className="text-sm font-semibold text-white">
              Decision metadata
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetadataCard
                icon={GitBranch}
                label="Model version"
                value={decision.modelVersion}
              />

              <MetadataCard
                icon={Activity}
                label="Feature version"
                value={decision.featureVersion}
              />

              <MetadataCard
                icon={Fingerprint}
                label="Decision hash"
                value={shortenHash(application.decisionHash)}
              />

              <MetadataCard
                icon={ShieldCheck}
                label="Policy hash"
                value={shortenHash(decision.policyHash)}
              />
            </div>
          </section>
        </>
      )}
    </PageShell>
  );
}

function BlockchainFeaturePanel() {
  const nowMs = useMemo(() => Date.now(), []);
  const featuresQuery = trpc.ai.blockchain.features.useQuery(
    {
      nowMs,
      evidenceMode: "verified",
      observations: [
        {
          chainId: "ethereum-sepolia",
          blockNumber: 8_214_552,
          txHash: "0xabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabca",
          direction: "out",
          asset: "USDC",
          amount: "1250",
          timestampMs: nowMs - 3 * 86_400_000,
          verified: true,
          address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        },
      ],
      events: [],
    },
    { retry: false, refetchOnWindowFocus: false },
  );
  const features = featuresQuery.data;
  const derivedInput = features ? { features } : skipToken;
  const queryOptions = { retry: false as const, refetchOnWindowFocus: false };
  const scoreQuery = trpc.ai.blockchain.score.useQuery(derivedInput, queryOptions);
  const routeQuery = trpc.ai.blockchain.route.useQuery(derivedInput, queryOptions);
  const riskQuery = trpc.ai.blockchain.walletRisk.useQuery(derivedInput, queryOptions);
  const fingerprintQuery = trpc.ai.blockchain.fingerprint.useQuery(derivedInput, queryOptions);
  const derivedError = firstQueryError(
    featuresQuery.error,
    scoreQuery.error,
    routeQuery.error,
    riskQuery.error,
    fingerprintQuery.error,
  );

  return (
    <section className="pl-panel mt-6 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
            AI × blockchain features
          </div>
          <h2 className="mt-2 text-lg font-semibold text-white">
            Proof-aware context, not invented evidence
          </h2>
          <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-500">
            Educational sample: wallet, graph, freshness, and coverage signals are derived from
            Attestcoin-verified observations. They inform advisory underwriting context and abstention.
            They cannot mint facts or bypass RiskGuard.
          </p>
        </div>
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-300/10">
          <GitBranch className="h-5 w-5 text-cyan-300" />
        </div>
      </div>

      {derivedError ? (
        <div className="mt-5 rounded-2xl border border-rose-400/20 bg-rose-400/[0.06] p-4 text-sm text-rose-200">
          <p>{derivedError}</p>
          <button
            type="button"
            className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-rose-50 underline-offset-4 hover:underline"
            onClick={() => {
              void featuresQuery.refetch();
              if (features) {
                void scoreQuery.refetch();
                void routeQuery.refetch();
                void riskQuery.refetch();
                void fingerprintQuery.refetch();
              }
            }}
          >
            Retry blockchain features
          </button>
        </div>
      ) : !features ? (
        <div className="mt-5 text-sm text-slate-500">Loading blockchain feature context…</div>
      ) : (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="Proof coverage" value={features.proofCoverage.toFixed(2)} />
            <Metric label="Freshness" value={features.freshnessScore.toFixed(2)} />
            <Metric label="Blockchain score" value={scoreQuery.data ? scoreQuery.data.score.toFixed(2) : "—"} />
            <Metric label="Wallet risk" value={riskQuery.data !== undefined ? riskQuery.data.toFixed(2) : "—"} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[10px] text-slate-300">
              route:{routeQuery.data ?? "pending"}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[10px] text-slate-300">
              abstain:{scoreQuery.data?.abstain ? "true" : "false"}
            </span>
            {fingerprintQuery.data ? (
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[10px] text-slate-300">
                fp:{shortenHash(fingerprintQuery.data)}
              </span>
            ) : null}
          </div>
        </>
      )}
    </section>
  );
}

function firstQueryError(...errors: Array<{ message?: string } | null | undefined>): string | undefined {
  for (const error of errors) {
    const message = error?.message?.trim();
    if (message) return cleanProofLoanErrorMessage(message);
  }
  return undefined;
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white/[0.03] p-4">
      <div className="text-[10px] uppercase tracking-[0.15em] text-slate-600">
        {label}
      </div>

      <div className="mt-2 text-2xl font-bold text-white">
        {value}
      </div>
    </div>
  );
}

function MetadataCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ShieldCheck;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-black/10 p-4">
      <Icon className="h-4 w-4 text-slate-500" />

      <div className="mt-4 text-[10px] uppercase tracking-[0.15em] text-slate-600">
        {label}
      </div>

      <div className="mt-2 break-all font-mono text-xs text-slate-300">
        {value}
      </div>
    </div>
  );
}
