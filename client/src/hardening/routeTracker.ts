import { pushTelemetry } from "./telemetryBuffer";

export function trackRoute(path: string) {
  pushTelemetry({
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: "route_view",
    timestamp: Date.now(),
    metadata: { path: path.slice(0, 150) },
  });
}
