import { describe, expect, it } from "vitest";
import { officialOperatorPolicy } from "./policy";
import { AccountSeparation } from "./accounts";
import { OperatorStateMachine } from "./stateMachine";
import { operatorRetryDelay, isRetryableOperatorError } from "./backoff";
import { assessElection } from "./election";
import { authorizationCheck, canRegister } from "./authorization";
import { registrationPlan, signalPlan, chillPlan } from "./registration";
import { OperatorRpcManager, endpointFromUrl } from "./rpc";
import { validateRpcEndpoint, rpcPolicy } from "./rpcPolicy";
import { validateP2PConfig } from "./p2p";
import { inspectSecret, redactRpc, assertNoSecretInLog } from "./security";
import { currentEpoch, secondsToEpochEnd } from "./epoch";
import { reconcileOperator } from "./reconciler";
import { prometheusText } from "./metricsText";
import { OperatorMetrics } from "./metrics";
import { AttestorOperatorService } from "./operatorService";
import { fromEnv, fromCli, mergeConfig } from "./config";
import { OperatorError, normalizeOperatorError, trpcCodeForOperatorError } from "./errors";
import type { OperatorAccount, OperatorOnChainState } from "./types";

const attestor: OperatorAccount = { address: "A", role: "attestor", keyType: "sr25519", secretConfigured: true, custody: "hot" };
const stash: OperatorAccount = { address: "B", role: "stash", keyType: "sr25519", secretConfigured: false, custody: "cold" };

function state(overrides: Partial<OperatorOnChainState> = {}): OperatorOnChainState {
  return {
    operatorId: "x",
    environment: "cc3-testnet",
    chainKey: 3,
    attestorAddress: "A",
    stashAddress: "B",
    authorized: true,
    registered: true,
    status: "idle",
    elected: false,
    active: false,
    ...overrides,
  };
}

