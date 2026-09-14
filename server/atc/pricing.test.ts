import { describe, expect, it } from "vitest";
import { feeSplitReconciles, formatAtcAmount, splitAtcFee } from "@shared/atc";
import { loadAtcConfigFromEnv, toPublicFeePolicy } from "./config";
import { hashAtcPayload, quoteActionFee, quoteFreeRead } from "./pricing";

const policy = toPublicFeePolicy(loadAtcConfigFromEnv());

describe("ATC pricing", () => {
  it("issues a zero-cost read quote", () => {
    const quote = quoteFreeRead(
      { environment: "cc3-testnet", actionKind: "cross-chain-message" },
      policy,
      "ethereum-sepolia",
      "creditcoin",
    );
    expect(quote.kind).toBe("read");
    expect(quote.totalAtomic).toBe("0");
    expect(quote.operatorRewardAtomic).toBe("0");
    expect(quote.burnAtomic).toBe("0");
    expect(quote.treasuryAtomic).toBe("0");
    expect(feeSplitReconciles(quote.fee)).toBe(true);
  });

  it("quotes a positive ATC fee for a cross-chain action", () => {
    const quote = quoteActionFee(
      {
        environment: "cc3-testnet",
        sender: "0xproofloan",
        sourceChain: "creditcoin",
        destinationChain: "ethereum-sepolia",
        actionKind: "cross-chain-message",
        payload: { applicationId: "PL-DEMO12345678", event: "credit-approved" },
        proofCount: 1,
        priority: "standard",
      },
      policy,
      "creditcoin",
      "ethereum-sepolia",
    );
    expect(quote.kind).toBe("action");
    expect(BigInt(quote.totalAtomic) > 0n).toBe(true);
    expect(feeSplitReconciles(quote.fee)).toBe(true);
    expect(quote.payloadHash).toBe(
      hashAtcPayload({ applicationId: "PL-DEMO12345678", event: "credit-approved" }),
    );
  });

  it("charges more for fast priority than standard", () => {
    const input = {
      environment: "cc3-testnet" as const,
      sender: "0xproofloan",
      sourceChain: "creditcoin",
      destinationChain: "ethereum-sepolia",
      actionKind: "credit-execution" as const,
      payload: { applicationId: "PL-FAST00000001" },
      proofCount: 0,
    };
    const standard = quoteActionFee({ ...input, priority: "standard" }, policy, "creditcoin", "ethereum-sepolia");
    const fast = quoteActionFee({ ...input, priority: "fast" }, policy, "creditcoin", "ethereum-sepolia");
    expect(BigInt(fast.totalAtomic) > BigInt(standard.totalAtomic)).toBe(true);
  });

  it("keeps payload hashing canonical across key order", () => {
    expect(hashAtcPayload({ b: 2, a: 1 })).toBe(hashAtcPayload({ a: 1, b: 2 }));
  });

  it("reconciles demo operator/burn splits exactly", () => {
    const split = splitAtcFee("100000000000000000", 7000, 3000, 0);
    expect(split.operatorRewardAtomic).toBe("70000000000000000");
    expect(split.burnAtomic).toBe("30000000000000000");
    expect(split.treasuryAtomic).toBe("0");
    expect(formatAtcAmount(split.totalAtomic)).toBe("0.1");
  });
});
