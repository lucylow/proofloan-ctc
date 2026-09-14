import type { ReactNode } from "react";

import { SectionNav } from "./SectionNav";

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  showSectionNav?: boolean;
  children: ReactNode;
};

export function PageShell({
  eyebrow,
  title,
  description,
  actions,
  showSectionNav = true,
  children,
}: Props) {
  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="min-w-0 max-w-3xl">
          {eyebrow && (
            <div className="pl-kicker mb-2">
              {eyebrow}
            </div>
          )}

          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-[2.15rem] lg:leading-tight">
            {title}
          </h1>

          {description && (
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base sm:leading-7">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-2 xl:justify-end">
            {actions}
          </div>
        )}
      </div>

      {showSectionNav && <SectionNav />}

      {children}
    </div>
  );
}
