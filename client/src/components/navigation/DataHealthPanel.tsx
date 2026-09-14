import { AlertTriangle, CheckCircle2, Database, ShieldCheck } from "lucide-react";
import type { DemoDataSet } from "@/demo/types";
import { inspectDemoReferences } from "@/demo/validation/referenceIntegrity";

export function DataHealthPanel({ data }: { data: DemoDataSet }) {
  const issues = inspectDemoReferences(data);
  const healthy = issues.length === 0;

  return (
    <section className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.03]">
          <Database className="h-4 w-4 text-cyan-300" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-white">Data integrity</div>
          <div className="mt-1 text-xs text-slate-600">Cross-checks between applications, evidence, decisions and offers.</div>
        </div>
        {healthy ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <AlertTriangle className="h-4 w-4 text-amber-300" />}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Applications" value={data.applications.length} />
        <Metric label="Evidence" value={data.evidence.length} />
        <Metric label="Decisions" value={data.decisions.length} />
        <Metric label="Offers" value={data.offers.length} />
      </div>

      {!healthy && (
        <div className="mt-4 rounded-xl border border-amber-400/10 bg-amber-400/[0.03] p-3">
          {issues.slice(0, 3).map(issue => (
            <div key={`${issue.code}:${issue.message}`} className="flex gap-2 text-[11px] text-amber-200/80">
              <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0" />
              {issue.message}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white/[0.03] p-3">
      <div className="text-[10px] uppercase tracking-wider text-slate-600">{label}</div>
      <div className="mt-1 text-lg font-bold text-white">{value}</div>
    </div>
  );
}
