import {
  CheckCircle2,
  ExternalLink,
  FileCheck2,
} from "lucide-react";

import type { AttestcoinFact } from "@shared/attestcoin";
import { getExplorerTxUrl } from "@shared/multichain";
import { ProtocolBadge } from "./ProtocolBadge";

export function VerifiedFactCard({
  fact,
}: {
  fact: AttestcoinFact;
}) {
  const amountLabel = fact.amount.includes(fact.asset)
    ? fact.amount
    : `${fact.amount} ${fact.asset}`;

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

            <ProtocolBadge live={fact.sourceVerified} />
          </div>

          <div className="mt-2 break-all font-mono text-[10px] text-slate-600">
            {fact.txHash}
          </div>
        </div>

        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Fact label="Event" value={fact.eventType} />
        <Fact label="Amount" value={amountLabel} />
        <Fact label="Source block" value={String(fact.sourceBlock)} />
        <Fact label="Freshness" value={fact.freshness} />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.05] pt-3 text-[10px]">
        <span className="text-slate-700">
          Verified at block {fact.verificationBlock}
        </span>

        <a
          href={getExplorerTxUrl(fact.chain, fact.txHash)}
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
