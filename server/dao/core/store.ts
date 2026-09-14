import type { GovernanceMember, GovernanceProposal, ProposalId, ProposalReceipt } from "./types";
export class GovernanceStore {
  readonly proposals = new Map<ProposalId, GovernanceProposal>();
  readonly members = new Map<string, GovernanceMember>();
  readonly receipts: ProposalReceipt[] = [];
  readonly delegation = new Map<string, string>();
  getProposal(id: ProposalId): GovernanceProposal | undefined { return this.proposals.get(id); }
  putProposal(p: GovernanceProposal): void { this.proposals.set(p.id, p); }
  getMember(address: string): GovernanceMember | undefined { return this.members.get(address); }
  putMember(member: GovernanceMember): void { this.members.set(member.address, member); }
}
