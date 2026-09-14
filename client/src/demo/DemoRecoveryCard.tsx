import {
  AlertTriangle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

import { Link } from "wouter";

import { useDemo } from "./DemoProvider";

import { Button } from "@/components/ui/button";

export function DemoRecoveryCard() {
  const { scenario } = useDemo();

  if (scenario !== "error-recovery" && scenario !== "recovery") {
    return null;
  }

  return (
    <section className="rounded-3xl border border-amber-400/10 bg-amber-400/[0.035] p-6">
      <div className="flex items-start gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-amber-400/10">
          <AlertTriangle className="h-5 w-5 text-amber-300" />
        </div>

        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">
            Recovery mode
          </div>

          <h2 className="mt-2 text-lg font-semibold text-white">
            Verification service is degraded
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            The demo intentionally simulates a slow proof verifier.
            Existing application identifiers remain preserved while
            the interface communicates a retryable state.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() =>
                window.location.reload()
              }
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>

            <Button
              asChild
              variant="ghost"
              className="rounded-xl text-cyan-300"
            >
              <Link href="/support">
                Recovery guide
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
