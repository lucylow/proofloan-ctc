import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type PanelProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  padded?: boolean;
  interactive?: boolean;
  accent?: boolean;
};

export function Panel({
  className,
  children,
  padded = false,
  interactive = false,
  accent = false,
  ...props
}: PanelProps) {
  return (
    <div
      className={cn(
        "pl-panel rounded-3xl",
        padded && "p-5 sm:p-6",
        interactive && "pl-panel-interactive",
        accent && "pl-panel-accent",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
