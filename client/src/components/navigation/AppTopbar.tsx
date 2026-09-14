import { Menu, Radio, Search } from "lucide-react";

import { Link, useLocation } from "wouter";

import { getBreadcrumbs, parseWorkspacePath } from "@/navigation/config";
import { useDemo } from "@/demo/DemoProvider";
import { WalletButton } from "./WalletButton";
import { NotificationCenter } from "./NotificationCenter";

import { Button } from "@/components/ui/button";

type AppTopbarProps = {
  sidebarCollapsed: boolean;
  onOpenMobileMenu: () => void;
  onOpenCommandPalette: () => void;
};

function BreadcrumbTrail({
  className,
}: {
  className: string;
}) {
  const [location] = useLocation();
  const { data } = useDemo();
  const parsed = parseWorkspacePath(location);
  const applicationLabel =
    parsed.kind === "application"
      ? data.applications.find(item => item.id === parsed.applicationId)?.id ??
        parsed.applicationId
      : undefined;
  const breadcrumbs = getBreadcrumbs(location, { applicationLabel });

  return (
    <nav aria-label="Breadcrumb" className={className}>
      {breadcrumbs.map((breadcrumb, index) => {
        const current = index === breadcrumbs.length - 1;

        return (
          <div
            key={`${breadcrumb.label}-${index}`}
            className="flex min-w-0 items-center gap-2"
          >
            {index > 0 && (
              <span className="text-slate-600">/</span>
            )}

            {breadcrumb.path && !current ? (
              <Link
                href={breadcrumb.path}
                className="truncate text-slate-400 hover:text-white"
              >
                {breadcrumb.label}
              </Link>
            ) : (
              <span
                aria-current={current ? "page" : undefined}
                className={[
                  "truncate",
                  current
                    ? "font-semibold text-slate-100"
                    : "text-slate-400",
                ].join(" ")}
              >
                {breadcrumb.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export function AppTopbar({
  onOpenMobileMenu,
  onOpenCommandPalette,
}: AppTopbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#070b12]/72 backdrop-blur-2xl">
      <div className="flex h-14 items-center gap-3 px-4 sm:h-[76px] sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-xl lg:hidden"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <BreadcrumbTrail className="hidden min-w-0 flex-1 items-center gap-2 text-sm lg:flex" />

        <button
          onClick={onOpenCommandPalette}
          className="hidden h-10 w-[min(100%,280px)] items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.035] px-3 text-left text-xs text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,.04)] transition-colors hover:border-cyan-300/20 hover:bg-white/[0.05] sm:flex lg:h-11 lg:w-[300px]"
        >
          <Search className="h-4 w-4 text-slate-400" />
          <span className="flex-1">
            Search ProofLoan
          </span>
          <kbd className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
            ⌘K
          </kbd>
        </button>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenCommandPalette}
            className="h-10 w-10 rounded-xl sm:hidden"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Button>

          <div className="hidden items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.07] px-3 py-1.5 text-[11px] font-medium text-emerald-200 md:inline-flex">
            <Radio className="h-3 w-3 text-emerald-300 pl-status-live" />
            Creditcoin testnet
          </div>

          <NotificationCenter />

          <div className="hidden h-6 w-px bg-white/[0.08] sm:block" />

          <WalletButton />
        </div>
      </div>

      <div className="flex h-9 items-center justify-between gap-3 border-t border-white/[0.04] px-4 sm:px-6 lg:hidden">
        <BreadcrumbTrail className="flex min-w-0 items-center gap-2 text-xs" />
        <span className="inline-flex shrink-0 items-center gap-1.5 text-[10px] font-medium text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 pl-status-live" />
          Live
        </span>
      </div>
    </header>
  );
}
