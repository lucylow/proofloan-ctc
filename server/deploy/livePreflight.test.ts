import { describe, expect, it } from "vitest";
import { CREDITCOIN_DEPLOY_NETWORKS } from "./networks";
import { probeDeployNetwork } from "./preflight";

describe("live Creditcoin RPC preflight", () => {
  it(
    "reaches CC3 Testnet and reports chain ID 102031",
    async () => {
      const probe = await probeDeployNetwork(CREDITCOIN_DEPLOY_NETWORKS["cc3-testnet"]);
      expect(probe.ok).toBe(true);
      expect(probe.chainId).toBe(102031);
      expect(probe.blockNumber).toBeGreaterThan(0);
    },
    20_000,
  );

  it(
    "reaches CC3 Mainnet and reports chain ID 102030",
    async () => {
      const probe = await probeDeployNetwork(CREDITCOIN_DEPLOY_NETWORKS["cc3-mainnet"]);
      expect(probe.ok).toBe(true);
      expect(probe.chainId).toBe(102030);
      expect(probe.blockNumber).toBeGreaterThan(0);
    },
    20_000,
  );
});
