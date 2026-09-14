import type { GovernanceProposal, GovernanceMember, Vote } from "../core/types";
import { tallyProposal } from "../core/tally";

export function simulate(
  proposal: GovernanceProposal,
  members: Map<string, GovernanceMember>,
  choices: Record<string, "for" | "against" | "abstain">,
) {
  const votes: Vote[] = [];
  for (const [voter, choice] of Object.entries(choices)) {
    const member = members.get(voter);
    if (!member) continue;
    votes.push({
      voter,
      choice,
      weight: member.votingPower,
      delegatedFrom: [],
      castAt: new Date(0).toISOString(),
    });
  }
  return tallyProposal({ ...proposal, votes }, members);
}
