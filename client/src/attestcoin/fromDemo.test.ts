import { describe, expect, it } from "vitest";
import { normalizeAttestcoinClientError } from "./error";
import { toAttestcoinFacts } from "./fromDemo";
import type { DemoEvidence } from "@/demo/types";

describe("Attestcoin client error normalization", () => {
  it("extracts protocol kinds and retryability", () => {
    const error = normalizeAttestcoinClientError(
      new Error("[ATTESTCOIN:SOURCE_RPC] Source transaction has not been mined."),
    );
    expect(error.kind).toBe("SOURCE_RPC");
    expect(error.retriable).toBe(true);
    expect(error.message).toBe("Source transaction has not been mined.");
  });
});

describe("demo evidence mapping", () => {
  it("keeps unverified demo facts labeled as preview", () => {
    const facts = toAttestcoinFacts([
      {
        id: "EV-001",
        applicationId: "PL-7F42A91C",
        chain: "Ethereum Sepolia",
        chainId: 11155111,
        type: "REPAYMENT",
        amount: 1250,
        currency: "USDC",
        sourceTransaction: "0x4d9f61be92ac812c",
        blockNumber: 6_421_883,
        timestamp: "2026-09-01T00:00:00.000Z",
        freshness: "Fresh",
        verifier: "Attestcoin verifier",
        confidence: 97,
        verified: false,
      } satisfies DemoEvidence,
    ]);

    expect(facts).toHaveLength(1);
    expect(facts[0]?.sourceVerified).toBe(false);
    expect(facts[0]?.eventType).toBe("REPAYMENT");
  });
});
