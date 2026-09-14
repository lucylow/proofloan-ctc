import {
  ArrowRight,
  Fingerprint,
  GitBranch,
  ShieldAlert,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { useState } from "react";

import { PageShell } from "@/components/navigation/PageShell";
import { Panel } from "@/components/navigation/Panel";
import { StatCard } from "@/components/navigation/StatCard";
import { StatusPill } from "@/components/navigation/StatusPill";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { cleanProofLoanErrorMessage } from "@shared/proofloan";

const pipelineLabels: Record<string, string> = {
  query: "Query",
  "proof-generation": "Proof generation",
  verification: "Verification",
  "data-extraction": "Data extraction",
};

const flowLabels: Record<string, string> = {
  "target-transaction": "Target transaction",
  "query-phase": "Query",
  "proof-builder": "Proof Builder",
  "merkle-proof": "Merkle proof",
  "continuity-proof": "Continuity proof",
  "proof-envelope": "Proof envelope",
  "creditcoin-asc": "Creditcoin ASC",
  "block-prover-precompile": "Block Prover 0x0FD2",
  "cryptographic-verification": "Verification",
  "transaction-data-extraction": "Data extraction",
  "proofloan-business-logic": "ProofLoan logic",
};

function demoHash(nonce: number) {
  const suffix = nonce.toString(16).padStart(2, "0").slice(-2);
  return `0x${"cd".repeat(31)}${suffix}`;
}

function parseChainKey(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function isTxHash(value: string): boolean {
  return /^0x[0-9a-fA-F]{64}$/.test(value.trim());
}

function firstErrorMessage(...errors: Array<{ message?: string } | null | undefined>): string | undefined {
  for (const error of errors) {
    const message = error?.message?.trim();
    if (message) return cleanProofLoanErrorMessage(message);
  }
  return undefined;
}

export default function TransactionProving() {
  const [chainKey, setChainKey] = useState("1");
  const [nonce, setNonce] = useState(1);
  const [txHash, setTxHash] = useState(demoHash(1));
  const [actionError, setActionError] = useState<string | null>(null);
  const healthQuery = trpc.transactionProving.health.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 15_000,
  });
  const costQuery = trpc.transactionProving.estimateCost.useQuery(
    { hashCount: 10, budgetCtc: 0.01 },
    { retry: false, refetchOnWindowFocus: false, staleTime: 60_000 },
  );
  const preview = trpc.transactionProving.provePreview.useMutation({
    onMutate: () => setActionError(null),
    onSuccess: () => {
      setActionError(null);
      const next = nonce + 1;
      setNonce(next);
      setTxHash(demoHash(next));
      void healthQuery.refetch();
    },
    onError: (error: { message?: string }) => {
      setActionError(firstErrorMessage(error) ?? "Transaction proving failed.");
    },
  });

  const health = healthQuery.data;
  const phases = health?.pipeline ?? Object.keys(pipelineLabels);
  const result = preview.isSuccess && !actionError ? preview.data : undefined;
  const queryError = firstErrorMessage(healthQuery.error, costQuery.error);
  const errorMessage = actionError ?? queryError;

  const parsedChainKey = parseChainKey(chainKey);

  const runPreview = () => {
    if (parsedChainKey == null) {
      setActionError("Chain key must be a non-negative integer.");
      return;
    }
    if (!isTxHash(txHash)) {
      setActionError("Enter a complete 32-byte source transaction hash.");
      return;
    }
    preview.mutate({ chainKey: parsedChainKey, txHash: txHash.trim() });
  };

  return (
    <PageShell
      eyebrow="Attestcoin"
      title="Transaction proving"
      description="Query a source transaction, obtain Merkle inclusion and continuity proofs, verify them at the Block Prover boundary, then extract bytes only after verification succeeds."
      actions={
        <StatusPill
          label={health?.adapters.live.production ? "Live verifier isolated" : "Transaction proving"}
          tone="cyan"
          live
        />
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Phases"
          value="4"
          description="Query → generate → verify → extract"
          icon={Workflow}
        />
        <StatCard
          label="Block Prover"
          value="0x0FD2"
          description="Synchronous precompile verification"
          icon={ShieldCheck}
        />
        <StatCard
          label="Continuity cost"
          value={costQuery.data ? costQuery.data.estimatedCtc.toExponential(2) : "2.3e-5"}
          description={costQuery.data?.formula ?? "2.3e-5 + 2.9e-7 × hashes"}
          icon={GitBranch}
        />
      </div>

      <section className="mt-6 overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          Four-phase model
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {phases.map((step, index) => (
            <div key={step} className="flex items-center gap-2">
              <div className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                {index + 1}. {pipelineLabels[step] ?? step}
              </div>
              {index < phases.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-slate-600" />}
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {(health?.flow ?? Object.keys(flowLabels)).map((step, index, all) => (
            <div key={step} className="flex items-center gap-2">
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-slate-300">
                {flowLabels[step] ?? step}
              </div>
              {index < all.length - 1 && <ArrowRight className="h-3 w-3 text-slate-700" />}
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
        <Panel padded>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-400/10">
              <ShieldAlert className="h-4 w-4 text-amber-200" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Adapter boundary</h2>
              <p className="text-sm text-slate-500">Local helpers do not replace the Block Prover.</p>
            </div>
          </div>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-slate-500">Preview prover</dt>
              <dd className="text-slate-200">{health?.adapters.preview.prover ?? "DeterministicMockProver"}</dd>
              <dd className="text-xs text-amber-200/80">{health?.adapters.preview.note}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Live Block Prover</dt>
              <dd className="text-slate-200">{health?.adapters.live.verifier}</dd>
              <dd className="text-xs text-emerald-200/80">{health?.adapters.live.note}</dd>
            </div>
          </dl>
        </Panel>

        <Panel padded>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-300/10">
              <Fingerprint className="h-4 w-4 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Preview query</h2>
              <p className="text-sm text-slate-500">Educational Merkle + continuity envelope. Not consensus.</p>
            </div>
          </div>
          <label className="mt-5 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Chain key
          </label>
          <Input
            value={chainKey}
            onChange={event => setChainKey(event.target.value)}
            placeholder="1"
            className="mt-2 bg-[#0b121d] text-white"
          />
          <label className="mt-4 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Transaction hash
          </label>
          <Input
            value={txHash}
            onChange={event => setTxHash(event.target.value)}
            placeholder="0x…"
            className="mt-2 bg-[#0b121d] font-mono text-xs text-white"
          />
          <p className="mt-2 text-xs leading-5 text-slate-500">
            Preview queries are identified by chain key + hash, then wrapped in a proof envelope before any decode.
          </p>
          <Button
            className="mt-4"
            disabled={preview.isPending}
            onClick={runPreview}
          >
            {preview.isPending ? "Proving…" : "Run preview proving flow"}
          </Button>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel padded>
          <h2 className="text-lg font-semibold text-white">Safety checks</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-400">
            <li>500 KB encoded-transaction guard</li>
            <li>Continuity-length cost estimate from the published CTC formula</li>
            <li>Freshness, deadline, replay, and receipt-success checks</li>
            <li>Decode runs only after verification</li>
          </ul>
        </Panel>

        <Panel padded accent={Boolean(result)}>
          <h2 className="text-lg font-semibold text-white">Last result</h2>
          {errorMessage && (
            <div className="mt-3 space-y-2">
              <p className="text-sm leading-6 text-rose-300">{errorMessage}</p>
              {queryError && !actionError && (
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 px-3 text-xs"
                  onClick={() => {
                    void healthQuery.refetch();
                    void costQuery.refetch();
                  }}
                >
                  Retry health check
                </Button>
              )}
            </div>
          )}
          {result && (
            <dl className="mt-3 grid gap-2 text-sm text-slate-300">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Request</dt>
                <dd className="truncate font-mono text-xs">{result.request.requestId}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Fingerprint</dt>
                <dd className="truncate font-mono text-xs">{result.envelope.fingerprint}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Risk</dt>
                <dd>
                  {result.decision.risk}
                  {result.educational ? " · educational" : ""}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Receipt</dt>
                <dd>{result.extraction.status === 1 ? "success (0x1)" : result.extraction.status}</dd>
              </div>
            </dl>
          )}
          {!result && !errorMessage && (
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Run a preview query to see the envelope fingerprint, risk class, and receipt guard.
            </p>
          )}
        </Panel>
      </div>
    </PageShell>
  );
}
