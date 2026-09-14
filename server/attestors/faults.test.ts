import { describe, expect, it } from "vitest";
import { FaultBook } from "./faults";
import { SlashingEngine } from "./slashing";

describe("Attestor faults", () => {
  it("confirms a fault and calculates slashing", () => {
    const faults = new FaultBook();
    const fault = faults.propose({ operatorId: "bad-attestor", sourceChain: "ethereum-sepolia", category: "double-sign", severity: "critical", evidence: { digest: "0x01" } });
    faults.confirm(fault.faultId, 1000);
    const engine = new SlashingEngine(faults);
    const result = engine.apply({ operatorId: "bad-attestor", payoutAddress: "0x1111111111111111111111111111111111111111", signingAddress: "0x2222222222222222222222222222222222222222", blsPublicKey: `0x${"11".repeat(48)}`, environment: "cc3-testnet", chains: ["ethereum-sepolia"], status: "active", stakeAtomic: "10000", minStakeAtomic: "1000", weightBps: 1000, joinedAt: new Date().toISOString(), lastSeenAt: new Date().toISOString(), uptimeBps: 10000, faultCount: 1, slashCount: 0, rewardAtomic: "0" }, fault.faultId);
    expect(result.slashedAtomic).toBe("1000");
    expect(result.remainingStakeAtomic).toBe("9000");
  });
});
