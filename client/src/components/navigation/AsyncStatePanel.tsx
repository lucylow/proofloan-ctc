import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import type { AsyncStatus } from "@/hardening/types";

export function AsyncStatePanel({ status, message }: { status: AsyncStatus; message?: string }) {
  if (status === "pending") {
    return <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 text-xs text-slate-500"><Loader2 className="h-4 w-4 animate-spin text-cyan-300" />{message ?? "Working…"}</div>;
  }

  if (status === "error") {
    return <div role="alert" className="flex items-center gap-3 rounded-2xl border border-rose-400/10 bg-rose-400/[0.035] p-4 text-xs text-rose-200"><AlertTriangle className="h-4 w-4 shrink-0" />{message ?? "The operation failed."}</div>;
  }

  if (status === "success") {
    return <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.03] p-4 text-xs text-emerald-200"><CheckCircle2 className="h-4 w-4 shrink-0" />{message ?? "Completed successfully."}</div>;
  }

  return null;
}
