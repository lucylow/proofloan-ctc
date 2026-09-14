import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import type { AttestcoinProofProgress as Progress } from "@/attestcoin/types";

export function ProofProgress({
  progress,
}: {
  progress: Progress;
}) {
  const running =
    progress.state === "validating" ||
    progress.state === "fetching" ||
    progress.state === "verifying";

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-300/10">
          {running ? (
            <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
          ) : progress.state === "error" ? (
            <AlertTriangle className="h-4 w-4 text-amber-300" />
          ) : progress.state === "complete" || progress.state === "preview" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
          ) : (
            <span className="h-2 w-2 rounded-full bg-slate-600" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium text-slate-200">
            {progress.label}
          </div>

          <div className="mt-1 truncate text-[10px] text-slate-700">
            {progress.requestId ?? "No active request"}
          </div>
        </div>

        <span className="font-mono text-[10px] text-slate-600">
          {progress.progress}%
        </span>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
        <div
          className="h-full rounded-full bg-cyan-300 transition-[width] duration-300"
          style={{ width: `${progress.progress}%` }}
        />
      </div>

      {progress.error && (
        <div className="mt-3 rounded-xl border border-amber-400/10 bg-amber-400/[0.035] p-3 text-xs leading-5 text-amber-200">
          {progress.error.message}
        </div>
      )}
    </div>
  );
}
