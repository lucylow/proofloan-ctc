export type MultichainMetricEvent =
  | "rpc_success"
  | "rpc_failure"
  | "rpc_failover"
  | "proof_live"
  | "proof_preview"
  | "proof_rejected"
  | "circuit_open"
  | "health_probe";

export type MultichainMetricsSnapshot = {
  rpcSuccesses: number;
  rpcFailures: number;
  rpcFailovers: number;
  liveProofs: number;
  previewProofs: number;
  rejectedProofs: number;
  circuitOpens: number;
  healthProbes: number;
  lastEvent?: MultichainMetricEvent;
  lastTarget?: string;
};

const state: MultichainMetricsSnapshot = {
  rpcSuccesses: 0,
  rpcFailures: 0,
  rpcFailovers: 0,
  liveProofs: 0,
  previewProofs: 0,
  rejectedProofs: 0,
  circuitOpens: 0,
  healthProbes: 0,
};

export function recordMultichainEvent(
  event: MultichainMetricEvent,
  target?: string,
) {
  if (event === "rpc_success") state.rpcSuccesses += 1;
  if (event === "rpc_failure") state.rpcFailures += 1;
  if (event === "rpc_failover") state.rpcFailovers += 1;
  if (event === "proof_live") state.liveProofs += 1;
  if (event === "proof_preview") state.previewProofs += 1;
  if (event === "proof_rejected") state.rejectedProofs += 1;
  if (event === "circuit_open") state.circuitOpens += 1;
  if (event === "health_probe") state.healthProbes += 1;
  state.lastEvent = event;
  state.lastTarget = target;
}

export function snapshotMultichainMetrics(): MultichainMetricsSnapshot {
  return { ...state };
}

export function resetMultichainMetrics() {
  state.rpcSuccesses = 0;
  state.rpcFailures = 0;
  state.rpcFailovers = 0;
  state.liveProofs = 0;
  state.previewProofs = 0;
  state.rejectedProofs = 0;
  state.circuitOpens = 0;
  state.healthProbes = 0;
  state.lastEvent = undefined;
  state.lastTarget = undefined;
}
