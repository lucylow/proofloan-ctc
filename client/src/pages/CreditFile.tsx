import {
  ArrowRight,
  CheckCircle2,
  Info,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import { Link } from "wouter";

import { PageShell } from "@/components/navigation/PageShell";
import { ScoreRing } from "@/components/navigation/ScoreRing";
import { StatCard } from "@/components/navigation/StatCard";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { useDemo } from "@/demo/DemoProvider";
import { CreditHealthCard } from "@/demo/CreditHealthCard";

export default function CreditFile() {
  const { data } = useDemo();
  const { creditFile } = data;

  return (
    <PageShell
      eyebrow="Credit"
      title="Your verified credit file"
      description="A human-readable representation of the evidence and features currently available to ProofLoan underwriting."
      actions={
        <>
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() =>
              toast.message("Credit file is current", {
                description:
                  "This presentation snapshot is already loaded. Refresh never starts a new proof request.",
              })
            }
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>

          <Button
            asChild
            className="rounded-xl bg-cyan-300 text-slate-950 hover:bg-cyan-200"
          >
            <Link href="/borrow">
              Borrow
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </>
      }
    >
      <section className="pl-panel pl-panel-accent mb-6 flex flex-col items-start gap-6 rounded-[28px] p-6 sm:flex-row sm:items-center">
        <ScoreRing
          value={creditFile.score || 0}
          caption={`Tier ${creditFile.riskTier}`}
        />
        <div className="min-w-0">
          <div className="pl-kicker">Verified profile</div>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white">
            {creditFile.score || "—"} credit score
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
            {creditFile.confidence}% confidence from {creditFile.totalEvidence} verified facts.
            Freshness score {creditFile.freshnessScore} with {creditFile.repaymentCount} documented repayments.
          </p>
          <div className="mt-4 inline-flex rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-slate-300">
            {creditFile.score >= 740
              ? "Strong verified profile"
              : creditFile.score >= 670
                ? "Eligible with bounded terms"
                : creditFile.score >= 580
                  ? "Review-sensitive profile"
                  : "Limited verified history"}
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Risk tier"
          value={creditFile.riskTier}
          description="Moderate-low risk"
          icon={ShieldCheck}
        />

        <StatCard
          label="Confidence"
          value={`${creditFile.confidence || 0}%`}
          description="Model confidence"
          icon={TrendingUp}
        />

        <StatCard
          label="Freshness"
          value={String(creditFile.freshnessScore)}
          description="Evidence freshness score"
          icon={RefreshCw}
        />

        <StatCard
          label="Verified facts"
          value={String(creditFile.totalEvidence)}
          description={`${creditFile.freshEvidence} fresh · ${creditFile.staleEvidence} aging`}
          icon={CheckCircle2}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="pl-panel rounded-3xl p-6">
          <div className="text-sm font-semibold text-white">
            Repayment profile
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/[0.05] bg-white/[0.03] p-4">
              <div className="text-xs text-slate-500">
                Repayments
              </div>
              <div className="mt-2 text-2xl font-extrabold text-white">
                {creditFile.repaymentCount}
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.05] bg-white/[0.03] p-4">
              <div className="text-xs text-slate-500">
                Late payments
              </div>
              <div className="mt-2 text-2xl font-extrabold text-white">
                {creditFile.latePaymentCount}
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.05] bg-white/[0.03] p-4">
              <div className="text-xs text-slate-500">
                Wallet age
              </div>
              <div className="mt-2 text-2xl font-extrabold text-white">
                {creditFile.walletAgeDays}d
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.05] bg-white/[0.03] p-4">
              <div className="text-xs text-slate-500">
                Leverage
              </div>
              <div className="mt-2 text-2xl font-extrabold text-white">
                {Math.round(creditFile.leverageRatio * 100)}%
              </div>
            </div>
          </div>
        </section>

        <CreditHealthCard />
      </div>

      <section className="pl-panel pl-panel-accent mt-6 p-6">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-4 w-4 text-cyan-300" />

          <div>
            <div className="text-sm font-semibold text-white">
              Why this profile is eligible
            </div>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              ProofLoan detected a strong repayment history,
              relatively low leverage, and sufficient fresh
              evidence for preliminary underwriting.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {[
            "Strong repayment history",
            "Low leverage ratio",
            "Sufficient evidence coverage",
            "Fresh evidence available",
          ].map(reason => (
            <div
              key={reason}
              className="flex items-center gap-3 text-sm text-slate-300"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              {reason}
            </div>
          ))}
        </div>
      </section>

      <section className="pl-panel mt-6 p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-white">
              Evidence quality
            </div>

            <div className="mt-1 text-xs text-slate-600">
              Freshness and coverage by verification domain
            </div>
          </div>

          <Button asChild variant="ghost" className="rounded-xl">
            <Link href="/evidence">
              Inspect evidence
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <div className="mt-6 space-y-4">
          {([
            ["Repayment history", Math.min(100, creditFile.repaymentCount * 4)],
            ["Collateral activity", Math.round(creditFile.evidenceCoverage * 100)],
            ["Wallet age", creditFile.walletAgeDays > 0 ? 100 : 0],
            ["Transaction volume", creditFile.freshnessScore],
          ] as Array<[string, number]>).map(([label, value]) => (
            <div key={label}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  {label}
                </span>

                <span className="font-mono text-slate-600">
                  {value}%
                </span>
              </div>

              <div className="pl-progress mt-2">
                <div
                  className="pl-progress-fill"
                  style={{
                    width: `${value}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