describe("operator integration", () => {
  it("keeps attestor and stash separate", () => {
    expect(new AccountSeparation().validate(attestor, stash)).toEqual([]);
  });

  it("rejects colocated or identical operator accounts", () => {
    const errors = new AccountSeparation().validate(
      { ...attestor, address: "same" },
      { ...stash, address: "same", secretConfigured: true, custody: "hot" },
    );
    expect(errors.join(" ")).toMatch(/different/i);
    expect(errors.join(" ")).toMatch(/Stash/);
  });

  it("models waiting until the next election", () => {
    const p = officialOperatorPolicy("cc3-testnet");
    expect(p.chainKey).toBe(3);
    expect(officialOperatorPolicy("cc3-mainnet").chainKey).toBe(1);
    const r = assessElection(state({ status: "waiting" }), p);
    expect(r.selectable).toBe(true);
    expect(r.nextEpochRequired).toBe(true);
  });

  it("allows documented lifecycle transitions", () => {
    const sm = new OperatorStateMachine();
    expect(sm.transition({ operatorId: "x", from: "idle", to: "waiting", reason: "ready" }).to).toBe("waiting");
    expect(sm.transition({ operatorId: "x", from: "waiting", to: "active", reason: "elected" }).to).toBe("active");
    expect(sm.canTransition("active", "leaving")).toBe(true);
    expect(() => sm.transition({ operatorId: "x", from: "unregistered", to: "active", reason: "skip" })).toThrow(/Invalid operator transition/);
  });

  it("uses bounded retry delay", () => {
    expect(operatorRetryDelay(1, 100, 1000, 0)).toBe(100);
    expect(operatorRetryDelay(10, 100, 1000, 0)).toBe(1000);
    expect(isRetryableOperatorError(new Error("connection timeout"))).toBe(true);
  });

  it("requires authorization before registerAttestor on AuthorizedOnly networks", () => {
    const policy = officialOperatorPolicy("cc3-testnet");
    expect(policy.electionMode).toBe("AuthorizedOnly");
    expect(canRegister(state({ authorized: false, registered: false, status: "unregistered" }), policy)).toBe(false);
    expect(authorizationCheck(state({ authorized: false }), policy).ok).toBe(false);
    const plan = registrationPlan(state({ authorized: true, registered: false, status: "unregistered" }), policy, true);
    expect(plan.allowed).toBe(true);
    expect(plan.warnings.some(warning => warning.includes("NotPreAuthorizedToRegister"))).toBe(true);
  });

  it("plans daemon attest() signaling from Idle and clean chill from Active", () => {
    const policy = officialOperatorPolicy("cc3-testnet");
    expect(signalPlan(state({ status: "idle" }), policy).allowed).toBe(true);
    expect(signalPlan(state({ status: "unregistered" }), policy).allowed).toBe(false);
    const chill = chillPlan(state({ status: "active" }));
    expect(chill.allowed).toBe(true);
    expect(chill.warnings.join(" ")).toMatch(/Leaving/);
  });

  it("validates websocket RPC, historical Ethereum access, and P2P boot-node readiness", () => {
    expect(endpointFromUrl("cc3", "https://rpc.example")).toBeUndefined();
    const eth = endpointFromUrl("ethereum", "wss://eth.example/ws")!;
    expect(validateRpcEndpoint(eth, rpcPolicy("ethereum"))).toEqual([]);
    expect(validateP2PConfig({ port: 9000, noMdns: true, bootNodes: [], publicAddress: undefined }).length).toBeGreaterThan(0);
    expect(validateP2PConfig({ port: 9000, noMdns: true, bootNodes: ["/ip4/1.2.3.4/tcp/9000"], publicAddress: "/ip4/5.6.7.8/tcp/9000" })).toEqual([]);
  });

  it("fails over across healthy RPC endpoints without logging secrets", () => {
    const rpc = new OperatorRpcManager([
      { role: "cc3", url: "wss://a", scheme: "wss", selfHosted: true, healthy: false, supportsHistoricalBlocks: false, maxConcurrency: 8 },
      { role: "cc3", url: "wss://b", scheme: "wss", selfHosted: true, healthy: true, supportsHistoricalBlocks: false, maxConcurrency: 8 },
    ]);
    expect(rpc.choose("cc3").url).toBe("wss://b");
    expect(inspectSecret("alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu").ok).toBe(true);
    expect(redactRpc("wss://user:pass@host/path?apiKey=secret")).not.toMatch(/pass|secret/);
    expect(() => assertNoSecretInLog("seed phrase leaked here", "seed phrase leaked here")).toThrow(/Secret material/);
  });

  it("tracks 12-hour epochs and reconciles local vs on-chain status", () => {
    const genesis = Date.parse("2026-01-01T00:00:00.000Z");
    const now = genesis + 13 * 60 * 60 * 1000;
    expect(currentEpoch(now, genesis, 12 * 60 * 60)).toBe(1);
    expect(secondsToEpochEnd(now, genesis, 12 * 60 * 60)).toBe(11 * 60 * 60);
    const issues = reconcileOperator({ status: "idle", chainKey: 3, attestorAddress: "A" }, state({ status: "waiting" }));
    expect(issues.some(issue => issue.field === "status")).toBe(true);
  });

  it("exports prometheus text and never auto-submits dangerous operator actions", () => {
    const metrics = new OperatorMetrics();
    metrics.increment("lifecycle.waiting");
    expect(prometheusText(metrics)).toMatch(/proofloan_attestor_operator_lifecycle_waiting 1/);
    const service = new AttestorOperatorService({
      operatorId: "x",
      environment: "cc3-testnet",
      chainKey: 3,
      node: {},
      attestor,
      stash,
      state: state({ authorized: true, registered: false, status: "unregistered" }),
    });
    const readiness = service.evaluateCurrent();
    const plan = service.actionPlan("register", readiness);
    expect(plan.action).toBe("register");
    expect(plan.allowed).toBe(true);
    expect(service.actionPlan("rotate-secret", readiness).allowed).toBe(false);
  });

  it("maps operator failures to typed OperatorError codes", () => {
    const sm = new OperatorStateMachine();
    try {
      sm.transition({ operatorId: "x", from: "unregistered", to: "active", reason: "skip" });
      throw new Error("expected lifecycle error");
    } catch (error) {
      expect(error).toBeInstanceOf(OperatorError);
      const normalized = normalizeOperatorError(error);
      expect(normalized.code).toBe("LIFECYCLE");
      expect(trpcCodeForOperatorError(normalized)).toBe("CONFLICT");
    }
  });

  it("merges file, env, and CLI operator config", () => {
    const merged = mergeConfig({ name: "file-node" }, fromEnv({ ATTESTOR_CHAIN_KEY: "1", ATTESTOR_NO_MDNS: "true" }), fromCli(["--name", "cli-node", "--p2p-port", "9000", "--eth-url", "wss://eth", "--cc3-url", "wss://cc3"]));
    expect(merged.name).toBe("cli-node");
    expect(merged.p2pPort).toBe(9000);
    expect(merged.noMdns).toBe(true);
    expect(merged.eth.url).toBe("wss://eth");
  });
});
