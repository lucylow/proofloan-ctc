import { ReactNode, Suspense } from "react";
import { PageSkeleton } from "./PageSkeleton";
import { RouteRecoveryBoundary } from "./RouteRecoveryBoundary";

export function RouteLoadingGuard({ children, routeName }: { children: ReactNode; routeName?: string }) {
  return (
    <RouteRecoveryBoundary routeName={routeName}>
      <Suspense fallback={<PageSkeleton />}>
        {children}
      </Suspense>
    </RouteRecoveryBoundary>
  );
}
