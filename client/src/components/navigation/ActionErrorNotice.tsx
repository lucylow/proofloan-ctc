import { AlertCircle, RefreshCw } from "lucide-react";
import type { NormalizedAppError } from "@/hardening/types";

export function ActionErrorNotice({ error, onRetry }: { error: NormalizedAppError | null; onRetry?: () => void }) {
  if (!error) return null;

  return (
    <div role="alert" className="rounded-2xl border border-rose-400/10 bg-rose-400/[0.035] p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-rose-200">{error.userMessage}</div>
          {error.retryable && onRetry && (
            <button type="button" onClick={onRetry} className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-[11px] text-slate-300 hover:bg-white/[0.03]">
              <RefreshCw className="h-3 w-3" />
              Retry action
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
