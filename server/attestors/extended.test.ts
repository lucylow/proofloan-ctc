import { describe, expect, it } from "vitest";
import { AttestorRegistry } from "./registry";
import { AttestorScheduler } from "./scheduler";
import { AttestorWatchtower } from "./watchtower";
import { FaultBook } from "./faults";
import { AttestorRewardLedger } from "./ledger";
import { AttestorRewardEscrow } from "./escrow";
import { MessageDeduper } from "./dedupe";
import { AttestorCircuitBreaker } from "./circuit";
import { classifyQuorum } from "./thresholds";
import { normalizeAttestorProfile, publicAttestorView } from "./normalization";
import type { AttestorProfile } from "@shared/attestors";

const base: AttestorProfile = { operatorId: "extended-1", payoutAddress: "0x1111111111111111111111111111111111111111", signingAddress: "0x2222222222222222222222222222222222222222", blsPublicKey: `0x${"11".repeat(48)}`, environment: "cc3-testnet", chains: ["ethereum-sepolia"], status: "active", stakeAtomic: "10000", minStakeAtomic: "1000", weightBps: 1000, joinedAt: new Date().toISOString(), lastSeenAt: new Date().toISOString(), uptimeBps: 10000, faultCount: 0, slashCount: 0, rewardAtomic: "0" };

describe("extended Attestor subsystem", () => {
  it("normalizes a profile", () => expect(normalizeAttestorProfile({ operatorId: "x", environment: "cc3-testnet", chains: [] }).status).toBe("inactive"));
  it("hides signing material in public views", () => expect(publicAttestorView(base)).not.toHaveProperty("blsPublicKey"));
  it("registers profiles", () => expect(new AttestorRegistry([base]).get(base.operatorId)?.operatorId).toBe(base.operatorId));
  it("schedules work", () => expect(new AttestorScheduler().schedule("ethereum-sepolia", [base])).toHaveLength(1));
  it("classifies quorum", () => expect(classifyQuorum(5000)).toBe("critical"));
  it("deduplicates message IDs", () => { const d = new MessageDeduper(); expect(d.seenBefore("m")).toBe(false); expect(d.seenBefore("m")).toBe(true); });
  it("opens circuit after repeated failure", () => { const c = new AttestorCircuitBreaker(2); c.failure(0); c.failure(1); expect(c.snapshot().state).toBe("open"); });
  it("escrows a reward", () => { const e = new AttestorRewardEscrow(); const r = e.hold({ feeId: "f", operatorId: "x", amountAtomic: "10", status: "accrued", activity: "both" }); expect(e.release(r.key).status).toBe("released"); });
  it("stores rewards", () => { const l = new AttestorRewardLedger(); l.append({ feeId: "f", operatorId: "x", amountAtomic: "12", status: "claimable", activity: "both" }); expect(l.accrued("x")).toBe(12n); });
  it("raises a quorum watch alert when weight collapses", () => { const faults = new FaultBook(); const watch = new AttestorWatchtower(faults); const bad = { ...base, weightBps: 100 }; const alerts = watch.scan([bad], 6667); expect(alerts.some(a => a.type === "quorum-risk")).toBe(true); });
});
