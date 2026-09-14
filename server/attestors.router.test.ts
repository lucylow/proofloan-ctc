import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Attestor router", () => {
  it("exposes summary, health, and public operators without signing material", async () => {
    const caller = appRouter.createCaller(createContext());
    const summary = await caller.attestors.summary({ environment: "cc3-testnet" });
    expect(summary.activeAttestors).toBeGreaterThanOrEqual(2);
    expect(summary.requiredQuorumBps).toBe(6667);
    expect(summary.totalWeightBps).toBeGreaterThanOrEqual(summary.requiredQuorumBps);

    const health = await caller.attestors.health({ environment: "cc3-testnet" });
    expect(health.snapshot.healthyAttestors).toBe(summary.healthyAttestors);
    expect(health.operators.length).toBeGreaterThanOrEqual(2);

    const operators = await caller.attestors.operators({ environment: "cc3-testnet" });
    expect(operators.items.length).toBeGreaterThanOrEqual(2);
    expect(operators.items[0]).not.toHaveProperty("blsPublicKey");
    expect(operators.items[0]).not.toHaveProperty("signingAddress");
    expect(operators.items[0]).toHaveProperty("identityDigest");
  });

  it("attaches an Attestor network snapshot to preview proof bundles", async () => {
    const caller = appRouter.createCaller(createContext());
    const bundle = await caller.attestcoin.preview({
      walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      sourceChain: "Ethereum Sepolia",
    });
    expect(bundle.attestorNetwork?.environment).toBe("cc3-testnet");
    expect(bundle.attestorNetwork?.healthyAttestors).toBeGreaterThanOrEqual(2);
  });
});
