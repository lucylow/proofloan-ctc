import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Info,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import { Link } from "wouter";

import { PageShell } from "@/components/navigation/PageShell";
import { EmptyState } from "@/components/navigation/EmptyState";

import { useDemo } from "@/demo/DemoProvider";
import { DemoTimestamp } from "@/demo/DemoTimestamp";

const categoryIcon = {
  evidence: FileCheck2,
  policy: ShieldCheck,
  underwriting: CheckCircle2,
  wallet: WalletCards,
  offer: Clock3,
  system: Info,
};

export default function Activity() {
  const { data } = useDemo();
  const activity = data.activity;

  return (
    <PageShell
      eyebrow="Activity"
      title="Recent activity"
      description="A human-readable timeline of the events surrounding your ProofLoan workspace."
    >
      <section className="pl-panel rounded-3xl p-5 sm:p-6">
        {activity.length === 0 ? (
          <EmptyState
            icon={Info}
            title="No activity yet"
            description="Application, evidence, and policy events will appear here as the workspace moves."
            actionLabel="Go to dashboard"
            actionHref="/dashboard"
          />
        ) : (
          <div className="space-y-0">
            {activity.map((event, index) => {
              const Icon =
                event.severity === "warning"
                  ? AlertTriangle
                  : categoryIcon[event.category];

              const body = (
                <>
                  <div className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/[0.07] bg-[#0b121d]">
                    <Icon className="h-4 w-4 text-cyan-300" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-sm font-medium text-white">
                        {event.title}
                      </div>

                      <DemoTimestamp timestamp={event.timestamp} />
                    </div>

                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
                      {event.description}
                    </p>
                  </div>
                </>
              );

              return (
                <div
                  key={event.id}
                  className="relative flex gap-4 pb-8 last:pb-0"
                >
                  {index < activity.length - 1 && (
                    <div className="absolute bottom-0 left-5 top-10 w-px bg-white/[0.07]" />
                  )}

                  {event.applicationId ? (
                    <Link
                      href={`/applications/${event.applicationId}/activity`}
                      className="relative flex min-w-0 flex-1 gap-4 rounded-2xl p-1 hover:bg-white/[0.03]"
                    >
                      {body}
                    </Link>
                  ) : (
                    body
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </PageShell>
  );
}
