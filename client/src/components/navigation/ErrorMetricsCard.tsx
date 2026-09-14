import { useState } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { getErrorMetrics, resetErrorMetrics } from "@/hardening/errorMetrics";

export function ErrorMetricsCard() {
  const [, forceRefresh] = useState(0);
  const metrics = getErrorMetrics();

  return (
    <section className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-400/10"><AlertTriangle className="h-4 w-4 text-amber-300" /></div>
          <div className="text-sm font-semibold text-white">Client error metrics</div>
        </div>
        <button type="button" onClick={() => { resetErrorMetrics(); forceRefresh(value => value + 1); }} className="grid h-8 w-8 place-items-center rounded-lg text-slate-600 hover:bg-white/[0.03] hover:text-slate-300"><RotateCcw className="h-3.5 w-3.5" /></button>
      </div>
      <div className="mt-4 space-y-2">
        {metrics.length === 0 ? <div className="text-xs text-slate-700">No client errors recorded.</div> : metrics.slice(0, 8).map(metric => (
          <div key={metric.code} className="flex items-center gap-3 rounded-xl bg-white/[0.02] p-3 text-xs">
            <code className="flex-1 font-mono text-slate-500">{metric.code}</code>
            <span className="font-semibold text-amber-300">{metric.count}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
