import { CheckCircle2, Circle, Loader2 } from "lucide-react";

const stages = [
  ["Source block located", "Fetch the transaction and its mined block."],
  ["Block attestation available", "Wait until the source block can be proven."],
  ["Proof generated", "Receive Merkle and continuity proof material."],
  ["Creditcoin verified", "Validate the proof with the Block Prover."],
  ["Facts admitted", "Only verified fields enter the credit evidence boundary."],
] as const;

export function AttestcoinTrace({
  current = 4,
}: {
  current?: number;
}) {
  return (
    <section className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5">
      <div className="text-sm font-semibold text-white">
        Attestcoin proof trace
      </div>
      <div className="mt-1 text-xs text-slate-600">
        Visible protocol lifecycle for the judge
      </div>

      <div className="mt-6 space-y-4">
        {stages.map(([title, description], index) => {
          const complete = index < current;
          const active = index === current;

          return (
            <div key={title} className="flex gap-3">
              <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/[0.07] bg-black/10">
                {complete ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                ) : active ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-300" />
                ) : (
                  <Circle className="h-3 w-3 text-slate-700" />
                )}
              </div>
              <div>
                <div className="text-xs font-medium text-slate-300">
                  {title}
                </div>
                <div className="mt-1 text-[11px] leading-5 text-slate-600">
                  {description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
