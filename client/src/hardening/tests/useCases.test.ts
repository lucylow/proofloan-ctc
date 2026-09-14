import { describe, expect, it } from "vitest";
import { getRecommendedRecovery } from "../errorRecovery";
import { normalizeAppError } from "../appError";

describe("recovery use cases", () => {
  it("does not suggest retry for rejected wallet actions", () => {
    const error = normalizeAppError(new Error("User rejected wallet request"));
    expect(getRecommendedRecovery(error)).toBe("connect");
  });
});
