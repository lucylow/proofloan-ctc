import {
  Activity,
  CheckCircle2,
  CircleDollarSign,
  ShieldAlert,
} from "lucide-react";

import { useDemo } from "./DemoProvider";

export function DemoSummary() {
  const { data } = useDemo();

  const active =
    data.applications.filter(
      item =>
        ![
          "Executed",
          "Rejected",
        ].includes(item.state),
    ).length;

  const verified =
    data.applications.filter(
      item =>
        [
          "EvidenceVerified",
          "Scored",
          "OfferReady",
          "Accepted",
          "Executed",
        ].includes(item.state),
    ).length;

  const warnings =
    data.notifications.filter(
      item =>
        item.severity === "warning" ||
        item.severity === "error",
    ).length;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Summary
        icon={Activity}
        label="Applications"
        value={data.applications.length}
      />

      <Summary
        icon={CircleDollarSign}
        label="Active"
        value={active}
      />

      <Summary
        icon={CheckCircle2}
        label="Verified"
        value={verified}
      />

      <Summary
        icon={ShieldAlert}
        label="Warnings"
        value={warnings}
        alert={warnings > 0}
      />
    </div>
  );
}

function Summary({
  icon: Icon,
  label,
  value,
  alert = false,
}: {
  icon: typeof Activity;
  label: string;
  value: number;
  alert?: boolean;
}) {
  return (
    <div className="pl-panel flex items-center gap-3 rounded-2xl p-4">
      <div className={alert ? "grid h-10 w-10 place-items-center rounded-[0.9rem] bg-amber-400/10 text-amber-300" : "pl-icon-well"}>
        <Icon className="h-4 w-4" />
      </div>

      <div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
          {label}
        </div>

        <div className="mt-1 text-xl font-extrabold tracking-tight text-white">
          {value}
        </div>
      </div>
    </div>
  );
}
