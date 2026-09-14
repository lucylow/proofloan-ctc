import { describe, expect, it } from "vitest";
import { isOnline } from "../network";

describe("online status", () => {
  it("returns a boolean", () => expect(typeof isOnline()).toBe("boolean"));
});
