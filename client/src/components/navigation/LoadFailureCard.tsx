import { AlertOctagon } from "lucide-react";
import { RetryButton } from "./RetryButton";
import type { NormalizedAppError } from "@/hardening/types";

export function LoadFailureCard({ error, onRetry }: { error: NormalizedAppError; onRetry: () => void }) {
  return (
    <section role="alert" className="rounded-3xl border border-rose-400/10 bg-rose-400/[0.03] p-6">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-400/10">
          <AlertOctagon className="h-4 w-4 text-rose-300" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-white">Unable to load this section</div>
          <p className="mt-1 text-xs leading-5 text-slate-600">{error.userMessage}</p>
          {error.retryable && <div className="mt-4"><RetryButton onRetry={onRetry} /></div>}
        </div>
      </div>
    </section>
  );
}
