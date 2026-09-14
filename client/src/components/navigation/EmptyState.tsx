import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

import { Button } from "@/components/ui/button";

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  children?: ReactNode;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  children,
}: Props) {
  return (
    <div className="rounded-3xl border border-dashed border-cyan-300/15 bg-cyan-300/[0.03] px-6 py-10 text-center sm:p-10">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-cyan-300/10">
        <Icon className="h-6 w-6 text-cyan-300" />
      </div>

      <div className="mt-5 text-sm font-semibold text-slate-200">
        {title}
      </div>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
        {description}
      </p>

      {actionLabel && actionHref && (
        <Button asChild className="mt-5 rounded-xl bg-cyan-300 text-slate-950 hover:bg-cyan-200">
          <Link href={actionHref}>
            {actionLabel}
            <ArrowRight className="ml-2 h-3.5 w-3.5" />
          </Link>
        </Button>
      )}

      {actionLabel && onAction && !actionHref && (
        <Button
          onClick={onAction}
          variant="outline"
          className="mt-5 rounded-xl"
        >
          {actionLabel}
          <ArrowRight className="ml-2 h-3.5 w-3.5" />
        </Button>
      )}

      {children}
    </div>
  );
}
