import { useMemo, useState } from "react";
import {
  Boxes,
  Fingerprint,
  KeyRound,
  Link2,
  Radio,
  Server,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import { PageShell } from "@/components/navigation/PageShell";
import { Panel } from "@/components/navigation/Panel";
import { StatCard } from "@/components/navigation/StatCard";
import { StatusPill } from "@/components/navigation/StatusPill";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { cleanProofLoanErrorMessage } from "@shared/proofloan";
import type { AttestorNetwork } from "@shared/attestorSettings";

const PLACEHOLDER_MNEMONIC =
  "one two three four five six seven eight nine ten eleven twelve";

const networks: Array<{ id: AttestorNetwork; label: string }> = [
  { id: "cc3-testnet", label: "CC3 Testnet" },
  { id: "cc3-mainnet", label: "CC3 Mainnet" },
];

export default function AttestorSettings() {
  const [network, setNetwork] = useState<AttestorNetwork>("cc3-testnet");
  const listQuery = trpc.attestorSettings.list.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });
  const factsQuery = trpc.attestorSettings.facts.useQuery(
    { network },
    { retry: false, refetchOnWindowFocus: false, staleTime: 60_000 },
  );
  const releaseQuery = trpc.attestorSettings.officialRelease.useQuery(
    { network },
    { retry: false, refetchOnWindowFocus: false, staleTime: 60_000 },
  );
  const yaml = trpc.attestorSettings.configYaml.useMutation();
  const lifecycleQuery = trpc.attestorSettings.lifecycle.useQuery(
    { network, status: "None", authorized: false },
    { retry: false, refetchOnWindowFocus: false, staleTime: 60_000 },
  );

  const facts = factsQuery.data;
  const selected = listQuery.data?.find(item => item.environment === network);
  const electionMode = facts?.electionMode ?? lifecycleQuery.data?.electionMode ?? "AuthorizedOnly";
  const queryError = firstQueryError(
    listQuery.error,
    factsQuery.error,
    releaseQuery.error,
    lifecycleQuery.error,
  );
  const config = useMemo(
    () => ({
      name: "proofloan-attestor",
      chainKey: selected?.chainKey ?? (network === "cc3-mainnet" ? 1 : 3),
      secret: PLACEHOLDER_MNEMONIC,
      apiPort: selected?.metricsPort ?? 9100,
      p2pPort: selected?.p2pPort ?? 9000,
      noMdns: true,
      bootNodes: [] as string[],
      ethUrl: "wss://eth.example",
      cc3Url: selected?.cc3RpcUrl ?? "wss://rpc.cc3-testnet.creditcoin.network",
    }),
    [network, selected],
  );

  return (
    <PageShell
      eyebrow="Attestcoin"
      title="Per-chain Attestor settings"
      description="Official CC3 Mainnet and Testnet Attestor operator settings for Ethereum Mainnet. Boot-node addresses and authorization data stay external."
      actions={
        <StatusPill
          label={electionMode}
          tone="amber"
          live
        />
      }
    >
      <div className="flex flex-wrap gap-2">
        {networks.map(item => (
          <Button
            key={item.id}
            variant={network === item.id ? "default" : "outline"}
            onClick={() => setNetwork(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {queryError ? (
        <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          <p>{queryError}</p>
          <button
            type="button"
            className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-rose-50 underline-offset-4 hover:underline"
            onClick={() => {
              void listQuery.refetch();
              void factsQuery.refetch();
              void releaseQuery.refetch();
              void lifecycleQuery.refetch();
            }}
          >
            Retry attestor settings
          </button>
        </div>
      ) : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Chain key"
          value={String(facts?.chainKey ?? selected?.chainKey ?? "—")}
          description="Ethereum Mainnet on this CC3 environment"
          icon={KeyRound}
        />
        <StatCard
          label="Release image"
          value={(facts?.release ?? selected?.releaseImage ?? "—").replace("gluwa/creditcoin3:", "")}
          description="Pinned gluwa/creditcoin3 tag"
          icon={Boxes}
        />
        <StatCard
          label="Election"
          value={electionMode}
          description="Authorization is required before register"
          icon={ShieldCheck}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel padded>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-300/10">
              <Radio className="h-4 w-4 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Official endpoints</h2>
              <p className="text-sm text-slate-500">Documented CC3 WebSocket, Proof Builder, and dashboard URLs.</p>
            </div>
          </div>
          <dl className="mt-4 space-y-3 text-sm">
            <InfoRow label="CC3 RPC" value={facts?.cc3 ?? selected?.cc3RpcUrl} />
            <InfoRow label="Proof Builder" value={facts?.links.proofBuilder ?? selected?.proofBuilderUrl} />
            <InfoRow label="Dashboard" value={facts?.links.dashboard ?? selected?.dashboardUrl} />
            <InfoRow label="Decoder" value={facts?.decoder ?? selected?.decoderContract} />
            <InfoRow label="Block Prover" value={facts?.blockProver ?? selected?.blockProverPrecompile} />
            <InfoRow label="ChainInfo" value={facts?.chainInfo ?? selected?.chainInfoPrecompile} />
          </dl>
        </Panel>

        <Panel padded>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-400/10">
              <ShieldAlert className="h-4 w-4 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Operator policy</h2>
              <p className="text-sm text-slate-500">Balance floors, bond, and lifecycle without invented secrets.</p>
            </div>
          </div>
          <dl className="mt-4 space-y-3 text-sm">
            <InfoRow label="Min free balance" value={`${facts?.costs.minimumFreeBalance ?? selected?.minFreeBalanceCtc ?? "1"} CTC`} />
            <InfoRow label="Recommended buffer" value={`${facts?.costs.recommendedFreeBalance ?? selected?.recommendedFreeBalanceCtc ?? "10"} CTC`} />
            <InfoRow label="Min bond" value={`${facts?.costs.minBond ?? selected?.minBondRequirementCtc ?? "—"} CTC`} />
            <InfoRow label="Unauthorized next action" value={lifecycleQuery.data?.actions.join(", ") ?? "authorize"} />
            <InfoRow label="P2P / metrics" value={`${selected?.p2pPort ?? 9000} / ${selected?.metricsPort ?? 9100}`} />
          </dl>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-400">
            {(facts?.notes ?? []).map(note => (
              <li key={note}>• {note}</li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel padded>
          <div className="flex items-center gap-3">
            <Server className="h-4 w-4 text-cyan-300" />
            <h2 className="text-lg font-semibold text-white">Operator config template</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            YAML uses the authoritative chain key. The mnemonic is a placeholder for preview only. Boot nodes remain an empty array until the Creditcoin team supplies one.
          </p>
          <Button
            className="mt-4"
            disabled={yaml.isPending || !selected}
            onClick={() => {
              if (!selected) return;
              yaml.mutate({ network, config });
            }}
          >
            {yaml.isPending ? "Generating…" : "Generate config YAML"}
          </Button>
          {yaml.error && (
            <p className="mt-3 text-sm text-rose-300">{cleanProofLoanErrorMessage(yaml.error.message)}</p>
          )}
          {yaml.data && (
            <pre className="mt-4 overflow-x-auto rounded-2xl bg-black/40 p-4 text-xs leading-6 text-cyan-100">
              {yaml.data}
            </pre>
          )}
        </Panel>

        <Panel padded accent={Boolean(releaseQuery.data)}>
          <div className="flex items-center gap-3">
            <Fingerprint className="h-4 w-4 text-cyan-300" />
            <h2 className="text-lg font-semibold text-white">Pinned Docker image</h2>
          </div>
          <p className="mt-3 font-mono text-sm text-slate-200">{releaseQuery.data?.image}</p>
          <pre className="mt-4 overflow-x-auto rounded-2xl bg-black/40 p-4 text-xs leading-6 text-slate-300">
            {releaseQuery.data?.docker ?? "Loading official docker run command…"}
          </pre>
          <div className="mt-4 flex items-start gap-2 text-sm leading-6 text-slate-500">
            <Link2 className="mt-0.5 h-4 w-4 shrink-0" />
            ProofLoan does not invent boot-node multiaddrs or operator authorization payloads.
          </div>
        </Panel>
      </div>
    </PageShell>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="truncate font-mono text-xs text-slate-200">{value ?? "—"}</dd>
    </div>
  );
}

function firstQueryError(...errors: Array<{ message?: string } | null | undefined>): string | undefined {
  for (const error of errors) {
    const message = error?.message?.trim();
    if (message) return cleanProofLoanErrorMessage(message);
  }
  return undefined;
}
