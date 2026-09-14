import { Compass, LayoutDashboard, ListChecks, Search } from "lucide-react";
import { Link } from "wouter";

import { PageShell } from "@/components/navigation/PageShell";
import { Button } from "@/components/ui/button";
import { navigationItems } from "@/navigation/config";

const suggestions = navigationItems.filter(item =>
  ["dashboard", "borrow", "applications", "credit-file", "docs"].includes(item.id),
);

export default function WorkspaceNotFound() {
  return (
    <PageShell
      eyebrow="Navigation"
      title="Page not found"
      description="That route is not part of the ProofLoan workspace. Jump to a nearby page or search from the command palette."
      actions={
        <Button asChild className="rounded-xl bg-cyan-300 text-slate-950 hover:bg-cyan-200">
          <Link href="/dashboard">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Go to dashboard
          </Link>
        </Button>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {suggestions.map(item => {
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={item.path}
              className="pl-panel pl-panel-interactive flex min-h-[5.5rem] items-center gap-3 rounded-2xl px-4"
            >
              <div className="pl-icon-well">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white">{item.label}</div>
                <div className="mt-0.5 truncate text-xs text-slate-500">
                  {item.description}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-xs text-slate-500">
        <Compass className="h-4 w-4 text-cyan-300" />
        <span>Press</span>
        <kbd className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
          ⌘K
        </kbd>
        <span>or</span>
        <kbd className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
          /
        </kbd>
        <span>to search pages.</span>
        <Link href="/applications" className="ml-auto inline-flex items-center gap-1 text-cyan-300 hover:text-cyan-200">
          <ListChecks className="h-3.5 w-3.5" />
          Applications
        </Link>
        <Search className="h-3.5 w-3.5 text-slate-600" />
      </div>
    </PageShell>
  );
}
