import type { MockNotification, MockProofRequest, MockScenario } from "../types";
import { atOffset } from "../utils";

export function createMockNotifications(scenario: MockScenario, proofs: MockProofRequest[]): MockNotification[] {
  if (scenario === "empty") return [];

  const delayed = proofs.some(proof => proof.status === "delayed");
  const rejected = proofs.some(proof => proof.status === "rejected");

  return [
    {
      id: "N-PROTOCOL",
      title: "Presentation dataset active",
      description: "Mock Attestcoin records are labeled and isolated from live proof execution.",
      timestamp: atOffset(1),
      read: scenario === "judge",
      severity: "info",
    },
    ...(delayed ? [{
      id: "N-DELAY",
      title: "Proof delay",
      description: "A source block is still waiting for attestation.",
      timestamp: atOffset(0.4),
      read: false,
      severity: "warning" as const,
    }] : []),
    ...(rejected ? [{
      id: "N-REJECT",
      title: "Proof rejected",
      description: "Creditcoin verification returned false; no fact was admitted as live truth.",
      timestamp: atOffset(0.2),
      read: false,
      severity: "error" as const,
    }] : []),
    ...(scenario === "recovery" ? [{
      id: "N-RECOVERY",
      title: "Protocol health degraded",
      description: "Retryable Attestcoin infrastructure failures are visible in health diagnostics.",
      timestamp: atOffset(0.1),
      read: false,
      severity: "error" as const,
    }] : []),
  ];
}
