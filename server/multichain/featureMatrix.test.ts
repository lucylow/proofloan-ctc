import { describe, expect, it } from "vitest";
import {
  buildFeatureMatrix,
  featureEnabled,
  officialLiveProofChains,
} from "./featureMatrix";

describe("capability matrix", () => {
  it("enables live proof only for officially bound chains", () => {
    const testnet = buildFeatureMatrix("cc3-testnet");
    const sepolia = testnet.find(row => row.name === "Ethereum Sepolia");
    const amoy = testnet.find(row => row.name === "Polygon Amoy");
    const mainnet = testnet.find(row => row.name === "Ethereum Mainnet");

    expect(sepolia?.features["live-proof"]).toBe(true);
    expect(mainnet?.features["live-proof"]).toBe(true);
    expect(amoy?.features["live-proof"]).toBe(false);
    expect(amoy?.features["preview-proof"]).toBe(true);
    expect(officialLiveProofChains("cc3-testnet")).toEqual([
      "Ethereum Sepolia",
      "Ethereum Mainnet",
    ]);
  });

  it("on CC3 Mainnet only lists Ethereum Mainnet as live-proof capable", () => {
    expect(officialLiveProofChains("cc3-mainnet")).toEqual(["Ethereum Mainnet"]);
    expect(featureEnabled("Ethereum Sepolia", "live-proof", "cc3-mainnet")).toBe(false);
    expect(featureEnabled("Ethereum Mainnet", "live-proof", "cc3-mainnet")).toBe(true);
  });
});
