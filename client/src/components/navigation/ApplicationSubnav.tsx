import { Link, useLocation } from "wouter";
import { useEffect, useRef } from "react";

import {
  APPLICATION_DETAIL_SECTIONS,
  getApplicationDetailPath,
  parseWorkspacePath,
} from "@/navigation/config";

type Props = {
  applicationId: string;
};

export function ApplicationSubnav({
  applicationId,
}: Props) {
  const [location] = useLocation();
  const parsed = parseWorkspacePath(location);
  const activeSection =
    parsed.kind === "application" && parsed.applicationId === applicationId
      ? parsed.section
      : "overview";
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const activeLink = scrollerRef.current?.querySelector("[aria-current='page']");
    if (activeLink instanceof HTMLElement) {
      activeLink.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    }
  }, [activeSection]);

  return (
    <nav
      aria-label="Application sections"
      className="mb-6 overflow-x-auto rounded-2xl border border-white/[0.07] bg-white/[0.02] p-1.5"
    >
      <div ref={scrollerRef} className="flex min-w-max gap-1">
        {APPLICATION_DETAIL_SECTIONS.map(item => {
          const path = getApplicationDetailPath(applicationId, item.id);
          const active = activeSection === item.id;
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={path}
              aria-current={active ? "page" : undefined}
              className={[
                "flex min-h-10 items-center gap-2 rounded-xl px-3 text-xs transition-colors",
                active
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
