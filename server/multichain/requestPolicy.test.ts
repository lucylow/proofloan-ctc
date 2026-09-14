import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { POLYGON_AMOY_LIVE_PROOF_REJECTION } from "@shared/multichain";
import { classifyProofRequest, liveProofAllowed } from "./requestPolicy";
import { resetEnvironmentCache } from "./environment";

const LIVE_HASH = `0x${"ab".repeat(32)}`;

describe("proof request policy", () => {
  beforeEach(() => {
    process.env.ATTESTCOIN_ENVIRONMENT = "cc3-testnet";
    resetEnvironmentCache();
  });

  afterEach(() => {
    resetEnvironmentCache();
  });
  it("allows live proofs for official CC3 Testnet Sepolia", () => {
    const decision = classifyProofRequest({
      txHash: LIVE_HASH,
      sourceChain: "Ethereum Sepolia",
      intent: "live",
    });
    expect(decision.kind).toBe("live");
    if (decision.kind === "live") {
      expect(decision.chainKey).toBe(1);
    }
    expect(liveProofAllowed("Ethereum Sepolia")).toBe(true);
  });

  it("allows live proofs for Ethereum Mainnet on CC3 Testnet with chainkey 3", () => {
    const decision = classifyProofRequest({
      txHash: LIVE_HASH,
      sourceChain: "Ethereum Mainnet",
      intent: "live",
    });
    expect(decision.kind).toBe("live");
    if (decision.kind === "live") {
      expect(decision.chainKey).toBe(3);
    }
  });

  it("rejects a live Polygon Amoy proof with an explicit experimental explanation", () => {
    const decision = classifyProofRequest({
      txHash: LIVE_HASH,
      sourceChain: "Polygon Amoy",
      intent: "live",
    });
    expect(decision.kind).toBe("reject");
    if (decision.kind === "reject") {
      expect(decision.reason).toBe(POLYGON_AMOY_LIVE_PROOF_REJECTION);
      expect(decision.reason).toContain("no official chainkey");
    }
    expect(liveProofAllowed("Polygon Amoy")).toBe(false);
  });

  it("keeps Polygon Amoy preview available", () => {
    const decision = classifyProofRequest({
      sourceChain: "Polygon Amoy",
      intent: "preview",
    });
    expect(decision.kind).toBe("preview");
  });

  it("does not invent a Sepolia chainkey on CC3 Mainnet", () => {
    process.env.ATTESTCOIN_ENVIRONMENT = "cc3-mainnet";
    resetEnvironmentCache();
    const decision = classifyProofRequest({
      txHash: LIVE_HASH,
      sourceChain: "Ethereum Sepolia",
      intent: "live",
    });
    expect(decision.kind).toBe("reject");
    process.env.ATTESTCOIN_ENVIRONMENT = "cc3-testnet";
    resetEnvironmentCache();
  });
});
