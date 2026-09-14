import {
  ArrowRight,
  DatabaseZap,
  ShieldCheck,
} from "lucide-react";

export function ProofBoundaryCard() {
  const stages = [
    "Source chain",
    "Attestcoin attestation",
    "Merkle proof",
    "Creditcoin verification",
    "Verified fact",
  ];

  return (
    <section className="rounded-3xl border border-cyan-300/10 bg-cyan-300/[0.03] p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-300/10">
          <DatabaseZap className="h-4 w-4 text-cyan-300" />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
            Trust boundary
          </div>
          <div className="mt-1 text-sm font-semibold text-white">
            Raw RPC data never becomes financial truth by itself.
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2 md:flex-row md:items-center">
        {stages.map((stage, index) => (
          <div
            key={stage}
            className="flex flex-1 items-center gap-2"
          >
            <div className="flex min-h-11 flex-1 items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-300" />
              <span className="text-[10px] text-slate-400">
                {stage}
              </span>
            </div>
            {index < stages.length - 1 && (
              <ArrowRight className="hidden h-3.5 w-3.5 shrink-0 text-slate-700 md:block" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
