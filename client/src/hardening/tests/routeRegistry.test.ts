import { describe, expect, it } from "vitest";
import { isKnownRootRoute } from "../routeRegistry";

describe("route registry", () => {
  it("recognizes nested application routes", () => {
    expect(isKnownRootRoute("/applications/PL-1")).toBe(true);
    expect(isKnownRootRoute("/applications/PL-1/evidence")).toBe(true);
  });
  it("rejects unknown routes", () => {
    expect(isKnownRootRoute("/evil/path")).toBe(false);
  });
});
