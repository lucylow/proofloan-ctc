import { CheckCircle2, ExternalLink, FileCheck2 } from "lucide-react";
import { getMockChain } from "@/mock-attestcoin/chainCatalog";
import { ProtocolBadge } from "./ProtocolBadge";
import type { MockVerifiedFact } from "@/mock-attestcoin/types";

export function MockFactsPanel({
  facts,
}: {
  facts: MockVerifiedFact[];
}) {
  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-white">
              Presentation facts
            </div>
            <div className="mt-1 text-xs text-slate-600">
              Mock Attestcoin records, including chains outside the live Sepolia/Amoy prove path.
            </div>
          </div>
          <div className="font-mono text-xs text-cyan-300">
            {facts.length} facts
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          {facts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/[0.08] p-8 text-center text-xs text-slate-600">
              No presentation facts are attached to this application.
            </div>
          ) : (
            facts.map(fact => (
              <MockVerifiedFactCard key={fact.id} fact={fact} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function MockVerifiedFactCard({ fact }: { fact: MockVerifiedFact }) {
  const chain = getMockChain(fact.chainId);
  const amountLabel = `${fact.amount} ${fact.asset}`;

  return (
    <article className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cyan-300/10">
          <FileCheck2 className="h-4 w-4 text-cyan-300" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-slate-300">
              {fact.id}
            </span>
            <ProtocolBadge live={false} />
            <span className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[10px] text-slate-500">
              {fact.chainName}
            </span>
          </div>
          <div className="mt-2 break-all font-mono text-[10px] text-slate-600">
            {fact.txHash}
          </div>
        </div>
        <CheckCircle2 className={`h-4 w-4 shrink-0 ${fact.sourceVerified ? "text-emerald-300" : "text-violet-300"}`} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Fact label="Event" value={fact.eventType} />
        <Fact label="Amount" value={amountLabel} />
        <Fact label="Source block" value={String(fact.sourceBlock)} />
        <Fact label="Freshness" value={fact.freshness} />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.05] pt-3 text-[10px]">
        <span className="text-slate-700">
          {fact.sourceVerified ? `Verified at block ${fact.verificationBlock}` : "Preview fact · not live-verified"}
        </span>
        <a
          href={`${chain.explorerTx}${fact.txHash}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-cyan-300"
        >
          Source explorer
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/[0.03] p-3">
      <div className="text-[9px] uppercase tracking-[0.14em] text-slate-700">
        {label}
      </div>
      <div className="mt-1 truncate text-[11px] text-slate-300">
        {value}
      </div>
    </div>
  );
}
