import { describe, expect, it } from "vitest";
import { allocateOperatorRewards } from "./operators";

describe("ATC operator allocation", () => {
  it("allocates the operator pool by weight without exceeding it", () => {
    const allocations = allocateOperatorRewards("100", [
      { operatorId: "op-a", name: "A", weight: 70, address: "0xa" },
      { operatorId: "op-b", name: "B", weight: 30, address: "0xb" },
    ]);
    const total = allocations.reduce((sum, item) => sum + BigInt(item.amountAtomic), 0n);
    expect(total).toBe(100n);
    expect(allocations.find(item => item.operatorId === "op-a")?.amountAtomic).toBe("70");
    expect(allocations.find(item => item.operatorId === "op-b")?.amountAtomic).toBe("30");
  });

  it("assigns remainder dust to the highest-weight operator", () => {
    const allocations = allocateOperatorRewards("10", [
      { operatorId: "op-a", name: "A", weight: 50, address: "0xa" },
      { operatorId: "op-b", name: "B", weight: 30, address: "0xb" },
      { operatorId: "op-c", name: "C", weight: 20, address: "0xc" },
    ]);
    const total = allocations.reduce((sum, item) => sum + BigInt(item.amountAtomic), 0n);
    expect(total).toBe(10n);
    expect(allocations.every(item => BigInt(item.amountAtomic) >= 0n)).toBe(true);
  });
});
