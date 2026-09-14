import { afterEach, describe, expect, it } from "vitest";
import {
  recordMultichainEvent,
  resetMultichainMetrics,
  snapshotMultichainMetrics,
} from "./observability";

describe("multi-chain observability", () => {
  afterEach(() => {
    resetMultichainMetrics();
  });

  it("records in-process counters for RPC, proof, and policy events", () => {
    recordMultichainEvent("rpc_success", "https://example");
    recordMultichainEvent("rpc_failover", "https://backup");
    recordMultichainEvent("proof_rejected", "polygon-amoy");
    const snapshot = snapshotMultichainMetrics();
    expect(snapshot.rpcSuccesses).toBe(1);
    expect(snapshot.rpcFailovers).toBe(1);
    expect(snapshot.rejectedProofs).toBe(1);
    expect(snapshot.lastEvent).toBe("proof_rejected");
  });
});
