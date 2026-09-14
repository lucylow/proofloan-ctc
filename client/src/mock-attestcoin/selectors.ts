import { PRIMARY_APPLICATION_ID, PRIMARY_WALLET_ID } from "./constants";
import type { MockDataset } from "./types";

export function selectPrimaryApplication(dataset: MockDataset) {
  return dataset.applications.find(item => item.id === PRIMARY_APPLICATION_ID) ?? dataset.applications[0];
}

export function selectPrimaryWallet(dataset: MockDataset) {
  return dataset.wallets.find(item => item.id === PRIMARY_WALLET_ID) ?? dataset.wallets[0];
}

export function selectFactsForApplication(dataset: MockDataset, applicationId: string) {
  return dataset.facts.filter(fact => fact.applicationId === applicationId);
}

export function selectProofsForApplication(dataset: MockDataset, applicationId: string) {
  return dataset.proofRequests.filter(proof => proof.applicationId === applicationId);
}

export function selectDecisionForApplication(dataset: MockDataset, applicationId: string) {
  return dataset.decisions.find(decision => decision.applicationId === applicationId);
}

export function selectVerifiedFactCount(dataset: MockDataset) {
  return dataset.facts.filter(fact => fact.sourceVerified).length;
}

export function selectPreviewFactCount(dataset: MockDataset) {
  return dataset.facts.filter(fact => !fact.sourceVerified).length;
}

export function selectChainCoverage(dataset: MockDataset) {
  return Array.from(new Set(dataset.facts.map(fact => fact.chainName)));
}
