import {
  ArrowRight,
  Ban,
  CheckCircle2,
  Fingerprint,
  Fuel,
  GitBranch,
  GitMerge,
  Radio,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";

import { PageShell } from "@/components/navigation/PageShell";
import { Panel } from "@/components/navigation/Panel";
import { StatCard } from "@/components/navigation/StatCard";
import { StatusPill } from "@/components/navigation/StatusPill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { cleanProofLoanErrorMessage } from "@shared/proofloan";

const DEMO_CONTRACT = "0x742d35cc6634c0532925a3b844bc454e4438f44e";
const DEMO_TX = `0x${"cd".repeat(32)}`;
const DEMO_BLOCK_HASH = `0x${"ab".repeat(32)}`;

const pipelineLabels: Record<string, string> = {
  "source-event": "Source-chain event",
  "worker-scan": "Readability worker",
  finality: "Confirmation / finality",
  attestation: "Attestation wait",
  "proof-builder": "Proof Builder",
  "merkle-continuity": "Merkle + continuity",
  asc: "Creditcoin ASC",
  "block-prover": "Block Prover 0x0FD2",
  "receipt-success": "Receipt status 0x1",
  "business-logic": "ProofLoan logic",
};

function truncateHex(value: string, lead = 10): string {
  if (value.length <= lead + 8) return value;
  return `${value.slice(0, lead)}…${value.slice(-6)}`;
}

function demoEvent(eventName: string) {
  return {
    chainId: "ethereum-sepolia",
    blockNumber: 8_441_000,
    blockHash: DEMO_BLOCK_HASH,
    transactionHash: DEMO_TX,
    transactionIndex: 3,
    logIndex: 1,
    contractAddress: DEMO_CONTRACT,
    eventName,
    topics: [`0x${"11".repeat(32)}`],
    data: "0x0000000000000000000000000000000000000000000000000de0b6b3a7640000",
    confirmations: 40,
    observedAt: new Date().toISOString(),
  };
}

export default function Readability() {
  const [eventName, setEventName] = useState("CreditPositionOpened");
  const [logIndex, setLogIndex] = useState(1);
  const [continuityNow, setContinuityNow] = useState(10);
  const [continuityLater, setContinuityLater] = useState(1010);
  const [encodedBytes, setEncodedBytes] = useState(1024);
  const healthQuery = trpc.readability.health.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 15_000,
  });
  const gasPolicyQuery = trpc.readability.gasPolicy.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });
  const preview = trpc.readability.submitPreview.useMutation({
    onSuccess: () => {
      void healthQuery.refetch();
    },
  });
  const merkleSiblingCount = preview.data?.merkleInclusion?.siblingCount ?? 3;
  const estimateGas = trpc.readability.estimateGas.useQuery(
    {
      continuityHashCount: continuityNow,
      merkleSiblingCount,
      encodedTransactionBytes: encodedBytes,
    },
    { retry: false, refetchOnWindowFocus: false },
  );
  const optimizeGas = trpc.readability.optimizeGas.useQuery(
    {
      continuityHashCount: continuityNow,
      merkleSiblingCount,
      encodedTransactionBytes: encodedBytes,
      eventBlock: 8_441_000,
      attestedBlock: 8_441_000 + Math.max(0, continuityNow),
    },
    { retry: false, refetchOnWindowFocus: false },
  );
  const compareGas = trpc.readability.compareGas.useQuery(
    { continuityNow, continuityLater },
    { retry: false, refetchOnWindowFocus: false },
  );
  const durable = trpc.readability.ingestDurablePreview.useMutation({
    onSuccess: () => {
      void healthQuery.refetch();
    },
  });

  const health = healthQuery.data;
  const pipeline = health?.pipeline ?? Object.keys(pipelineLabels);
  const result = preview.data;
  const durableJob = durable.data;
  const errorMessage =
    preview.error?.message ??
    durable.error?.message ??
    healthQuery.error?.message ??
    compareGas.error?.message ??
    optimizeGas.error?.message;
  const displayError = errorMessage ? cleanProofLoanErrorMessage(errorMessage) : undefined;

  const eventPreview = useMemo(
    () => ({ ...demoEvent(eventName.trim() || "CreditPositionOpened"), logIndex }),
    [eventName, logIndex],
  );

  return (
    <PageShell
      eyebrow="Attestcoin"
      title="Cross-chain readability"
      description="Source-chain events become ProofLoan evidence only after attestation, Merkle and continuity proofs, synchronous Block Prover verification, and a successful source receipt."
      actions={
        <StatusPill
          label={health?.adapters.live.production ? "Live adapters isolated" : "Readability"}
          tone="cyan"
          live
        />
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Environment"
          value={health?.environment ?? "cc3-testnet"}
          description="Creditcoin environment for this worker"
          icon={Radio}
        />
        <StatCard
          label="Block Prover"
          value="0x0FD2"
          description="Synchronous precompile verification"
          icon={ShieldCheck}
        />
        <StatCard
          label="Delivered queries"
          value={String(health?.store.processed ?? 0)}
          description="Preview deliveries in this process"
          icon={CheckCircle2}
        />
        <StatCard
          label="Durable jobs"
          value={String(health?.offchainWorker?.store.jobs ?? 0)}
          description="Offchain worker job store"
          icon={GitBranch}
        />
      </div>

      <section className="mt-6 overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Documented flow
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {pipeline.map((step, index) => (
            <div key={step} className="flex items-center gap-2">
              <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                {index + 1}. {pipelineLabels[step] ?? step}
              </div>
              {index < pipeline.length - 1 && (
                <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-300/10">
            <GitMerge className="h-4 w-4 text-cyan-300" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Merkle inclusion</h2>
            <p className="text-sm text-slate-500">
              Preview walks a USC-style keccak path. Live proofs still use Block Prover 0x0FD2.
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-400">
          Leaves are hashed with prefix <code className="text-slate-300">0x00</code>, inner nodes with{" "}
          <code className="text-slate-300">0x01</code>. Odd right children pad with the zero hash. The preview
          tree is a local reconstruction of neighboring payloads, not the attested source-block tree.
        </p>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm text-slate-300">
          <div>
            <dt className="text-slate-500">Included</dt>
            <dd className="mt-1">
              {result?.merkleInclusion ? (result.merkleInclusion.valid ? "yes" : "no") : "run a preview"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Siblings / depth</dt>
            <dd className="mt-1">
              {result?.merkleInclusion?.siblingCount ?? "—"} / {result?.merkleInclusion?.depth ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Index / leaves</dt>
            <dd className="mt-1">
              {result?.merkleInclusion?.transactionIndex ?? "—"} / {result?.merkleInclusion?.leafCount ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Root</dt>
            <dd className="mt-1 font-mono text-xs">
              {result?.merkleInclusion?.merkleRoot
                ? truncateHex(result.merkleInclusion.merkleRoot)
                : "—"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-400/10">
              <Fuel className="h-4 w-4 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Gas / cost planner</h2>
              <p className="text-sm text-slate-500">
                Official CTC uses continuity length. Merkle and decode costs are internal heuristics.
              </p>
            </div>
          </div>
          <StatusPill
            label={health?.gas?.aware ? "Worker enforcement on" : "Estimates only"}
            tone={health?.gas?.aware ? "amber" : "slate"}
          />
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-400">
          {gasPolicyQuery.data?.officialModel
            ? `CTC Cost ≈ ${gasPolicyQuery.data.officialModel}. Payloads above ${gasPolicyQuery.data.maxTransactionBytes.toLocaleString()} bytes are treated as unprocessable.`
            : "CTC Cost ≈ 2.3e-5 + 2.9e-7 × continuity hash count. Transactions above 500 KB may be unprocessable."}
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Continuity hashes now
            <Input
              type="number"
              min={0}
              value={continuityNow}
              onChange={event => setContinuityNow(Number(event.target.value) || 0)}
              className="mt-2 bg-[#0b121d] text-white"
            />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Continuity hashes later
            <Input
              type="number"
              min={0}
              value={continuityLater}
              onChange={event => setContinuityLater(Number(event.target.value) || 0)}
              className="mt-2 bg-[#0b121d] text-white"
            />
          </label>
          <label className="block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Encoded transaction bytes
            <Input
              type="number"
              min={0}
              value={encodedBytes}
              onChange={event => setEncodedBytes(Number(event.target.value) || 0)}
              className="mt-2 bg-[#0b121d] text-white"
            />
          </label>
        </div>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm text-slate-300">
          <div>
            <dt className="text-slate-500">Official CTC</dt>
            <dd className="mt-1 font-mono text-xs">{estimateGas.data?.officialCtc.toExponential(4) ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Planning CTC</dt>
            <dd className="mt-1 font-mono text-xs">{estimateGas.data?.estimatedCtc.toExponential(4) ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Decision</dt>
            <dd className="mt-1">
              {optimizeGas.data?.action ?? "—"} · {optimizeGas.data?.risk ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Later / now</dt>
            <dd className="mt-1 font-mono text-xs">
              {compareGas.data ? `${compareGas.data.officialMultiplier.toFixed(2)}× official` : "—"}
            </dd>
          </div>
        </dl>
        {(optimizeGas.data?.reasons.length || optimizeGas.data?.recommendations.length) ? (
          <ul className="mt-4 list-disc space-y-1 pl-5 text-xs leading-5 text-slate-400">
            {(optimizeGas.data?.reasons ?? []).map(reason => (
              <li key={reason}>{reason}</li>
            ))}
            {(optimizeGas.data?.recommendations ?? []).map(recommendation => (
              <li key={recommendation}>{recommendation}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
        <Panel padded>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-rose-400/10">
              <Ban className="h-4 w-4 text-rose-300" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Event policy</h2>
              <p className="text-sm text-slate-500">Focused contracts. Unambiguous names.</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-400">
            {health?.policy.rule ??
              "Do not trigger readability from generic Transfer logs. Include destination-chain identifiers in the emitted event."}
          </p>
          <div className="mt-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Forbidden
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(health?.policy.forbidden ?? ["Transfer", "Approval"]).map(name => (
                <span
                  key={name}
                  className="rounded-full border border-rose-400/15 bg-rose-400/10 px-2.5 py-1 text-xs text-rose-200"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Focused events
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(health?.policy.focused ?? ["CreditPositionOpened", "RepaymentRecorded"]).map(name => (
                <span
                  key={name}
                  className="rounded-full border border-emerald-400/15 bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-200"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </Panel>

        <Panel padded>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-300/10">
              <GitBranch className="h-4 w-4 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Preview delivery</h2>
              <p className="text-sm text-slate-500">
                Educational Proof Builder. Not Attestcoin consensus.
              </p>
            </div>
          </div>
          <label className="mt-5 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Source event name
          </label>
          <Input
            value={eventName}
            onChange={event => setEventName(event.target.value)}
            placeholder="CreditPositionOpened"
            className="mt-2 bg-[#0b121d] text-white"
          />
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Try <code className="text-slate-300">Transfer</code> to see the policy rejection, or keep{" "}
            <code className="text-slate-300">CreditPositionOpened</code> for a successful preview.
          </p>
          <Button
            className="mt-4"
            disabled={preview.isPending}
            onClick={() => {
              preview.mutate({
                query: {
                  environment: "cc3-testnet",
                  sourceChain: "Ethereum Sepolia",
                  sourceContract: DEMO_CONTRACT,
                  eventName: eventPreview.eventName,
                  minConfirmations: 32,
                },
                event: eventPreview,
              });
              setLogIndex(value => value + 1);
            }}
          >
            {preview.isPending ? "Verifying…" : "Run preview pipeline"}
          </Button>
          <Button
            variant="outline"
            className="mt-3"
            disabled={durable.isPending}
            onClick={() => {
              durable.mutate({
                query: {
                  environment: "cc3-testnet",
                  sourceChain: "Ethereum Sepolia",
                  sourceContract: DEMO_CONTRACT,
                  eventName: eventPreview.eventName,
                  minConfirmations: 32,
                },
                event: eventPreview,
              });
              setLogIndex(value => value + 1);
            }}
          >
            {durable.isPending ? "Worker running…" : "Run durable worker"}
          </Button>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel padded>
          <div className="flex items-center gap-3">
            <Fingerprint className="h-4 w-4 text-cyan-300" />
            <h2 className="text-lg font-semibold text-white">Adapter boundary</h2>
          </div>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-slate-500">Preview Proof Builder</dt>
              <dd className="text-slate-200">{health?.adapters.preview.proofBuilder ?? "DeterministicProofBuilder"}</dd>
              <dd className="text-xs text-slate-500">
                {health?.adapters.preview.merkle ?? "local hashLeaf(0x00) / hashInner(0x01) inclusion"}
              </dd>
              <dd className="text-xs text-amber-200/80">{health?.adapters.preview.note}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Durable worker</dt>
              <dd className="text-slate-200">ProductionReadabilityWorker</dd>
              <dd className="text-xs text-slate-500">
                {health?.offchainWorker?.protocolBoundary.liveProofs ??
                  "Orchestrates retries and catch-up. Live proofs still use the USC SDK / Block Prover path."}
              </dd>
            </div>
          </dl>
        </Panel>

        <Panel padded accent={Boolean(result) || Boolean(durableJob?.job)}>
          <h2 className="text-lg font-semibold text-white">Last result</h2>
          {displayError && (
            <p className="mt-3 text-sm leading-6 text-rose-300">{displayError}</p>
          )}
          {result && (
            <dl className="mt-3 grid gap-2 text-sm text-slate-300">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Query</dt>
                <dd className="truncate font-mono text-xs">{result.queryId}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Adapter</dt>
                <dd>{result.adapter}{result.educational ? " · educational" : ""}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Receipt</dt>
                <dd>{result.receiptStatus === 1 ? "success (0x1)" : result.receiptStatus}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Verified</dt>
                <dd>{result.verified ? "yes" : "no"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Merkle</dt>
                <dd>
                  {result.merkleInclusion?.valid ? "included" : "not included"}
                  {result.merkleInclusion?.siblingCount != null
                    ? ` · ${result.merkleInclusion.siblingCount} siblings`
                    : ""}
                </dd>
              </div>
              {result.merkleInclusion?.merkleRoot ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Root</dt>
                  <dd className="truncate font-mono text-xs">
                    {truncateHex(result.merkleInclusion.merkleRoot)}
                  </dd>
                </div>
              ) : null}
            </dl>
          )}
          {!result && !durableJob && !displayError && (
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Run a preview delivery or the durable worker to see query ID, adapter label, and receipt status.
            </p>
          )}
          {durableJob?.job && (
            <dl className="mt-4 grid gap-2 border-t border-white/[0.06] pt-4 text-sm text-slate-300">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Durable job</dt>
                <dd className="truncate font-mono text-xs">{durableJob.job.jobId}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Phase</dt>
                <dd>{durableJob.job.phase}</dd>
              </div>
            </dl>
          )}
        </Panel>
      </div>
    </PageShell>
  );
}
