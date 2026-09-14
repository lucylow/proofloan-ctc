import { describe, expect, it } from "vitest";
import { RaceSafe } from "../raceSafe";

describe("race safe", () => {
  it("marks only latest version current", () => {
    const guard = new RaceSafe("x");
    const first = guard.next();
    const second = guard.next();
    expect(guard.isLatest(first)).toBe(false);
    expect(guard.isLatest(second)).toBe(true);
  });
});
