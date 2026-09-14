import {
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileCheck2,
  Filter,
  PauseCircle,
  Plus,
  Search,
  X,
  XCircle,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";

import { PageShell } from "@/components/navigation/PageShell";
import { EmptyState } from "@/components/navigation/EmptyState";
import { StatusPill } from "@/components/navigation/StatusPill";
import {
  getApplicationNextStep,
  getApplicationProgress,
  getApplicationStateMeta,
} from "@/navigation/applicationState";

import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useDemo } from "@/demo/DemoProvider";
import { relativeTime } from "@/demo/useDemoClock";

const stateMeta: Record<
  string,
  {
    label: string;
    icon: typeof CheckCircle2;
    className: string;
  }
> = {
  Draft: {
    label: "Draft",
    icon: Clock3,
    className: "text-slate-300",
  },
  Submitted: {
    label: "Submitted",
    icon: Clock3,
    className: "text-cyan-300",
  },
  VerifyingEvidence: {
    label: "Verifying evidence",
    icon: FileCheck2,
    className: "text-amber-300",
  },
  EvidenceVerified: {
    label: "Evidence verified",
    icon: CheckCircle2,
    className: "text-cyan-300",
  },
  Scored: {
    label: "Underwritten",
    icon: Clock3,
    className: "text-amber-300",
  },
  OfferReady: {
    label: "Offer ready",
    icon: CheckCircle2,
    className: "text-emerald-300",
  },
  Accepted: {
    label: "Accepted",
    icon: CheckCircle2,
    className: "text-emerald-300",
  },
  Executed: {
    label: "Executed",
    icon: CheckCircle2,
    className: "text-emerald-300",
  },
  Rejected: {
    label: "Rejected",
    icon: XCircle,
    className: "text-rose-300",
  },
  Paused: {
    label: "Paused",
    icon: PauseCircle,
    className: "text-amber-300",
  },
};

const fallbackMeta = {
  label: "Unknown",
  icon: Clock3,
  className: "text-slate-300",
};

const FILTERS = ["all", "active", "executed", "rejected"] as const;
type ApplicationFilter = (typeof FILTERS)[number];

function isApplicationFilter(value: string): value is ApplicationFilter {
  return FILTERS.includes(value as ApplicationFilter);
}

export default function Applications() {
  const { data } = useDemo();
  const applications = data.applications;
  const [location] = useLocation();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ApplicationFilter>("all");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("filter");
    if (requested && isApplicationFilter(requested)) {
      setFilter(requested);
    }
  }, [location]);

  const counts = useMemo(
    () => ({
      all: applications.length,
      active: applications.filter(
        application => !["Rejected", "Executed"].includes(application.state),
      ).length,
      executed: applications.filter(application => application.state === "Executed").length,
      rejected: applications.filter(application => application.state === "Rejected").length,
    }),
    [applications],
  );

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase().trim();

    return applications.filter(application => {
      const matchesQuery =
        !normalized ||
        application.id.toLowerCase().includes(normalized) ||
        application.state.toLowerCase().includes(normalized) ||
        application.borrowerLabel.toLowerCase().includes(normalized) ||
        String(application.amount).includes(normalized);

      const matchesFilter =
        filter === "all" ||
        (filter === "executed" && application.state === "Executed") ||
        (filter === "active" &&
          !["Rejected", "Executed"].includes(application.state)) ||
        (filter === "rejected" && application.state === "Rejected");

      return matchesQuery && matchesFilter;
    });
  }, [applications, query, filter]);

  return (
    <PageShell
      eyebrow="Borrowing"
      title="Applications"
      description="Monitor every ProofLoan application, its underwriting state, and its latest verifiable activity."
      actions={
        <Button
          asChild
          className="rounded-xl bg-cyan-300 text-slate-950 hover:bg-cyan-200"
        >
          <Link href="/borrow">
            <Plus className="mr-2 h-4 w-4" />
            New application
          </Link>
        </Button>
      }
    >
      <div className="pl-panel rounded-3xl">
        <div className="flex flex-col gap-4 border-b border-white/[0.06] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

            <Input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Search ID, borrower, amount, or state"
              aria-label="Search applications"
              className="h-11 rounded-xl border-white/10 bg-black/10 pr-10 pl-10"
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-slate-500 hover:bg-white/[0.06] hover:text-white"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />

            <Tabs value={filter} onValueChange={value => {
              if (isApplicationFilter(value)) {
                setFilter(value);
              }
            }}>
              <TabsList className="h-10 rounded-xl bg-white/[0.03]">
                <TabsTrigger value="all">All {counts.all}</TabsTrigger>
                <TabsTrigger value="active">Active {counts.active}</TabsTrigger>
                <TabsTrigger value="executed">Executed {counts.executed}</TabsTrigger>
                <TabsTrigger value="rejected">Rejected {counts.rejected}</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {applications.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={CircleDollarSign}
              title="No applications yet"
              description="Start your first ProofLoan application to generate a verifiable credit workflow."
              actionLabel="Start application"
              actionHref="/borrow"
            />
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            <div className="flex items-center justify-between gap-3 px-5 py-3 text-[11px] text-slate-500">
              <span>
                Showing {filtered.length} of {applications.length}
                {filter !== "all" ? ` · ${filter}` : ""}
                {query.trim() ? ` matching “${query.trim()}”` : ""}
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={Search}
                  title="No applications found"
                  description="Nothing matches the current search or filter. Clear them to see every application again."
                  actionLabel="Clear filters"
                  onAction={() => {
                    setQuery("");
                    setFilter("all");
                  }}
                />
              </div>
            ) : (
              filtered.map(application => {
                const metadata =
                  stateMeta[application.state] ?? fallbackMeta;

                const Icon = metadata.icon;
                const nextStep = getApplicationNextStep(application);
                const progress = Math.round(getApplicationProgress(application.state) * 100);

                return (
                  <Link
                    key={application.id}
                    href={nextStep.href}
                    className="pl-row group flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
                  >
                    <div className="pl-icon-well h-11 w-11 shrink-0">
                      <Icon
                        className={[
                          "h-5 w-5",
                          metadata.className,
                        ].join(" ")}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-slate-200">
                          {application.id}
                        </span>

                        <StatusPill
                          label={getApplicationStateMeta(application.state).label}
                          tone={getApplicationStateMeta(application.state).tone}
                          live={["OfferReady", "VerifyingEvidence", "Submitted"].includes(application.state)}
                        />
                      </div>

                      <div className="mt-2 text-xs text-slate-500">
                        {application.borrowerLabel} · {application.confidence}% confidence · Updated {relativeTime(application.updatedAt)}
                      </div>

                      <div className="pl-progress mt-3 sm:hidden">
                        <div
                          className="pl-progress-fill"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="sm:w-40 sm:text-right">
                      <div className="pl-num text-lg font-extrabold tracking-tight text-white">
                        $
                        {application.amount.toLocaleString()}
                        <span className="ml-1 text-xs font-medium text-slate-500">
                          {application.currency || "USDC"}
                        </span>
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        Risk tier {application.riskTier}
                      </div>

                      <div className="pl-progress mt-2 hidden sm:block">
                        <div
                          className="pl-progress-fill"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <span className="inline-flex items-center justify-between gap-2 text-xs font-semibold text-cyan-200 sm:min-w-[8.5rem] sm:justify-end">
                      {nextStep.label}
                      <ArrowRight className="h-4 w-4 text-cyan-300/70 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        )}
      </div>
    </PageShell>
  );
}
