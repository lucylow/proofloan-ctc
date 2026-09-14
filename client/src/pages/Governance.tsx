import {
  ArrowRight,
  Ban,
  Gavel,
  Landmark,
  ShieldAlert,
  ShieldCheck,
  Timer,
} from "lucide-react";
import { useMemo, useState } from "react";

import { PageShell } from "@/components/navigation/PageShell";
import { Panel } from "@/components/navigation/Panel";
import { StatCard } from "@/components/navigation/StatCard";
import { StatusPill } from "@/components/navigation/StatusPill";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { cleanProofLoanErrorMessage } from "@shared/proofloan";
import type { AppRouter } from "../../../server/routers";
import type { inferRouterInputs } from "@trpc/server";

type DaoCreateInput = inferRouterInputs<AppRouter>["dao"]["createProposal"];

const pipelineLabels = [
  "Verified evidence",
  "ProofLoan AI",
  "RiskGuard",
  "DAO parameters",
  "Timelock",
  "Execution",
];

type Template = {
  key: string;
  kind: string;
  title: string;
  payload: Record<string, unknown>;
  actions: Array<{
    target: string;
    selector: string;
    params: Record<string, unknown>;
    value: string;
    description: string;
  }>;
};

function statusTone(status: string): "cyan" | "green" | "amber" | "red" | "slate" {
  if (status === "executed" || status === "passed") return "green";
  if (status === "active" || status === "queued") return "cyan";
  if (status === "rejected" || status === "cancelled" || status === "expired") return "red";
  if (status === "draft" || status === "executing") return "amber";
  return "slate";
}

function templateDescription(template: Template): string {
  try {
    return `Prototype proposal for ${template.kind}. ${JSON.stringify(template.payload)}`;
  } catch {
    return `Prototype proposal for ${template.kind}.`;
  }
}

function firstErrorMessage(...errors: Array<{ message?: string } | null | undefined>): string | undefined {
  for (const error of errors) {
    const message = error?.message?.trim();
    if (message) return cleanProofLoanErrorMessage(message);
  }
  return undefined;
}

