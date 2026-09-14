import { Link, useLocation } from "wouter";
import { useEffect, useRef } from "react";

import {
  findNavigationItem,
  getSiblingNavItems,
  parseWorkspacePath,
} from "@/navigation/config";

export function SectionNav() {
  const [location] = useLocation();
  const parsed = parseWorkspacePath(location);
  const siblings = getSiblingNavItems(location);
  const active = findNavigationItem(location);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const hidden = parsed.kind === "application" || siblings.length < 2;

  useEffect(() => {
    if (hidden) {
      return;
    }

    const activeLink = scrollerRef.current?.querySelector("[aria-current='page']");
    if (activeLink instanceof HTMLElement) {
      activeLink.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    }
  }, [hidden, location]);

  if (hidden) {
    return null;
  }

  return (
    <nav
      aria-label="Related pages"
      className="mb-6 overflow-x-auto rounded-2xl border border-white/[0.07] bg-white/[0.02] p-1.5"
    >
      <div ref={scrollerRef} className="flex min-w-max gap-1">
        {siblings.map(item => {
          const Icon = item.icon;
          const isActive = active?.id === item.id;

          return (
            <Link
              key={item.id}
              href={item.path}
              aria-current={isActive ? "page" : undefined}
              className={[
                "flex min-h-10 items-center gap-2 rounded-xl px-3 text-xs transition-colors",
                isActive
                  ? "bg-cyan-300/12 text-cyan-100 shadow-[inset_0_0_0_1px_rgba(103,232,249,0.16)]"
                  : "text-slate-500 hover:bg-white/[0.04] hover:text-white",
              ].join(" ")}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
