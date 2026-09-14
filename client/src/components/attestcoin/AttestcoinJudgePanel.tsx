import { BadgeCheck, Code2, DatabaseZap, ShieldCheck } from "lucide-react";

export function AttestcoinJudgePanel() {
  const items = [
    ["Read cross-chain data", "Source transactions are proven into Creditcoin."],
    ["Verify before inference", "Raw RPC responses are not admitted as facts."],
    ["Preserve provenance", "Source block, verification block and proof root travel with each fact."],
    ["Bind underwriting", "The evidence root feeds the feature and decision fingerprint."],
  ];

  return (
    <section className="rounded-3xl border border-cyan-300/10 bg-cyan-300/[0.03] p-6">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-300/10">
          <BadgeCheck className="h-5 w-5 text-cyan-300" />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
            Attestcoin Protocol integration
          </div>
          <div className="mt-1 text-xl font-semibold text-white">
            Protocol usage is visible, not decorative.
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {items.map(([title, description], index) => (
          <div key={title} className="rounded-2xl border border-white/[0.06] bg-black/[0.08] p-4">
            {index === 0 ? <DatabaseZap className="h-4 w-4 text-cyan-300" /> : index === 1 ? <ShieldCheck className="h-4 w-4 text-cyan-300" /> : <Code2 className="h-4 w-4 text-cyan-300" />}
            <div className="mt-3 text-sm font-medium text-white">{title}</div>
            <p className="mt-1 text-xs leading-5 text-slate-600">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
