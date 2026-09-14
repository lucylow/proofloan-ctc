import { MOCK_NOW_ISO, MOCK_SEED, type MockScenario } from "./constants";
import { MOCK_CHAINS } from "./chainCatalog";
import type { MockAnalytics, MockDataset } from "./types";
import { createMockHealth } from "./healthFactory";
import {
  createMockApplications,
  createMockAttestations,
  createMockContinuityProofs,
  createMockDecisions,
  createMockEvidenceGraph,
  createMockEvidenceSnapshots,
  createMockFacts,
  createMockFeatures,
  createMockMerkleProofs,
  createMockNotifications,
  createMockOffers,
  createMockProofRequests,
  createMockRiskGuards,
  createMockSourceBlocks,
  createMockTimelines,
  createMockTransactions,
  createMockWallets,
} from "./factories";

export function createMockAnalytics(dataset: Omit<MockDataset, "analytics">): MockAnalytics {
  const verifiedFacts = dataset.facts.filter(fact => fact.sourceVerified).length;
  const proofsVerified = dataset.proofRequests.filter(proof => proof.status === "verified").length;
  const proofsRejected = dataset.proofRequests.filter(proof => proof.status === "rejected").length;
  const latency = dataset.proofRequests.length === 0
    ? 0
    : Math.round(dataset.proofRequests.reduce((total, proof) => total + proof.latencyMs, 0) / dataset.proofRequests.length);

  return {
    applications: dataset.applications.length,
    facts: dataset.facts.length,
    verifiedFacts,
    previewFacts: dataset.facts.length - verifiedFacts,
    proofsVerified,
    proofsRejected,
    averageProofLatencyMs: latency,
    chainCoverage: new Set(dataset.facts.map(fact => fact.chainId)).size,
  };
}

export function createMockDataset(scenario: MockScenario = "hero", seed = MOCK_SEED): MockDataset {
  const wallets = createMockWallets(seed, scenario);
  const applications = createMockApplications(scenario);
  const transactions = createMockTransactions(seed, applications, scenario);
  const sourceBlocks = createMockSourceBlocks(seed, transactions);
  const proofRequests = createMockProofRequests(transactions, scenario);
  const attestations = createMockAttestations(proofRequests);
  const merkleProofs = createMockMerkleProofs(seed, proofRequests);
  const continuityProofs = createMockContinuityProofs(seed, proofRequests);
  const facts = createMockFacts(transactions, proofRequests, scenario);
  const evidenceGraph = createMockEvidenceGraph(facts, proofRequests);
  const evidenceSnapshots = createMockEvidenceSnapshots(facts);
  const features = createMockFeatures(applications, facts);
  const decisions = createMockDecisions(applications, features, evidenceSnapshots);
  const riskGuards = createMockRiskGuards(applications, features);
  const offers = createMockOffers(applications, riskGuards);
  const timelines = createMockTimelines(applications, facts, proofRequests);
  const notifications = createMockNotifications(scenario, proofRequests);
  const health = createMockHealth(scenario);

  const partial: Omit<MockDataset, "analytics"> = {
    seed,
    scenario,
    generatedAt: MOCK_NOW_ISO,
    presentationOnly: true,
    chains: MOCK_CHAINS,
    wallets,
    applications,
    transactions,
    sourceBlocks,
    proofRequests,
    attestations,
    merkleProofs,
    continuityProofs,
    facts,
    evidenceGraph,
    evidenceSnapshots,
    features,
    decisions,
    riskGuards,
    offers,
    timelines,
    notifications,
    health,
  };

  return {
    ...partial,
    analytics: createMockAnalytics(partial),
  };
}
