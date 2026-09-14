import { AlertTriangle, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { normalizeAppError } from "@/hardening/appError";
import { navigateSafely } from "@/hardening/safeNavigation";

export function RecoveryRoute({ error }: { error: unknown }) {
  const [, navigate] = useLocation();
  const normalized = normalizeAppError(error);

  return (
    <main className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-400/10">
        <AlertTriangle className="h-6 w-6 text-rose-300" />
      </div>
      <div className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-rose-300">Recovery required</div>
      <h1 className="mt-2 text-xl font-bold text-white">This action could not be completed.</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">{normalized.userMessage}</p>
      <div className="mt-6 flex justify-center gap-2">
        <Button variant="outline" className="rounded-xl" onClick={() => window.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button className="rounded-xl bg-cyan-300 text-slate-950 hover:bg-cyan-200" onClick={() => navigateSafely(navigate, "/dashboard")}>
          Retry
        </Button>
      </div>
    </main>
  );
}
