import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileCheck2,
  Gauge,
  ShieldCheck,
} from "lucide-react";

import { Link, Redirect, useParams } from "wouter";

import { PageShell } from "@/components/navigation/PageShell";
import { ApplicationNotFound } from "@/components/navigation/ApplicationNotFound";
import { ApplicationSubnav } from "@/components/navigation/ApplicationSubnav";
import { StatusPill } from "@/components/navigation/StatusPill";
import { Button } from "@/components/ui/button";

import { toAttestcoinFacts } from "@/attestcoin/fromDemo";
import { AttestcoinFactsPanel } from "@/components/attestcoin/AttestcoinFactsPanel";
import { AttestcoinProvenanceTable } from "@/components/attestcoin/AttestcoinProvenanceTable";
import { AttestcoinTrace } from "@/components/attestcoin/AttestcoinTrace";
import { CrossChainCoverage } from "@/components/attestcoin/CrossChainCoverage";
import { MockCrossChainCoverage } from "@/components/attestcoin/MockCrossChainCoverage";
import { MockFactsPanel } from "@/components/attestcoin/MockFactsPanel";
import { useDemo } from "@/demo/DemoProvider";
import { useOptionalMockAttestcoin } from "@/mock-attestcoin/hooks";
import { selectFactsForApplication } from "@/mock-attestcoin/selectors";
import { ApplicationTimeline } from "@/demo/ApplicationTimeline";
import { ApplicationStateCard } from "@/demo/ApplicationStateCard";
import { DecisionBreakdown } from "@/demo/DecisionBreakdown";
import { RiskGuardPanel } from "@/demo/RiskGuardPanel";
import { OfferComparison } from "@/demo/OfferComparison";
import { relativeTime } from "@/demo/useDemoClock";
import { shortenHash } from "@/demo/utils";
import { getApplicationProgress, getApplicationStateMeta } from "@/navigation/applicationState";
import {
  getApplicationDetailPath,
  isApplicationDetailSection,
} from "@/navigation/config";

