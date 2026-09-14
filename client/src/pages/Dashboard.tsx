import {
  Activity,
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  FileCheck2,
  Gauge,
} from "lucide-react";

import { Link } from "wouter";

import { PageShell } from "@/components/navigation/PageShell";
import { Panel } from "@/components/navigation/Panel";
import { StatCard } from "@/components/navigation/StatCard";
import { StatusPill } from "@/components/navigation/StatusPill";
import { CreditPositionHero } from "@/components/navigation/CreditPositionHero";
import { QuickActions } from "@/components/navigation/QuickActions";
import { getApplicationNextStep, getApplicationStateMeta } from "@/navigation/applicationState";

import { Button } from "@/components/ui/button";

import { MockHealthStrip } from "@/components/attestcoin/MockHealthStrip";
import { useDemo } from "@/demo/DemoProvider";
import { WalletOverview } from "@/demo/WalletOverview";
import { DemoOnboarding } from "@/demo/DemoOnboarding";
import { CreditHealthCard } from "@/demo/CreditHealthCard";
import { ActivityStream } from "@/demo/ActivityStream";
import { SystemHealth } from "@/demo/SystemHealth";
import { DemoRecoveryCard } from "@/demo/DemoRecoveryCard";
import { relativeTime } from "@/demo/useDemoClock";

export default function Dashboard() {
  const { data } = useDemo();

  const {
    applications,
    portfolio,
    creditFile,
  } = data;

  return (
    <PageShell
      eyebrow="ProofLoan workspace"
      title="Credit command center"
      description="Review your verifiable credit position, active applications, and available borrowing capacity from one interface."
      actions={
        <>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/credit-file">
              View credit file
            </Link>
          </Button>

          <Button
            asChild
            className="rounded-xl bg-cyan-300 text-slate-950 hover:bg-cyan-200"
          >
            <Link href="/borrow">
              New application
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </>
      }
    >
      <CreditPositionHero />

      <div className="mt-6">
        <QuickActions />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Applications"
          value={String(portfolio.totalApplications)}
          description={`${portfolio.activeApplications} active`}
          icon={Activity}
          href="/applications"
        />

        <StatCard
          label="Executed"
          value={String(portfolio.executedLoans)}
          description={`$${portfolio.totalExecuted.toLocaleString()} funded`}
          icon={CheckCircle2}
          href="/applications?filter=executed"
        />

        <StatCard
          label="Requested"
          value={`$${portfolio.totalRequested.toLocaleString()}`}
          description="Across all applications"
          icon={CircleDollarSign}
          href="/borrow"
        />

        <StatCard
          label="Avg confidence"
          value={`${portfolio.averageConfidence}%`}
          description={`Tier ${portfolio.averageRiskTier}`}
          trend={`${creditFile.freshEvidence} fresh facts`}
          icon={Gauge}
          href="/credit-file"
        />
      </div>

      <div className="mt-6">
        <MockHealthStrip />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <Panel>
            <div className="flex flex-col gap-3 border-b border-white/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-white">
                  Recent applications
                </div>

                <div className="mt-1 text-xs text-slate-500">
                  Latest ProofLoan state transitions
                </div>
              </div>

              <Button asChild variant="ghost" className="rounded-xl text-slate-400">
                <Link href="/applications">
                  View all
                  <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>

            {applications.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-500">
                No applications in this demo scenario.
              </div>
            ) : (
              <div className="divide-y divide-white/[0.05]">
                {applications.slice(0, 5).map(application => {
                  const nextStep = getApplicationNextStep(application);

                  return (
                  <Link
                    key={application.id}
                    href={nextStep.href}
                    className="pl-row group flex flex-col gap-3 p-5 sm:flex-row sm:items-center"
                  >
                    <div className="pl-icon-well">
                      <FileCheck2 className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-[11px] text-slate-400">
                        {application.id}
                      </div>

                      <div className="pl-num mt-1 text-base font-semibold text-white">
                        ${application.amount.toLocaleString()}
                        <span className="ml-1 text-xs font-medium text-slate-500">
                          {application.currency || "USDC"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                      <StatusPill
                        label={getApplicationStateMeta(application.state).label}
                        tone={getApplicationStateMeta(application.state).tone}
                        live={["OfferReady", "VerifyingEvidence", "Submitted"].includes(application.state)}
                      />

                      <div className="text-[11px] text-slate-500">
                        {application.confidence}% confidence · {relativeTime(application.updatedAt)}
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-200 sm:min-w-[7.5rem] sm:justify-end">
                      {nextStep.label}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                  );
                })}
              </div>
            )}
          </Panel>

          <ActivityStream />

          <SystemHealth />
        </div>

        <div className="space-y-6">
          <WalletOverview />
          <DemoOnboarding />
          <CreditHealthCard />
        </div>
      </div>

      <div className="mt-6">
        <DemoRecoveryCard />
      </div>
    </PageShell>
  );
}
