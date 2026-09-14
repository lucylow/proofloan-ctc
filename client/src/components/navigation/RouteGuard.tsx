import { ReactNode } from "react";
import { useLocation } from "wouter";
import { isKnownRootRoute } from "@/hardening/routeRegistry";
import { navigateSafely } from "@/hardening/safeNavigation";

export function RouteGuard({ children }: { children: ReactNode }) {
  const [location, navigate] = useLocation();

  if (!isKnownRootRoute(location)) {
    navigateSafely(navigate, "/404");
    return null;
  }

  return <>{children}</>;
}
