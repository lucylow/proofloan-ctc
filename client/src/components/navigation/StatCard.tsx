import type { LucideIcon } from "lucide-react";
import { Link } from "wouter";

type Props = {
  label: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  trend?: string;
  href?: string;
};

export function StatCard({
  label,
  value,
  description,
  icon: Icon,
  trend,
  href,
}: Props) {
  const content = (
    <div className="pl-panel pl-panel-interactive rounded-2xl p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {label}
          </div>

          <div className="pl-num mt-2 truncate text-2xl font-extrabold tracking-tight text-white">
            {value}
          </div>
        </div>

        <div className="pl-icon-well shrink-0">
          <Icon className="h-4 w-4" />
        </div>
      </div>

      {(description || trend) && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          {trend && (
            <span className="rounded-full border border-emerald-400/15 bg-emerald-400/10 px-2 py-1 text-emerald-300">
              {trend}
            </span>
          )}

          {description && (
            <span className="text-slate-500">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className="block rounded-2xl focus-visible:outline-none">
      {content}
    </Link>
  );
}
