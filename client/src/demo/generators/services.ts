import type {
  DemoSystemService,
} from "../types";

export function createDemoServices(): DemoSystemService[] {
  return [
    {
      id: "wallet",
      name: "Wallet gateway",
      status: "healthy",
      latencyMs: 84,
      lastChecked: new Date().toISOString(),
    },
    {
      id: "attestcoin",
      name: "Attestcoin verifier",
      status: "healthy",
      latencyMs: 142,
      lastChecked: new Date().toISOString(),
    },
    {
      id: "proof-worker",
      name: "Proof worker",
      status: "healthy",
      latencyMs: 227,
      lastChecked: new Date().toISOString(),
    },
    {
      id: "underwriter",
      name: "Underwriting service",
      status: "healthy",
      latencyMs: 311,
      lastChecked: new Date().toISOString(),
    },
    {
      id: "riskguard",
      name: "RiskGuard",
      status: "healthy",
      latencyMs: 118,
      lastChecked: new Date().toISOString(),
    },
    {
      id: "execution",
      name: "Execution gateway",
      status: "degraded",
      latencyMs: 742,
      lastChecked: new Date().toISOString(),
    },
  ];
}
