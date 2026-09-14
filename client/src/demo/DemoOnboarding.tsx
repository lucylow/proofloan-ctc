import {
  ArrowRight,
  CheckCircle2,
  Wallet,
} from "lucide-react";

import { Link } from "wouter";

import { useDemo } from "./DemoProvider";

export function DemoOnboarding() {
  const { data } = useDemo();

  const hasWallet =
    data.wallets.some(
      wallet => wallet.connected,
    );

  const hasEvidence =
    data.evidence.length > 0;

  const hasDecision =
    data.decisions.length > 0;

  const steps = [
    {
      title: "Wallet connected",
      done: hasWallet,
    },
    {
      title: "Evidence available",
      done: hasEvidence,
    },
    {
      title: "Underwriting generated",
      done: hasDecision,
    },
  ];

  if (steps.every(step => step.done)) {
    return null;
  }

  return (
    <section className="pl-panel rounded-3xl p-6">
      <div className="flex items-center gap-3">
        <div className="pl-icon-well">
          <Wallet className="h-4 w-4" />
        </div>

        <div>
          <div className="text-sm font-semibold text-white">
            Demo onboarding
          </div>

          <div className="mt-1 text-xs text-slate-500">
            A complete user journey is pre-seeded.
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {steps.map(step => (
          <div
            key={step.title}
            className="flex items-center gap-3"
          >
            <CheckCircle2
              className={[
                "h-4 w-4",
                step.done
                  ? "text-emerald-300"
                  : "text-slate-600",
              ].join(" ")}
            />

            <span className={step.done ? "text-xs text-slate-300" : "text-xs text-slate-500"}>
              {step.title}
            </span>
          </div>
        ))}
      </div>

      <Link
        href="/borrow"
        className="mt-6 inline-flex items-center text-xs font-semibold text-cyan-300 hover:text-cyan-200"
      >
        Continue application
        <ArrowRight className="ml-2 h-3.5 w-3.5" />
      </Link>
    </section>
  );
}
