import { ArrowRight, FileCheck2, Gauge, WalletCards } from "lucide-react";
import { Link } from "wouter";

import { Button } from "@/components/ui/button";
import { useDemo } from "@/demo/DemoProvider";
import { getNextBestAction } from "@/navigation/applicationState";

import { ScoreRing } from "./ScoreRing";

export function CreditPositionHero() {
  const { data } = useDemo();
  const action = getNextBestAction(data);
  const { creditFile, portfolio } = data;

  return (
    <section className="pl-panel pl-panel-accent relative overflow-hidden rounded-[28px] p-6 sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-cyan-300/14 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 left-8 h-44 w-44 rounded-full bg-sky-500/10 blur-3xl" />

      <div className="relative grid gap-8 xl:grid-cols-[auto_minmax(0,1fr)_minmax(240px,320px)] xl:items-center">
        <ScoreRing
          value={creditFile.score || 0}
          caption={`Tier ${creditFile.riskTier}`}
        />

        <div className="min-w-0">
          <div className="pl-kicker">Verified credit position</div>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-[1.85rem]">
            ${portfolio.availableCapacity.toLocaleString()}
            <span className="ml-2 text-base font-medium text-slate-500">
              available
            </span>
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
            Capacity is bounded by verified evidence, freshness, and RiskGuard —
            not by raw wallet history.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <HeroMetric
              icon={WalletCards}
              label="Active apps"
              value={String(portfolio.activeApplications)}
            />
            <HeroMetric
              icon={Gauge}
              label="Confidence"
              value={`${creditFile.confidence}%`}
            />
            <HeroMetric
              icon={FileCheck2}
              label="Fresh facts"
              value={`${creditFile.freshEvidence}/${creditFile.totalEvidence}`}
            />
          </div>
        </div>

        <div className="min-w-0 rounded-3xl border border-white/[0.08] bg-black/25 p-5 sm:p-6">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
            {action.eyebrow}
          </div>
          <h3 className="mt-2 text-lg font-extrabold tracking-tight text-white">
            {action.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            {action.description}
          </p>
          <Button
            asChild
            className="mt-5 h-11 w-full rounded-xl bg-cyan-300 font-bold text-slate-950 hover:bg-cyan-200"
          >
            <Link href={action.href}>
              {action.label}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function HeroMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-black/15 p-4">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-slate-400">
        <Icon className="h-3.5 w-3.5 text-cyan-300" />
        {label}
      </div>
      <div className="pl-num mt-2 text-lg font-extrabold tracking-tight text-white">
        {value}
      </div>
    </div>
  );
}