export default function Governance() {
  const [templateKey, setTemplateKey] = useState("increase_evidence_floor-001");
  const [voter, setVoter] = useState("member-alice");
  const [choice, setChoice] = useState<"for" | "against" | "abstain">("for");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const summaryQuery = trpc.dao.summary.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const membersQuery = trpc.dao.members.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const proposalsQuery = trpc.dao.proposals.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const templatesQuery = trpc.dao.templates.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 60_000,
  });

  const invalidate = async () => {
    await Promise.all([summaryQuery.refetch(), membersQuery.refetch(), proposalsQuery.refetch()]);
  };

  const retryFailedQueries = () => {
    void summaryQuery.refetch();
    void membersQuery.refetch();
    void proposalsQuery.refetch();
    void templatesQuery.refetch();
  };

  const mutationHandlers = {
    onMutate: () => setActionError(null),
    onSuccess: () => {
      setActionError(null);
      void invalidate();
    },
    onError: (error: { message?: string }) => {
      setActionError(firstErrorMessage(error) ?? "Governance action failed.");
    },
  };

  const createProposal = trpc.dao.createProposal.useMutation(mutationHandlers);
  const activate = trpc.dao.activate.useMutation(mutationHandlers);
  const vote = trpc.dao.vote.useMutation(mutationHandlers);
  const finalize = trpc.dao.finalize.useMutation(mutationHandlers);
  const queue = trpc.dao.queue.useMutation(mutationHandlers);
  const execute = trpc.dao.execute.useMutation(mutationHandlers);
  const cancel = trpc.dao.cancel.useMutation(mutationHandlers);
  const advance = trpc.dao.advance.useMutation(mutationHandlers);

  const templates = (templatesQuery.data ?? []) as Template[];
  const selectedTemplate = templates.find(item => item.key === templateKey) ?? templates[0];
  const proposals = proposalsQuery.data ?? [];
  const selected = proposals.find(proposal => proposal.id === selectedId) ?? proposals[0];
  const summary = summaryQuery.data;
  const catalogError = firstErrorMessage(summaryQuery.error, membersQuery.error, proposalsQuery.error, templatesQuery.error);
  const errorMessage = actionError ?? catalogError;
  const busy =
    createProposal.isPending ||
    activate.isPending ||
    vote.isPending ||
    finalize.isPending ||
    queue.isPending ||
    execute.isPending ||
    cancel.isPending ||
    advance.isPending;
  const canCreate = Boolean(selectedTemplate?.key && selectedTemplate.actions?.length) && !busy && !templatesQuery.isError;

  const constitutionEntries = useMemo(
    () => Object.entries(summary?.constitution ?? {}),
    [summary],
  );

  return (
    <PageShell
      eyebrow="Protocol"
      title="DAO governance"
      description="Govern RiskGuard, AI, Attestor, and ATC parameters. The DAO cannot mint evidence, cannot make AI output authoritative, and cannot disable RiskGuard through a standard proposal."
      actions={
        <StatusPill
          label={summary ? `${summary.proposalCount} proposals` : "Prototype"}
          tone="amber"
          live
        />
      }
    >
      <div className="flex flex-wrap gap-2">
        {pipelineLabels.map((label, index) => (
          <div
            key={label}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300"
          >
            <span className="font-semibold text-cyan-300">{index + 1}</span>
            {label}
            {index < pipelineLabels.length - 1 ? <ArrowRight className="h-3 w-3 text-slate-500" /> : null}
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Members"
          value={String(summary?.members ?? "—")}
          description="Seeded prototype voters"
          icon={Landmark}
        />
        <StatCard
          label="Active"
          value={String(summary?.active ?? 0)}
          description="Proposals in the voting window"
          icon={Gavel}
        />
        <StatCard
          label="Queued"
          value={String(summary?.queued ?? 0)}
          description="Waiting on timelock"
          icon={Timer}
        />
        <StatCard
          label="Executed"
          value={String(summary?.executed ?? 0)}
          description="Dry-run chain receipts"
          icon={ShieldCheck}
        />
      </div>

      {catalogError ? (
        <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          <p>Governance data could not be loaded. Proposal actions stay disabled until this recovers.</p>
          <button
            type="button"
            onClick={retryFailedQueries}
            className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-rose-50 underline-offset-4 hover:underline"
          >
            Retry governance
          </button>
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel padded>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-300/10">
              <Gavel className="h-4 w-4 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Create a parameter proposal</h2>
              <p className="text-sm text-slate-400">
                Templates are deterministic ProofLoan scenarios. Execution stays a dry-run unless wired to audited contracts.
              </p>
            </div>
          </div>

          <label className="mt-5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Template
          </label>
          <select
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white"
            value={selectedTemplate?.key ?? ""}
            onChange={event => setTemplateKey(event.target.value)}
            disabled={templatesQuery.isError || busy}
          >
            {templates.length === 0 ? <option value="">No templates available</option> : null}
            {templates.map(template => (
              <option key={template.key} value={template.key}>
                {template.kind} · {template.title.replace("ProofLoan governance scenario: ", "")}
              </option>
            ))}
          </select>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              disabled={!canCreate}
              onClick={() => {
                if (!selectedTemplate?.actions?.length) return;
                const title = selectedTemplate.title.trim().slice(0, 160);
                if (title.length < 5) return;
                createProposal.mutate({
                  proposer: "member-alice",
                  title,
                  description: templateDescription(selectedTemplate),
                  kind: selectedTemplate.kind as DaoCreateInput["kind"],
                  snapshotBlock: 1,
                  actions: selectedTemplate.actions,
                });
              }}
            >
              {createProposal.isPending ? "Creating…" : "Create proposal"}
            </Button>
            <Button variant="outline" disabled={busy} onClick={() => advance.mutate({ seconds: 3600 })}>
              Advance 1 hour
            </Button>
            <Button variant="outline" disabled={busy} onClick={() => advance.mutate({ seconds: 86400 })}>
              Advance 1 day
            </Button>
            <Button variant="outline" disabled={busy} onClick={() => advance.mutate({ seconds: 259200 })}>
              Advance 3 days
            </Button>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Governance clock: {summary?.now ?? "—"}. Voting delay is one hour, voting lasts three days, and standard execution is timelocked for one day.
          </p>
          {errorMessage ? (
            <p className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {errorMessage}
            </p>
          ) : null}
        </Panel>

        <Panel padded>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-300/10">
              <ShieldAlert className="h-4 w-4 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Constitutional invariants</h2>
              <p className="text-sm text-slate-400">Standard governance cannot cross the evidence / RiskGuard boundary.</p>
            </div>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            {constitutionEntries.length === 0 ? (
              <li className="rounded-xl bg-white/5 px-3 py-2 text-slate-400">Constitutional rules are unavailable until governance summary loads.</li>
            ) : (
              constitutionEntries.map(([key, value]) => (
                <li key={key} className="flex items-start justify-between gap-3 rounded-xl bg-white/5 px-3 py-2">
                  <span>{key}</span>
                  <span className="font-mono text-xs text-cyan-300">{String(value)}</span>
                </li>
              ))
            )}
          </ul>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel padded>
          <h2 className="text-lg font-semibold text-white">Members</h2>
          <div className="mt-4 space-y-2">
            {(membersQuery.data ?? []).length === 0 ? (
              <p className="text-sm text-slate-400">
                {membersQuery.isError ? "Members could not be loaded." : "No members are seeded in this prototype."}
              </p>
            ) : (
              (membersQuery.data ?? []).map(member => (
              <button
                key={member.address}
                type="button"
                onClick={() => setVoter(member.address)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm ${
                  voter === member.address ? "bg-cyan-300/15 text-white" : "bg-white/5 text-slate-300"
                }`}
              >
                <span>
                  {member.address}
                  <span className="ml-2 text-xs uppercase tracking-wide text-slate-500">{member.role}</span>
                </span>
                <span className="font-mono text-xs">{member.votingPower}</span>
              </button>
              ))
            )}
          </div>
        </Panel>

        <Panel padded>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">Proposals</h2>
            {selected ? <StatusPill label={selected.status} tone={statusTone(selected.status)} /> : null}
          </div>

          <div className="mt-4 space-y-2">
            {proposalsQuery.isError ? (
              <p className="text-sm text-slate-400">Proposals could not be loaded.</p>
            ) : proposals.length === 0 ? (
              <p className="text-sm text-slate-400">No proposals yet. Create one from a ProofLoan template.</p>
            ) : (
              proposals.map(proposal => (
                <button
                  key={proposal.id}
                  type="button"
                  onClick={() => setSelectedId(proposal.id)}
                  className={`w-full rounded-xl px-3 py-3 text-left ${
                    selected?.id === proposal.id ? "bg-cyan-300/15" : "bg-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-white">{proposal.title}</div>
                    <span className="text-xs uppercase tracking-wide text-slate-500">{proposal.kind}</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {proposal.status} · quorum {proposal.quorumBps / 100}% · approval {proposal.approvalBps / 100}%
                  </div>
                </button>
              ))
            )}
          </div>

          {selected ? (
            <div className="mt-5 space-y-3">
              <div className="flex flex-wrap gap-2">
                {(["for", "against", "abstain"] as const).map(item => (
                  <Button
                    key={item}
                    size="sm"
                    variant={choice === item ? "default" : "outline"}
                    disabled={busy}
                    onClick={() => setChoice(item)}
                  >
                    {item}
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" disabled={busy} onClick={() => activate.mutate({ id: selected.id })}>
                  Activate
                </Button>
                <Button size="sm" disabled={busy || !voter} onClick={() => vote.mutate({ id: selected.id, voter, choice, reason: "workspace vote" })}>
                  Vote as {voter}
                </Button>
                <Button size="sm" variant="outline" disabled={busy} onClick={() => finalize.mutate({ id: selected.id })}>
                  Finalize
                </Button>
                <Button size="sm" variant="outline" disabled={busy} onClick={() => queue.mutate({ id: selected.id })}>
                  Queue
                </Button>
                <Button size="sm" variant="outline" disabled={busy} onClick={() => execute.mutate({ id: selected.id })}>
                  {execute.isPending ? "Executing…" : "Execute"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => cancel.mutate({ id: selected.id, actor: "guardian-proofloan" })}
                >
                  <Ban className="mr-1 h-3.5 w-3.5" />
                  Guardian cancel
                </Button>
              </div>
              <p className="text-xs leading-5 text-slate-500">
                Voting window {selected.startAt} → {selected.endAt}
                {selected.eta ? ` · timelock ETA ${selected.eta}` : ""}
                {selected.executionHash ? ` · ${selected.executionHash}` : ""}
              </p>
              {typeof selected.metadata?.lastExecutionError === "string" && selected.metadata.lastExecutionError ? (
                <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                  Last execution error: {selected.metadata.lastExecutionError}
                </p>
              ) : null}
            </div>
          ) : null}
        </Panel>
      </div>
    </PageShell>
  );
}
