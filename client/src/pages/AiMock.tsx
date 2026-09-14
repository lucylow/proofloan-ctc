import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Beaker,
  GitBranch,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { AiMockScenarioPanel } from "@/components/AiMockScenarioPanel";
import { PageShell } from "@/components/navigation/PageShell";
import { Panel } from "@/components/navigation/Panel";
import { StatCard } from "@/components/navigation/StatCard";
import { StatusPill } from "@/components/navigation/StatusPill";
import { isAiMockScenarioId } from "@/lib/aiMockData";
import { trpc } from "@/lib/trpc";
import { cleanProofLoanErrorMessage } from "@shared/proofloan";
import type { AiMockScenarioId } from "@shared/aiMockTypes";

function recommendationTone(value?: string): "green" | "amber" | "red" | "slate" {
  if (value === "APPROVE") return "green";
  if (value === "REVIEW") return "amber";
  if (value === "REJECT") return "red";
  return "slate";
}

export default function AiMock() {
  const [scenarioId, setScenarioId] = useState<AiMockScenarioId>("hero");

  const listQuery = trpc.aiMock.list.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });
  const dashboardQuery = trpc.aiMock.dashboard.useQuery(
    { scenarioId },
    {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 15_000,
      placeholderData: previous => previous,
    },
  );
  const failureQuery = trpc.aiMock.simulateFailure.useQuery(
    { scenarioId },
    {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 15_000,
      placeholderData: previous => previous,
    },
  );

  const stats = listQuery.data?.stats;
  const snapshot = dashboardQuery.data;
  const scenario = snapshot?.scenario;
  const errorMessage = useMemo(() => {
    const raw = listQuery.error?.message ?? dashboardQuery.error?.message ?? failureQuery.error?.message;
    return raw ? cleanProofLoanErrorMessage(raw) : undefined;
  }, [dashboardQuery.error?.message, failureQuery.error?.message, listQuery.error?.message]);

  const retry = () => {
    void listQuery.refetch();
    void dashboardQuery.refetch();
    void failureQuery.refetch();
  };

  return (
    <PageShell
      eyebrow="Demo"
      title="AI mock lab"
      description="Deterministic VerifiedFact fixtures, feature vectors, explanations, confidence bands, and what-if recommendations. This layer interprets mock evidence only. It does not replace Attestcoin verification or RiskGuard."
      actions={
        <StatusPill
          label={snapshot ? `${snapshot.recommendation} · mock` : "Loading mock AI"}
          tone={recommendationTone(snapshot?.recommendation)}
          live={Boolean(snapshot)}
        />
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Scenarios"
          value={String(stats?.scenarios ?? 22)}
          description="Named underwriting walkthroughs"
          icon={Beaker}
        />
        <StatCard
          label="Mock facts"
          value={String(stats?.facts ?? "—")}
          description="Labeled evidenceMode=mock"
          icon={GitBranch}
        />
        <StatCard
          label="Approve / review / reject"
          value={`${stats?.recommendations.APPROVE ?? 0}/${stats?.recommendations.REVIEW ?? 0}/${stats?.recommendations.REJECT ?? 0}`}
          description="Advisory recommendations only"
          icon={Sparkles}
        />
        <StatCard
          label="RiskGuard"
          value="Still required"
          description="Mock AI cannot authorize execution"
          icon={ShieldCheck}
        />
      </div>

      <p className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
        {listQuery.data?.warning ?? "AI mock fixtures are synthetic and never prove a live cross-chain fact."}
      </p>

      {errorMessage ? (
        <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          <p>{errorMessage}</p>
          <button
            type="button"
            onClick={retry}
            className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-rose-50 underline-offset-4 hover:underline"
          >
            Retry AI mock dataset
          </button>
        </div>
      ) : null}

      <div className="mt-6">
        <AiMockScenarioPanel
          snapshot={snapshot}
          selectedScenarioId={scenarioId}
          onScenarioChange={id => {
            if (isAiMockScenarioId(id)) setScenarioId(id);
          }}
        />
      </div>

      {scenario ? (
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Panel padded>
            <h2 className="text-lg font-semibold text-white">{scenario.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">{scenario.description}</p>
            <p className="mt-4 text-sm leading-6 text-slate-300">{scenario.narrative.summary}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <List title="Strengths" items={scenario.narrative.strengths} />
              <List title="Concerns" items={scenario.narrative.concerns} />
            </div>
            <div className="mt-5">
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Evidence chain</h3>
              <ul className="mt-2 space-y-1 text-sm text-slate-300">
                {scenario.narrative.evidenceChain.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <p className="mt-5 text-xs leading-5 text-slate-500">{scenario.narrative.actionRationale}</p>
            <p className="mt-2 text-xs leading-5 text-amber-200">{scenario.narrative.disclaimer}</p>
          </Panel>

          <div className="space-y-6">
            <Panel padded>
              <h2 className="text-lg font-semibold text-white">Feature contributions</h2>
              <div className="mt-4 space-y-3">
                {snapshot?.featureContributions.map(item => (
                  <div key={item.feature} className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-white">{item.feature}</span>
                      <span className="text-xs uppercase tracking-[0.14em] text-slate-500">{item.direction}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{item.explanation}</p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel padded>
              <h2 className="text-lg font-semibold text-white">What-if</h2>
              <div className="mt-4 space-y-3">
                {snapshot?.whatIf.map(item => (
                  <div key={item.label} className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-white">{item.label}</span>
                      <StatusPill label={item.recommendation} tone={recommendationTone(item.recommendation)} />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      {item.changedFeature}: {item.baseline} → {item.counterfactual}
                    </p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      ) : null}

      {failureQuery.data && !failureQuery.data.ok ? (
        <div className="mt-6 rounded-3xl border border-rose-400/20 bg-rose-400/10 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-rose-200" />
            <div>
              <h2 className="text-lg font-semibold text-white">Simulated proof/AI failure</h2>
              <p className="mt-2 text-sm text-rose-100">{failureQuery.data.message}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-rose-200">
                {failureQuery.data.retryable ? "Retryable mock failure" : "Terminal mock failure"}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {scenario ? (
        <Panel padded className="mt-6">
          <h2 className="text-lg font-semibold text-white">Mock facts</h2>
          <p className="mt-2 text-sm text-slate-500">
            Wallet {scenario.walletAddress}. Chains: {scenario.sourceChains.join(", ")}. Latency {scenario.proofLatencyMs} ms.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                <tr>
                  <th className="pb-2">Event</th>
                  <th className="pb-2">Chain</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Freshness</th>
                  <th className="pb-2">Mode</th>
                </tr>
              </thead>
              <tbody>
                {scenario.facts.map(fact => (
                  <tr key={fact.id} className="border-t border-white/8 text-slate-300">
                    <td className="py-2">{fact.eventType}</td>
                    <td className="py-2">{fact.chain}</td>
                    <td className="py-2">{fact.amount}</td>
                    <td className="py-2">{fact.freshness}</td>
                    <td className="py-2">{fact.evidenceMode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      ) : null}
    </PageShell>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{title}</h3>
      <ul className="mt-2 space-y-1 text-sm leading-6 text-slate-300">
        {items.length ? items.map(item => <li key={item}>{item}</li>) : <li>None in this mock sample.</li>}
      </ul>
    </div>
  );
}
