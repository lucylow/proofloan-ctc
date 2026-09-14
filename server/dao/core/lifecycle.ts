import { DaoError } from "../errors";
import type { GovernanceProposal, ProposalStatus } from "./types";

export function canTransition(from: ProposalStatus, to: ProposalStatus): boolean {
  const edges: Record<ProposalStatus, ProposalStatus[]> = {
    draft: ["active", "cancelled"],
    queued: ["executing", "cancelled", "expired"],
    active: ["passed", "rejected", "cancelled", "expired"],
    passed: ["queued", "executing", "cancelled", "expired"],
    rejected: [],
    executing: ["executed", "cancelled", "queued"],
    executed: [],
    cancelled: [],
    expired: [],
  };
  return edges[from]?.includes(to) ?? false;
}

export function transition(p: GovernanceProposal, to: ProposalStatus): void {
  if (!canTransition(p.status, to)) {
    throw new DaoError("TRANSITION", `Invalid governance transition ${p.status} -> ${to}`);
  }
  p.status = to;
}
