import {
  CheckCircle2,
  Clock3,
  FileCheck2,
  PauseCircle,
  ShieldX,
} from "lucide-react";

import type {
  DemoApplicationState,
} from "./types";

const map: Record<
  DemoApplicationState,
  {
    icon: typeof Clock3;
    title: string;
    tone: string;
  }
> = {
  Draft: {
    icon: Clock3,
    title: "Draft application",
    tone: "text-slate-300",
  },
  Submitted: {
    icon: Clock3,
    title: "Submitted",
    tone: "text-cyan-300",
  },
  VerifyingEvidence: {
    icon: FileCheck2,
    title: "Verifying evidence",
    tone: "text-amber-300",
  },
  EvidenceVerified: {
    icon: CheckCircle2,
    title: "Evidence verified",
    tone: "text-cyan-300",
  },
  Scored: {
    icon: ShieldX,
    title: "Underwriting scored",
    tone: "text-cyan-300",
  },
  OfferReady: {
    icon: CheckCircle2,
    title: "Offer ready",
    tone: "text-emerald-300",
  },
  Accepted: {
    icon: CheckCircle2,
    title: "Offer accepted",
    tone: "text-emerald-300",
  },
  Executed: {
    icon: CheckCircle2,
    title: "Executed",
    tone: "text-emerald-300",
  },
  Rejected: {
    icon: ShieldX,
    title: "Rejected",
    tone: "text-rose-300",
  },
  Paused: {
    icon: PauseCircle,
    title: "Paused for review",
    tone: "text-amber-300",
  },
};

export function ApplicationStateCard({
  state,
}: {
  state: DemoApplicationState;
}) {
  const config = map[state];

  const Icon = config.icon;

  return (
    <div className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-5">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.03]">
          <Icon
            className={[
              "h-5 w-5",
              config.tone,
            ].join(" ")}
          />
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-slate-600">
            Application state
          </div>

          <div
            className={[
              "mt-1 text-sm font-semibold",
              config.tone,
            ].join(" ")}
          >
            {config.title}
          </div>
        </div>
      </div>
    </div>
  );
}
