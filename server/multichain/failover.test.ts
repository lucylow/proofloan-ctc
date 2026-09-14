import { describe, expect, it } from "vitest";
import { FailoverExhaustedError, firstHealthyTarget, withFailover } from "./failover";

describe("provider failover", () => {
  it("returns the first healthy target", async () => {
    const result = await withFailover(
      ["https://dead.example", "https://live.example"],
      async target => {
        if (target.includes("dead")) throw new Error("offline");
        return `ok:${target}`;
      },
    );

    expect(result.value).toBe("ok:https://live.example");
    expect(result.failedOver).toBe(true);
    expect(result.attempts).toHaveLength(2);
    expect(firstHealthyTarget(result.attempts)).toBe("https://live.example");
  });

  it("exhausts the target list when every provider fails", async () => {
    await expect(
      withFailover(["a", "b"], async () => {
        throw new Error("nope");
      }, { label: "rpc" }),
    ).rejects.toBeInstanceOf(FailoverExhaustedError);
  });
});
