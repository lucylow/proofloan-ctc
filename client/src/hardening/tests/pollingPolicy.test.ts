import { describe, expect, it } from "vitest";
import { getPollingDelay } from "../pollingPolicy";

describe("polling policy", () => {
  it("pauses polling offline", () => {
    expect(getPollingDelay({ online: false, visible: true, hasWork: true, attempt: 0 })).toBeNull();
  });
  it("backs off", () => {
    expect(getPollingDelay({ online: true, visible: true, hasWork: true, attempt: 1 })).toBe(6000);
  });
});
