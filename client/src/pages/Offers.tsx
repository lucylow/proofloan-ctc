import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Info,
  ShieldCheck,
} from "lucide-react";

import { Link } from "wouter";

import { PageShell } from "@/components/navigation/PageShell";
import { EmptyState } from "@/components/navigation/EmptyState";
import { Button } from "@/components/ui/button";

import { useDemo } from "@/demo/DemoProvider";
import { formatOfferExpiry } from "@/navigation/applicationState";

export default function Offers() {
  const { data } = useDemo();
  const offers = [...data.offers].sort(
    (left, right) => Number(Boolean(right.featured)) - Number(Boolean(left.featured)),
  );

  return (
    <PageShell
      eyebrow="Borrowing"
      title="Available offers"
      description="Offers below have passed the current UI eligibility checks. Final acceptance remains subject to the active application and execution boundary."
      actions={
        <Button
          asChild
          variant="outline"
          className="rounded-xl"
        >
          <Link href="/applications">
            View applications
          </Link>
        </Button>
      }
    >
      {offers.length === 0 ? (
        <EmptyState
          icon={Clock3}
          title="No offers available"
          description="Eligible offers appear after RiskGuard accepts a verified application. Start a new application or switch the presentation scenario."
          actionLabel="Start application"
          actionHref="/borrow"
        />
      ) : (
        <>
        <div className="mb-4 text-[11px] text-slate-500">
          {offers.length} eligible offer{offers.length === 1 ? "" : "s"}
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {offers.slice(0, 6).map(offer => {
            const expiry = formatOfferExpiry(offer.expiresAt);
            const hoursLeft = (new Date(offer.expiresAt).getTime() - Date.now()) / 3_600_000;
            const urgent = hoursLeft <= 6;

            return (
            <section
              key={offer.id}
              className={[
                "rounded-[28px] p-5 sm:p-6",
                offer.featured
                  ? "pl-panel pl-panel-accent pl-panel-interactive"
                  : "pl-panel pl-panel-interactive",
              ].join(" ")}
            >
              {offer.featured && (
                <div className="mb-5 inline-flex rounded-full bg-cyan-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-200">
                  Recommended
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-slate-400">
                  {offer.pool}
                </div>

                <span className="rounded-full bg-white/[0.04] px-2 py-1 text-[10px] text-slate-400">
                  {offer.status}
                </span>
              </div>

              <div className="mt-3 pl-num text-3xl font-extrabold tracking-tight text-white">
                ${offer.amount.toLocaleString()}
                <span className="ml-1 text-sm font-medium text-slate-500">
                  {offer.currency}
                </span>
              </div>

              <div className={[
                "mt-1 text-xs",
                expiry === "Expired" ? "text-rose-300" : urgent ? "text-amber-200" : "text-slate-400",
              ].join(" ")}>
                {expiry}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/[0.03] p-3">
                  <div className="text-[10px] uppercase text-slate-600">
                    APR
                  </div>

                  <div className="mt-1 text-sm font-semibold text-white">
                    {offer.apr}%
                  </div>
                </div>

                <div className="rounded-xl bg-white/[0.03] p-3">
                  <div className="text-[10px] uppercase text-slate-600">
                    LTV
                  </div>

                  <div className="mt-1 text-sm font-semibold text-white">
                    {Math.round(
                      offer.ltv * 100,
                    )}
                    %
                  </div>
                </div>

                <div className="rounded-xl bg-white/[0.03] p-3">
                  <div className="text-[10px] uppercase text-slate-600">
                    Term
                  </div>

                  <div className="mt-1 text-sm font-semibold text-white">
                    {offer.termDays} days
                  </div>
                </div>

                <div className="rounded-xl bg-white/[0.03] p-3">
                  <div className="text-[10px] uppercase text-slate-600">
                    Fee
                  </div>

                  <div className="mt-1 text-sm font-semibold text-white">
                    ${offer.fee}
                  </div>
                </div>
              </div>

              <Button
                asChild
                className={[
                  "mt-7 w-full rounded-xl",
                  offer.featured
                    ? "bg-cyan-300 text-slate-950 hover:bg-cyan-200"
                    : "",
                ].join(" ")}
                variant={offer.featured ? "default" : "outline"}
              >
                <Link href={`/applications/${offer.applicationId}/offer`}>
                  Review offer
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </section>
            );
          })}
        </div>
        </>
      )}

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <InfoCard
          icon={ShieldCheck}
          title="Policy bounded"
          text="Offer parameters are checked against deterministic RiskGuard constraints."
        />

        <InfoCard
          icon={CheckCircle2}
          title="Evidence-backed"
          text="Offers are associated with the verified credit application rather than raw wallet history."
        />

        <InfoCard
          icon={Clock3}
          title="Time-limited"
          text="Offer expiry and evidence freshness are shown before acceptance."
        />
      </section>
    </PageShell>
  );
}

function InfoCard({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Info;
  title: string;
  text: string;
}) {
  return (
    <div className="pl-panel rounded-2xl p-5">
      <Icon className="h-4 w-4 text-cyan-300" />

      <div className="mt-4 text-sm font-medium text-white">
        {title}
      </div>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {text}
      </p>
    </div>
  );
}