export default function ApplicationDetail() {
  const params = useParams<{ id: string; section?: string }>();
  const id = params.id ?? "PL-7F42A91C";
  const requestedSection = params.section;
  const { data } = useDemo();
  const mock = useOptionalMockAttestcoin();

  const application =
    data.applications.find(
      item => item.id === id,
    );

  const relatedActivity = data.activity.filter(
    event => event.applicationId === id,
  );
  const relatedFacts = toAttestcoinFacts(
    data.evidence.filter(item => item.applicationId === id),
  );
  const mockFacts = mock ? selectFactsForApplication(mock.dataset, id) : [];
  const stateMeta = getApplicationStateMeta(application?.state ?? "");
  const primaryAction =
    application?.state === "OfferReady" || application?.state === "Accepted"
      ? { href: getApplicationDetailPath(id, "offer"), label: "Review offer" }
      : application?.state === "Executed"
        ? { href: "/credit-file", label: "View credit file" }
        : { href: getApplicationDetailPath(id, "evidence"), label: "Inspect evidence" };

  if (requestedSection && !isApplicationDetailSection(requestedSection)) {
    return <Redirect to={getApplicationDetailPath(id)} />;
  }

  const section = isApplicationDetailSection(requestedSection)
    ? requestedSection
    : "overview";

  const currentIndex = data.applications.findIndex(item => item.id === id);
  const previous = currentIndex > 0 ? data.applications[currentIndex - 1] : undefined;
  const next =
    currentIndex >= 0 && currentIndex < data.applications.length - 1
      ? data.applications[currentIndex + 1]
      : undefined;

  return (
    <PageShell
      showSectionNav={false}
      eyebrow={application?.id ?? "Application"}
      title={
        application
          ? `$${application.amount.toLocaleString()} ${application.currency}`
          : id
      }
      description={
        application
          ? `${stateMeta.label} · Risk tier ${application.riskTier} · Updated ${relativeTime(application.updatedAt)}`
          : "Detailed application state, verification milestones, underwriting context and offer readiness."
      }
      actions={
        <>
          <Button
            asChild
            variant="outline"
            className="rounded-xl"
          >
            <Link href="/applications">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to applications
            </Link>
          </Button>
          {application && (
            <Button
              asChild
              className="rounded-xl bg-cyan-300 text-slate-950 hover:bg-cyan-200"
            >
              <Link href={primaryAction.href}>
                {primaryAction.label}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </>
      }
    >
      {application ? (
        <>
          <ApplicationSubnav applicationId={application.id} />

          {(previous || next) && (
            <div className="mb-6 flex items-center justify-between gap-3 text-xs text-slate-500">
              {previous ? (
                <Link
                  href={getApplicationDetailPath(previous.id, section)}
                  className="inline-flex items-center gap-1 hover:text-white"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  {previous.id}
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link
                  href={getApplicationDetailPath(next.id, section)}
                  className="inline-flex items-center gap-1 hover:text-white"
                >
                  {next.id}
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <span />
              )}
            </div>
          )}

          {section === "overview" && (
            <div className="grid min-w-0 gap-6 xl:grid-cols-[1.25fr_0.75fr]">
              <div className="min-w-0 space-y-6">
                <section className="pl-panel p-5 sm:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Current state
                      </div>

                      <div className="mt-2 flex items-center gap-2">
                        <StatusPill
                          label={stateMeta.label}
                          tone={stateMeta.tone}
                          live={["OfferReady", "VerifyingEvidence", "Submitted"].includes(application.state)}
                        />
                      </div>
                    </div>

                    <div className="rounded-full bg-cyan-300/10 px-3 py-1.5 text-xs text-cyan-200">
                      Risk tier {application.riskTier}
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="mb-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Underwriting progress</span>
                      <span className="pl-num text-cyan-200">
                        {Math.round(getApplicationProgress(application.state) * 100)}%
                      </span>
                    </div>
                    <div className="pl-progress">
                      <div
                        className="pl-progress-fill"
                        style={{ width: `${Math.round(getApplicationProgress(application.state) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-8">
                    <ApplicationTimeline
                      currentState={application.state}
                    />
                  </div>
                </section>

                <section className="pl-panel p-5 sm:p-6">
                  <div className="text-sm font-semibold text-white">
                    Continue this file
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <Link
                      href={getApplicationDetailPath(application.id, "evidence")}
                      className="pl-panel-interactive rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4"
                    >
                      <div className="text-xs font-semibold text-white">Evidence</div>
                      <p className="mt-1 text-[11px] leading-5 text-slate-500">
                        Inspect verified facts for this application.
                      </p>
                    </Link>
                    <Link
                      href={getApplicationDetailPath(application.id, "decision")}
                      className="pl-panel-interactive rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4"
                    >
                      <div className="text-xs font-semibold text-white">Decision</div>
                      <p className="mt-1 text-[11px] leading-5 text-slate-500">
                        Review advisory underwriting and RiskGuard.
                      </p>
                    </Link>
                    <Link
                      href={getApplicationDetailPath(application.id, "offer")}
                      className="pl-panel-interactive rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4"
                    >
                      <div className="text-xs font-semibold text-white">Offer</div>
                      <p className="mt-1 text-[11px] leading-5 text-slate-500">
                        Open the bounded offer associated with this file.
                      </p>
                    </Link>
                  </div>
                </section>
              </div>

              <div className="min-w-0 space-y-6">
                <ApplicationStateCard state={application.state} />

                <section className="rounded-3xl border border-cyan-300/10 bg-cyan-300/[0.04] p-5 sm:p-6">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-300/10">
                    <Gauge className="h-5 w-5 text-cyan-300" />
                  </div>

                  <div className="mt-5 text-xs text-slate-500">
                    Preliminary capacity
                  </div>

                  <div className="mt-1 text-3xl font-bold text-white">
                    ${application.amount.toLocaleString()}
                  </div>

                  <div className="mt-2 text-xs leading-5 text-slate-600">
                    Subject to RiskGuard validation and offer availability.
                  </div>

                  <Button
                    asChild
                    className="mt-6 w-full rounded-xl bg-cyan-300 text-slate-950 hover:bg-cyan-200"
                  >
                    <Link href={primaryAction.href}>
                      {primaryAction.label}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </section>

                <section className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5">
                  <div className="text-sm font-semibold text-white">
                    Application identifiers
                  </div>

                  <div className="mt-4 space-y-3">
                    {[
                      ["Evidence root", shortenHash(application.decisionHash)],
                      ["Model version", application.modelVersion],
                      ["Feature version", application.featureVersion],
                      ["Policy hash", shortenHash(application.policyHash)],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between gap-4 border-b border-white/[0.05] pb-3 last:border-b-0 last:pb-0"
                      >
                        <span className="text-xs text-slate-600">
                          {label}
                        </span>

                        <span className="font-mono text-xs text-slate-300">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          )}

          {section === "evidence" && (
            <div className="space-y-6">
              {mock ? (
                <MockFactsPanel facts={mockFacts} />
              ) : (
                <AttestcoinFactsPanel facts={relatedFacts} />
              )}

              <AttestcoinProvenanceTable facts={mock ? mockFacts : relatedFacts} />

              {mock ? (
                <MockCrossChainCoverage dataset={mock.dataset} applicationId={id} />
              ) : (
                <CrossChainCoverage facts={relatedFacts} />
              )}

              <Button
                asChild
                variant="outline"
                className="w-full rounded-xl"
              >
                <Link href="/evidence">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open evidence explorer
                </Link>
              </Button>
            </div>
          )}

          {section === "decision" && (
            <div className="grid min-w-0 gap-6 xl:grid-cols-[1.25fr_0.75fr]">
              <div className="min-w-0 space-y-6">
                <DecisionBreakdown applicationId={application.id} />
              </div>
              <div className="min-w-0 space-y-6">
                <RiskGuardPanel applicationId={application.id} />
                <AttestcoinTrace current={application.state === "Draft" ? 1 : 4} />
              </div>
            </div>
          )}

          {section === "offer" && (
            <div className="grid min-w-0 gap-6 xl:grid-cols-[1.25fr_0.75fr]">
              <OfferComparison applicationId={application.id} />
              <div className="min-w-0 space-y-6">
                <ApplicationStateCard state={application.state} />
                <Button
                  asChild
                  variant="outline"
                  className="w-full rounded-xl"
                >
                  <Link href="/offers">
                    View offer book
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {section === "activity" && (
            <section className="pl-panel">
              <div className="border-b border-white/[0.06] p-5">
                <div className="text-sm font-semibold text-white">
                  Verification timeline
                </div>
              </div>

              <div className="space-y-0 p-5">
                {(relatedActivity.length > 0
                  ? relatedActivity
                  : data.activity.slice(0, 3)
                ).map((event, index, list) => (
                  <div
                    key={event.id}
                    className="relative flex gap-4 pb-6 last:pb-0"
                  >
                    {index < list.length - 1 && (
                      <div className="absolute bottom-0 left-5 top-10 w-px bg-white/[0.07]" />
                    )}

                    <div className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-300/10">
                      {event.category === "evidence" ? (
                        <FileCheck2 className="h-4 w-4 text-cyan-300" />
                      ) : event.category === "policy" ? (
                        <ShieldCheck className="h-4 w-4 text-cyan-300" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-cyan-300" />
                      )}
                    </div>

                    <div>
                      <div className="text-sm font-medium text-white">
                        {event.title}
                      </div>

                      <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-600">
                        {event.description}
                      </p>

                      <div className="mt-2 text-[10px] uppercase tracking-wider text-slate-700">
                        {relativeTime(event.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        <ApplicationNotFound
          applicationId={id}
        />
      )}
    </PageShell>
  );
}
