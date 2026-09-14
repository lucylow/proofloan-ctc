import { Globe2 } from "lucide-react";
import type { AttestcoinFact, AttestcoinSourceChain } from "@shared/attestcoin";
import { ATTESTCOIN_SOURCE_CHAIN_NAMES, getSourceChainRecord } from "@shared/multichain";

export function CrossChainCoverage({
  facts,
}: {
  facts: AttestcoinFact[];
}) {
  const chains = new Set(facts.map(fact => fact.chain));

  return (
    <section className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-300/10">
          <Globe2 className="h-4 w-4 text-cyan-300" />
        </div>
        <div>
          <div className="text-sm font-semibold text-white">
            Cross-chain evidence coverage
          </div>
          <div className="mt-1 text-xs text-slate-600">
            Source chains contributing verified observations
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-3">
        {ATTESTCOIN_SOURCE_CHAIN_NAMES.map(chain => {
          const record = getSourceChainRecord(chain);
          const count = facts.filter(
            fact => fact.chain === chain,
          ).length;
          const active = chains.has(chain as AttestcoinSourceChain);
          return (
            <div
              key={chain}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">
                  {chain}
                  {record.support === "experimental" ? " · experimental" : ""}
                </span>
                <span className={active ? "text-emerald-300" : "text-slate-700"}>
                  {active ? `${count} facts` : "No facts"}
                </span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                <div
                  className="h-full rounded-full bg-cyan-300"
                  style={{ width: `${Math.min(100, count * 20)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
