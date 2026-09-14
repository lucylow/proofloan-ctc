import {
  ChevronLeft,
  ChevronRight,
  Command,
  Plus,
  ShieldCheck,
} from "lucide-react";

import { Link, useLocation } from "wouter";

import {
  desktopNavigationGroups,
  findNavigationItem,
} from "@/navigation/config";
import { badgeForNavItem, getNavigationBadges } from "@/navigation/navBadges";
import { useDemo } from "@/demo/DemoProvider";

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";

type AppSidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
  onOpenCommandPalette: () => void;
};

export function AppSidebar({
  collapsed,
  onToggle,
  onOpenCommandPalette,
}: AppSidebarProps) {
  const [location] = useLocation();
  const { data } = useDemo();
  const badges = getNavigationBadges(data);
  const activeItem = findNavigationItem(location);

  return (
    <aside
      className={[
        "fixed inset-y-0 left-0 z-50 hidden border-r border-white/[0.07] bg-[#070b12]/80 backdrop-blur-2xl lg:flex lg:flex-col",
        "transition-[width] duration-300",
        collapsed ? "w-[76px]" : "w-[270px]",
      ].join(" ")}
    >
      <div className="flex h-[76px] items-center border-b border-white/[0.07] px-4">
        <Link
          href="/dashboard"
          className={[
            "group flex min-w-0 items-center gap-3",
            collapsed ? "mx-auto" : "",
          ].join(" ")}
        >
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-cyan-300 text-slate-950 shadow-[0_0_35px_rgba(103,232,249,0.32)]">
            <ShieldCheck className="h-5 w-5" />
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate text-sm font-extrabold tracking-tight text-white">
                ProofLoan
              </div>

              <div className="truncate text-[10px] uppercase tracking-[0.2em] text-slate-500">
                Verifiable Credit
              </div>
            </div>
          )}
        </Link>

        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="ml-auto h-8 w-8 rounded-lg text-slate-500 hover:text-white"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto py-5 proofloan-scroll">
        {desktopNavigationGroups.map(group => (
          <div key={group.section} className="mb-5">
            {!collapsed && (
              <div className="px-5 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {group.label}
              </div>
            )}

            <nav className="space-y-1 px-3" aria-label={group.label}>
              {group.items.map(item => {
                const Icon = item.icon;
                const active = activeItem?.id === item.id;
                const badge = badgeForNavItem(item.id, badges);

                return (
                  <Link
                    key={item.id}
                    href={item.path}
                    title={collapsed ? item.label : undefined}
                    className={[
                      "group relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition-all",
                      collapsed ? "justify-center" : "",
                      active
                        ? "bg-cyan-300/10 text-cyan-100 shadow-[inset_0_0_0_1px_rgba(103,232,249,0.08)]"
                        : "text-slate-400 hover:bg-white/[0.04] hover:text-white",
                    ].join(" ")}
                    aria-current={active ? "page" : undefined}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,.8)]" />
                    )}

                    <span className="relative">
                      <Icon
                        className={[
                          "h-[18px] w-[18px] shrink-0",
                          active
                            ? "text-cyan-300"
                            : "text-slate-500 group-hover:text-slate-300",
                        ].join(" ")}
                      />
                      {collapsed && badge ? (
                        <span className="absolute -right-1 -top-1 h-1.5 w-1.5 rounded-full bg-cyan-300" />
                      ) : null}
                    </span>

                    {!collapsed && (
                      <span className="min-w-0 flex-1 truncate font-medium">
                        {item.label}
                      </span>
                    )}

                    {!collapsed && badge ? (
                      <span className="rounded-full bg-cyan-300/15 px-2 py-0.5 text-[10px] font-semibold text-cyan-200">
                        {badge}
                      </span>
                    ) : !collapsed && active ? (
                      <ChevronRight className="h-3.5 w-3.5 text-cyan-300/60" />
                    ) : null}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="border-t border-white/[0.07] p-3">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <Link
              href="/borrow"
              className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-300 text-slate-950 shadow-[0_0_24px_rgba(103,232,249,.28)]"
              aria-label="New application"
            >
              <Plus className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={onOpenCommandPalette}
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.025] hover:border-cyan-300/30 hover:bg-cyan-300/10"
              aria-label="Open command palette"
            >
              <Command className="h-4 w-4 text-slate-500" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <Link
              href="/borrow"
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-cyan-300 text-sm font-bold text-slate-950 shadow-[0_10px_24px_-12px_rgba(103,232,249,.55)] hover:bg-cyan-200"
            >
              <Plus className="h-4 w-4" />
              New application
            </Link>
            <button
              type="button"
              onClick={onOpenCommandPalette}
              className="w-full rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3 text-left hover:border-cyan-300/20 hover:bg-white/[0.05]"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border border-cyan-300/20">
                  <AvatarFallback className="bg-cyan-300/10 text-xs font-bold text-cyan-300">
                    PL
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <div className="truncate text-xs font-semibold text-white">
                    ProofLoan account
                  </div>

                  <div className="truncate text-[10px] text-slate-500">
                    Search pages with ⌘K
                  </div>
                </div>
              </div>
            </button>
          </div>
        )}

        {collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="mt-2 mx-auto flex h-8 w-8 rounded-lg"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4 text-slate-500" />
          </Button>
        )}
      </div>
    </aside>
  );
}
