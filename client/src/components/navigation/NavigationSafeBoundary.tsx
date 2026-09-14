import { ReactNode } from "react";
import { HardenedErrorBoundary } from "@/components/HardenedErrorBoundary";
import { RouteGuard } from "./RouteGuard";

export function NavigationSafeBoundary({ children }: { children: ReactNode }) {
  return (
    <HardenedErrorBoundary>
      <RouteGuard>{children}</RouteGuard>
    </HardenedErrorBoundary>
  );
}
