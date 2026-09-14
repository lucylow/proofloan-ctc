import { BadgeCheck, GitBranch, ShieldCheck } from "lucide-react";
import { useOptionalMockAttestcoin } from "@/mock-attestcoin/hooks";
import { buildJudgeSummary } from "@/mock-attestcoin/presentation";

export function MockJudgeSummaryCard() {
  const mock = useOptionalMockAttestcoin();
  if (!mock) return null;

  const summary = buildJudgeSummary(mock.dataset);

  return (
    <section className="rounded-3xl border border-cyan-300/10 bg-cyan-300/[0.03] p-6">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-300/10">
          <BadgeCheck className="h-5 w-5 text-cyan-300" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
            Judge-mode summary
          </div>
          <div className="mt-1 text-xl font-semibold text-white">
            Presentation trust path for {summary.applicationId ?? "no application"}
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-600">
            {summary.note}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Metric label="Verified facts" value={String(summary.verifiedFacts)} />
        <Metric label="Preview facts" value={String(summary.previewFacts)} />
        <Metric label="Source chains" value={String(summary.chains.length)} />
      </div>

      <ol className="mt-5 grid gap-2 md:grid-cols-2">
        {summary.trustPath.map((step, index) => (
          <li
            key={step}
            className="flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-black/[0.08] p-4"
          >
            {index < 5 ? (
              <GitBranch className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
            ) : (
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
            )}
            <div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-slate-700">
                Stage {index + 1}
              </div>
              <div className="mt-1 text-sm text-slate-200">{step}</div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="text-[10px] uppercase tracking-[0.14em] text-slate-700">{label}</div>
      <div className="mt-1 font-mono text-lg text-white">{value}</div>
    </div>
  );
}
