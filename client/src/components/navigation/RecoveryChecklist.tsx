import { CheckCircle2, Circle, Loader2 } from "lucide-react";

export function RecoveryChecklist({
  steps,
}: {
  steps: Array<{
    label: string;
    status: "pending" | "running" | "complete";
  }>;
}) {
  return (
    <div className="space-y-3">
      {steps.map(step => {
        const Icon = step.status === "complete" ? CheckCircle2 : step.status === "running" ? Loader2 : Circle;
        return (
          <div key={step.label} className="flex items-center gap-3 text-xs text-slate-400">
            <Icon className={step.status === "complete" ? "h-4 w-4 text-emerald-300" : step.status === "running" ? "h-4 w-4 animate-spin text-cyan-300" : "h-4 w-4 text-slate-700"} />
            {step.label}
          </div>
        );
      })}
    </div>
  );
}
