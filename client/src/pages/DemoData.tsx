import { useMemo, useState } from "react";
import {
  Beaker,
  Database,
  Layers,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { PageShell } from "@/components/navigation/PageShell";
import { Panel } from "@/components/navigation/Panel";
import { StatCard } from "@/components/navigation/StatCard";
import { StatusPill } from "@/components/navigation/StatusPill";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

const KIND_FILTERS = [
  "happy-path",
  "freshness",
  "late-payment",
  "sparse-evidence",
  "cross-chain",
  "attestor-failure",
  "rpc-failure",
  "proof-builder-failure",
  "gas-pressure",
  "merkle-pressure",
  "ai-abstain",
  "riskguard-block",
  "operator-recovery",
  "reorg-recovery",
] as const;

function decisionTone(status?: string): "green" | "red" | "amber" | "slate" {
  if (status === "Ready") return "green";
  if (status === "Blocked") return "red";
  if (status === "Abstain") return "amber";
  return "slate";
}

export default function DemoData() {
  const [profileId, setProfileId] = useState("strong-borrower");
  const [catalogQuery, setCatalogQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<string>("");
  const [selectedCaseId, setSelectedCaseId] = useState("extended-001");

  const healthQuery = trpc.demo.health.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 15_000,
  });
  const profilesQuery = trpc.demo.profiles.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });
  const batchQuery = trpc.demo.extendedBatch.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });
  const searchQuery = trpc.demo.searchExtendedCases.useQuery(
    { query: catalogQuery },
    {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 15_000,
    },
  );
  const selectedCaseQuery = trpc.demo.extendedCase.useQuery(
    { id: selectedCaseId },
    {
      retry: false,
      refetchOnWindowFocus: false,
      enabled: selectedCaseId.length > 0,
    },
  );
  const evaluationQuery = trpc.demo.evaluateExtendedCase.useQuery(
    { id: selectedCaseId },
    {
      retry: false,
      refetchOnWindowFocus: false,
      enabled: selectedCaseId.length > 0,
    },
  );
  const createApplication = trpc.demo.createApplication.useMutation();
  const resetDemo = trpc.demo.reset.useMutation({
    onSuccess: () => {
      createApplication.reset();
    },
  });

  const health = healthQuery.data;
  const profiles = profilesQuery.data ?? [];
  const selected = useMemo(
    () => profiles.find(profile => profile.id === profileId) ?? profiles[0],
    [profileId, profiles],
  );
  const envelope = createApplication.data;
  const snapshot = envelope?.snapshot;
  const catalogError =
    healthQuery.error?.message ??
    profilesQuery.error?.message ??
    batchQuery.error?.message ??
    searchQuery.error?.message;
  const evaluationError = selectedCaseQuery.error?.message ?? evaluationQuery.error?.message;
  const errorMessage =
    createApplication.error?.message ??
    resetDemo.error?.message ??
    catalogError ??
    evaluationError;
  const retryFailedQueries = () => {
    void healthQuery.refetch();
    void profilesQuery.refetch();
    void batchQuery.refetch();
    void searchQuery.refetch();
    if (selectedCaseId.length > 0) {
      void selectedCaseQuery.refetch();
      void evaluationQuery.refetch();
    }
  };
  const catalog = useMemo(() => {
    const rows = searchQuery.data ?? [];
    return kindFilter ? rows.filter(item => item.kind === kindFilter) : rows;
  }, [kindFilter, searchQuery.data]);
  const selectedCase = selectedCaseQuery.data;
  const evaluation = evaluationQuery.data;
  const counts = batchQuery.data?.countsByKind ?? {};

  return (
    <PageShell
      eyebrow="Demo"
      title="Mock data & fallback"
      description="Deterministic borrower scenarios and a 180-case extended catalog for offline walkthroughs. Mock facts are labeled evidenceMode=mock and never become live Attestcoin proofs. RiskGuard still runs."
      actions={
        <StatusPill
          label={health?.enabled ? "Demo mode on" : "Demo mode off"}
          tone={health?.enabled ? "amber" : "slate"}
          live={Boolean(health?.enabled)}
        />
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Profiles"
          value={String(health?.profileCount ?? 12)}
          description="Borrower, operator, and failure scenarios"
          icon={Beaker}
        />
        <StatCard
          label="Extended catalog"
          value={String(health?.extendedCaseCount ?? batchQuery.data?.total ?? 180)}
          description="Sepolia and Mainnet mock cases, no live chain"
          icon={Layers}
        />
        <StatCard
          label="Fallback"
          value={health?.allowLiveFailureFallback ? "Explicit" : "Disabled"}
          description="Live Attestcoin failures stay failed unless demo flags are on"
          icon={ShieldAlert}
        />
        <StatCard
          label="RiskGuard"
          value="Enforced"
          description="Demo underwriting cannot bypass policy"
          icon={ShieldCheck}
        />
      </div>

      {healthQuery.isError ? (
        <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          <p>Demo health could not be loaded. Mock walkthroughs stay disabled until this recovers.</p>
          <button
            type="button"
            onClick={retryFailedQueries}
            className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-rose-50 underline-offset-4 hover:underline"
          >
            Retry demo health
          </button>
        </div>
      ) : (
        <p className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          {health?.warning ?? "Demo health is loading."} Mock data requires PROOFLOAN_DEMO_MODE=true.
        </p>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
        <Panel padded>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-400/10">
              <Sparkles className="h-4 w-4 text-amber-200" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Create demo application</h2>
              <p className="text-sm text-slate-500">No network call. Facts stay synthetic.</p>
            </div>
          </div>

          <label className="mt-5 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Scenario
          </label>
          <select
            value={selected?.id ?? profileId}
            onChange={event => setProfileId(event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b121d] px-3 py-2 text-sm text-white"
          >
            {profiles.map(profile => (
              <option key={profile.id} value={profile.id}>
                {profile.label}
              </option>
            ))}
          </select>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            {selected?.description ?? "Choose a deterministic profile for the offline underwriting walkthrough."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              disabled={createApplication.isPending || health?.enabled === false || !selected?.id || profilesQuery.isError}
              onClick={() => {
                if (!selected?.id) return;
                createApplication.mutate({ profileId: selected.id });
              }}
            >
              {createApplication.isPending ? "Generating…" : "Generate demo application"}
            </Button>
            <Button
              variant="outline"
              disabled={resetDemo.isPending}
              onClick={() => resetDemo.mutate()}
            >
              Reset demo store
            </Button>
          </div>
        </Panel>

        <Panel padded accent={Boolean(snapshot)}>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-300/10">
              <Database className="h-4 w-4 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Last demo snapshot</h2>
              <p className="text-sm text-slate-500">Labeled mock evidence plus RiskGuard output.</p>
            </div>
          </div>
          {errorMessage && <p className="mt-3 text-sm leading-6 text-rose-300">{errorMessage}</p>}
          {snapshot && (
            <dl className="mt-4 grid gap-2 text-sm text-slate-300">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Application</dt>
                <dd className="truncate font-mono text-xs">{snapshot.applicationId}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Evidence mode</dt>
                <dd>{snapshot.evidenceMode ?? snapshot.facts[0]?.evidenceMode}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Facts</dt>
                <dd>{snapshot.facts.length} mock records</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">State</dt>
                <dd>{snapshot.state}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Risk tier</dt>
                <dd>{snapshot.decision?.riskTier ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Offer</dt>
                <dd>{snapshot.offer?.status ?? "—"}</dd>
              </div>
            </dl>
          )}
          {!snapshot && !errorMessage && (
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Generate a profile to see mock facts, demo underwriting, and the RiskGuard gate.
            </p>
          )}
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
        <Panel padded>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-violet-300/10">
              <Search className="h-4 w-4 text-violet-200" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Extended catalog</h2>
              <p className="text-sm text-slate-500">
                {catalog.length} of {batchQuery.data?.total ?? 180} deterministic mock cases.
              </p>
            </div>
          </div>

          <label className="mt-5 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Search cases
          </label>
          <input
            value={catalogQuery}
            onChange={event => setCatalogQuery(event.target.value.slice(0, 200))}
            placeholder="rpc, abstain, sepolia, reorg…"
            maxLength={200}
            className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b121d] px-3 py-2 text-sm text-white placeholder:text-slate-600"
          />

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setKindFilter("")}
              className={`rounded-full border px-2.5 py-1 text-[11px] ${
                kindFilter === "" ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100" : "border-white/10 text-slate-400"
              }`}
            >
              all
            </button>
            {KIND_FILTERS.map(kind => (
              <button
                key={kind}
                type="button"
                onClick={() => setKindFilter(kind)}
                className={`rounded-full border px-2.5 py-1 text-[11px] ${
                  kindFilter === kind ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100" : "border-white/10 text-slate-400"
                }`}
              >
                {kind}
                {counts[kind] ? ` ${counts[kind]}` : ""}
              </button>
            ))}
          </div>

          <div className="mt-4 max-h-[28rem] space-y-2 overflow-auto pr-1">
            {catalog.map(item => {
              const active = item.id === selectedCaseId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedCaseId(item.id)}
                  className={`w-full rounded-2xl border px-3 py-3 text-left ${
                    active ? "border-cyan-300/30 bg-cyan-300/10" : "border-white/10 bg-white/[0.02] hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-white">{item.label}</p>
                    <StatusPill label={item.kind} tone={active ? "cyan" : "slate"} />
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {item.chain} · {item.facts.length} facts · {item.failure ? item.failure.kind : "no failure"}
                  </p>
                </button>
              );
            })}
            {searchQuery.isError && (
              <p className="text-sm text-rose-300">
                Extended catalog search failed. {searchQuery.error?.message ?? "Retry the search."}
              </p>
            )}
            {catalog.length === 0 && !searchQuery.isError && (
              <p className="text-sm text-slate-500">
                {searchQuery.isLoading ? "Loading extended mock cases…" : "No extended cases match that search."}
              </p>
            )}
          </div>
        </Panel>

        <Panel padded accent={Boolean(selectedCase)}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Evaluate mock case</h2>
              <p className="text-sm text-slate-500">Offline decision. Never a live Attestcoin proof.</p>
            </div>
            <StatusPill
              label={evaluation?.status ?? "Loading"}
              tone={decisionTone(evaluation?.status)}
            />
          </div>

          {evaluationError && (
            <p className="mt-3 text-sm leading-6 text-rose-300">{evaluationError}</p>
          )}
          {selectedCase && (
            <>
              <p className="mt-4 text-sm leading-6 text-slate-400">{selectedCase.description}</p>
              <dl className="mt-4 grid gap-2 text-sm text-slate-300">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Case</dt>
                  <dd className="font-mono text-xs">{selectedCase.id}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Chain</dt>
                  <dd>{selectedCase.chain}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Evidence mode</dt>
                  <dd>mock</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Facts</dt>
                  <dd>{selectedCase.facts.length} synthetic records</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Failure</dt>
                  <dd>{selectedCase.failure?.message ?? "None"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Risk tier</dt>
                  <dd>{evaluation?.riskTier ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Policy</dt>
                  <dd>{evaluation?.policyStatus ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Confidence</dt>
                  <dd>{evaluation ? evaluation.confidence.toFixed(2) : "—"}</dd>
                </div>
              </dl>
              {evaluation?.reasons?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {evaluation.reasons.map(reason => (
                    <StatusPill key={reason} label={reason} tone="amber" />
                  ))}
                </div>
              ) : null}
              <ul className="mt-4 space-y-2 text-xs text-slate-400">
                {selectedCase.facts.map((fact, index) => (
                  <li key={`${selectedCase.id}-${index}`} className="rounded-xl border border-white/10 px-3 py-2">
                    {fact.eventType} · {fact.amount} {fact.asset ?? "USDC"} · {fact.freshness ?? "derived"} · {fact.ageDays}d
                  </li>
                ))}
              </ul>
            </>
          )}
        </Panel>
      </div>
    </PageShell>
  );
}
