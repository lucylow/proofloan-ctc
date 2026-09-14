import { describe, expect, it } from "vitest";
import { startRouteHealthTracking } from "../routeHealth";

describe("route health", () => {
  it("returns a completion function", () => {
    const end = startRouteHealthTracking("/dashboard");
    const result = end();
    expect(result.path).toBe("/dashboard");
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });
});
