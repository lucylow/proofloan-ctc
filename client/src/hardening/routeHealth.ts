import { trackRoute } from "./routeTracker";

export function startRouteHealthTracking(path: string) {
  const started = performance.now();
  trackRoute(path);

  return () => ({
    path,
    durationMs: Math.round(performance.now() - started),
  });
}
