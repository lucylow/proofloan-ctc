import type { AttestcoinFact } from "@shared/attestcoin";
import { VerifiedFactCard } from "./VerifiedFactCard";
import { ProofBoundaryCard } from "./ProofBoundaryCard";

export function AttestcoinFactsPanel({
  facts,
}: {
  facts: AttestcoinFact[];
}) {
  return (
    <section className="space-y-4">
      <ProofBoundaryCard />

      <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5 sm:p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-white">
              Verified cross-chain facts
            </div>
            <div className="mt-1 text-xs text-slate-600">
              Facts admitted to the underwriting evidence boundary
            </div>
          </div>
          <div className="font-mono text-xs text-cyan-300">
            {facts.length} facts
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          {facts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/[0.08] p-8 text-center text-xs text-slate-600">
              No verified facts are attached to this application.
            </div>
          ) : (
            facts.map(fact => (
              <VerifiedFactCard key={fact.id} fact={fact} />
            ))
          )}
        </div>
      </div>
    </section>
  );
}
