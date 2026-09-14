import { useEffect } from "react";
import { ShieldCheck, X } from "lucide-react";

import { Link, useLocation } from "wouter";

import {
  desktopNavigationGroups,
  findNavigationItem,
} from "@/navigation/config";
import { badgeForNavItem, getNavigationBadges } from "@/navigation/navBadges";
import { useDemo } from "@/demo/DemoProvider";

import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function MobileNavigation({
  open,
  onClose,
}: Props) {
  const [location] = useLocation();
  const { data } = useDemo();
  const badges = getNavigationBadges(data);
  const active = findNavigationItem(location);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] lg:hidden">
      <button
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close navigation"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="ProofLoan navigation"
        className="absolute inset-y-0 left-0 flex w-[min(86vw,360px)] flex-col border-r border-white/10 bg-[#070b12]/95 shadow-2xl backdrop-blur-2xl"
      >
        <div className="flex h-[72px] items-center justify-between border-b border-white/[0.07] px-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-300 text-slate-950 shadow-[0_0_28px_rgba(103,232,249,0.28)]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="font-extrabold tracking-tight text-white">
                ProofLoan
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                Verifiable credit
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9 rounded-xl"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto p-4">
          {desktopNavigationGroups.map(group => (
            <div key={group.section} className="mb-5">
              <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                {group.label}
              </div>

              <div className="space-y-1">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const isActive = active?.id === item.id;
                  const badge = badgeForNavItem(item.id, badges);

                  return (
                    <Link
                      key={item.id}
                      href={item.path}
                      onClick={onClose}
                      aria-current={isActive ? "page" : undefined}
                      className={[
                        "flex min-h-12 items-center gap-3 rounded-xl px-3",
                        isActive
                          ? "bg-cyan-300/10 text-cyan-200"
                          : "text-slate-400 hover:bg-white/[0.04] hover:text-white",
                      ].join(" ")}
                    >
                      <Icon className="h-[18px] w-[18px]" />

                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium">
                          {item.label}
                        </div>

                        <div className="truncate text-xs text-slate-500">
                          {item.description}
                        </div>
                      </div>

                      {badge ? (
                        <span className="rounded-full bg-cyan-300/15 px-2 py-0.5 text-[10px] font-semibold text-cyan-200">
                          {badge}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </div>
  );
}
