import {
  CheckCircle2,
  Clock3,
} from "lucide-react";

import { Link } from "wouter";

import { useDemo } from "./DemoProvider";

export function OfferComparison({
  applicationId,
}: {
  applicationId?: string;
}) {
  const { data } = useDemo();

  const offers = data.offers.filter(
    offer =>
      !applicationId ||
      offer.applicationId ===
        applicationId,
  );

  if (offers.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 p-8 text-center">
        <div className="text-sm text-slate-500">
          No demo offers available.
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {offers.slice(0, 3).map(offer => (
        <Link
          key={offer.id}
          href={`/applications/${offer.applicationId}`}
          className={[
            "rounded-3xl border p-5 transition-all hover:-translate-y-0.5",
            offer.featured
              ? "border-cyan-300/20 bg-cyan-300/[0.045]"
              : "border-white/[0.07] bg-white/[0.02]",
          ].join(" ")}
        >
          {offer.featured && (
            <div className="mb-4 inline-flex rounded-full bg-cyan-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-200">
              Recommended
            </div>
          )}

          <div className="text-xs text-slate-600">
            {offer.pool}
          </div>

          <div className="mt-2 text-3xl font-bold text-white">
            ${offer.amount.toLocaleString()}
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Metric
              label="APR"
              value={`${offer.apr}%`}
            />

            <Metric
              label="LTV"
              value={`${Math.round(
                offer.ltv * 100,
              )}%`}
            />

            <Metric
              label="Term"
              value={`${offer.termDays}d`}
            />

            <Metric
              label="Fee"
              value={`$${offer.fee}`}
            />
          </div>

          <div className="mt-5 flex items-center gap-2 text-xs">
            {offer.status === "Expiring" ? (
              <Clock3 className="h-3.5 w-3.5 text-amber-300" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
            )}

            <span className="text-slate-400">
              {offer.status}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-white/[0.03] p-3">
      <div className="text-[10px] uppercase tracking-wider text-slate-600">
        {label}
      </div>

      <div className="mt-1 text-sm font-semibold text-white">
        {value}
      </div>
    </div>
  );
}
