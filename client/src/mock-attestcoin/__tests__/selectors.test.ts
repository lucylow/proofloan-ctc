import { describe, expect, it } from "vitest";
import { PRIMARY_APPLICATION_ID, PRIMARY_WALLET_ID } from "../constants";
import { createMockDataset } from "../createMockDataset";
import {
  selectChainCoverage,
  selectDecisionForApplication,
  selectFactsForApplication,
  selectPreviewFactCount,
  selectPrimaryApplication,
  selectPrimaryWallet,
  selectProofsForApplication,
  selectVerifiedFactCount,
} from "../selectors";

describe("mock Attestcoin selectors", () => {
  it("selects the primary application and wallet", () => {
    const dataset = createMockDataset("hero");
    expect(selectPrimaryApplication(dataset)?.id).toBe(PRIMARY_APPLICATION_ID);
    expect(selectPrimaryWallet(dataset)?.id).toBe(PRIMARY_WALLET_ID);
  });

  it("returns undefined-safe fallbacks on empty datasets", () => {
    const dataset = createMockDataset("empty");
    expect(selectPrimaryApplication(dataset)).toBeUndefined();
    expect(selectPrimaryWallet(dataset)).toBeUndefined();
    expect(selectVerifiedFactCount(dataset)).toBe(0);
    expect(selectPreviewFactCount(dataset)).toBe(0);
    expect(selectChainCoverage(dataset)).toEqual([]);
  });

  it("scopes facts, proofs, and decisions to an application", () => {
    const dataset = createMockDataset("hero");
    const facts = selectFactsForApplication(dataset, PRIMARY_APPLICATION_ID);
    const proofs = selectProofsForApplication(dataset, PRIMARY_APPLICATION_ID);
    const decision = selectDecisionForApplication(dataset, PRIMARY_APPLICATION_ID);
    expect(facts.every(fact => fact.applicationId === PRIMARY_APPLICATION_ID)).toBe(true);
    expect(proofs.every(proof => proof.applicationId === PRIMARY_APPLICATION_ID)).toBe(true);
    expect(decision?.applicationId).toBe(PRIMARY_APPLICATION_ID);
    expect(selectVerifiedFactCount(dataset) + selectPreviewFactCount(dataset)).toBe(dataset.facts.length);
  });
});
