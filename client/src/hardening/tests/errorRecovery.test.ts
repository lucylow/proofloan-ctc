import { describe, expect, it } from "vitest";
import { normalizeAppError } from "../appError";
import { getRecommendedRecovery } from "../errorRecovery";

describe("recovery recommendation", () => {
  it("suggests retry for network failures", () => {
    const error = normalizeAppError(new Error("Failed to fetch"));
    expect(getRecommendedRecovery(error)).toBe("retry");
  });
});
