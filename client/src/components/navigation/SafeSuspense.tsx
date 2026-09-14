import { Suspense, ReactNode } from "react";
import { PageSkeleton } from "./PageSkeleton";
import { HardenedErrorBoundary } from "../HardenedErrorBoundary";

export function SafeSuspense({
  children,
  routeName,
}: {
  children: ReactNode;
  routeName?: string;
}) {
  return (
    <HardenedErrorBoundary>
      <Suspense fallback={<PageSkeleton />}>
        {children}
      </Suspense>
    </HardenedErrorBoundary>
  );
}
