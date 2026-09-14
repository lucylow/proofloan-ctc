import type { ReactNode } from "react";
import { Link } from "wouter";
import { sanitizeInternalPath } from "@/hardening/safeNavigation";

export function GuardedLink({
  href,
  children,
  className,
}: {
  href: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <Link href={sanitizeInternalPath(href)} className={className}>
      {children}
    </Link>
  );
}
