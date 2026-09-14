import {
  CheckCircle2,
  Circle,
  Lock,
} from "lucide-react";

const stages = [
  "Submitted",
  "VerifyingEvidence",
  "EvidenceVerified",
  "Scored",
  "OfferReady",
  "Accepted",
  "Executed",
];

export function ApplicationTimeline({
  currentState,
}: {
  currentState: string;
}) {
  const currentIndex =
    stages.indexOf(currentState);

  return (
    <div className="space-y-3">
      {stages.map((stage, index) => {
        const complete =
          currentIndex >= 0 &&
          index <= currentIndex;

        const active =
          index === currentIndex;

        const Icon = complete
          ? CheckCircle2
          : index > currentIndex
            ? Lock
            : Circle;

        return (
          <div
            key={stage}
            className="flex items-center gap-3"
          >
            <div
              className={[
                "grid h-8 w-8 place-items-center rounded-full border",
                complete
                  ? "border-cyan-300/20 bg-cyan-300/10 text-cyan-300"
                  : "border-white/[0.07] bg-white/[0.02] text-slate-700",
              ].join(" ")}
            >
              <Icon className="h-3.5 w-3.5" />
            </div>

            <div className="flex-1">
              <div
                className={[
                  "text-xs",
                  active
                    ? "font-semibold text-cyan-200"
                    : complete
                      ? "text-slate-300"
                      : "text-slate-700",
                ].join(" ")}
              >
                {stage}
              </div>
            </div>

            {active && (
              <span className="rounded-full bg-cyan-300/10 px-2 py-1 text-[9px] uppercase tracking-wider text-cyan-300">
                Current
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
