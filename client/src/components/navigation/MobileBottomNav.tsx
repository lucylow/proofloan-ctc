import { MoreHorizontal } from "lucide-react";

import { Link, useLocation } from "wouter";

import {
  findNavigationItem,
  mobilePrimaryItems,
} from "@/navigation/config";
import { badgeForNavItem, getNavigationBadges } from "@/navigation/navBadges";
import { useDemo } from "@/demo/DemoProvider";

type Props = {
  onOpenMore: () => void;
};

export function MobileBottomNav({ onOpenMore }: Props) {
  const [location] = useLocation();
  const { data } = useDemo();
  const badges = getNavigationBadges(data);
  const activeItem = findNavigationItem(location);
  const moreActive = !mobilePrimaryItems.some(item => item.id === activeItem?.id);

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.08] bg-[#070b12]/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto flex h-[4.25rem] max-w-lg items-end justify-around pb-2">
        {mobilePrimaryItems.map(item => {
          const Icon = item.icon;
          const active = activeItem?.id === item.id;
          const primary = item.id === "borrow";
          const badge = badgeForNavItem(item.id, badges);

          if (primary) {
            return (
              <Link
                key={item.id}
                href={item.path}
                aria-current={active ? "page" : undefined}
                aria-label="Start a borrow application"
                className="flex min-w-14 flex-col items-center justify-center gap-1 px-2 text-[10px] text-cyan-200"
              >
                <div
                  className={[
                    "pl-nav-fab grid h-12 w-12 -translate-y-3 place-items-center rounded-2xl bg-cyan-300 text-slate-950 shadow-[0_10px_24px_-10px_rgba(103,232,249,.8)]",
                    active ? "ring-2 ring-cyan-100/70" : "",
                  ].join(" ")}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="font-semibold">Borrow</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.path}
              aria-current={active ? "page" : undefined}
              className={[
                "flex min-w-14 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 text-[10px]",
                active ? "text-cyan-300" : "text-slate-500",
              ].join(" ")}
            >
              <div
                className={[
                  "relative grid h-7 w-10 place-items-center rounded-xl transition-colors",
                  active ? "bg-cyan-300/10" : "",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />
                {badge ? (
                  <span className="absolute -right-0.5 -top-0.5 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-cyan-300 px-1 text-[8px] font-bold text-slate-950">
                    {badge > 9 ? "9+" : badge}
                  </span>
                ) : null}
              </div>

              <span className="font-medium">
                {item.id === "dashboard"
                  ? "Home"
                  : item.id === "applications"
                    ? "Apps"
                    : item.id === "credit-file"
                      ? "Credit"
                      : item.label}
              </span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={onOpenMore}
          aria-label="Open more navigation"
          aria-current={moreActive ? "true" : undefined}
          className={[
            "flex min-w-14 flex-col items-center justify-center gap-1 rounded-xl px-2 py-1 text-[10px]",
            moreActive ? "text-cyan-300" : "text-slate-500",
          ].join(" ")}
        >
          <div
            className={[
              "grid h-7 w-10 place-items-center rounded-xl transition-colors",
              moreActive ? "bg-cyan-300/10" : "",
            ].join(" ")}
          >
            <MoreHorizontal className="h-4 w-4" />
          </div>
          <span className="font-medium">More</span>
        </button>
      </div>
    </nav>
  );
}
