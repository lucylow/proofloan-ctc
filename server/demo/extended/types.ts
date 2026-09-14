import type { DemoFactSpec, DemoFailureKind } from "../types";

export type ExtendedScenarioKind =
  | "happy-path" | "freshness" | "late-payment" | "sparse-evidence"
  | "cross-chain" | "attestor-failure" | "rpc-failure" | "proof-builder-failure"
  | "gas-pressure" | "merkle-pressure" | "ai-abstain" | "riskguard-block"
  | "operator-recovery" | "reorg-recovery";

export type ExtendedScenarioCase = {
  id: string;
  label: string;
  kind: ExtendedScenarioKind;
  description: string;
  walletSeed: string;
  transactionSeed: string;
  chain: "Ethereum Sepolia" | "Ethereum Mainnet";
  facts: DemoFactSpec[];
  failure?: { kind: DemoFailureKind; message: string; retryAfterMs?: number };
  expectations: {
    minEvidence: number;
    maxEvidence?: number;
    freshness?: "Fresh" | "Aging" | "Stale";
    requireFallback?: boolean;
    allowOffer?: boolean;
    requireAbstention?: boolean;
    requirePolicyBlock?: boolean;
  };
  tags: string[];
};

export type ExtendedScenarioBatch = {
  generatedAt: string;
  total: number;
  cases: ExtendedScenarioCase[];
  countsByKind: Record<string, number>;
};
