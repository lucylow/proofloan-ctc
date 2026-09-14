import { Globe2 } from "lucide-react";
import { MOCK_CHAINS } from "@/mock-attestcoin/chainCatalog";
import type { MockDataset } from "@/mock-attestcoin/types";

export function MockCrossChainCoverage({
  dataset,
  applicationId,
}: {
  dataset: MockDataset;
  applicationId?: string;
}) {
  const facts = applicationId
    ? dataset.facts.filter(fact => fact.applicationId === applicationId)
    : dataset.facts;

  return (
    <section className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-300/10">
          <Globe2 className="h-4 w-4 text-cyan-300" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white">
            Presentation source-chain coverage
          </div>
          <div className="mt-1 text-xs text-slate-600">
            Five mock chains for demo screens only. Live proofs still require Creditcoin verification.
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {MOCK_CHAINS.map(chain => {
          const count = facts.filter(fact => fact.chainId === chain.id).length;
          const verified = facts.filter(fact => fact.chainId === chain.id && fact.sourceVerified).length;
          return (
            <div
              key={chain.id}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-slate-300">
                  {chain.name}
                </span>
                <span className={count > 0 ? "text-emerald-300" : "text-slate-700"}>
                  {count > 0 ? `${count} facts` : "No facts"}
                </span>
              </div>
              <div className="mt-2 text-[10px] text-slate-600">
                {verified} verified · {count - verified} preview
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                <div
                  className="h-full rounded-full bg-cyan-300"
                  style={{ width: `${Math.min(100, count * 12)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
