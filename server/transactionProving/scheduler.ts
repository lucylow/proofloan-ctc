import type { ProofDecision, ProofEnvelope } from "./types";
import { classifyProofRisk } from "./risk";

export interface ScheduledProof {
  envelope: ProofEnvelope;
  decision: ProofDecision;
  priority: number;
}

export class ProofScheduler {
  plan(envelope: ProofEnvelope): ScheduledProof {
    const decision = classifyProofRisk(envelope);
    const priority =
      decision.risk === "low" ? 100 : decision.risk === "medium" ? 60 : decision.risk === "high" ? 20 : 0;
    return { envelope, decision, priority };
  }
}
